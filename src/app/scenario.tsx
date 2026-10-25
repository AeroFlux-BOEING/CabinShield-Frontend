import { View } from 'react-native';

import { Screen, ScreenHeader } from '../components/Screen';
import { Button, OptionField, ReadOnlyField, SliderField } from '../components/ui/Controls';
import { Grid } from '../components/ui/Grid';
import { Badge, HazardList } from '../components/ui/Verdict';
import { Card, CardLabel, Panel, flexItem, wrapRow } from '../components/ui/Surfaces';
import { T } from '../components/ui/T';
import {
  BUFFER_RANGE,
  CART_POSITION_OPTIONS,
  LAVATORY_OPTIONS,
  SERVICE_OPTIONS,
  TTA_RANGE,
  YES_NO_OPTIONS,
} from '../domain/constants';
import { useScenario } from '../state/ScenarioContext';
import { useTheme } from '../theme/ThemeProvider';

export default function ScenarioScreen() {
  const { c } = useTheme();
  const { state, result: m, setField, reset } = useScenario();

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Scenario 01 · Hot beverage service · Aft cabin / Cruise"
        title="Scenario Input"
        right={<Button label="Reset to Scenario 01" big onPress={reset} />}
      />

      <View style={wrapRow}>
        <Panel style={flexItem(3, 480)} gap={18}>
          <T size={20} weight={800}>
            Cabin state
          </T>
          <Grid min={200}>
            <ReadOnlyField label="Aircraft" value="Boeing 737-8" />
            <OptionField label="Service" options={SERVICE_OPTIONS} value={state.service} onChange={(v) => setField('service', v)} />
            <OptionField label="Cart position" options={CART_POSITION_OPTIONS} value={state.cartPos} onChange={(v) => setField('cartPos', v)} />
            <OptionField label="Cart secured" options={YES_NO_OPTIONS} value={state.cartSecured} onChange={(v) => setField('cartSecured', v)} />
            <OptionField label="Lavatory 1" options={LAVATORY_OPTIONS} value={state.lav1} onChange={(v) => setField('lav1', v)} />
          </Grid>
          <T size={20} weight={800} style={{ marginTop: 8 }}>
            Time inputs
          </T>
          <Grid min={240} gap={20}>
            <SliderField label="Conservative TTA" value={state.tta} {...TTA_RANGE} onChange={(v) => setField('tta', v)} />
            <SliderField label="Safety buffer" value={state.buffer} {...BUFFER_RANGE} onChange={(v) => setField('buffer', v)} />
          </Grid>
        </Panel>

        <View style={[flexItem(1, 280), { gap: 16 }]}>
          <View accessibilityLiveRegion="polite" style={{ backgroundColor: c.accent, borderRadius: 22, padding: 20, gap: 12 }}>
            <CardLabel color={c.onAccent2}>Live kernel result</CardLabel>
            {m.plans.map((p) => (
              <View key={p.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <T weight={800} color={c.onAccent}>
                  {p.title}
                </T>
                <T color={c.onAccent} tnum>
                  CST {p.cst} · CSM {p.csmText}
                </T>
                <Badge verdict={p.verdict} />
              </View>
            ))}
          </View>
          <Card>
            <CardLabel>Open hazards</CardLabel>
            <HazardList hazards={m.hazards} />
          </Card>
        </View>
      </View>
    </Screen>
  );
}
