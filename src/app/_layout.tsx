import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SetupSheet } from '../components/SetupSheet';
import { Sidebar } from '../components/Sidebar';
import { Toast } from '../components/Toast';
import { useResponsive } from '../hooks/useResponsive';
import { LangProvider } from '../i18n/LangContext';
import { FlightProvider } from '../state/FlightContext';
import { UiProvider } from '../state/UiContext';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

function AppShell() {
  const { c, scheme } = useTheme();
  const { compact } = useResponsive();
  return (
    <View style={{ flex: 1, flexDirection: compact ? 'column' : 'row', backgroundColor: c.page }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Sidebar compact={compact} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Slot />
      </View>
      <Toast />
      <SetupSheet />
    </View>
  );
}

/** The app always fills the screen (no device frame), respecting safe-area insets on tablets and phones. */
function Screen({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.page, paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
      {children}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LangProvider>
          <FlightProvider>
            <UiProvider>
              <Screen>
                <AppShell />
              </Screen>
            </UiProvider>
          </FlightProvider>
        </LangProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
