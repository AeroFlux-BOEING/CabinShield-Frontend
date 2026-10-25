import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState, type ComponentRef, type RefObject } from 'react';
import { Platform, View } from 'react-native';
import { captureRef, captureScreen } from 'react-native-view-shot';

export type ExportMode = 'screen' | 'panel';

/**
 * PNG export for the crew tablet.
 * - `screen`: what is visible right now.
 * - `panel`: the whole work panel, including content scrolled off-screen.
 * Opens the system share sheet so the crew can save to Photos / Files / AirDrop.
 */
export function usePngExport(target: RefObject<ComponentRef<typeof View> | null>) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const exportPng = useCallback(
    async (mode: ExportMode) => {
      if (Platform.OS === 'web') {
        show('PNG export runs in the iOS/Android app. This is the web preview.');
        return;
      }
      try {
        const uri =
          mode === 'screen'
            ? await captureScreen({ format: 'png', quality: 1, result: 'tmpfile' })
            : await captureRef(target, { format: 'png', quality: 1, result: 'tmpfile' });
        if (!(await Sharing.isAvailableAsync())) {
          show('Sharing is not available on this device.');
          return;
        }
        await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Save CabinShield screenshot' });
      } catch {
        show('Could not capture the screen. Try again.');
      }
    },
    [target, show],
  );

  return { exportPng, toast };
}
