import Slider from '@react-native-community/slider';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Option } from '../../domain/constants';
import { useTheme } from '../../theme/ThemeProvider';
import { CardLabel } from './Surfaces';
import { T } from './T';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'default' | 'primary';
  big?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'default', big, disabled, style }: ButtonProps) {
  const { c } = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          height: big ? 44 : 40,
          paddingHorizontal: big ? 20 : 16,
          borderRadius: big ? 22 : 20,
          borderWidth: primary ? 0 : 1,
          borderColor: c.lineStrong,
          backgroundColor: primary ? c.accent : c.card,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <T weight={700} color={primary ? c.onAccent : c.fg}>
        {label}
      </T>
    </Pressable>
  );
}

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'solid' | 'alert';
  dot?: boolean;
}

export function Chip({ children, variant = 'default', dot }: ChipProps) {
  const { c } = useTheme();
  const bg = variant === 'solid' ? c.accent : variant === 'alert' ? c.tightBg : c.card;
  const fg = variant === 'solid' ? c.onAccent : variant === 'alert' ? c.tight : c.fg;
  return (
    <View
      style={{
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: bg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.tightBar }} /> : null}
      <T weight={variant === 'default' ? 600 : 700} color={fg} tnum>
        {children}
      </T>
    </View>
  );
}

interface SegmentedProps<V extends string> {
  options: Option<V>[];
  value: V;
  onChange: (v: V) => void;
  accessibilityLabel?: string;
}

/** Pill segmented control (Cabin zones). */
export function Segmented<V extends string>({ options, value, onChange, accessibilityLabel }: SegmentedProps<V>) {
  const { c } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        gap: 4,
        padding: 4,
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.line,
        borderTopLeftRadius: 26,
        borderBottomLeftRadius: 26,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
      }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{
              height: 40,
              minWidth: 84,
              paddingHorizontal: 18,
              borderRadius: 20,
              backgroundColor: on ? c.accent : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <T weight={700} color={on ? c.onAccent : c.fg}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

interface OptionFieldProps<V extends string> {
  label: string;
  options: Option<V>[];
  value: V;
  onChange: (v: V) => void;
}

/** Touch-friendly replacement for the web <select>: wrapping option pills. */
export function OptionField<V extends string>({ label, options, value, onChange }: OptionFieldProps<V>) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <CardLabel>{label}</CardLabel>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => onChange(o.value)}
              style={{
                height: 44,
                paddingHorizontal: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: on ? c.accent : c.lineStrong,
                backgroundColor: on ? c.accent : c.card,
                justifyContent: 'center',
              }}
            >
              <T weight={on ? 700 : 600} color={on ? c.onAccent : c.fg}>
                {o.label}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function ReadOnlyField({ label, value }: { label: string; value: string }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <CardLabel>{label}</CardLabel>
      <View style={{ height: 44, paddingHorizontal: 12, borderRadius: 12, backgroundColor: c.field, justifyContent: 'center' }}>
        <T weight={700}>{value}</T>
      </View>
    </View>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}

export function SliderField({ label, value, min, max, step, unit = 's', onChange }: SliderFieldProps) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 16, gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <CardLabel>{label}</CardLabel>
        <T size={20} weight={800} tnum>
          {value} {unit}
        </T>
      </View>
      <Slider
        accessibilityLabel={label}
        style={{ width: '100%', height: 40 }}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={(v: number) => onChange(Math.round(v))}
        minimumTrackTintColor={c.accent}
        maximumTrackTintColor={c.line}
        thumbTintColor={c.accent}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <T size={11} color={c.muted} tnum>
          {min} {unit}
        </T>
        <T size={11} color={c.muted} tnum>
          {max} {unit}
        </T>
      </View>
    </View>
  );
}
