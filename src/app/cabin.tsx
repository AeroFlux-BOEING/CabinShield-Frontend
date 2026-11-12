import { Screen } from '../components/Screen';
import { CrewCard, ServiceCard } from '../components/crew/CabinCards';
import { useLang } from '../i18n/LangContext';
import { TABS } from '../navigation/tabs';

const tab = TABS[2];

export default function Cabin() {
  const { P } = useLang();
  return (
    <Screen title={P(tab.label)} desc={P(tab.desc)}>
      <CrewCard />
      <ServiceCard />
    </Screen>
  );
}
