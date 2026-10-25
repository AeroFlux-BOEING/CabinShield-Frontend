import { ScrollView, View } from 'react-native';

import { ZONES } from '../domain/constants';
import type { ZoneId } from '../domain/types';
import { useTheme } from '../theme/ThemeProvider';
import { T } from './ui/T';

const ROW_LABELS: Record<number, string> = { 1: '1', 4: '4', 11: '11', 21: '21', 28: '28' };
const ROWS = Array.from({ length: 28 }, (_, i) => i + 1);

function zoneOf(row: number): ZoneId {
  if (row <= ZONES.forward.to) return 'forward';
  return row <= ZONES.mid.to ? 'mid' : 'aft';
}

function Box({ label, width, height, warn }: { label: string; width: number; height: number; warn?: boolean }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 6,
        borderWidth: warn ? 1.5 : 1,
        borderStyle: warn ? 'solid' : 'dashed',
        borderColor: warn ? c.tightBar : c.lineStrong,
        backgroundColor: warn ? c.tightBg : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <T size={9} weight={warn ? 800 : 700} color={warn ? c.tight : c.muted}>
        {label}
      </T>
    </View>
  );
}

/** Boeing typical 2-class layout (illustrative). Business rows 1–3 (2-2), economy 4–28 (3-3). */
export function Floorplan({ zone, lavOcc }: { zone: ZoneId; lavOcc: boolean }) {
  const { c } = useTheme();

  const seatStack = (row: number) => {
    const biz = row <= 3;
    const size = biz ? 20 : 14;
    const selected = zoneOf(row) === zone;
    return (
      <View style={{ gap: 4 }}>
        {Array.from({ length: biz ? 2 : 3 }, (_, i) => (
          <View key={i} style={{ width: size, height: size, borderRadius: biz ? 5 : 4, backgroundColor: selected ? c.accent : c.seat }} />
        ))}
      </View>
    );
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          borderWidth: 1.5,
          borderColor: c.line,
          borderTopLeftRadius: 80,
          borderBottomLeftRadius: 80,
          borderTopRightRadius: 22,
          borderBottomRightRadius: 22,
          paddingVertical: 14,
          paddingRight: 18,
          paddingLeft: 44,
          backgroundColor: c.card,
        }}
      >
        <T size={10} weight={700} color={c.muted} style={{ marginRight: 8 }}>
          FWD
        </T>
        <View style={{ gap: 6, marginRight: 8 }}>
          <Box label="LAV" width={34} height={48} />
          <Box label="GLY" width={34} height={48} />
        </View>
        {ROWS.map((n) => (
          <View key={n} style={{ alignItems: 'center', marginRight: n === 3 ? 10 : 0 }}>
            {seatStack(n)}
            <View style={{ height: 22, justifyContent: 'center' }}>
              <T size={10} weight={700} color={c.muted} tnum>
                {ROW_LABELS[n] ?? ''}
              </T>
            </View>
            {seatStack(n)}
          </View>
        ))}
        <View style={{ gap: 6, marginLeft: 8 }}>
          <Box label="LAV 1" width={40} height={32} warn={lavOcc} />
          <Box label="GLY" width={40} height={32} />
          <Box label="LAV 2" width={40} height={32} />
        </View>
        <T size={10} weight={700} color={c.muted} style={{ marginLeft: 8 }}>
          AFT
        </T>
      </View>
    </ScrollView>
  );
}
