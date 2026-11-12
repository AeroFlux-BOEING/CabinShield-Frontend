import { usePathname, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useFlight } from '../state/FlightContext';
import { useTheme } from '../theme/ThemeProvider';
import { T } from './ui/T';

/** Point alerts while the crew is on another tab. */
export function Toast() {
  const { c } = useTheme();
  const { toast, dismissToast } = useFlight();
  const path = usePathname();
  const router = useRouter();
  if (!toast || path === '/overview' || path === '/') return null;
  return (
    <View style={{ position: 'absolute', right: 20, bottom: 20, maxWidth: 420, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingLeft: 18, paddingRight: 14, borderRadius: 16, backgroundColor: c.toast, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }}>
      <T size={14.5} color="#FFFFFF" style={{ flexShrink: 1 }}>{toast}</T>
      <Pressable accessibilityRole="button" onPress={() => { dismissToast(); router.navigate('/overview'); }} style={{ backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 }}>
        <T size={13.5} weight={600} color="#1D1D1F">운항 현황 보기</T>
      </Pressable>
    </View>
  );
}
