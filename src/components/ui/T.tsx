import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { FONT_FAMILY, type Weight } from '../../theme/typography';

export interface TProps extends TextProps {
  size?: number;
  weight?: Weight;
  color?: string;
  /** Tabular numerals. */
  tnum?: boolean;
  /** Letter spacing in em (e.g. -0.03). */
  tracking?: number;
  upper?: boolean;
  lineHeight?: number;
  align?: TextStyle['textAlign'];
  strike?: boolean;
}

/** Themed text. Use <Span> for coloured runs nested inside a <T>. */
export function T({
  size = 14,
  weight = 400,
  color,
  tnum,
  tracking,
  upper,
  lineHeight,
  align,
  strike,
  style,
  ...rest
}: TProps) {
  const { c } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: FONT_FAMILY[weight],
          fontSize: size,
          color: color ?? c.fg,
          letterSpacing: tracking != null ? tracking * size : undefined,
          textTransform: upper ? 'uppercase' : undefined,
          fontVariant: tnum ? ['tabular-nums'] : undefined,
          lineHeight,
          textAlign: align,
          textDecorationLine: strike ? 'line-through' : undefined,
        },
        style,
      ]}
    />
  );
}

/** Inherits font settings from the parent <T>; only overrides colour/weight. */
export function Span({ color, weight, children }: { color?: string; weight?: Weight; children: React.ReactNode }) {
  return <Text style={{ color, fontFamily: weight ? FONT_FAMILY[weight] : undefined }}>{children}</Text>;
}
