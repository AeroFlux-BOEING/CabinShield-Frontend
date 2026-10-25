export type Service = 'HOT_BEVERAGE' | 'COLD_BEVERAGE' | 'MEAL' | 'NONE';
export type CartPosition = 'AFT_CABIN' | 'MID_CABIN';
export type YesNo = 'YES' | 'NO';
export type LavatoryState = 'OCCUPIED' | 'EMPTY';
export type Verdict = 'PASS' | 'TIGHT' | 'REJECT';
export type PlanId = 'A' | 'B' | 'C';
export type ZoneId = 'forward' | 'mid' | 'aft';
export type ActionKey = 'STOP' | 'HOT' | 'RETURN' | 'LOCAL' | 'MIN' | 'LAV' | 'SEAT';

/** Cabin state entered by the crew + time inputs from the ops layer. */
export interface CabinScenario {
  service: Service;
  cartPos: CartPosition;
  cartSecured: YesNo;
  lav1: LavatoryState;
  /** Conservative time-to-turbulence, seconds. */
  tta: number;
  /** Airline-defined safety buffer, seconds. */
  buffer: number;
}

export interface CabinAction {
  key: ActionKey;
  label: string;
  sec: number;
  /** Whether the action applies to the current cabin state. */
  on: boolean;
}

export interface PlanDef {
  id: PlanId;
  name: string;
  keys: ActionKey[];
}

export interface Plan {
  id: PlanId;
  title: string;
  name: string;
  /** Cabin securing time, seconds. */
  cst: number;
  /** Cabin safety margin = TTA − CST − buffer, seconds. */
  csm: number;
  csmText: string;
  verdict: Verdict;
  steps: CabinAction[];
  stepsText: string;
}

export interface Hazard {
  text: string;
  ok: boolean;
}

export interface KernelResult {
  lib: Record<ActionKey, CabinAction>;
  plans: Plan[];
  counts: Record<Verdict, number>;
  /** Fastest plan that is not REJECT, or null when every plan is rejected. */
  best: Plan | null;
  axisMax: number;
  hazards: Hazard[];
  cartLoose: boolean;
  hot: boolean;
  lavOcc: boolean;
  cartOnView: boolean;
}

export interface Zone {
  name: string;
  from: number;
  to: number;
}
