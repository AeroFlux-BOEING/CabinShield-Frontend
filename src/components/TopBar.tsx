import { Pressable, View } from 'react-native';

import { ROUTE_NM } from '../domain/geo';
import { hoursText } from '../state/FlightSim';
import { useFlight } from '../state/FlightContext';
import { useUi } from '../state/UiContext';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../theme/ThemeProvider';
import { T } from './ui/T';

export function TopBar() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { openSetup } = useUi();
  const { compact } = useResponsive();
  const f = sim.flight;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 14, rowGap: 6, paddingBottom: 4 }}>
      <T size={17} weight={600} tracking={-0.02}>{f ? `${f.no}${f.dateLabel ? ' · ' + f.dateLabel : ''}` : '비행편 없음'}</T>
      <Pressable accessibilityRole="button" onPress={openSetup} style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: pressed ? c.navySoft : c.card })}>
        <T size={12.5} weight={600} color={c.navy}>비행편 변경</T>
      </Pressable>
      <T size={14} color={c.ink2}>B787-9 · 인천 → 샌프란시스코</T>
      {compact ? null : <View style={{ flex: 1 }} />}
      <T size={14} color={c.ink2} num>{`현재 ${sim.clock(sim.t)} UTC · 도착까지 ${hoursText(((ROUTE_NM - sim.estD) / 492) * 3600)}`}</T>
    </View>
  );
}
