import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { fontFamily, weight as fw, type Weight } from '../../theme/typography';

interface Props {
  children?: ReactNode;
  size?: number;
  weight?: Weight;
  color?: string;
  /** letter-spacing in em */
  tracking?: number;
  /** tabular numbers */
  num?: boolean;
  lines?: number;
  align?: TextStyle['textAlign'];
  lh?: number;
  style?: StyleProp<TextStyle>;
}

export function T({ children, size = 15, weight = 400, color, tracking = -0.01, num, lines, align, lh, style }: Props) {
  const { c } = useTheme();
  return (
    <Text
      numberOfLines={lines}
      style={[
        {
          fontFamily,
          fontSize: size,
          fontWeight: fw(weight),
          color: color ?? c.ink,
          letterSpacing: tracking * size,
          lineHeight: lh ? lh * size : undefined,
          textAlign: align,
          fontVariant: num ? ['tabular-nums'] : undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
