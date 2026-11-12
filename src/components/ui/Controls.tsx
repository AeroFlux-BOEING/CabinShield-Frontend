import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { T } from './T';

/** iOS segmented control. */
export function Segmented<V extends string | number>({
  options, value, onChange, label, style,
}: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void; label: string; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[{ flexDirection: 'row', backgroundColor: c.fill, borderRadius: 10, padding: 3, gap: 2, alignSelf: 'flex-start' }, style]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{
              flexGrow: 1, minHeight: 30, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
              backgroundColor: on ? c.card : 'transparent',
              shadowColor: '#000', shadowOpacity: on ? 0.12 : 0, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
            }}
          >
            <T size={13} weight={on ? 600 : 500}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Rounded pill button. */
export function PillButton({ children, onPress, active, tone, label }: { children: ReactNode; onPress: () => void; active?: boolean; tone?: 'warn'; label?: string }) {
  const { c } = useTheme();
  const bg = active ? (tone === 'warn' ? c.p2Dot : c.navy) : c.soft;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={({ pressed }) => ({ minHeight: 36, paddingHorizontal: 15, borderRadius: 999, justifyContent: 'center', backgroundColor: pressed && !active ? c.fill : bg })}
    >
      <T size={14} weight={500} color={active ? '#FFFFFF' : c.ink}>
        {children}
      </T>
    </Pressable>
  );
}
