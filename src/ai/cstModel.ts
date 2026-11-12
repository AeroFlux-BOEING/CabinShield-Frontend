/**
 * On-device CST predictor + Safety Kernel. Pure TypeScript, no network, no native module:
 * runs inside the app on Hermes / JavaScriptCore / the browser in well under a millisecond.
 */
import { tx } from '../i18n/LangContext';
import { CST_MODEL } from './cstWeights';

export const PLANS = [
  { id: 'FULL', name: tx('전체 정리', 'Full secure'), desc: tx('카트 갤리 복귀 · 갤리 잠금 · 구역 점검', 'Carts to galley · lock galley · zone check') },
  { id: 'MINIMAL', name: tx('최소 정리', 'Minimum secure'), desc: tx('카트 현장 고정 · 화장실 승객 안내', 'Brake carts in place · guide lavatory passengers') },
  { id: 'IMMEDIATE', name: tx('즉시 착석', 'Sit down now'), desc: tx('하던 일 멈추고 가장 가까운 좌석에 착석', 'Stop and take the nearest seat') },
] as const;

export const SAFETY_BUFFER_S = 10;

/** Forward pass: returns CST p90 (s) for FULL / MINIMAL / IMMEDIATE, before the safety margin. */
export function predictCst(x: number[]): [number, number, number] {
  let h = x;
  const L = CST_MODEL.W.length;
  for (let l = 0; l < L; l++) {
    const W = CST_MODEL.W[l], b = CST_MODEL.b[l], out = new Array<number>(W.length);
    for (let o = 0; o < W.length; o++) {
      const row = W[o];
      let s = b[o];
      for (let i = 0; i < row.length; i++) s += row[i] * h[i];
      out[o] = l < L - 1 ? (s > 0 ? s : 0) : s;
    }
    h = out;
  }
  return [h[0] * CST_MODEL.scale, h[1] * CST_MODEL.scale, h[2] * CST_MODEL.scale];
}

export type Verdict = 'ok' | 'tight' | 'no';
export const VERDICT_LABEL: Record<Verdict, { ko: string; en: string }> = { ok: tx('가능', 'OK'), tight: tx('빠듯', 'Tight'), no: tx('불가', 'No') };

export interface KernelResult {
  /** predicted CST p90 + calibrated margin */
  cst: [number, number, number];
  /** cabin safety margin per plan (s), null when no forecast segment is ahead */
  csm: [number, number, number] | null;
  verdict: (Verdict | null)[];
  /** index into PLANS */
  pick: number;
  /** average inference + kernel time on this device (ms) */
  ms: number;
}

/** CSM = Q_low − (CST̂ + margin) − buffer. Pick the most thorough plan that still passes. */
export function decide(x: number[], qLow: number | null): KernelResult {
  const reps = 50;
  const now = () => (globalThis.performance?.now ? globalThis.performance.now() : Date.now());
  const t0 = now();
  let raw: [number, number, number] = [0, 0, 0];
  for (let r = 0; r < reps; r++) raw = predictCst(x);
  const ms = (now() - t0) / reps;
  const cst = raw.map((v, j) => Math.max(0, v) + CST_MODEL.margin[j]) as [number, number, number];
  if (qLow == null) return { cst, csm: null, verdict: [null, null, null], pick: 0, ms };
  const csm = cst.map((v) => qLow - v - SAFETY_BUFFER_S) as [number, number, number];
  const verdict = csm.map((v): Verdict => (v < 0 ? 'no' : v < 5 ? 'tight' : 'ok'));
  const ok = [0, 1, 2].filter((j) => csm[j] >= 0);
  let pick = 2;
  if (ok.length) pick = ok.sort((a, b) => Number(csm[b] >= 5) - Number(csm[a] >= 5) || a - b)[0];
  return { cst, csm, verdict, pick, ms };
}

/** Largest gap between the TS model and the Python reference outputs (s). */
export function selfCheck(): number {
  let worst = 0;
  CST_MODEL.test.x.forEach((x, i) => {
    const p = predictCst(x);
    p.forEach((v, j) => (worst = Math.max(worst, Math.abs(v - CST_MODEL.test.y[i][j]))));
  });
  return worst;
}

export const MODEL_INFO = {
  arch: 'MLP 38 → 32 → 16 → 3',
  params: 1827,
  sizeKb: 7.1,
};
