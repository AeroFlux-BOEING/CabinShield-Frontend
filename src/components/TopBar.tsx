import { View } from 'react-native';

import { SERVICE_NAMES } from '../domain/constants';
import type { ExportMode } from '../hooks/usePngExport';
import { useScenario } from '../state/ScenarioContext';
import { Button, Chip } from './ui/Controls';

const chips = { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', flexShrink: 1, maxWidth: '100%' } as const;

export function TopBar({ onExport }: { onExport: (mode: ExportMode) => void }) {
  const { state } = useScenario();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={chips}>
        <Chip variant="solid">Scenario 01</Chip>
        <Chip>{SERVICE_NAMES[state.service]}</Chip>
        <Chip>B737-8 · Aft cabin · Cruise</Chip>
      </View>
      <View style={chips}>
        <Chip variant="alert" dot>
          Anticipated turbulence · TTA {state.tta} s
        </Chip>
        <Button label="Save screenshot" onPress={() => onExport('screen')} />
        <Button label="Quick save PNG" variant="primary" onPress={() => onExport('panel')} />
      </View>
    </View>
  );
}
