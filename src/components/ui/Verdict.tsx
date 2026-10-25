import { View } from 'react-native';

import type { Hazard, Verdict } from '../../domain/types';
import { useTheme, verdictColors } from '../../theme/ThemeProvider';
import { T } from './T';

export function Badge({ verdict }: { verdict: Verdict }) {
  const { c } = useTheme();
  const v = verdictColors(c, verdict);
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: v.bg, flexShrink: 0 }}>
      <T size={12} weight={800} tracking={0.04} color={v.fg}>
        {verdict}
      </T>
    </View>
  );
}

export function VDot({ verdict, size = 14 }: { verdict: Verdict; size?: number }) {
  const { c } = useTheme();
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: verdictColors(c, verdict).bar }} />;
}

export function HazardList({ hazards }: { hazards: Hazard[] }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {hazards.map((h) => (
        <View
          key={h.text}
          style={{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: h.ok ? c.passBg : c.tightBg }}
        >
          <T size={13} weight={700} color={h.ok ? c.pass : c.tight}>
            {h.text}
          </T>
        </View>
      ))}
    </View>
  );
}
