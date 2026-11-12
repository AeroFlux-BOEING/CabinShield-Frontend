import { Row, Screen } from '../components/Screen';
import { AiModelCard } from '../components/crew/AiCards';
import { LogCard, StatusCard } from '../components/crew/SystemCards';
import { useLang } from '../i18n/LangContext';
import { TABS } from '../navigation/tabs';

const tab = TABS[4];

export default function System() {
  const { P } = useLang();
  return (
    <Screen title={P(tab.label)} desc={P(tab.desc)}>
      <Row breakAt={860}>
        <StatusCard />
        <AiModelCard />
      </Row>
      <LogCard />
    </Screen>
  );
}
