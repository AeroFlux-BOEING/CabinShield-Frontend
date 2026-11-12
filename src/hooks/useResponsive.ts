import { createContext, useContext } from 'react';
import { useWindowDimensions } from 'react-native';

/** Width of the app canvas (the iPad frame on wide web screens, otherwise the window). */
export const CanvasWidth = createContext<number | null>(null);

export function useResponsive() {
  const win = useWindowDimensions();
  const ctx = useContext(CanvasWidth);
  const width = ctx ?? win.width;
  return { width, compact: width < 760, narrow: width < 560 };
}
