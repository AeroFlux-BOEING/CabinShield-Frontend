import { Pressable, View } from 'react-native';

import { Screen, ScreenHeader } from '../components/Screen';
import { Grid } from '../components/ui/Grid';
import { Badge, VDot } from '../components/ui/Verdict';
import { Card, CardLabel, KV, Panel, flexItem, wrapRow } from '../components/ui/Surfaces';
import { T } from '../components/ui/T';
import { LIB_ORDER } from '../domain/constants';
import { useResponsive } from '../hooks/useResponsive';
import { useScenario } from '../state/ScenarioContext';
import { useTheme, verdictColors } from '../theme/ThemeProvider';

export default function KernelScreen() {
  const { c } = useTheme();
  const { compact } = useResponsive();
  const { state, result: m, viewPlan } = useScenario();
  const vp = m.plans.find((p) => p.id === state.viewPlan) ?? m.plans[0];
  const big = compact ? 44 : 56;

  return (
    <Screen>
      <ScreenHeader
        eyebrow={`Verifying ${vp.title}`}
        title="Safety Kernel"
        right={
          <T size={18} weight={800}>
            CSM = TTA − CST − Safety Buffer
          </T>
        }
      />

      <Grid min={200}>
        <Card fill>
          <CardLabel>TTA · time to turbulence</CardLabel>
          <T size={big} weight={800} tracking={-0.03} lineHeight={big * 1.1} color={c.accentInk} tnum>
            {state.tta} s
          </T>
          <T size={13} color={c.muted}>
            Conservative lower bound
          </T>
        </Card>
        <Card fill>
          <CardLabel>CST · cabin securing time</CardLabel>
          <T size={big} weight={800} tracking={-0.03} lineHeight={big * 1.1} tnum>
            {vp.cst} s
          </T>
          <T size={13} color={c.muted}>
            {vp.steps.length} actions in {vp.title}
          </T>
        </Card>
        <Card fill>
          <CardLabel>CSM · safety margin</CardLabel>
          <T size={big} weight={800} tracking={-0.03} lineHeight={big * 1.1} color={verdictColors(c, vp.verdict).fg} tnum>
            {vp.csmText}
          </T>
          <T size={13} color={c.muted}>
            After {state.buffer} s buffer · {vp.verdict}
          </T>
        </Card>
      </Grid>

      <View style={wrapRow}>
        <Panel style={flexItem(3, 480)} gap={12}>
          <T size={22} weight={800}>
            Verdicts
          </T>
          {m.plans.map((p) => {
            const selected = p.id === vp.id;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => viewPlan(p.id)}
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 18,
                  backgroundColor: c.card,
                  borderWidth: 2,
                  borderColor: selected ? c.accent : 'transparent',
                }}
              >
                <VDot verdict={p.verdict} />
                <View style={[flexItem(1, 220), { gap: 2 }]}>
                  <T size={15} weight={800}>
                    {p.title} · {p.name}
                  </T>
                  <T size={12} color={c.muted}>
                    {p.stepsText}
                  </T>
                </View>
                <T weight={700} tnum>
                  CST {p.cst} s · CSM {p.csmText}
                </T>
                <Badge verdict={p.verdict} />
              </Pressable>
            );
          })}
        </Panel>

        <View style={[flexItem(1, 280), { gap: 16 }]}>
          <Card gap={10}>
            <CardLabel>Verdict rules</CardLabel>
            <KV k="PASS" kColor={c.pass} v="CSM ≥ 15 s" />
            <KV k="TIGHT" kColor={c.tight} v="0 – 14 s" />
            <KV k="REJECT" kColor={c.reject} v="CSM < 0 s" />
          </Card>
          <Card>
            <CardLabel>Action library</CardLabel>
            {LIB_ORDER.map((k) => {
              const a = m.lib[k];
              const color = a.on ? c.fg : c.muted;
              return (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <T size={13} color={color} strike={!a.on}>
                    {a.label}
                  </T>
                  <T size={13} weight={700} color={color} strike={!a.on} tnum>
                    {a.sec} s
                  </T>
                </View>
              );
            })}
            <T size={12} color={c.muted}>
              Struck-through actions don't apply to the current cabin state.
            </T>
          </Card>
        </View>
      </View>
    </Screen>
  );
}
