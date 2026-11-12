/**
 * Cabin state fed to the on-device model (same 38 features as sim787.py), derived from the
 * service plan, crew rest rotation and the crew's checklist ticks.
 */
import { CREW, REST_A, REST_B } from '../domain/content';
import type { Txt } from '../i18n/LangContext';
import type { FlightSim } from '../state/FlightSim';

const CREW_ZONE = [0, 0, 0, 1, 1, 1, 2, 2, 2, 2];
const CART_ZONE = [0, 1, 2, 2];

export interface CabinActions {
  serviceStopped: boolean;
  cartsSecured: boolean;
  hotStowed: boolean;
  galleySecured: boolean;
  lavsCleared: boolean;
}

export const NO_ACTIONS: CabinActions = { serviceStopped: false, cartsSecured: false, hotStowed: false, galleySecured: false, lavsCleared: false };

export interface CabinState {
  svc: 0 | 1 | 2 | 3;
  serviceName: Txt | null;
  active: boolean;
  cong: number;
  carts: { unsecured: boolean; hot: boolean; zone: number }[];
  lavs: boolean[];
  galleyOpen: boolean[];
  resting: boolean[];
}

/** deterministic pseudo-random in [0,1) */
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function cabinState(sim: FlightSim): CabinState {
  const a = sim.cabin;
  const svcNow = sim.plan?.find((v) => v.start != null && v.end != null && sim.t >= v.start && sim.t < v.end) ?? null;
  const svc: CabinState['svc'] = !svcNow ? 0 : svcNow.id === 'sn' ? 1 : 3;
  const active = svc !== 0 && !a.serviceStopped && sim.cur === 0;
  const carts = CART_ZONE.map((zone, i) => {
    const unsecured = svc !== 0 && !a.cartsSecured && i < (svc === 3 ? 4 : 2);
    return { zone, unsecured, hot: unsecured && !a.hotStowed && (svc === 1 || i < 3) };
  });
  const slot = Math.floor(sim.t / 300);
  const lavs = Array.from({ length: 6 }, (_, i) => !a.lavsCleared && sim.cur === 0 && rand(slot * 7 + i) < 0.35);
  const galleyOpen = [0, 1, 2].map((z) => !a.galleySecured && (active || (svc !== 0 && z !== 0)));
  const h = sim.t / 3600;
  const restGroup = h >= 2.6 && h < 4.6 ? REST_A : h >= 5.6 && h < 7.0 ? REST_B : [];
  const resting = CREW.map(([pos]) => restGroup.includes(pos));
  return { svc, serviceName: svcNow?.name ?? null, active, cong: active ? 0.6 : 0.2, carts, lavs, galleyOpen, resting };
}

export function features(c: CabinState): number[] {
  const f: number[] = [0, 1, 2, 3].map((k) => (c.svc === k ? 1 : 0));
  f.push(c.active ? 1 : 0, c.cong);
  for (const k of c.carts) f.push(k.unsecured ? 1 : 0, k.hot ? 1 : 0, ...[0, 1, 2].map((z) => (k.unsecured && k.zone === z ? 1 : 0)));
  f.push(...c.lavs.map((x) => (x ? 1 : 0)), ...c.galleyOpen.map((x) => (x ? 1 : 0)));
  for (let z = 0; z < 3; z++) f.push(CREW_ZONE.filter((zz, i) => zz === z && !c.resting[i]).length / 4);
  return f;
}
