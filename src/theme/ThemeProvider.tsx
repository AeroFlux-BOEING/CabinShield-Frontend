import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

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
