import { useRef, type ComponentRef, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { PLACEHOLDER_NOTE } from '../domain/constants';
import { usePngExport } from '../hooks/usePngExport';
import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../theme/ThemeProvider';
import { TopBar } from './TopBar';
import { Eyebrow } from './ui/Surfaces';
import { T } from './ui/T';

/** Work panel for one tab: top bar, view content, PoC note. */
export function Screen({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const { compact } = useResponsive();
  const captureTarget = useRef<ComponentRef<typeof View>>(null);
  const { exportPng, toast } = usePngExport(captureTarget);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: compact ? 18 : 28 }} keyboardShouldPersistTaps="handled">
      <View ref={captureTarget} collapsable={false} style={{ gap: 24, backgroundColor: c.panel }}>
        <TopBar onExport={exportPng} />
        {toast ? (
          <View accessibilityLiveRegion="polite" style={{ alignSelf: 'flex-end', marginTop: -12, backgroundColor: c.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
            <T size={12} color={c.fg2}>
              {toast}
            </T>
          </View>
        ) : null}
        {children}
        <T size={12} color={c.tight}>
          {PLACEHOLDER_NOTE}
        </T>
      </View>
    </ScrollView>
  );
}

export function ScreenHeader({ eyebrow, title, right }: { eyebrow: string; title: string; right?: ReactNode }) {
  const { compact } = useResponsive();
  const size = compact ? 32 : 40;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <View style={{ gap: 4, flexShrink: 1 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <T accessibilityRole="header" size={size} weight={800} tracking={-0.03} lineHeight={size * 1.15}>
          {title}
        </T>
      </View>
      {right}
    </View>
  );
}
