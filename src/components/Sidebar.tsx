import { usePathname, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { useLang } from '../i18n/LangContext';
import { TABS } from '../navigation/tabs';
import { useFlight } from '../state/FlightContext';
import { bannerView } from '../state/crewView';
import { useTheme } from '../theme/ThemeProvider';
import { levelColors } from '../theme/tokens';
import { AeroFluxMark } from './AeroFluxMark';
import { Icon } from './Icon';
import { Segmented } from './ui/Controls';
import { T } from './ui/T';

function useActive() {
  return usePathname().replace(/^\//, '').split('/')[0] || 'overview';
}

function StatusChip({ small }: { small?: boolean }) {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { lang } = useLang();
  const b = bannerView(sim, lang);
  const col = levelColors(c, b.level);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: small ? 8 : 12, paddingHorizontal: small ? 12 : 14, borderRadius: 14, backgroundColor: b.level ? col.bg : c.soft }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: col.dot }} />
      <View>
        <T size={14} weight={600} color={b.level ? col.fg : c.ink}>{b.sideTitle}</T>
        {small ? null : <T size={12} color={c.ink2}>{b.sideSub}</T>}
      </View>
    </View>
  );
}

function SpeedControl() {
  const { c } = useTheme();
  const { sim, refresh } = useFlight();
  const { L } = useLang();
  return (
    <View style={{ gap: 6 }}>
      <T size={11.5} weight={600} color={c.ink3} tracking={0.06} style={{ paddingHorizontal: 8 }}>{L('발표용 배속', 'Demo speed')}</T>
      <Segmented
        label={L('빨리 감기', 'Speed')}
        value={sim.speed}
        onChange={(v) => { sim.setSpeed(v); refresh(); }}
        options={[{ value: 10, label: '10×' }, { value: 60, label: '60×' }, { value: 300, label: '300×' }]}
        style={{ alignSelf: 'stretch' }}
      />
    </View>
  );
}

function Flow() {
  const { c } = useTheme();
  const { L } = useLang();
  const steps = [L('조종실 · 기상 정보 수신', 'Flight deck & weather input'), L('AI가 포인트 판단', 'AI decides the point'), L('승무원이 확인하고 행동', 'Crew confirms and acts')];
  return (
    <View style={{ backgroundColor: c.soft, borderRadius: 14, padding: 14, gap: 8 }}>
      <T size={11.5} weight={600} color={c.ink3} tracking={0.06}>{L('포인트 안내 흐름', 'Decision flow')}</T>
      {steps.map((s) => (
        <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.navy }} />
          <T size={13}>{s}</T>
        </View>
      ))}
    </View>
  );
}

/** iPad: full-height left sidebar. Phone (`compact`): horizontal tab strip. */
export function Sidebar({ compact }: { compact: boolean }) {
  const { c } = useTheme();
  const router = useRouter();
  const { P, L } = useLang();
  const active = useActive();
  const go = (r: string) => router.navigate(`/${r}` as Href);

  if (compact) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 6, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' }}>
        <StatusChip small />
        {TABS.map((t) => {
          const on = t.route === active;
          return (
            <Pressable key={t.route} accessibilityRole="link" accessibilityState={{ selected: on }} onPress={() => go(t.route)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: on ? c.navySoft : 'transparent' }}>
              <T size={14.5} weight={on ? 600 : 500} color={on ? c.navy : c.ink}>{P(t.label)}</T>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ width: 248, flexGrow: 0, backgroundColor: c.sidebar, borderRightWidth: 1, borderRightColor: c.line }} contentContainerStyle={{ flexGrow: 1, paddingVertical: 18, paddingHorizontal: 12, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' }}>
          <AeroFluxMark width={24} />
        </View>
        <View>
          <T size={16} weight={600} tracking={-0.02}>CabinShield AI</T>
          <T size={12} color={c.ink2}>by AeroFlux</T>
        </View>
      </View>
      <StatusChip />
      <View accessibilityRole="menu" style={{ gap: 2 }}>
        <T size={11.5} weight={600} color={c.ink3} tracking={0.06} style={{ paddingHorizontal: 8, paddingBottom: 6 }}>{L('메뉴', 'Menu')}</T>
        {TABS.map((t) => {
          const on = t.route === active;
          return (
            <Pressable
              key={t.route}
              accessibilityRole="link"
              accessibilityState={{ selected: on }}
              onPress={() => go(t.route)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: on ? c.navySoft : pressed ? c.fill : 'transparent' })}
            >
              <Icon name={t.icon} color={on ? c.navy : c.ink2} />
              <T size={14.5} weight={on ? 600 : 500} color={on ? c.navy : c.ink}>{P(t.label)}</T>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      <SpeedControl />
      <Flow />
    </ScrollView>
  );
}
