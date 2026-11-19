import { createContext, useContext } from 'react';
import { useWindowDimensions } from 'react-native';

/** Optional override of the app canvas width (defaults to the window width). */
export const CanvasWidth = createContext<number | null>(null);

export function useResponsive() {
  const win = useWindowDimensions();
  const ctx = useContext(CanvasWidth);
  const width = ctx ?? win.width;
  return { width, compact: width < 760, narrow: width < 560 };
}
