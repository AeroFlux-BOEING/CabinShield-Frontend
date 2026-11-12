import { Screen } from '../components/Screen';
import { PointCards, ZoneTable } from '../components/crew/PointsCards';
import { useLang } from '../i18n/LangContext';
import { TABS } from '../navigation/tabs';

const tab = TABS[1];

export default function Points() {
  const { P } = useLang();
  return (
    <Screen title={P(tab.label)} desc={P(tab.desc)}>
      <PointCards />
      <ZoneTable />
    </Screen>
  );
}
