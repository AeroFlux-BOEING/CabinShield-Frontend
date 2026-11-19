/**
 * Ground link: connects the on-device FlightSim to the CabinShield Ground API.
 *
 * The tablet stays the decision maker. The server only
 *  - registers the flight and hands over the briefing package (forecast + past reports),
 *  - pushes newer forecasts (WebSocket FORECAST_UPDATED, plus a light poll as a fallback),
 *  - receives the offline queue (log · checklist · point · cabin · decision) and re-checks AI decisions.
 * When the server is unreachable everything keeps working on bundled data and the queue waits.
 */
import { Platform } from 'react-native';

import { cabinState, features } from '../ai/cabinState';
import { decide, PLANS } from '../ai/cstModel';
import { api, ApiError, apiEnabled, openFlightSocket } from '../api/client';
import type { ApiForecast, SyncEvent, SyncVerdict, WsMessage } from '../api/types';
import { setHistory } from '../domain/content';
import { setForecast } from '../domain/flight';
import { tx, type Txt } from '../i18n/LangContext';
import type { FlightInfo, FlightSim, SimEvent } from './FlightSim';

export type LinkState = 'off' | 'connecting' | 'online' | 'offline';

const MODEL_VERSION = 'cst-mlp-v1';
const FLUSH_MS = 10_000;
const POLL_MS = 60_000;
const MAX_QUEUE = 2000;

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 6)}`;
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export class GroundLink {
  readonly enabled = apiEnabled;
  state: LinkState = apiEnabled ? 'connecting' : 'off';
  flightId: string | null = null;
  routeId: string | null = null;
  wsOpen = false;
  queue: SyncEvent[] = [];
  /** sim time of the last successful upload */
  lastSyncT: number | null = null;
  lastError: Txt | null = null;
  audit = { total: 0, agree: 0, last: null as SyncVerdict | null };
  readonly deviceId = `${Platform.OS}-${uid().slice(-6)}`;

  private closeWs: (() => void) | null = null;
  private timers: ReturnType<typeof setInterval>[] = [];
  private flushing = false;
  private startSeq = 0;

  constructor(private sim: FlightSim, private changed: () => void) {}

  /* ---------- lifecycle ---------- */
  attach() {
    this.sim.onEvent = (e) => this.record(e);
    if (!this.enabled) return;
    this.sim.groundManaged = true;
    void this.ping();
    this.timers.push(setInterval(() => void this.flush(), FLUSH_MS));
    this.timers.push(setInterval(() => void this.pollForecast(), POLL_MS));
  }

  detach() {
    this.sim.onEvent = null;
    this.timers.forEach(clearInterval);
    this.timers = [];
    this.closeWs?.();
    this.closeWs = null;
  }

  /** Called right after `sim.start()`: register the flight and download the briefing package. */
  async startFlight(f: FlightInfo) {
    if (!this.enabled) return;
    const seq = ++this.startSeq;
    this.closeWs?.();
    this.closeWs = null;
    this.wsOpen = false;
    this.flightId = null;
    this.queue = this.queue.filter((e) => e.kind !== 'decision');
    this.setState('connecting');
    try {
      const fl = await api.createFlight({ flight_no: f.no, date: ymd(f.date), dep_local: f.depLocal });
      if (!fl || seq !== this.startSeq) return;
      this.flightId = fl.id;
      this.routeId = fl.route_id;
      const b = await api.briefing(fl.id);
      if (seq !== this.startSeq) return;
      if (b) {
        this.applyForecast(b.forecast.version, b.forecast.hazards, false);
        setHistory(b.history);
        this.sim.addLog(tx(`지상 브리핑 수신 · 예보 v${b.forecast.version} · 과거 보고 ${b.history.length}구간`, `Ground briefing received · forecast v${b.forecast.version} · ${b.history.length} past-report areas`));
      }
      this.setState('online');
      this.openSocket(fl.id);
      void this.flush();
    } catch (e) {
      if (seq !== this.startSeq) return;
      this.fail(e);
      // retry registration later; the tablet keeps running on bundled data meanwhile
      setTimeout(() => { if (seq === this.startSeq && !this.flightId) void this.startFlight(f); }, 15_000);
    }
  }

  /* ---------- queue ---------- */
  private record(e: SimEvent) {
    this.push(e.kind, e.payload as Record<string, unknown>);
    if (e.kind === 'point' && e.payload.point > 0) this.recordDecision();
  }

  private push(kind: SyncEvent['kind'], payload: Record<string, unknown>) {
    if (!this.enabled) return;
    this.queue.push({ id: uid(), kind, t_s: Math.round(this.sim.t * 10) / 10, at: new Date().toISOString(), payload });
    if (this.queue.length > MAX_QUEUE) this.queue.splice(0, this.queue.length - MAX_QUEUE);
  }

  /** Snapshot of the on-device AI recommendation, re-checked by the ground Safety Kernel on sync. */
  recordDecision() {
    const x = features(cabinState(this.sim));
    const q = this.sim.qLow;
    const r = decide(x, q);
    this.push('decision', {
      features: x, q_low_s: q, pick: PLANS[r.pick].id, cst_s: r.cst, csm_s: r.csm, model_version: MODEL_VERSION,
    });
  }

  async flush() {
    if (!this.enabled || this.flushing || !this.flightId || !this.queue.length) return;
    this.flushing = true;
    const batch = this.queue.slice(0, 500);
    try {
      const res = await api.sync(this.flightId, { device_id: this.deviceId, forecast_version: this.sim.forecastVersion || null, events: batch });
      const sent = new Set(batch.map((e) => e.id));
      this.queue = this.queue.filter((e) => !sent.has(e.id));
      this.lastSyncT = this.sim.t;
      if (res) {
        for (const v of res.verdicts) {
          this.audit.total++;
          if (v.agree) this.audit.agree++;
          this.audit.last = v;
        }
        if (res.forecast_stale) void this.pollForecast();
      }
      this.setState('online');
    } catch (e) {
      this.fail(e);
    } finally {
      this.flushing = false;
    }
  }

  /* ---------- forecast ---------- */
  private applyForecast(version: number, hazards: ApiForecast['hazards'], log = true) {
    if (version <= this.sim.forecastVersion && this.sim.forecastVersion > 0) {
      this.sim.lastUplink = this.sim.t;
      return;
    }
    setForecast(hazards, this.sim.t);
    this.sim.forecastUplinked(version);
    if (log) this.sim.addLog(tx(`새 흔들림 예보 v${version} 수신`, `New turbulence forecast v${version} received`));
  }

  async pollForecast() {
    if (!this.enabled || !this.routeId) return;
    try {
      const fc = await api.forecast(this.routeId, this.sim.forecastVersion || undefined);
      if (fc) this.applyForecast(fc.version, fc.hazards);
      else this.sim.lastUplink = this.sim.t;
      this.setState('online');
    } catch (e) {
      this.fail(e);
    }
  }

  private openSocket(id: string) {
    this.closeWs = openFlightSocket(id, {
      onStatus: (open) => {
        this.wsOpen = open;
        if (open) this.setState('online');
        this.changed();
      },
      onMessage: (m: WsMessage) => {
        if (m.type === 'event' && m.event === 'FORECAST_UPDATED') void this.pollForecast();
      },
    });
  }

  /* ---------- status ---------- */
  private async ping() {
    try {
      await api.health();
      this.setState('online');
    } catch (e) {
      this.fail(e);
    }
  }

  private fail(e: unknown) {
    const status = e instanceof ApiError ? e.status : 0;
    this.lastError =
      e instanceof ApiError && typeof e.detail === 'object' && e.detail?.msg
        ? e.detail.msg
        : status === 401
          ? tx('API 키가 맞지 않습니다', 'API key rejected')
          : tx('지상 서버에 연결할 수 없습니다', 'Cannot reach the ground server');
    // 4xx = the server answered; the link itself is up
    this.setState(status >= 400 && status < 500 ? 'online' : 'offline');
  }

  private setState(s: LinkState) {
    const was = this.state;
    this.state = s;
    if (s === 'online') this.lastError = null;
    if (this.enabled) {
      const sat = s === 'online';
      if (this.sim.sat !== sat) {
        this.sim.sat = sat;
        this.push('link', { aid: this.sim.aid, sat });
      }
    }
    if (was !== s) this.changed();
  }
}
