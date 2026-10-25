import { ScrollView, View } from 'react-native';

import type { KernelResult } from '../domain/types';
import { useTheme, verdictColors } from '../theme/ThemeProvider';
import { DashedRule } from './ui/DashedRule';
import { T } from './ui/T';

const ROW_H = 30;
const ROW_GAP = 14;

/** Plan completion time (CST) vs. conservative TTA, with the safety buffer band. */
export function PlanChart({ m, tta, buffer }: { m: KernelResult; tta: number; buffer: number }) {
  const { c } = useTheme();
  const pct = (v: number) => Math.max(0, Math.min(100, (v / m.axisMax) * 100));
  const bufFrom = Math.max(0, tta - buffer);

  const ticks: number[] = [];
  for (let t = 0; t <= m.axisMax; t += 10) ticks.push(t);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ flexGrow: 1, paddingBottom: 4 }}>
      <View style={{ flex: 1, minWidth: 560, flexDirection: 'row', paddingTop: 36, paddingRight: 16 }}>
        <View style={{ width: 84, marginRight: 12, gap: ROW_GAP }}>
          {m.plans.map((p) => (
            <View key={p.id} style={{ height: ROW_H, justifyContent: 'center' }}>
              <T size={13} weight={800}>
                {p.title}
              </T>
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ gap: ROW_GAP, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: c.lineStrong, paddingBottom: 6 }}>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -6,
                bottom: 0,
                left: `${pct(bufFrom)}%`,
                width: `${pct(tta) - pct(bufFrom)}%`,
                backgroundColor: c.tightBg,
                opacity: 0.85,
              }}
            />
            <View pointerEvents="none" style={{ position: 'absolute', top: -6, bottom: 0, left: `${pct(tta)}%`, width: 2, zIndex: 1 }}>
              <DashedRule color={c.rejectBar} thickness={2} dash={6} gap={4} />

            </View>
            <View pointerEvents="none" style={{ position: 'absolute', top: -32, left: `${pct(tta)}%`, marginLeft: 6, width: 220 }}>
              <T size={12} weight={800} color={c.reject} tnum numberOfLines={1}>
                TURBULENCE · {tta} s
              </T>
            </View>
            {m.plans.map((p) => {
              const v = verdictColors(c, p.verdict);
              return (
                <View key={p.id} style={{ height: ROW_H, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ height: ROW_H, borderRadius: 8, width: `${pct(p.cst)}%`, backgroundColor: v.bar }} />
                  <T size={13} weight={800} color={v.fg} tnum numberOfLines={1}>
                    CST {p.cst} · CSM {p.csmText}
                  </T>
                </View>
              );
            })}
          </View>
          <View style={{ height: 24 }}>
            {ticks.map((t) => (
              <T
                key={t}
                size={11}
                color={c.muted}
                tnum
                align="center"
                style={{ position: 'absolute', top: 4, left: `${pct(t)}%`, width: 32, marginLeft: -16 }}
              >
                {t}
              </T>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
