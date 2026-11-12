import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { useLang } from '../i18n/LangContext';
import { useTheme } from '../theme/ThemeProvider';
import { TopBar } from './TopBar';
import { T } from './ui/T';

/** Scrollable page body under the top bar, with optional large title. */
export function Screen({ title, desc, children }: { title?: string; desc?: string; children: ReactNode }) {
  const { c } = useTheme();
  const { compact } = useResponsive();
  const { L } = useLang();
  const pad = compact ? 16 : 22;
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: pad, paddingTop: compact ? 8 : 18, gap: 16, paddingBottom: 32 }}>
      <TopBar />
      {title ? (
        <View style={{ gap: 4, paddingHorizontal: 4 }}>
          <T size={30} weight={700} tracking={-0.03}>{title}</T>
          {desc ? <T size={15} color={c.ink2}>{desc}</T> : null}
        </View>
      ) : null}
      {children}
      <T size={12} color={c.ink2} align="center">{L('실제 운항에서는 항공사 절차와 조종실 지시를 우선합니다.', 'In operations, airline procedures and flight deck instructions take precedence.')}</T>
    </ScrollView>
  );
}

/** Row that stacks on narrow canvases. `weights` sets relative widths. */
export function Row({ children, weights, breakAt = 980 }: { children: ReactNode[]; weights?: number[]; breakAt?: number }) {
  const { width } = useResponsive();
  const stack = width < breakAt;
  return (
    <View style={{ flexDirection: stack ? 'column' : 'row', gap: 16 }}>
      {children.map((ch, i) => (
        <View key={i} style={stack ? undefined : { flex: weights?.[i] ?? 1, minWidth: 0 }}>
          {ch}
        </View>
      ))}
    </View>
  );
}
