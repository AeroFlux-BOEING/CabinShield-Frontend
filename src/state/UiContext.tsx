import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface Ui {
  setupOpen: boolean;
  openSetup: () => void;
  closeSetup: () => void;
}

const Ctx = createContext<Ui>({ setupOpen: true, openSetup: () => {}, closeSetup: () => {} });

export function UiProvider({ children }: { children: ReactNode }) {
  const [setupOpen, setOpen] = useState(true);
  const value = useMemo(() => ({ setupOpen, openSetup: () => setOpen(true), closeSetup: () => setOpen(false) }), [setupOpen]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useUi = () => useContext(Ctx);
