import { Screen } from '../components/Screen';
import { PointCards, ZoneTable } from '../components/crew/PointsCards';
import { TABS } from '../navigation/tabs';

const tab = TABS[1];

export default function Points() {
  return (
    <Screen title={tab.title} desc={tab.desc}>
      <PointCards />
      <ZoneTable />
    </Screen>
  );
}
