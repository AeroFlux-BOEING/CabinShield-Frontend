import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import type { Verdict } from '../domain/types';
import { darkPalette, lightPalette, type Palette } from './tokens';

interface Theme {
  scheme: 'light' | 'dark';
  c: Palette;
}

const ThemeContext = createContext<Theme>({ scheme: 'light', c: lightPalette });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const value = useMemo<Theme>(() => {
    const scheme = system === 'dark' ? 'dark' : 'light';
    return { scheme, c: scheme === 'dark' ? darkPalette : lightPalette };
  }, [system]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export function verdictColors(c: Palette, v: Verdict) {
  switch (v) {
    case 'PASS':
      return { fg: c.pass, bg: c.passBg, bar: c.passBar };
    case 'TIGHT':
      return { fg: c.tight, bg: c.tightBg, bar: c.tightBar };
    case 'REJECT':
      return { fg: c.reject, bg: c.rejectBg, bar: c.rejectBar };
  }
}
