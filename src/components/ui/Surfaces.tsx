import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { T } from './T';

interface SurfaceProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  gap?: number;
  /** Stretch to fill the parent (use inside <Grid> cells). */
  fill?: boolean;
}

export function Card({ style, gap = 8, fill, ...rest }: SurfaceProps) {
  const { c } = useTheme();
  return (
    <View
      {...rest}
      style={[{ backgroundColor: c.card, borderRadius: 22, padding: 20, gap, minWidth: 0 }, fill && { flexGrow: 1 }, style]}
    />
  );
}

export function Panel({ style, gap = 14, fill, ...rest }: SurfaceProps) {
  const { c } = useTheme();
  return (
    <View
      {...rest}
      style={[{ backgroundColor: c.surface, borderRadius: 28, padding: 24, gap, minWidth: 0 }, fill && { flexGrow: 1 }, style]}
    />
  );
}

export function Eyebrow({ children, color }: { children: React.ReactNode; color?: string }) {
  const { c } = useTheme();
  return (
    <T size={12} weight={700} tracking={0.08} upper color={color ?? c.muted}>
      {children}
    </T>
  );
}

export function CardLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  const { c } = useTheme();
  return (
    <T size={13} weight={700} color={color ?? c.fg2}>
      {children}
    </T>
  );
}

/** Key/value line: label left, value right. */
export function KV({ k, v, kColor }: { k: React.ReactNode; v: React.ReactNode; kColor?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <T weight={800} color={kColor}>
        {k}
      </T>
      <T tnum style={{ flexShrink: 1, textAlign: 'right' }}>
        {v}
      </T>
    </View>
  );
}

/** Flex item that mirrors CSS `flex: <grow> 1 <basis>px`. */
export function flexItem(grow: number, basis: number): ViewStyle {
  return { flexGrow: grow, flexShrink: 1, flexBasis: basis, minWidth: 0, maxWidth: '100%' };
}

export const wrapRow: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' };
