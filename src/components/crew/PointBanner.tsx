import { View } from 'react-native';

import { mmss } from '../../state/FlightSim';
import { useFlight } from '../../state/FlightContext';
import { bannerView } from '../../state/crewView';
import { useResponsive } from '../../hooks/useResponsive';
import { useTheme } from '../../theme/ThemeProvider';
import { levelColors } from '../../theme/tokens';
import { T } from '../ui/T';

export function PointBanner() {
  const { c, scheme } = useTheme();
  const { sim } = useFlight();
  const { compact } = useResponsive();
  const b = bannerView(sim);
  const col = levelColors(c, b.level);
  const tinted = b.level > 0;
  const cnt = b.countSec != null ? mmss(b.countSec) : null;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'flex-start' : 'center', gap: 16,
        borderRadius: 24, paddingVertical: 20, paddingHorizontal: 24, backgroundColor: tinted ? col.bg : c.card,
        borderWidth: b.level === 4 ? 3 : 0, borderColor: col.dot,
        shadowColor: '#000', shadowOpacity: scheme === 'dark' ? 0 : 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
      }}
    >
      <View style={{ flex: compact ? undefined : 1, gap: 6, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: col.dot }} />
          <T size={14} weight={600} color={tinted ? col.fg : c.ink2}>{b.chip}</T>
        </View>
        <T size={compact ? 26 : 30} weight={700} tracking={-0.03} lh={1.2}>{b.head}</T>
        <T size={16} color={c.ink2}>{b.sub}</T>
      </View>
      <View style={{ alignItems: compact ? 'flex-start' : 'flex-end' }}>
        <T size={13} weight={500} color={c.ink2}>{b.countLabel}</T>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          {cnt ? (
            <>
              <T size={60} weight={600} tracking={-0.045} color={tinted ? col.fg : c.ink3} num>{cnt.big}</T>
              <T size={19} weight={500} color={c.ink2}>{cnt.unit}</T>
              {cnt.sec ? (
                <>
                  <T size={60} weight={600} tracking={-0.045} color={tinted ? col.fg : c.ink3} num>{' ' + cnt.sec}</T>
                  <T size={19} weight={500} color={c.ink2}>초</T>
                </>
              ) : null}
            </>
          ) : (
            <View style={{ width: 60, height: 6, borderRadius: 3, backgroundColor: c.ink3, marginVertical: 30 }} />
          )}
        </View>
      </View>
    </View>
  );
}
