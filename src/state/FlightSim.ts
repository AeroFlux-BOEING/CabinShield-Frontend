/**
 * Mutable flight simulation: aircraft position (GNSS via AID or on-device estimate), forecast
 * look-ahead, crew point stage (T-23 / T-13 / T-5), service plan and alert log.
 * UI components read it through FlightContext, which re-renders a few times per second.
 */
import { NO_ACTIONS, type CabinActions } from '../ai/cabinState';
import { minutesTx, pad } from '../i18n/format';
import { tx, type Txt } from '../i18n/LangContext';
import { POINTS } from '../domain/content';
import {
  exposures, flightLevel, groundSpeed, lookAhead, PLAN_GS, START_NM, timeForDistance,
  type Exposure, type LookAhead,
} from '../domain/flight';
import { posAt, ROUTE_NM } from '../domain/geo';
import { MODE_LABEL, planServices, type PlannedService } from '../domain/planner';

export interface FlightInfo {
  no: string;
  /** departure date (local) */
  date: Date;
  /** departure, seconds after 00:00 UTC */
  depUtc: number;
}

export interface LogEntry {
  t: number;
  msg: Txt;
}

export class FlightSim {
  flight: FlightInfo | null = null;
  t = 0;
  d = START_NM;
  gs = 0;
  gsEst = 0;
  estD = START_NM;
  sigma = 0.05;
  lossD = 0;
  running = false;
  aid = true;
  sat = true;
  lastUplink = 0;
  look: LookAhead | null = null;
  cur = 0;
  g = 0;
  afterUntil = -1;
  arrived = false;
  done: Record<number, boolean> = {};
  ex: Exposure[] = [];
  plan: PlannedService[] | null = null;
  log: LogEntry[] = [];
  /** what the crew has already done in the cabin (from checklist ticks); feeds the on-device model */
  cabin: CabinActions = { ...NO_ACTIONS };
  private lastService: string | null = null;
  private lastPlanT = -1e9;
  private forecastHazard: unknown = null;
  private started = false;
  onToast: ((msg: Txt) => void) | null = null;

  constructor() {
    this.reset();
  }

  /* ---------- clocks ---------- */
  get depUtc() {
    return this.flight?.depUtc ?? 11 * 3600 + 40 * 60;
  }
  /** "HH:MM" UTC for sim time t */
  clock(t: number) {
    const s = Math.floor(this.depUtc + t);
    return pad(Math.floor(s / 3600) % 24) + ':' + pad(Math.floor((s % 3600) / 60));
  }
  /** "HH:MM" at UTC offset h */
  clockAt(t: number, h: number) {
    const x = Math.floor(this.depUtc + t + h * 3600);
    return pad((((Math.floor(x / 3600) % 24) + 24) % 24)) + ':' + pad(Math.floor((((x % 3600) + 3600) % 3600) / 60));
  }
  get eta() {
    return this.t + ((ROUTE_NM - this.estD) / PLAN_GS) * 3600;
  }
  get groundSpeedShown() {
    return this.aid ? this.gs : this.gsEst;
  }
  get tEntry(): number | null {
    return this.look && this.cur === 0 ? this.look.first[1] : null;
  }
  get after() {
    return this.cur === 0 && this.t < this.afterUntil;
  }

  /* ---------- lifecycle ---------- */
  reset() {
    const t = timeForDistance(START_NM), g = groundSpeed(START_NM, t);
    Object.assign(this, {
      t, d: START_NM, gs: g, gsEst: g, estD: START_NM, sigma: 0.05, lossD: 0, aid: true, sat: true, lastUplink: t,
      look: null, cur: 0, g: 0, afterUntil: -1, arrived: false, done: {}, ex: [], plan: null, log: [], cabin: { ...NO_ACTIONS },
    });
    this.lastService = null;
    this.lastPlanT = -1e9;
    this.forecastHazard = null;
    this.started = false;
  }

  start(flight: FlightInfo) {
    this.flight = flight;
    this.reset();
    this.running = true;
    this.addLog(tx(`${flight.no} 비행편 시작 · 인천 ${this.clock(0)} UTC 출발`, `${flight.no} started · departed Incheon ${this.clock(0)} UTC`));
    this.addLog(tx('비행 중 · 순항 고도 도달', 'In flight · reached cruise altitude'));
    this.evaluate();
    this.updatePlan(true);
    this.started = true;
  }

  addLog(msg: Txt) {
    this.log.unshift({ t: this.t, msg });
    if (this.log.length > 60) this.log.pop();
  }

  private toast(msg: Txt) {
    this.onToast?.(msg);
  }

  /* ---------- simulation ---------- */
  private step(dt: number) {
    const gs = groundSpeed(this.d, this.t);
    this.gs = gs;
    this.d = Math.min(ROUTE_NM, this.d + (gs * dt) / 3600);
    this.t += dt;
    if (this.aid) {
      this.estD = this.d;
      this.gsEst += (gs - this.gsEst) * Math.min(1, dt / 600);
      this.sigma = 0.05;
    } else {
      this.estD = Math.min(ROUTE_NM, this.estD + (this.gsEst * dt) / 3600);
      this.sigma = 0.2 + 0.02 * (this.estD - this.lossD);
    }
    if (this.sat && this.t - this.lastUplink >= 900) this.lastUplink = this.t;
    if (this.d >= ROUTE_NM && !this.arrived) {
      this.arrived = true;
      this.running = false;
      this.addLog(tx('샌프란시스코 도착', 'Arrived in San Francisco'));
    }
  }

