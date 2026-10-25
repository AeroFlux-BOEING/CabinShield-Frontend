import { useRouter } from 'expo-router';

import { useResponsive } from '../hooks/useResponsive';
import { useTheme } from '../theme/ThemeProvider';
import { Screen } from './Screen';
import { Button } from './ui/Controls';
import { Eyebrow, Panel } from './ui/Surfaces';
import { T } from './ui/T';

export function PlaceholderView({ title, description }: { title: string; description: string }) {
  const { c } = useTheme();
  const { compact } = useResponsive();
  const router = useRouter();
  return (
    <Screen>
      <Panel style={{ minHeight: 480, justifyContent: 'center', alignItems: 'flex-start', padding: compact ? 24 : 40 }}>
        <Eyebrow>Next tab</Eyebrow>
        <T accessibilityRole="header" size={compact ? 34 : 44} weight={800} tracking={-0.03}>
          {title}
        </T>
        <T size={16} lineHeight={24.8} color={c.fg2} style={{ maxWidth: 620 }}>
          {description}
        </T>
        <Button label="Back to Overview" variant="primary" big onPress={() => router.navigate('/overview')} style={{ marginTop: 12 }} />
      </Panel>
    </Screen>
  );
}
