import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { SetupSheet } from '../components/SetupSheet';
import { Sidebar } from '../components/Sidebar';
import { Toast } from '../components/Toast';
import { T } from '../components/ui/T';
import { CanvasWidth, useResponsive } from '../hooks/useResponsive';
import { LangProvider, useLang } from '../i18n/LangContext';
import { FlightProvider } from '../state/FlightContext';
import { pad } from '../state/FlightSim';
import { UiProvider } from '../state/UiContext';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

/** 11-inch iPad, landscape, in points. */
const IPAD = { w: 1180, h: 820, bezel: 14, bar: 26 };

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

function IpadStatusBar() {
  const { c } = useTheme();
  const { lang } = useLang();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={{ height: IPAD.bar, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, backgroundColor: c.sidebar }}>
      <T size={13} weight={600}>{`${now.getHours()}:${pad(now.getMinutes())}`}</T>
      <T size={13} weight={600}>{lang === 'ko' ? `${now.getMonth() + 1}월 ${now.getDate()}일 ${'일월화수목금토'[now.getDay()]}` : now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</T>
      <View style={{ flex: 1 }} />
      <Svg width={17} height={12} viewBox="0 0 17 12">
        <Path d="M8.5 2.2c2.4 0 4.6.9 6.3 2.5l1.1-1.1A10.5 10.5 0 0 0 8.5.6 10.5 10.5 0 0 0 1.1 3.6l1.1 1.1A8.9 8.9 0 0 1 8.5 2.2Zm0 3.2c1.5 0 2.9.6 4 1.6l1.1-1.1a7.3 7.3 0 0 0-10.2 0l1.1 1.1c1.1-1 2.5-1.6 4-1.6Zm0 3.2c.7 0 1.3.3 1.8.7L8.5 11 6.7 9.3c.5-.4 1.1-.7 1.8-.7Z" fill={c.ink} />
      </Svg>
      <T size={13} weight={600}>100%</T>
      <Svg width={25} height={12} viewBox="0 0 25 12">
        <Rect x={0.5} y={0.5} width={21} height={11} rx={3} fill="none" stroke={c.ink} opacity={0.4} />
        <Rect x={2} y={2} width={18} height={8} rx={1.8} fill={c.ink} />
        <Rect x={22.5} y={4} width={1.6} height={4} rx={0.8} fill={c.ink} opacity={0.4} />
      </Svg>
    </View>
  );
}

/**
 * On wide web screens the app is shown inside an iPad frame (scaled to fit) for presentations.
 * On real tablets, phones and narrow windows it fills the screen.
 */
function Frame({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const win = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const framed = Platform.OS === 'web' && win.width >= 1240 && win.height >= 640;
  if (!framed) {
    return (
      <View style={{ flex: 1, backgroundColor: c.page, paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
        {children}
      </View>
    );
  }
  const dw = IPAD.w + IPAD.bezel * 2, dh = IPAD.h + IPAD.bezel * 2;
  const k = Math.min((win.width - 56) / dw, (win.height - 56) / dh, 1);
  return (
    <View style={{ flex: 1, backgroundColor: '#E6E8EC', overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute', left: (win.width - dw) / 2, top: (win.height - dh) / 2, width: dw, height: dh,
          padding: IPAD.bezel, borderRadius: 46, backgroundColor: '#1C1C1E', transform: [{ scale: k }],
          shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 60, shadowOffset: { width: 0, height: 30 },
        }}
      >
        <View style={{ flex: 1, borderRadius: 32, overflow: 'hidden', backgroundColor: c.page }}>
          <IpadStatusBar />
          <CanvasWidth.Provider value={IPAD.w}>
            <View style={{ flex: 1 }}>{children}</View>
          </CanvasWidth.Provider>
        </View>
      </View>
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
            <Frame>
              <AppShell />
            </Frame>
          </UiProvider>
        </FlightProvider>
        </LangProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
