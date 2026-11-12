/**
 * Mutable flight simulation: aircraft position (GNSS via AID or on-device estimate), forecast
 * look-ahead, crew point stage (T-23 / T-13 / T-5), service plan and alert log.
 * UI components read it through FlightContext, which re-renders a few times per second.
 */
import { POINTS } from '../domain/content';
import {
  exposures, flightLevel, groundSpeed, lookAhead, PLAN_GS, START_NM, timeForDistance,
  type Exposure, type LookAhead,
} from '../domain/flight';
import { posAt, ROUTE_NM } from '../domain/geo';
import { planServices, type PlannedService } from '../domain/planner';

export interface FlightInfo {
  no: string;
  /** "11월 12일" */
  dateLabel: string;
  /** departure, seconds after 00:00 UTC */
  depUtc: number;
}

export interface LogEntry {
  t: number;
  msg: string;
}

export type Speed = 10 | 60 | 300;

const pad = (n: number) => String(n).padStart(2, '0');

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
  speed: Speed = 60;
  aid = true;
  sat = true;
  lastUplink = 0;
  look: LookAhead | null = null;
  cur = 0;
  g = 0;
  afterUntil = -1;
  near = false;
  arrived = false;
  done: Record<number, boolean> = {};
  ex: Exposure[] = [];
  plan: PlannedService[] | null = null;
  log: LogEntry[] = [];
  private lastPlanT = -1e9;
  private forecastHazard: unknown = null;
  private started = false;
  onToast: ((msg: string) => void) | null = null;

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
  get effectiveSpeed(): number {
    return this.near ? Math.min(this.speed, 10) : this.speed;
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
      look: null, cur: 0, g: 0, afterUntil: -1, near: false, arrived: false, done: {}, ex: [], plan: null, log: [],
    });
    this.lastPlanT = -1e9;
    this.forecastHazard = null;
    this.started = false;
  }

  start(flight: FlightInfo) {
    this.flight = flight;
    this.reset();
    this.running = true;
    this.addLog(`${flight.no} 비행편 시작 · 인천 ${this.clock(0)} UTC 출발`);
    this.addLog('비행 중 · 순항 고도 도달');
    this.evaluate();
    this.updatePlan(true);
    this.started = true;
  }

  addLog(msg: string) {
    this.log.unshift({ t: this.t, msg });
    if (this.log.length > 60) this.log.pop();
  }

  private toast(msg: string) {
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
      this.addLog('샌프란시스코 도착');
    }
  }

  /** Advance by real seconds (scaled by the demo speed). */
  advance(realDt: number) {
    if (!this.running || this.arrived) return;
    let dt = Math.min(0.25, realDt) * this.effectiveSpeed;
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
        this.addLog('난기류 구간 진입 · 3포인트 착석 유지');
        this.toast('난기류 구간입니다 · 착석 유지');
      } else {
        this.addLog('난기류 구간을 벗어났습니다');
        this.afterUntil = this.t + 600;
      }
    }
    this.cur = cur;
    const tE = this.tEntry;
    const g = cur > 0 ? 3 : tE == null ? 0 : tE <= POINTS[2].lead ? 3 : tE <= POINTS[1].lead ? 2 : tE <= POINTS[0].lead ? 1 : 0;
    if (L && L.h !== this.forecastHazard && cur === 0) {
      this.forecastHazard = L.h;
      this.addLog(`다음 난기류 구간 확인 · ${minutesText(L.first[1])} 뒤`);
    }
    if (this.started && g > this.g && cur === 0 && tE != null) {
      const P = POINTS[g - 1];
      this.addLog(`${g}포인트 시작 · ${P.name} · 구간 진입 ${minutesText(tE)} 전`);
      this.toast(`${g}포인트 · ${P.name} 단계가 시작됐어요`);
    }
    if (g !== this.g) this.done = {};
    this.g = g;
    this.near = !!L && (L.cur > 0 || L.first[1] <= 1560);
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
          this.addLog(`${n.name} 시간 변경 · ${o.start != null ? this.clock(o.start) : '—'} → ${n.start != null ? this.clock(n.start) : n.mode}${n.mode === '간소화' ? ' (간소화)' : ''}`);
        }
      }
    }
    this.plan = np;
  }

  /* ---------- controls ---------- */
  setSpeed(s: Speed) {
    this.speed = s;
  }
  toggleRun() {
    if (!this.arrived) this.running = !this.running;
  }
  toggleAid() {
    if (this.aid) {
      this.aid = false;
      this.lossD = this.d;
      this.addLog('비행기 위치 신호 끊김 · 예측 위치로 계산 시작');
    } else {
      this.aid = true;
      this.estD = this.d;
      this.addLog('비행기 위치 신호 복구');
    }
    this.evaluate();
  }
  toggleSat() {
    if (this.sat) {
      this.sat = false;
      this.addLog('지상 연결 끊김 · 태블릿이 혼자 판단 중');
    } else {
      this.sat = true;
      this.lastUplink = this.t;
      this.addLog('지상 연결 복구 · 최신 흔들림 예보 받음');
      this.lastPlanT = -1e9;
    }
    this.evaluate();
  }
  /** Jump to 30 minutes before the next forecast segment. */
  jumpToNext() {
    let found: number | null = null;
    for (let s = 0; s <= 10 * 3600; s += 30) {
      const d = this.d + (this.gs * s) / 3600;
      if (d > ROUTE_NM) break;
      if (lookAhead(d, this.t + s, this.gs)?.cur) { found = s; break; }
    }
    if (found === null) return this.addLog('남은 비행에 예상되는 흔들림이 없습니다');
    if (found <= 1800) return this.addLog('다음 구역이 이미 30분 안에 있습니다');
    const adv = found - 1800;
    this.d += (this.gs * adv) / 3600;
    this.t += adv;
    this.estD = this.aid ? this.d : this.estD + (this.gsEst * adv) / 3600;
    if (!this.aid) this.sigma = 0.2 + 0.02 * (this.estD - this.lossD);
    if (this.sat) this.lastUplink = this.t;
    this.afterUntil = -1;
    this.lastPlanT = -1e9;
    this.evaluate();
    this.updatePlan(true);
  }
  restart() {
    if (!this.flight) return;
    this.start(this.flight);
  }
  toggleDone(i: number) {
    this.done = { ...this.done, [i]: !this.done[i] };
  }

  /* ---------- derived ---------- */
  get position() {
    return posAt(this.estD);
  }
  get flightLevel() {
    return flightLevel(this.estD);
  }
}

export const minutesText = (s: number) => (s < 90 ? '1분 이내' : '약 ' + Math.round(s / 60) + '분');
export const hoursText = (s: number) => {
  const m = Math.round(s / 60);
  return m >= 60 ? Math.floor(m / 60) + '시간 ' + (m % 60) + '분' : m + '분';
};
export const hm = (s: number) => {
  const m = Math.max(0, Math.round(s / 60));
  return Math.floor(m / 60) + ':' + pad(m % 60);
};
export const mmss = (s: number) => {
  const x = Math.max(0, Math.round(s));
  return x >= 600 ? { big: String(Math.round(x / 60)), unit: '분', sec: null as string | null } : { big: String(Math.floor(x / 60)), unit: '분', sec: pad(x % 60) };
};
export { pad };
