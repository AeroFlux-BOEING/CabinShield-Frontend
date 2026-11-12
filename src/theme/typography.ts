import { Platform, type TextStyle } from 'react-native';

/** System type: SF Pro + Apple SD Gothic Neo on Apple devices, Roboto/Noto on Android, a matching stack on web. */
export const fontFamily: string | undefined = Platform.select({
  web: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
  default: undefined,
});

export type Weight = 400 | 500 | 600 | 700 | 800;

export function weight(w: Weight): TextStyle['fontWeight'] {
  return String(w) as TextStyle['fontWeight'];
}

/** Font for react-native-svg <Text> (defaults to serif on web otherwise). */
export const svgFont: string | undefined = fontFamily;
