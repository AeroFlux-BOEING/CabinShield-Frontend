import { useWindowDimensions } from 'react-native';

/** Mirrors the web console breakpoints (760 px / 560 px). */
export function useResponsive() {
  const { width } = useWindowDimensions();
  return { width, compact: width < 760, narrow: width < 560 };
}
