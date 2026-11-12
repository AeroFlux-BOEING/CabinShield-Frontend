/**
 * Service timing planner: moves or simplifies cabin services so they do not overlap forecast
 * turbulence segments (plus a lead-time dependent buffer). Started services are frozen.
 */
import { tx, type Txt } from '../i18n/LangContext';
import { SERVICES, type ServiceDef } from './content';
import type { Exposure } from './flight';

export interface PlannedService extends ServiceDef {
  start: number | null;
  end: number | null;
  mode: 'normal' | 'simplified' | 'skipped' | 'purser';
  shift: number;
}

export const bufferBefore = (e: Exposure, now: number) => 600 + 120 * Math.max(0, (e.t0 - now) / 3600);

export function planServices(now: number, eta: number, ex: Exposure[], prev: PlannedService[] | null): PlannedService[] {
  const latest = eta - 40 * 60;
  const blocks = ex.map((e) => [e.t0 - bufferBefore(e, now), e.t1 + 600] as const);
  const free = (a: number, b: number) => blocks.every(([x, y]) => b <= x || a >= y);
  let prevEnd = 0;
  return SERVICES.map((sv): PlannedService => {
    const old = prev?.find((q) => q.id === sv.id);
    if (old && old.start != null && old.end != null && old.start <= now) { prevEnd = old.end; return old; }
    if (old && old.start != null && old.end != null && old.start >= prevEnd + 1200 && old.end <= latest && free(old.start, old.end)) {
      prevEnd = old.end;
      return old;
    }
    const tryMode = (dur: number) => {
      for (let k = 0; k <= 36; k++)
        for (const sg of k ? [1, -1] : [1]) {
          const st = sv.pref + sg * k * 300;
          if (st < now || st < prevEnd + 1200 || st + dur > latest) continue;
          if (free(st, st + dur)) return { st, shift: sg * k * 300 };
        }
      return null;
    };
    let r = tryMode(sv.dur), mode: PlannedService['mode'] = 'normal', dur = sv.dur;
    if (sv.simp && (!r || Math.abs(r.shift) > 3600)) {
      const r2 = tryMode(sv.simp);
      if (r2 && (!r || Math.abs(r2.shift) < Math.abs(r.shift))) { r = r2; mode = 'simplified'; dur = sv.simp; }
    }
    if (!r) return { ...sv, start: null, end: null, mode: sv.optional ? 'skipped' : 'purser', shift: 0 };
    prevEnd = r.st + dur;
    return { ...sv, start: r.st, end: r.st + dur, mode, shift: r.shift };
  });
}

export const MODE_LABEL: Record<PlannedService['mode'], Txt> = {
  normal: tx('정상', 'Normal'),
  simplified: tx('간소화', 'Simplified'),
  skipped: tx('생략', 'Skipped'),
  purser: tx('사무장 결정', 'Purser decides'),
};
