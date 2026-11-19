/**
 * Simulated flight physics and forecast turbulence areas along ICN → SFO.
 * All values are illustrative demo values, not operational data.
 */
import { tx, type Txt } from '../i18n/LangContext';
import { D2R, destination, lon360, posAt, ROUTE_NM, trackAt, type LatLon } from './geo';

/** Mean planning ground speed (kt) used for ETAs and far-ahead timing. */
export const PLAN_GS = 492;
/** Cruise true airspeed (kt) used to derive head/tail wind. */
export const TAS = 488;
/** Where the demo starts along the route (nm). */
export const START_NM = 350;

export const timeForDistance = (d: number) => (d / 470) * 3600;

/** Ground speed with climb/descent ramps and a slowly varying jet-stream component. */
export function groundSpeed(d: number, t: number): number {
  const ramp = Math.max(0, Math.min(1, d / 140, (ROUTE_NM - d) / 130));
  const cruise = 492 + 28 * Math.sin(t / 2600) + 12 * Math.sin(t / 730 + 1);
  return 250 + (cruise - 250) * ramp;
}

/** Flight level (hundreds of ft) at distance d, with step climbs. */
export function flightLevel(d: number): number {
  const plan = d < 0.45 * ROUTE_NM ? 350 : d < 0.72 * ROUTE_NM ? 370 : 390;
  return Math.max(0, Math.min(plan, 15 + (335 * d) / 160, 15 + (plan * (ROUTE_NM - d)) / 130));
}

/* ---------- forecast turbulence areas (rings: outer, middle, core) ---------- */

export interface Hazard {
  idx: number;
  name: Txt;
  fl: [number, number];
  f: number;
  off: number;
  r: number;
  kt: number;
  shape: number[];
  c0: LatLon;
  tRef: number;
  /** polygon vertices in nm offsets from the centre */
  v: [number, number][];
  /** server id (HZ1 …) when the forecast came from the ground API */
  id?: string;
  /** minimum intensity anywhere inside (SEV SIGMET → 3) */
  floor?: number;
  /** drift direction (deg true, default 90 = east) */
  dir?: number;
  /** active window in sim seconds (live areas) */
  tFrom?: number;
  tTo?: number;
  source?: string;
}

/** Strength labels for ring 1–3. */
export const STRENGTH: Txt[] = [tx('', ''), tx('약함', 'light'), tx('보통', 'moderate'), tx('심함', 'severe')];
const RING = [1, 0.66, 0.33];

const DEFS = [
  { name: tx('후쿠오카 FIR · 일본 북부 해상', 'Fukuoka FIR · off northern Japan'), fl: [300, 400] as [number, number], f: 0.2, off: -55, r: 120, kt: 18, shape: [1, 0.8, 1.15, 0.9, 1.2, 0.85, 1.05, 0.95] },
  { name: tx('앵커리지 해양 · 알류샨 남쪽', 'Anchorage Oceanic · south of the Aleutians'), fl: [320, 410] as [number, number], f: 0.5, off: 30, r: 150, kt: 25, shape: [0.9, 1.1, 1, 1.25, 0.85, 1, 1.15, 0.8] },
  { name: tx('오클랜드 해양 · 미국 서해안 앞', 'Oakland Oceanic · off the US West Coast'), fl: [280, 400] as [number, number], f: 0.81, off: -85, r: 110, kt: 15, shape: [1.1, 0.9, 1, 0.8, 1.15, 1.05, 0.9, 1] },
];

const shapeVerts = (r: number, shape: number[]) =>
  shape.map((sc, k) => {
    const a = k * 45 * D2R;
    return [r * sc * Math.sin(a), r * sc * Math.cos(a)] as [number, number];
  });

const routeAnchored = (h: (typeof DEFS)[number], idx: number): Hazard => {
  const dr = h.f * ROUTE_NM;
  return { ...h, idx, c0: destination(posAt(dr), trackAt(dr) - 90, h.off), tRef: timeForDistance(dr), v: shapeVerts(h.r, h.shape) };
};

/** Current forecast. Mutated in place by `setForecast` when a newer one arrives from the ground. */
export const HAZARDS: Hazard[] = DEFS.map(routeAnchored);

/** Forecast area as published by the ground API (see src/api/types.ts ApiHazard). */
export interface HazardSpec {
  id: string;
  name: Txt;
  fl: [number, number];
  f: number;
  off_nm: number;
  r_nm: number;
  drift_kt: number;
  shape: number[];
  source?: string;
  centre_ll?: { lat: number; lon: number };
  t_obs_utc?: string;
  vertices_nm?: [number, number][];
  floor?: number;
  drift_dir_deg?: number;
  valid_from_utc?: string;
  valid_to_utc?: string;
}

/**
 * Replace the forecast with a ground one. Live areas (absolute centre + observation time) are
 * replayed so the observation lands at sim time `tNow`, like the server's default CS_WX_TIME_MODE=replay.
 */
