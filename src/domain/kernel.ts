import { LIB_ORDER, PASS_MIN_CSM, PLAN_DEFS } from './constants';
import type { ActionKey, CabinAction, CabinScenario, Hazard, KernelResult, Plan, Verdict } from './types';

/** "+14 s" / "−3 s" (uses a real minus sign, like the web console). */
export function formatMargin(n: number): string {
  return `${n >= 0 ? '+' : '−'}${Math.abs(n)} s`;
}

export function verdictFor(csm: number): Verdict {
  if (csm < 0) return 'REJECT';
  return csm < PASS_MIN_CSM ? 'TIGHT' : 'PASS';
}

/** Action library with PoC assumed action times, resolved against the current cabin state. */
export function buildActionLibrary(s: CabinScenario): Record<ActionKey, CabinAction> {
  const cartLoose = s.cartSecured === 'NO';
  const hot = s.service === 'HOT_BEVERAGE' && cartLoose;
  const lavOcc = s.lav1 === 'OCCUPIED';
  return {
    STOP: { key: 'STOP', label: 'Stop service', sec: 2, on: s.service !== 'NONE' },
    HOT: { key: 'HOT', label: 'Secure hot liquid', sec: 7, on: hot },
    RETURN: {
      key: 'RETURN',
      label: 'Return cart to aft galley',
      sec: s.cartPos === 'MID_CABIN' ? 42 : 30,
      on: cartLoose,
    },
    LOCAL: { key: 'LOCAL', label: 'Secure cart locally', sec: 6, on: cartLoose },
    MIN: { key: 'MIN', label: 'Minimum local securing', sec: 13, on: cartLoose },
    LAV: { key: 'LAV', label: 'Assist lavatory passenger', sec: 6, on: lavOcc },
    SEAT: { key: 'SEAT', label: 'Crew seated', sec: 6, on: true },
  };
}

/**
 * Safety Kernel: CSM = TTA − CST − Safety Buffer.
 * PASS ≥ 15 s · TIGHT 0–14 s · REJECT < 0 s.
 */
export function computeKernel(s: CabinScenario): KernelResult {
  const cartLoose = s.cartSecured === 'NO';
  const hot = s.service === 'HOT_BEVERAGE' && cartLoose;
  const lavOcc = s.lav1 === 'OCCUPIED';
  const lib = buildActionLibrary(s);

  const counts: Record<Verdict, number> = { PASS: 0, TIGHT: 0, REJECT: 0 };
  let maxCst = 0;

  const plans: Plan[] = PLAN_DEFS.map((d) => {
    const active = d.keys.filter((k) => lib[k].on);
    const cst = active.reduce((t, k) => t + lib[k].sec, 0);
    const csm = s.tta - cst - s.buffer;
    const verdict = verdictFor(csm);
    counts[verdict]++;
    if (cst > maxCst) maxCst = cst;
    return {
      id: d.id,
      title: `Plan ${d.id}`,
      name: d.name,
      cst,
      csm,
      csmText: formatMargin(csm),
      verdict,
      steps: active.map((k) => lib[k]),
      stepsText: active.map((k) => lib[k].label).join(' → '),
    };
  });

  const safe = plans.filter((p) => p.verdict !== 'REJECT').sort((a, b) => a.cst - b.cst);

  const hazards: Hazard[] = [];
  if (cartLoose) {
    hazards.push({ text: `Cart unsecured · ${s.cartPos === 'AFT_CABIN' ? 'aft aisle' : 'mid aisle'}`, ok: false });
  }
  if (hot) hazards.push({ text: 'Hot liquid on the cart', ok: false });
  if (lavOcc) hazards.push({ text: 'LAV 1 occupied — passenger must return to seat', ok: false });
  if (!hazards.length) hazards.push({ text: 'No open hazards', ok: true });

  return {
    lib,
    plans,
    counts,
    best: safe[0] ?? null,
    axisMax: Math.max(90, Math.ceil((Math.max(s.tta, maxCst) + 10) / 10) * 10),
    hazards,
    cartLoose,
    hot,
    lavOcc,
    cartOnView: s.cartPos === 'AFT_CABIN',
  };
}

export { LIB_ORDER };
