import { usePathname, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { TABS, type TabItem } from '../navigation/tabs';
import { useTheme } from '../theme/ThemeProvider';
import { AeroFluxMark } from './AeroFluxMark';
import { Icon } from './Icon';
import { Eyebrow } from './ui/Surfaces';
import { T } from './ui/T';

function useActiveRoute(): string {
  const pathname = usePathname();
  return pathname.replace(/^\//, '').split('/')[0] || 'overview';
}

function Brand() {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8 }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.line,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AeroFluxMark width={30} />
      </View>
      <View>
        <T size={17} weight={800} tracking={-0.01}>
          CabinShield AI
        </T>
        <T size={12} color={c.muted}>
          by AeroFlux
        </T>
      </View>
    </View>
  );
}

function NavItem({ tab, active, pill }: { tab: TabItem; active: boolean; pill?: boolean }) {
  const { c } = useTheme();
  const router = useRouter();
  const fg = active ? c.onAccent : c.fg;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.label}
      onPress={() => router.navigate(`/${tab.route}` as Href)}
      style={({ pressed }) => ({
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        borderRadius: 22,
        backgroundColor: active ? c.accent : pressed ? c.card : pill ? c.card : 'transparent',
      })}
    >
      <Icon name={tab.icon} color={fg} />
      <T weight={600} color={fg}>
        {tab.label}
      </T>
    </Pressable>
  );
}

function DecisionFlow() {
  const { c } = useTheme();
  const steps = ['GenAI proposes', 'Safety Kernel verifies', 'Human decides'];
  return (
    <View style={{ backgroundColor: c.card, borderRadius: 20, padding: 16, gap: 10 }}>
      <Eyebrow>Decision flow</Eyebrow>
      <View style={{ gap: 6 }}>
        {steps.map((s, i) => (
          <View key={s} style={{ gap: 6 }}>
            {i > 0 ? (
              <T size={13} color={c.muted}>
                ↓
              </T>
            ) : null}
            <T size={13} weight={600}>
              {s}
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Tablet: fixed left menu. Phone (`compact`): brand + horizontally scrolling tab pills. */
export function Sidebar({ compact }: { compact: boolean }) {
  const { c } = useTheme();
  const active = useActiveRoute();

  if (compact) {
    return (
      <View style={{ backgroundColor: c.side, borderRadius: 28, paddingVertical: 16, gap: 14 }}>
        <View style={{ paddingHorizontal: 12 }}>
          <Brand />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
          {TABS.map((t) => (
            <NavItem key={t.route} tab={t} active={t.route === active} pill />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ width: 240, backgroundColor: c.side, borderRadius: 28, paddingVertical: 24, paddingHorizontal: 16, gap: 28 }}>
      <Brand />
      <View accessibilityRole="menu" style={{ gap: 4 }}>
        <View style={{ paddingHorizontal: 12, paddingBottom: 6 }}>
          <Eyebrow>Menu</Eyebrow>
        </View>
        {TABS.map((t) => (
          <NavItem key={t.route} tab={t} active={t.route === active} />
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <DecisionFlow />
    </View>
  );
}
