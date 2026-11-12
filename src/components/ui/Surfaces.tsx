import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { radius } from '../../theme/tokens';
import { T } from './T';

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  const { c, scheme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderRadius: radius.card,
          padding: padded ? 20 : 0,
          gap: 14,
          minWidth: 0,
          shadowColor: '#000',
          shadowOpacity: scheme === 'dark' ? 0 : 0.06,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 4 },
          elevation: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Card heading with optional subtitle and right-side accessory. */
export function CardHead({ title, en, right }: { title: string; en?: string; right?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexShrink: 1 }}>
        <T size={17} weight={600} tracking={-0.02}>
          {title}
        </T>
        {en ? (
          <T size={12.5} weight={500} color={c.ink3} tracking={0}>
            {en}
          </T>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export type TagTone = 'ok' | 'p1' | 'p2' | 'p3' | 'navy' | 'mute';

export function Tag({ tone = 'mute', children, dot = true }: { tone?: TagTone; children: ReactNode; dot?: boolean }) {
  const { c } = useTheme();
  const map = {
    ok: [c.okSoft, c.ok], p1: [c.p1Soft, c.p1], p2: [c.p2Soft, c.p2], p3: [c.p3Soft, c.p3], navy: [c.navySoft, c.navy], mute: [c.soft, c.ink3],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      {dot ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: fg, opacity: 0.85 }} /> : null}
      <T size={12} weight={600} color={fg} tracking={0} num>
        {children}
      </T>
    </View>
  );
}

/** Small gray inner tile (label / value / note). */
export function Tile({ label, value, unit, note, style }: { label: string; value: ReactNode; unit?: string; note?: string; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View style={[{ backgroundColor: c.soft, borderRadius: radius.inner, paddingVertical: 12, paddingHorizontal: 14, gap: 2, minWidth: 0, justifyContent: 'center' }, style]}>
      <T size={12.5} color={c.ink2}>
        {label}
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
        {typeof value === 'string' ? (
          <T size={22} weight={600} tracking={-0.03} num>
            {value}
          </T>
        ) : (
          value
        )}
        {unit ? (
          <T size={13} weight={500} color={c.ink2} tracking={0}>
            {unit}
          </T>
        ) : null}
      </View>
      {note ? (
        <T size={12} color={c.ink2}>
          {note}
        </T>
      ) : null}
    </View>
  );
}

/** Label/value row list with hairlines. */
export function KV({ rows }: { rows: [string, string, string?][] }) {
  const { c } = useTheme();
  return (
    <View>
      {rows.map(([k, v, sub], i) => (
        <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: 9, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
          <T size={13.5} color={c.ink2}>
            {k}
          </T>
          <View style={{ flexShrink: 1, alignItems: 'flex-end' }}>
            <T size={14.5} weight={600} align="right" num>
              {v}
            </T>
            {sub ? (
              <T size={12} color={c.ink2} align="right">
                {sub}
              </T>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