  /** Advance by real elapsed seconds (1:1 with wall-clock time). */
  advance(realDt: number) {
    if (!this.running || this.arrived) return;
    let dt = Math.min(0.25, realDt);
    while (dt > 0) {
      const h = Math.min(dt, 5);
      this.step(h);
      dt -= h;
      if (this.arrived) break;
    }
  }

  evaluate() {
    const L = lookAhead(this.estD, this.t, this.groundSpeedShown);
    this.look = L;
    const cur = L ? L.cur : 0;
    if (cur > 0 !== this.cur > 0) {
      if (cur > 0) {
        this.addLog(tx('난기류 구간 진입 · 3포인트 착석 유지', 'Entered turbulence segment · Point 3, stay seated'));
        this.toast(tx('난기류 구간입니다 · 착석 유지', 'Turbulence segment · stay seated'));
      } else {
        this.addLog(tx('난기류 구간을 벗어났습니다', 'Left the turbulence segment'));
        this.afterUntil = this.t + 600;
      }
    }
    this.cur = cur;
    const tE = this.tEntry;
    const g = cur > 0 ? 3 : tE == null ? 0 : tE <= POINTS[2].lead ? 3 : tE <= POINTS[1].lead ? 2 : tE <= POINTS[0].lead ? 1 : 0;
    if (L && L.h !== this.forecastHazard && cur === 0) {
      this.forecastHazard = L.h;
      const m = minutesTx(L.first[1]);
      this.addLog(tx(`다음 난기류 구간 확인 · ${m.ko} 뒤`, `Next turbulence segment found · in ${m.en}`));
    }
    if (this.started && g > this.g && cur === 0 && tE != null) {
      const P = POINTS[g - 1];
      const m = minutesTx(tE);
      this.addLog(tx(`${g}포인트 시작 · ${P.name.ko} · 구간 진입 ${m.ko} 전`, `Point ${g} started · ${P.name.en} · ${m.en} before the segment`));
      this.toast(tx(`${g}포인트 · ${P.name.ko} 단계가 시작됐어요`, `Point ${g} · ${P.name.en} has started`));
    }
    if (g !== this.g) this.done = {};
    this.g = g;
    const svc = this.plan?.find((v) => v.start != null && v.end != null && this.t >= v.start && this.t < v.end)?.id ?? null;
    if (svc !== this.lastService) {
      if (svc) this.cabin = { ...NO_ACTIONS };
      this.lastService = svc;
    }
  }

  updatePlan(force = false) {
    if (!force && this.t - this.lastPlanT < 600 && this.plan) return;
    this.lastPlanT = this.t;
    this.ex = exposures(this.estD, this.t);
    const np = planServices(this.plan ? this.t : 0, this.eta, this.ex, this.plan);
    if (this.plan) {
      for (const n of np) {
        const o = this.plan.find((q) => q.id === n.id);
        if (o && (o.start !== n.start || o.mode !== n.mode) && !(o.start != null && o.start <= this.t)) {
          const from = o.start != null ? this.clock(o.start) : '—';
          const to = (l: 'ko' | 'en') => (n.start != null ? this.clock(n.start) : MODE_LABEL[n.mode][l]) + (n.mode === 'simplified' ? ` (${MODE_LABEL.simplified[l]})` : '');
          this.addLog(tx(`${n.name.ko} 시간 변경 · ${from} → ${to('ko')}`, `${n.name.en} moved · ${from} → ${to('en')}`));
        }
      }
    }
    this.plan = np;
  }

  /* ---------- crew input ---------- */
  toggleDone(i: number) {
    const on = !this.done[i];
    this.done = { ...this.done, [i]: on };
    // checklist ticks change the cabin state the on-device model sees
    const map: Record<number, Record<number, (keyof CabinActions)[]>> = {
      2: { 0: ['serviceStopped'], 1: ['cartsSecured', 'galleySecured'], 2: ['hotStowed'], 4: ['lavsCleared'] },
      3: { 0: ['serviceStopped'], 1: ['cartsSecured', 'galleySecured', 'hotStowed'], 2: ['lavsCleared'] },
    };
    const keys = this.cur === 0 ? map[this.g]?.[i] : undefined;
    if (keys) {
      const next = { ...this.cabin };
      for (const k of keys) next[k] = on;
      this.cabin = next;
    }
  }

  /** Conservative time available before the segment (s): TTA − 1.28σ. 0 inside, null when nothing ahead. */
  get qLow(): number | null {
    if (this.cur > 0) return 0;
    const tE = this.tEntry;
    if (tE == null) return null;
    const sigmaNm = Math.hypot(5 + (3 * (this.t - this.lastUplink)) / 3600, this.sigma);
    const sigmaS = (sigmaNm / Math.max(this.groundSpeedShown, 200)) * 3600;
    return Math.max(0, tE - 1.28 * sigmaS);
  }

  /* ---------- derived ---------- */
  get position() {
    return posAt(this.estD);
  }
  get flightLevel() {
    return flightLevel(this.estD);
  }
}

export { pad };
