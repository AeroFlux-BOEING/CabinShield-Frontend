/** Spherical geometry for the ICN → SFO great-circle route. Distances in nautical miles. */
export const D2R = Math.PI / 180;
export const R2D = 180 / Math.PI;
export const EARTH_NM = 3440.065;

export interface LatLon {
  lat: number;
  /** degrees east, 0–360 */
  lon: number;
}

export const lon360 = (l: number) => ((l % 360) + 360) % 360;

export const ICN: LatLon = { lat: 37.4602, lon: 126.4407 };
export const SFO: LatLon = { lat: 37.619, lon: lon360(-122.3749) };

type Vec = [number, number, number];
const vec = (p: LatLon): Vec => {
  const a = p.lat * D2R, b = p.lon * D2R;
  return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)];
};
const VA = vec(ICN);
const VB = vec(SFO);
const OMEGA = Math.acos(VA[0] * VB[0] + VA[1] * VB[1] + VA[2] * VB[2]);

/** Great-circle distance ICN → SFO */
export const ROUTE_NM = OMEGA * EARTH_NM;

/** Point at fraction f (0–1) along the great circle. */
export function gc(f: number): LatLon {
  const ff = Math.max(0, Math.min(1, f));
  const s = Math.sin(OMEGA), a = Math.sin((1 - ff) * OMEGA) / s, b = Math.sin(ff * OMEGA) / s;
  const x = a * VA[0] + b * VB[0], y = a * VA[1] + b * VB[1], z = a * VA[2] + b * VB[2];
  return { lat: Math.atan2(z, Math.hypot(x, y)) * R2D, lon: lon360(Math.atan2(y, x) * R2D) };
}

export function bearing(p: LatLon, q: LatLon): number {
  const f1 = p.lat * D2R, f2 = q.lat * D2R, dl = (q.lon - p.lon) * D2R;
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return lon360(Math.atan2(y, x) * R2D);
}

/** Destination from p along bearing b (deg) for nm nautical miles (nm may be negative). */
export function destination(p: LatLon, b: number, nm: number): LatLon {
  const d = nm / EARTH_NM, f1 = p.lat * D2R, l1 = p.lon * D2R, t = b * D2R;
  const f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(t));
  const l2 = l1 + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(f1), Math.cos(d) - Math.sin(f1) * Math.sin(f2));
  return { lat: f2 * R2D, lon: lon360(l2 * R2D) };
}

export function distanceNm(a: LatLon, b: LatLon): number {
  const f1 = a.lat * D2R, f2 = b.lat * D2R, df = f2 - f1, dl = (b.lon - a.lon) * D2R;
  const x = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
  return 2 * EARTH_NM * Math.asin(Math.min(1, Math.sqrt(x)));
}

/** Position after flying d nm along the route. */
export const posAt = (d: number) => gc(d / ROUTE_NM);

/** Ground track (deg) at distance d along the route. */
export const trackAt = (d: number) =>
  bearing(posAt(Math.max(0, Math.min(ROUTE_NM - 2, d) - 1)), posAt(Math.min(ROUTE_NM, Math.max(2, d) + 1)));

/** Web-Mercator y for a latitude (radians-scaled). */
export const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * D2R) / 2));
