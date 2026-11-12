import { Screen } from '../components/Screen';
import { CrewCard, ServiceCard } from '../components/crew/CabinCards';
import { TABS } from '../navigation/tabs';

const tab = TABS[2];

export default function Cabin() {
  return (
    <Screen title={tab.title} desc={tab.desc}>
      <CrewCard />
      <ServiceCard />
    </Screen>
  );
}
