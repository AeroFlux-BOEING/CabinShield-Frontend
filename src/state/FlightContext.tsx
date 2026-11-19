import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Txt } from '../i18n/LangContext';
import { FlightSim } from './FlightSim';
import { GroundLink } from './GroundLink';

interface FlightCtx {
  sim: FlightSim;
  /** connection to the CabinShield Ground API (inactive when EXPO_PUBLIC_API_URL is unset) */
  ground: GroundLink;
  /** increments on every UI refresh; read it to subscribe */
  version: number;
  refresh: () => void;
  toast: Txt | null;
  dismissToast: () => void;
}

const Ctx = createContext<FlightCtx | null>(null);

/** Runs the simulation loop and re-renders consumers about 5 times per second. */
export function FlightProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const [sim] = useState(() => new FlightSim());
  const [ground] = useState(() => new GroundLink(sim, () => setVersion((v) => v + 1)));
  const [toast, setToast] = useState<Txt | null>(null);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    ground.attach();
    return () => ground.detach();
  }, [ground]);

  useEffect(() => {
    let toastTimer: ReturnType<typeof setTimeout> | undefined;
    sim.onToast = (m) => {
      setToast(m);
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => setToast(null), 9000);
    };
    let last = Date.now();
    let lastPlan = 0;
    const id = setInterval(() => {
      const now = Date.now();
      sim.advance((now - last) / 1000);
      last = now;
      if (sim.flight) {
        sim.evaluate();
        if (now - lastPlan > 1000) {
          sim.updatePlan(false);
          lastPlan = now;
        }
      }
      setVersion((v) => v + 1);
    }, 200);
    return () => {
      clearInterval(id);
      clearTimeout(toastTimer);
      sim.onToast = null;
    };
  }, [sim]);

  const value = useMemo(
    () => ({ sim, ground, version, refresh, toast, dismissToast: () => setToast(null) }),
    [sim, ground, version, refresh, toast],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFlight(): FlightCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useFlight must be used inside FlightProvider');
  return v;
}
