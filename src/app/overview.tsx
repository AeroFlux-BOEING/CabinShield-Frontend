import { Row, Screen } from '../components/Screen';
import { FlightMap } from '../components/crew/FlightMap';
import { HistoryCard, InsightCard } from '../components/crew/HistoryInsight';
import { InfoTodoCard } from '../components/crew/InfoTodoCard';
import { PointBanner } from '../components/crew/PointBanner';
import { RouteBar } from '../components/crew/RouteBar';

/** 운항 현황: whole flight, current point, map with live data or checklist, past data and AI insight. */
export default function Overview() {
  return (
    <Screen>
      <RouteBar />
      <PointBanner />
      <Row weights={[1.15, 1]} breakAt={900}>
        <FlightMap />
        <InfoTodoCard />
      </Row>
      <Row weights={[1.15, 1]} breakAt={900}>
        <HistoryCard />
        <InsightCard />
      </Row>
    </Screen>
  );
}
