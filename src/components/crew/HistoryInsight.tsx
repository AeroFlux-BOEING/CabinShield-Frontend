import { View } from 'react-native';

import { HISTORY, POINTS } from '../../domain/content';
import { PLAN_GS, STRENGTH } from '../../domain/flight';
import { hoursText } from '../../state/FlightSim';
import { useFlight } from '../../state/FlightContext';
import { useTheme } from '../../theme/ThemeProvider';
import { Card, CardHead, Tag, Tile } from '../ui/Surfaces';
import { T } from '../ui/T';

/** Picks the past-report segment that matters next (overlapping the next forecast, else next ahead). */
function useRelevant() {
  const { sim } = useFlight();
  const nf = sim.ex.find((e) => e.t1 >= sim.t) ?? null;
  let hs = nf ? HISTORY.find((h) => h.d1 >= nf.d0 - 60 && h.d0 <= nf.d1 + 60) : undefined;
  if (!hs) hs = HISTORY.find((h) => h.d1 >= sim.estD);
  return { sim, nf, hs: hs ?? null };
}

export function HistoryCard() {
  const { c } = useTheme();
  const { sim, nf, hs } = useRelevant();
  const fl = Math.round(sim.flightLevel / 10) * 10;
  if (!hs)
    return (
      <Card style={{ flex: 1 }}>
        <CardHead title="과거 데이터 참고" en="Historical Reference" />
        <T color={c.ink2}>남은 경로에 참고할 과거 보고가 없습니다.</T>
      </Card>
    );
  const inBand = fl >= hs.band[0] && fl <= hs.band[1];
  const ahead = hs.d0 > sim.estD ? hoursText(((hs.d0 - sim.estD) / PLAN_GS) * 3600) + ' 뒤' : '지금 구간';
  const tiles: [string, string, string][] = [
    ['유사 난기류 보고', `${hs.cases}건`, '최근 3년 이 구간 통과편 기준'],
    ['가장 많은 고도대', `FL${hs.band[0]}–${hs.band[1]}`, inBand ? `현재 FL${fl} · 이 고도대 안` : `현재 FL${fl} · 고도대 밖`],
    ['주요 패턴', hs.pattern, hs.season],
    ['보고 강도', hs.sev, nf ? '오늘 예보와 겹침' : '오늘 예보 없음'],
  ];
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title="과거 데이터 참고" en="Historical Reference" right={<Tag tone={hs.cases >= 15 ? 'p2' : 'p1'}>{`과거 보고 ${hs.cases}건`}</Tag>} />
      <T size={15} weight={600} style={{ marginTop: -6 }}>{`${hs.name} · ${ahead}`}</T>
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {tiles.map(([k, v, n]) => (
          <Tile key={k} label={k} value={<T size={19} weight={600} tracking={-0.02}>{v}</T>} note={n} style={{ flexBasis: '46%', flexGrow: 1 }} />
        ))}
      </View>
    </Card>
  );
}

export function InsightCard() {
  const { c } = useTheme();
  const { sim, nf, hs } = useRelevant();
  const fl = Math.round(sim.flightLevel / 10) * 10;
  const items: [string, boolean, string, string][] = [];
  if (hs) {
    const inBand = fl >= hs.band[0] && fl <= hs.band[1];
    const svc = sim.plan?.find((v) => v.start != null && v.end != null && sim.t >= v.start && sim.t < v.end);
    const svc2 = nf && sim.plan?.find((v) => v.start != null && v.end != null && v.start < nf.t0 && v.end > nf.t0 - POINTS[0].lead);
    items.push(hs.cases >= 10 ? ['!', true, '이 구간은 과거 비행에서 난기류 보고가 반복된 곳입니다.', `${hs.cases}건 · ${hs.pattern}`] : ['i', false, '과거 보고가 많지 않은 구간입니다.', `${hs.cases}건 · ${hs.pattern}`]);
    if (nf && (hs.cases >= 15 || nf.max >= 2)) items.push(['2', true, '2포인트부터 주의 단계를 한 단계 높여 대응하세요.', '과거 보고와 오늘 예보가 겹치는 구간']);
    else if (nf) items.push(['✓', false, '포인트 기준대로 대응하면 됩니다.', `오늘 예보 강도 ${STRENGTH[nf.max]}`]);
    else items.push(['!', true, '오늘 예보는 없지만 과거 보고가 있는 구간입니다.', '좌석벨트 안내를 미리 준비해 두세요']);
    items.push([inBand ? '!' : 'i', inBand, inBand ? `현재 고도 FL${fl}이 과거 보고가 가장 많았던 고도대 안에 있습니다.` : `현재 고도 FL${fl}은 주요 보고 고도대 밖입니다.`, `주요 고도대 FL${hs.band[0]}–${hs.band[1]}`]);
    if (svc || svc2) items.push(['⏱', true, '기내 서비스가 진행 중이면 평소보다 일찍 준비하세요.', svc ? `지금 ${svc.name} 진행 중` : `${svc2 ? svc2.name : ''}이 1포인트 전후와 겹칩니다`]);
    else items.push(['✓', false, '구간 전에 겹치는 기내 서비스가 없습니다.', '서비스 계획 기준']);
  } else items.push(['✓', false, '남은 경로에서 특별히 주의할 구간이 없습니다.', '']);
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title="AI 인사이트" en="AI Insight" right={<Tag tone="navy">온디바이스 분석</Tag>} />
      <View style={{ flex: 1, gap: 10 }}>
        {items.map(([ic, warn, t, sm]) => (
          <View key={t} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.soft, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: warn ? c.p2Soft : c.navySoft }}>
              <T size={13} weight={700} color={warn ? c.p2 : c.navy}>{ic}</T>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T size={15} lh={1.5}>{t}</T>
              {sm ? <T size={12.5} color={c.ink2}>{sm}</T> : null}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
