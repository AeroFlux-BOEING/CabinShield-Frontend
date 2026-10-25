import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import { SCENARIO_01 } from '../domain/constants';
import { computeKernel } from '../domain/kernel';
import type { CabinScenario, KernelResult, PlanId, ZoneId } from '../domain/types';

export interface UiState extends CabinScenario {
  zone: ZoneId;
  viewPlan: PlanId;
  confirmed: PlanId | null;
}

type Action =
  | { type: 'field'; field: keyof CabinScenario; value: CabinScenario[keyof CabinScenario] }
  | { type: 'zone'; zone: ZoneId }
  | { type: 'view'; plan: PlanId }
  | { type: 'confirm'; plan: PlanId }
  | { type: 'reset' };

const INITIAL: UiState = { ...SCENARIO_01, zone: 'aft', viewPlan: 'A', confirmed: null };

function reducer(state: UiState, action: Action): UiState {
  switch (action.type) {
    case 'field':
      // Any change to the cabin state invalidates the crew's confirmation.
      return { ...state, [action.field]: action.value, confirmed: null };
    case 'zone':
      return { ...state, zone: action.zone };
    case 'view':
      return { ...state, viewPlan: action.plan };
    case 'confirm':
      return { ...state, confirmed: action.plan, viewPlan: action.plan };
    case 'reset':
      return { ...state, ...SCENARIO_01, confirmed: null, viewPlan: 'A' };
  }
}

interface ScenarioContextValue {
  state: UiState;
  result: KernelResult;
  setField: <K extends keyof CabinScenario>(field: K, value: CabinScenario[K]) => void;
  setZone: (zone: ZoneId) => void;
  viewPlan: (plan: PlanId) => void;
  confirmPlan: (plan: PlanId) => void;
  reset: () => void;
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const result = useMemo(
    () =>
      computeKernel({
        service: state.service,
        cartPos: state.cartPos,
        cartSecured: state.cartSecured,
        lav1: state.lav1,
        tta: state.tta,
        buffer: state.buffer,
      }),
    [state.service, state.cartPos, state.cartSecured, state.lav1, state.tta, state.buffer],
  );

  const setField = useCallback(<K extends keyof CabinScenario>(field: K, value: CabinScenario[K]) => {
    dispatch({ type: 'field', field, value });
  }, []);
  const setZone = useCallback((zone: ZoneId) => dispatch({ type: 'zone', zone }), []);
  const viewPlan = useCallback((plan: PlanId) => dispatch({ type: 'view', plan }), []);
  const confirmPlan = useCallback((plan: PlanId) => dispatch({ type: 'confirm', plan }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  const value = useMemo(
    () => ({ state, result, setField, setZone, viewPlan, confirmPlan, reset }),
    [state, result, setField, setZone, viewPlan, confirmPlan, reset],
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario(): ScenarioContextValue {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error('useScenario must be used inside <ScenarioProvider>');
  return ctx;
}
