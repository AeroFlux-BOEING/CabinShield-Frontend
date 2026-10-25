import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sidebar } from '../components/Sidebar';
import { useResponsive } from '../hooks/useResponsive';
import { ScenarioProvider } from '../state/ScenarioContext';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { FONT_ASSETS } from '../theme/typography';

function Shell() {
  const { c, scheme } = useTheme();
  const { compact } = useResponsive();
  const insets = useSafeAreaInsets();
  const pad = compact ? 12 : 24;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.ground,
        paddingTop: insets.top + pad,
        paddingBottom: insets.bottom + pad,
        paddingLeft: Math.max(16, insets.left + (compact ? 0 : 8)),
        paddingRight: Math.max(16, insets.right + (compact ? 0 : 8)),
      }}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, width: '100%', maxWidth: 1440, alignSelf: 'center', flexDirection: compact ? 'column' : 'row', gap: compact ? 12 : 20 }}>
        <Sidebar compact={compact} />
        <View style={{ flex: 1, minWidth: 0, backgroundColor: c.panel, borderRadius: 28, overflow: 'hidden' }}>
          <Slot />
        </View>
      </View>
    </View>
  );
}

function Boot() {
  const [loaded, error] = useFonts(FONT_ASSETS);
  const { c } = useTheme();
  // Fall back to system fonts if Manrope fails to load rather than blocking the crew.
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: c.ground }} />;
  return <Shell />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ScenarioProvider>
          <Boot />
        </ScenarioProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
