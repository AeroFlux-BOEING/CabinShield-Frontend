import { View } from 'react-native';

import { Floorplan } from '../components/Floorplan';
import { Icon } from '../components/Icon';
import { PlaneArt } from '../components/PlaneArt';
import { Screen } from '../components/Screen';
import { Segmented } from '../components/ui/Controls';
import { Grid } from '../components/ui/Grid';
import { Card, CardLabel, Eyebrow, Panel, flexItem } from '../components/ui/Surfaces';
import { Span, T } from '../components/ui/T';
import { ZONE_ORDER, ZONES } from '../domain/constants';
import { useResponsive } from '../hooks/useResponsive';
import { useScenario } from '../state/ScenarioContext';
import { useTheme } from '../theme/ThemeProvider';

const SPECS = [
  ['Registration', '[HL0000]'],
  ['Engines', 'CFM LEAP-1B ×2'],
  ['Cabin', '2-class'],
  ['PoC scope', 'Aft cabin'],
] as const;

export default function OverviewScreen() {
  const { c } = useTheme();
  const { compact } = useResponsive();
  const { state, result: m, setZone } = useScenario();

  const zr = ZONES[state.zone];
  let zoneSeats = 0;
  for (let n = zr.from; n <= zr.to; n++) zoneSeats += n <= 3 ? 4 : 6;

  const conf = m.plans.find((p) => p.id === state.confirmed);
  const kernelSub = conf
    ? `Crew confirmed ${conf.title} · CSM ${conf.csmText}`
    : m.plans.map((p) => `${p.id} ${p.csmText}`).join(' · ');
  const heroSize = compact ? 44 : 56;

  return (
    <Screen>
      {/* Current aircraft */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <View style={[flexItem(1, 260), { gap: 20 }]}>
          <View style={{ gap: 6 }}>
            <Eyebrow>Current aircraft</Eyebrow>
            <T accessibilityRole="header" size={heroSize} weight={800} tracking={-0.03} lineHeight={heroSize * 1.06}>
              {'Boeing\n737-8'}
            </T>
          </View>
          <Grid columns={2} gap={20} rowGap={16}>
            {SPECS.map(([k, v]) => (
              <View key={k}>
                <T size={12} color={c.muted}>
                  {k}
                </T>
                <T size={15} weight={700} style={{ marginTop: 2 }}>
                  {v}
                </T>
              </View>
            ))}
          </Grid>
        </View>
        <View style={flexItem(3, 520)}>
          <PlaneArt />
        </View>
      </View>

      {/* Cabin zones */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'center', flexShrink: 1, maxWidth: '100%' }}>
          <T size={15} weight={700}>
            Cabin zones
          </T>
          <Segmented
            accessibilityLabel="Cabin zone"
            value={state.zone}
            onChange={setZone}
            options={ZONE_ORDER.map((z) => ({ value: z, label: ZONES[z].name }))}
          />
        </View>
        <T size={13} color={c.muted}>
          {zr.name} zone · rows {zr.from}–{zr.to}
          {state.zone === 'aft' ? ' · PoC scenario area' : ''}
        </T>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, alignItems: 'stretch' }}>
        {/* Seat summary */}
        <View style={[flexItem(1, 260), { backgroundColor: c.accent, borderRadius: 28, padding: 26, gap: 18, minHeight: 280 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <T size={72} weight={800} tracking={-0.03} lineHeight={76} color={c.onAccent} tnum>
                162
              </T>
              <T size={15} weight={600} color={c.onAccent2}>
                Total seats
              </T>
            </View>
            <Icon name="plane" size={64} color={c.onAccent} strokeWidth={1.2} />
          </View>
          <Grid columns={2} gap={12}>
            {[
              ['12', 'Business · 2-2'],
              ['150', 'Economy · 3-3'],
            ].map(([n, l]) => (
              <View key={l} style={{ backgroundColor: c.onAccentTile, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, gap: 2 }}>
                <T size={24} weight={800} color={c.onAccent} tnum>
                  {n}
                </T>
                <T size={12} color={c.onAccent2}>
                  {l}
                </T>
              </View>
            ))}
          </Grid>
          <View style={{ flex: 1 }} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 8,
              borderTopWidth: 1,
              borderTopColor: c.onAccentLine,
              paddingTop: 14,
            }}
          >
            <T size={13} color={c.onAccent2}>
              {zr.name} zone
            </T>
            <T size={18} weight={800} color={c.onAccent} tnum>
              {zoneSeats} seats
            </T>
          </View>
        </View>

        {/* Floorplan */}
        <Panel style={flexItem(3, 560)}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <T size={26} weight={800} tracking={-0.02}>
              Floorplan
            </T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              <Legend swatch={{ backgroundColor: c.accent }} label="Selected zone" />
              <Legend swatch={{ backgroundColor: c.seat }} label="Seat" />
              <Legend swatch={{ borderWidth: 1.5, borderColor: c.tightBar }} label="Occupied lavatory" />
            </View>
          </View>
          <Floorplan zone={state.zone} lavOcc={m.lavOcc} />
          <T size={12} color={c.muted}>
            Boeing typical 2-class layout, illustrative. Row numbers mark zone boundaries.
          </T>
        </Panel>
      </View>

      <Grid min={220}>
        <Card fill>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.tightBar }} />
            <CardLabel color={c.tight}>Turbulence ahead</CardLabel>
          </View>
          <T size={34} weight={800} tracking={-0.02} tnum>
            {state.tta} s
          </T>
          <T size={13} color={c.muted}>
            Conservative TTA · buffer {state.buffer} s
          </T>
        </Card>
        <Card fill>
          <CardLabel>Safety Kernel</CardLabel>
          <T size={22} weight={800} lineHeight={28.6} tnum>
            <Span color={c.pass}>{m.counts.PASS} PASS</Span>
            {' · '}
            <Span color={c.tight}>{m.counts.TIGHT} TIGHT</Span>
            {' · '}
            <Span color={c.reject}>{m.counts.REJECT} REJECT</Span>
          </T>
          <T size={13} color={c.muted} tnum>
            {kernelSub}
          </T>
        </Card>
        <Card fill>
          <CardLabel>Cabin status</CardLabel>
          <T size={22} weight={800} lineHeight={27.5}>
            {m.cartLoose ? 'Cart unsecured' : 'Cart secured'}
            {'\n'}
            {m.lavOcc ? 'LAV 1 occupied' : 'LAV 1 empty'}
          </T>
          <T size={13} color={c.muted}>
            {m.hot ? 'Hot liquid on cart · ' : ''}
            {m.cartOnView ? 'aft aisle' : 'mid aisle'}
          </T>
        </Card>
        <Card fill>
          <CardLabel>Cabin crew</CardLabel>
          <T size={34} weight={800} tracking={-0.02} tnum>
            4 <Span>FA</Span>
          </T>
          <T size={13} color={c.muted}>
            FA3 with cart · FA4 aft galley
          </T>
        </Card>
      </Grid>
    </Screen>
  );
}

function Legend({ swatch, label }: { swatch: object; label: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={[{ width: 12, height: 12, borderRadius: 3 }, swatch]} />
      <T size={12} color={c.fg2}>
        {label}
      </T>
    </View>
  );
}
