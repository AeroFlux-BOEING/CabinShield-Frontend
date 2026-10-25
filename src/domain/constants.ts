import type {
  ActionKey,
  CabinScenario,
  CartPosition,
  LavatoryState,
  PlanDef,
  Service,
  YesNo,
  Zone,
  ZoneId,
} from './types';

export const SCENARIO_01: CabinScenario = {
  service: 'HOT_BEVERAGE',
  cartPos: 'AFT_CABIN',
  cartSecured: 'NO',
  lav1: 'OCCUPIED',
  tta: 75,
  buffer: 10,
};

export const SERVICE_NAMES: Record<Service, string> = {
  HOT_BEVERAGE: 'Hot beverage service',
  COLD_BEVERAGE: 'Cold beverage service',
  MEAL: 'Meal service',
  NONE: 'No service',
};

export const PLAN_DEFS: PlanDef[] = [
  { id: 'A', name: 'Full tidy-up', keys: ['STOP', 'HOT', 'RETURN', 'LAV', 'SEAT'] },
  { id: 'B', name: 'Minimum safe transition', keys: ['STOP', 'HOT', 'LOCAL', 'LAV', 'SEAT'] },
  { id: 'C', name: 'Self-protection', keys: ['STOP', 'MIN', 'SEAT'] },
];

export const LIB_ORDER: ActionKey[] = ['STOP', 'HOT', 'RETURN', 'LOCAL', 'MIN', 'LAV', 'SEAT'];

export const ZONES: Record<ZoneId, Zone> = {
  forward: { name: 'Forward', from: 1, to: 10 },
  mid: { name: 'Mid', from: 11, to: 20 },
  aft: { name: 'Aft', from: 21, to: 28 },
};

export const ZONE_ORDER: ZoneId[] = ['forward', 'mid', 'aft'];

/** Verdict thresholds on CSM, seconds. */
export const PASS_MIN_CSM = 15;

export interface Option<T extends string> {
  value: T;
  label: string;
}

export const SERVICE_OPTIONS: Option<Service>[] = [
  { value: 'HOT_BEVERAGE', label: 'Hot beverage' },
  { value: 'COLD_BEVERAGE', label: 'Cold beverage' },
  { value: 'MEAL', label: 'Meal' },
  { value: 'NONE', label: 'None' },
];

export const CART_POSITION_OPTIONS: Option<CartPosition>[] = [
  { value: 'AFT_CABIN', label: 'Aft cabin' },
  { value: 'MID_CABIN', label: 'Mid cabin' },
];

export const YES_NO_OPTIONS: Option<YesNo>[] = [
  { value: 'NO', label: 'No' },
  { value: 'YES', label: 'Yes' },
];

export const LAVATORY_OPTIONS: Option<LavatoryState>[] = [
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'EMPTY', label: 'Empty' },
];

export const TTA_RANGE = { min: 30, max: 120, step: 5 } as const;
export const BUFFER_RANGE = { min: 0, max: 30, step: 1 } as const;

export const PLACEHOLDER_NOTE = '※ 모든 행동시간 및 임계값은 현재 PoC 가정값입니다.';
