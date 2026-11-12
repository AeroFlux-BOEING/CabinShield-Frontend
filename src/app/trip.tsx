import { Row, Screen } from '../components/Screen';
import { AirportsCard, ArrivalCard, FlightInfoCard } from '../components/crew/TripCards';
import { useLang } from '../i18n/LangContext';
import { TABS } from '../navigation/tabs';

const tab = TABS[3];

export default function Trip() {
  const { P } = useLang();
  return (
    <Screen title={P(tab.label)} desc={P(tab.desc)}>
      <Row breakAt={860}>
        <FlightInfoCard />
        <AirportsCard />
        <ArrivalCard />
      </Row>
    </Screen>
  );
}
