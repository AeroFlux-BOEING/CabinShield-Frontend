import { Row, Screen } from '../components/Screen';
import { AirportsCard, ArrivalCard, FlightInfoCard } from '../components/crew/TripCards';
import { TABS } from '../navigation/tabs';

const tab = TABS[3];

export default function Trip() {
  return (
    <Screen title={tab.title} desc={tab.desc}>
      <Row breakAt={860}>
        <FlightInfoCard />
        <AirportsCard />
        <ArrivalCard />
      </Row>
    </Screen>
  );
}