export function setForecast(specs: HazardSpec[], tNow: number) {
  const ms = (iso?: string) => (iso ? Date.parse(iso) : NaN);
  const next = specs.map((s, idx): Hazard => {
    const base = routeAnchored({ name: s.name, fl: s.fl, f: s.f, off: s.off_nm, r: s.r_nm, kt: s.drift_kt, shape: s.shape.length === 8 ? s.shape : [1, 1, 1, 1, 1, 1, 1, 1] }, idx);
    const h: Hazard = { ...base, id: s.id, floor: s.floor ?? 0, dir: s.drift_dir_deg ?? 90, source: s.source };
    if (s.vertices_nm?.length) h.v = s.vertices_nm.map(([x, y]) => [x, y] as [number, number]);
    if (s.centre_ll) {
      h.c0 = { lat: s.centre_ll.lat, lon: lon360(s.centre_ll.lon) };
      h.tRef = tNow;
      const obs = Number.isFinite(ms(s.t_obs_utc)) ? ms(s.t_obs_utc) : Date.now();
      const rel = (iso?: string) => (Number.isFinite(ms(iso)) ? tNow + (ms(iso) - obs) / 1000 : undefined);
      h.tFrom = rel(s.valid_from_utc);
      h.tTo = rel(s.valid_to_utc);
    }
    return h;
  });
  HAZARDS.splice(0, HAZARDS.length, ...next);
}

const active = (h: Hazard, t: number) => (h.tFrom == null || t >= h.tFrom) && (h.tTo == null || t <= h.tTo);

/** Centre of a hazard at sim time t (drifts east). */
export const hazardCentre = (h: Hazard, t: number) => destination(h.c0, h.dir ?? 90, (h.kt * (t - h.tRef)) / 3600);

function pointInPoly(v: [number, number][], x: number, y: number) {
  let r = false;
  for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
    const [xi, yi] = v[i], [xj, yj] = v[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) r = !r;
  }
  return r;
}

/** Which ring (0 = outside, 3 = core) point p falls in for hazard h centred at c. */
export function ringOf(h: Hazard, c: LatLon, p: LatLon): number {
  let dl = p.lon - c.lon;
  if (dl > 180) dl -= 360;
  if (dl < -180) dl += 360;
  const x = dl * 60 * Math.cos(c.lat * D2R), y = (p.lat - c.lat) * 60;
  for (let k = 3; k >= 1; k--) if (pointInPoly(h.v, x / RING[k - 1], y / RING[k - 1])) return Math.max(k, h.floor ?? 0);
  return 0;
}

function levelAt(d0: number, t0: number, gs: number, s: number): { h: Hazard | null; k: number } | null {
  const d = d0 + (gs * s) / 3600;
  if (d > ROUTE_NM) return null;
  const p = posAt(d), fl = flightLevel(d);
  let best: { h: Hazard | null; k: number } = { h: null, k: 0 };
  for (const h of HAZARDS) {
    if (fl < h.fl[0] || fl > h.fl[1] || !active(h, t0 + s)) continue;
    const k = ringOf(h, hazardCentre(h, t0 + s), p);
    if (k > best.k) best = { h, k };
  }
  return best;
}

export interface LookAhead {
  /** ring the aircraft is in now (0 = outside) */
  cur: number;
  /** seconds until first entering ring k (index 1–3) */
  first: Record<number, number>;
  max: number;
  /** seconds until leaving the area */
  exit: number;
  h: Hazard;
}

/** Look one hour ahead along the planned path for the next forecast area. */
export function lookAhead(d0: number, t0: number, gs: number): LookAhead | null {
  const z = levelAt(d0, t0, gs, 0), cur = z ? z.k : 0;
  let h0: Hazard | null = cur && z ? z.h : null;
  const first: Record<number, number> = {};
  let max = cur, exit: number | null = null;
  if (cur) for (let k = 1; k <= cur; k++) first[k] = 0;
  for (let s = 0; s <= 3600; s += 5) {
    const r = levelAt(d0, t0, gs, s);
    if (!r) break;
    if (r.k > 0 && (!h0 || r.h === h0)) {
      h0 = r.h;
      for (let k = 1; k <= r.k; k++) if (first[k] == null) first[k] = s;
      max = Math.max(max, r.k);
    } else if (h0 && r.h !== h0) {
      exit = s;
      break;
    }
  }
  return h0 ? { cur, first, max, exit: exit ?? 3600, h: h0 } : null;
}

export interface Exposure {
  h: Hazard;
  t0: number;
  t1: number;
  d0: number;
  d1: number;
  max: number;
}

/** Every forecast segment along the whole route, timed with the planning ground speed. */
export function exposures(estD: number, t: number): Exposure[] {
  const out: Exposure[] = [];
  let w: Exposure | null = null;
  for (let d = 0; d <= ROUTE_NM; d += 8) {
    const tt = t + ((d - estD) / PLAN_GS) * 3600, p = posAt(d), fl = flightLevel(d);
    let k = 0, hh: Hazard | null = null;
    for (const h of HAZARDS) {
      if (fl < h.fl[0] || fl > h.fl[1] || !active(h, tt)) continue;
      const r = ringOf(h, hazardCentre(h, tt), p);
      if (r > k) { k = r; hh = h; }
    }
    if (k && hh) {
      if (!w || w.h !== hh) { w = { h: hh, t0: tt, t1: tt, d0: d, d1: d, max: k }; out.push(w); }
      else { w.t1 = tt; w.d1 = d; w.max = Math.max(w.max, k); }
    } else w = null;
  }
  return out;
}
