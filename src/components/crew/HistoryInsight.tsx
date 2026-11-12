import { View } from 'react-native';

import { HISTORY, POINTS } from '../../domain/content';
import { PLAN_GS, STRENGTH } from '../../domain/flight';
import { hoursText } from '../../i18n/format';
import { useLang } from '../../i18n/LangContext';
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
  const { lang, L, P } = useLang();
  const { sim, nf, hs } = useRelevant();
  const fl = Math.round(sim.flightLevel / 10) * 10;
  const title = L('과거 데이터 참고', 'Past data');
  if (!hs)
    return (
      <Card style={{ flex: 1 }}>
        <CardHead title={title} en={lang === 'ko' ? 'Historical Reference' : undefined} />
        <T color={c.ink2}>{L('남은 경로에 참고할 과거 보고가 없습니다.', 'No past reports along the rest of the route.')}</T>
      </Card>
    );
  const inBand = fl >= hs.band[0] && fl <= hs.band[1];
  const ahead = hs.d0 > sim.estD ? (lang === 'ko' ? `${hoursText(((hs.d0 - sim.estD) / PLAN_GS) * 3600, lang)} 뒤` : `in ${hoursText(((hs.d0 - sim.estD) / PLAN_GS) * 3600, lang)}`) : L('지금 구간', 'current segment');
  const tiles: [string, string, string][] = [
    [L('유사 난기류 보고', 'Similar reports'), L(`${hs.cases}건`, `${hs.cases}`), L('최근 3년 이 구간 통과편 기준', 'Flights through here, last 3 years')],
    [L('가장 많은 고도대', 'Most common band'), `FL${hs.band[0]}–${hs.band[1]}`, inBand ? L(`현재 FL${fl} · 이 고도대 안`, `Now FL${fl} · inside this band`) : L(`현재 FL${fl} · 고도대 밖`, `Now FL${fl} · outside this band`)],
    [L('주요 패턴', 'Common pattern'), P(hs.pattern), P(hs.season)],
    [L('보고 강도', 'Reported intensity'), P(hs.sev), nf ? L('오늘 예보와 겹침', "Overlaps today's forecast") : L('오늘 예보 없음', 'No forecast today')],
  ];
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title={title} en={lang === 'ko' ? 'Historical Reference' : undefined} right={<Tag tone={hs.cases >= 15 ? 'p2' : 'p1'}>{L(`과거 보고 ${hs.cases}건`, `${hs.cases} past reports`)}</Tag>} />
      <T size={15} weight={600} style={{ marginTop: -6 }}>{`${P(hs.name)} · ${ahead}`}</T>
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
  const { lang, L, P } = useLang();
  const { sim, nf, hs } = useRelevant();
  const fl = Math.round(sim.flightLevel / 10) * 10;
  const items: [string, boolean, string, string][] = [];
  if (hs) {
    const inBand = fl >= hs.band[0] && fl <= hs.band[1];
    const svc = sim.plan?.find((v) => v.start != null && v.end != null && sim.t >= v.start && sim.t < v.end);
    const svc2 = nf && sim.plan?.find((v) => v.start != null && v.end != null && v.start < nf.t0 && v.end > nf.t0 - POINTS[0].lead);
    items.push(hs.cases >= 10
      ? ['!', true, L('이 구간은 과거 비행에서 난기류 보고가 반복된 곳입니다.', 'This route segment has shown repeated turbulence reports in past flights.'), L(`${hs.cases}건 · ${P(hs.pattern)}`, `${hs.cases} reports · ${P(hs.pattern)}`)]
      : ['i', false, L('과거 보고가 많지 않은 구간입니다.', 'Few past reports on this segment.'), L(`${hs.cases}건 · ${P(hs.pattern)}`, `${hs.cases} reports · ${P(hs.pattern)}`)]);
    if (nf && (hs.cases >= 15 || nf.max >= 2)) items.push(['2', true, L('2포인트부터 주의 단계를 한 단계 높여 대응하세요.', 'Recommend increased caution from Point 2.'), L('과거 보고와 오늘 예보가 겹치는 구간', "Past reports overlap today's forecast")]);
    else if (nf) items.push(['✓', false, L('포인트 기준대로 대응하면 됩니다.', 'Follow the standard point timeline.'), L(`오늘 예보 강도 ${STRENGTH[nf.max].ko}`, `Today's forecast: ${STRENGTH[nf.max].en}`)]);
    else items.push(['!', true, L('오늘 예보는 없지만 과거 보고가 있는 구간입니다.', 'No forecast today, but past reports exist here.'), L('좌석벨트 안내를 미리 준비해 두세요', 'Have the seatbelt PA ready')]);
    items.push([inBand ? '!' : 'i', inBand, inBand ? L(`현재 고도 FL${fl}이 과거 보고가 가장 많았던 고도대 안에 있습니다.`, `Current FL${fl} is inside the most-reported altitude band.`) : L(`현재 고도 FL${fl}은 주요 보고 고도대 밖입니다.`, `Current FL${fl} is outside the main reported band.`), L(`주요 고도대 FL${hs.band[0]}–${hs.band[1]}`, `Main band FL${hs.band[0]}–${hs.band[1]}`)]);
    if (svc || svc2) items.push(['⏱', true, L('기내 서비스가 진행 중이면 평소보다 일찍 준비하세요.', 'If cabin service is ongoing, prepare earlier.'), svc ? L(`지금 ${svc.name.ko} 진행 중`, `${svc.name.en} in progress`) : svc2 ? L(`${svc2.name.ko}이 1포인트 전후와 겹칩니다`, `${svc2.name.en} overlaps Point 1`) : '']);
    else items.push(['✓', false, L('구간 전에 겹치는 기내 서비스가 없습니다.', 'No cabin service overlaps the segment.'), L('서비스 계획 기준', 'Per service plan')]);
  } else items.push(['✓', false, L('남은 경로에서 특별히 주의할 구간이 없습니다.', 'Nothing special to watch for on the rest of the route.'), '']);
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title={L('AI 인사이트', 'AI Insight')} en={lang === 'ko' ? 'AI Insight' : undefined} right={<Tag tone="navy">{L('온디바이스 분석', 'On-device')}</Tag>} />
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
