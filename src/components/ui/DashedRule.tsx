import { View } from 'react-native';

interface Props {
  color: string;
  thickness?: number;
  dash?: number;
  gap?: number;
  vertical?: boolean;
  /** Number of dashes rendered; extra dashes are clipped by the parent box. */
  count?: number;
}

/**
 * Dashed line that renders consistently on iOS/Android/web
 * (single-side dashed borders are unreliable on iOS).
 * Fills its parent's cross axis: give the wrapper an explicit size or stretch it.
 */
export function DashedRule({ color, thickness = 1, dash = 4, gap = 4, vertical = true, count = 80 }: Props) {
  return (
    <View
      pointerEvents="none"
      style={[
        { overflow: 'hidden', gap },
        vertical ? { width: thickness, height: '100%', flexDirection: 'column' } : { height: thickness, width: '100%', flexDirection: 'row' },
      ]}
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={vertical ? { width: thickness, height: dash, backgroundColor: color } : { height: thickness, width: dash, backgroundColor: color }}
        />
      ))}
    </View>
  );
}
