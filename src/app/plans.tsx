import { Pressable, View } from 'react-native';

import { PlanChart } from '../components/PlanChart';
import { Screen, ScreenHeader } from '../components/Screen';
import { Grid } from '../components/ui/Grid';
import { Badge, VDot } from '../components/ui/Verdict';
import { Panel } from '../components/ui/Surfaces';
import { T } from '../components/ui/T';
import type { Plan } from '../domain/types';
import { useScenario } from '../state/ScenarioContext';
import { useTheme } from '../theme/ThemeProvider';

export default function PlansScreen() {
  const { c } = useTheme();
  const { state, result: m } = useScenario();

  return (
    <Screen>
      <ScreenHeader eyebrow="GenAI proposes · Kernel verifies · Crew decides" title="Response Plans" />

      <Panel>
        <T size={20} weight={800}>
          Plan completion time vs. conservative TTA
        </T>
        <PlanChart m={m} tta={state.tta} buffer={state.buffer} />
        <T size={12} color={c.muted}>
          Seconds from now. The shaded band is the {state.buffer} s safety buffer before turbulence.
        </T>
      </Panel>

      <Grid min={260}>
        {m.plans.map((p) => (
          <PlanCard key={p.id} plan={p} confirmed={state.confirmed === p.id} />
        ))}
      </Grid>
    </Screen>
  );
}

function PlanCard({ plan: p, confirmed }: { plan: Plan; confirmed: boolean }) {
  const { c } = useTheme();
  const { confirmPlan } = useScenario();
  const rejected = p.verdict === 'REJECT';

  const btn = rejected
    ? { borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, fg: c.muted }
    : confirmed
      ? { borderWidth: 0, borderColor: 'transparent', backgroundColor: c.accent, fg: c.onAccent }
      : { borderWidth: 1, borderColor: c.accentInk, backgroundColor: c.card, fg: c.accentInk };

  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: c.card,
        borderRadius: 22,
        padding: 20,
        gap: 12,
        borderWidth: 2,
        borderColor: confirmed ? c.accent : 'transparent',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <VDot verdict={p.verdict} />
        <T size={15} weight={800} style={{ flex: 1 }}>
          {p.title} · {p.name}
        </T>
        <Badge verdict={p.verdict} />
      </View>
      <T weight={700} tnum>
        CST {p.cst} s · CSM {p.csmText}
      </T>
      <View style={{ gap: 6 }}>
        {p.steps.map((s) => (
          <View
            key={s.key}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 8,
              backgroundColor: c.surface,
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 10,
            }}
          >
            <T size={13} style={{ flexShrink: 1 }}>
              {s.label}
            </T>
            <T size={13} weight={700} tnum>
              {s.sec} s
            </T>
          </View>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: rejected, selected: confirmed }}
        disabled={rejected}
        onPress={() => confirmPlan(p.id)}
        style={({ pressed }) => ({
          height: 44,
          borderRadius: 22,
          borderWidth: btn.borderWidth,
          borderColor: btn.borderColor,
          backgroundColor: btn.backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <T weight={700} color={btn.fg}>
          {rejected ? 'Rejected by kernel' : confirmed ? 'Confirmed by crew ✓' : `Confirm ${p.title}`}
        </T>
      </Pressable>
    </View>
  );
}
