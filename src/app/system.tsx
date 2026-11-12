import { Row, Screen } from '../components/Screen';
import { DemoCard, LogCard, StatusCard } from '../components/crew/SystemCards';
import { TABS } from '../navigation/tabs';

const tab = TABS[4];

export default function System() {
  return (
    <Screen title={tab.title} desc={tab.desc}>
      <Row breakAt={860}>
        <StatusCard />
        <LogCard />
        <DemoCard />
      </Row>
    </Screen>
  );
}
