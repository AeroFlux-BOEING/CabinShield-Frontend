import { View } from 'react-native';

import { CabinTwin } from '../components/CabinTwin';
import { Screen, ScreenHeader } from '../components/Screen';
import { HazardList } from '../components/ui/Verdict';
import { Card, CardLabel, KV, Panel, flexItem, wrapRow } from '../components/ui/Surfaces';
import { T } from '../components/ui/T';
import { useScenario } from '../state/ScenarioContext';
import { useTheme } from '../theme/ThemeProvider';

export default function TwinScreen() {
  const { c } = useTheme();
  const { state, result: m } = useScenario();
  const best = m.best;

  return (
    <Screen>
      <ScreenHeader eyebrow="B737-8 aft cabin" title="Cabin Digital Twin" />
      <View style={wrapRow}>
        <Panel style={[flexItem(3, 480), { padding: 28 }]}>
          <CabinTwin m={m} service={state.service} />
        </Panel>
        <View style={[flexItem(1, 280), { gap: 16 }]}>
          <Card gap={12}>
            <CardLabel>Open hazards</CardLabel>
            <HazardList hazards={m.hazards} />
          </Card>
          <Card gap={10}>
            <CardLabel>Crew positions</CardLabel>
            <KV k="FA3" v={m.cartOnView ? 'Aft aisle, with cart (row 27)' : 'Mid cabin, with cart'} />
            <KV k="FA4" v="Aft galley" />
          </Card>
          <Card>
            <CardLabel>Fastest safe plan</CardLabel>
            <T size={22} weight={800}>
              {best ? `${best.title} · ${best.name}` : 'None — self-protect now'}
            </T>
            <T size={13} color={c.muted} tnum>
              {best ? `CST ${best.cst} s · CSM ${best.csmText}` : 'Every plan exceeds the time left'}
            </T>
          </Card>
        </View>
      </View>
    </Screen>
  );
}
