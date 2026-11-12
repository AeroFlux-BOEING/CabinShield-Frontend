import { View } from 'react-native';

import { AIRPORTS, PLACES } from '../../domain/content';
import { TAS } from '../../domain/flight';
import { distanceNm, ROUTE_NM } from '../../domain/geo';
import { dateLabel, hm, hoursText, pad } from '../../i18n/format';
import { useLang } from '../../i18n/LangContext';
import { useFlight } from '../../state/FlightContext';
import { useTheme } from '../../theme/ThemeProvider';
import { Card, CardHead, KV } from '../ui/Surfaces';
import { T } from '../ui/T';

const PST = -8;
const KST = 9;

export function FlightInfoCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { lang, L, P } = useLang();
  const est = sim.position, eta = sim.eta, gs = Math.max(sim.groundSpeedShown, 200);
  const fl = sim.flightLevel;
  const oat = Math.round(-56 + ((390 - Math.min(fl, 390)) / 40) * 6 + 2 * Math.sin(sim.t / 1900));
  const wind = Math.round(gs - TAS);
  let region = PLACES[7][0], best = Infinity;
  for (const [n, la, lo, city] of PLACES) if (!city) { const d = distanceNm(est, { lat: la, lon: lo }); if (d < best) { best = d; region = n; } }
  const solar = ((((sim.depUtc + sim.t) / 3600 + est.lon / 15) % 24) + 24) % 24;
  const night = solar < 6 || solar >= 18.5;
  const date = sim.flight ? ' · ' + dateLabel(sim.flight.date, lang) : '';
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title={L('비행 정보', 'Flight data')} />
      <View style={{ gap: 6 }}>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: c.fill, overflow: 'hidden' }}>
          <View style={{ width: `${(sim.estD / ROUTE_NM) * 100}%`, height: '100%', backgroundColor: c.navy, borderRadius: 3 }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T size={12.5} color={c.ink2} num>{`${L('경과', 'Elapsed')} ${hm(sim.t)}`}</T>
          <T size={12.5} color={c.ink2} num>{`${L('남은', 'Remaining')} ${hm(eta - sim.t)}`}</T>
        </View>
      </View>
      <KV
        rows={[
          [L('출발', 'Departure'), `${L('인천', 'Incheon')} ICN ${sim.clock(0)} UTC`, `${L('한국 시각', 'Korea')} ${sim.clockAt(0, KST)}${date}`],
          [L('도착 예정', 'Arrival'), `${L('샌프란시스코', 'San Francisco')} ${sim.clock(eta)} UTC`, `${L('현지', 'Local')} ${sim.clockAt(eta, PST)} · ${L('한국', 'Korea')} ${sim.clockAt(eta, KST)}`],
          [L('현재 위치', 'Position'), L(`${P(region)} 부근`, `Near ${P(region)}`), sim.aid ? L('실시간 위치', 'Live position') : L('예측 위치', 'Estimated position')],
          [L('바깥 온도', 'Outside air'), `${oat}°C`],
          [L('바람', 'Wind'), `${wind >= 0 ? L('뒷바람', 'Tailwind') : L('맞바람', 'Headwind')} ${Math.abs(wind)} kt`, wind >= 0 ? L('도착이 빨라지는 방향', 'Shortens the flight') : L('도착이 늦어지는 방향', 'Lengthens the flight')],
          [L('바깥', 'Outside'), night ? L('밤', 'Night') : L('낮', 'Day'), `${L('현지 태양시', 'Local solar time')} ${pad(Math.floor(solar))}:${pad(Math.floor((solar % 1) * 60))}`],
        ]}
      />
    </Card>
  );
}

export function AirportsCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { lang, L, P } = useLang();
  const est = sim.position, gs = Math.max(sim.groundSpeedShown, 200);
  const list = AIRPORTS.map((a) => ({ a, d: distanceNm(est, { lat: a[2], lon: a[3] }) })).sort((x, y) => x.d - y.d).slice(0, 4);
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title={L('가까운 공항', 'Nearest airports')} right={<T size={12.5} color={c.ink2}>{L('응급 상황 대비', 'For emergencies')}</T>} />
      <View>
        {list.map(({ a, d }, i) => (
          <View key={a[0]} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <View style={{ width: 44, paddingVertical: 5, borderRadius: 8, backgroundColor: c.navySoft, alignItems: 'center' }}>
              <T size={13} weight={700} color={c.navy}>{a[0]}</T>
            </View>
            <T size={14.5} weight={600} style={{ flex: 1 }}>{P(a[1])}</T>
            <View style={{ alignItems: 'flex-end' }}>
              <T size={14} weight={600} num>{`${Math.round(d).toLocaleString()} NM`}</T>
              <T size={12} color={c.ink2}>{L(`약 ${hoursText((d / gs) * 3600, lang)}`, `about ${hoursText((d / gs) * 3600, lang)}`)}</T>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function ArrivalCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { L } = useLang();
  const eta = sim.eta, m2 = sim.plan?.find((v) => v.id === 'm2');
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title={L('도착 준비', 'Arrival prep')} right={<T size={12.5} color={c.ink2}>{L('샌프란시스코 SFO', 'San Francisco SFO')}</T>} />
      <KV
        rows={[
          [L('도착지 날씨', 'Weather'), L('맑음 · 15°C', 'Clear · 15°C'), L('서풍 12 kt · 시뮬레이션 값', 'West 12 kt · simulated')],
          [L('현지 시각', 'Local time'), `${sim.clockAt(sim.t, PST)} PST`, L('한국보다 17시간 느림', '17 h behind Korea')],
          [L('2차 식사', 'Second meal'), m2 && m2.start != null && m2.end != null ? `${sim.clock(m2.start)}–${sim.clock(m2.end)} UTC` : L('조정 필요', 'Needs adjusting')],
          [L('세관 신고 안내', 'Customs forms'), `${sim.clock(eta - 7200)} UTC`, L('도착 2시간 전 · 미국 입국 안내', '2 h before arrival · US entry')],
          [L('하강 준비 시작', 'Descent prep'), `${sim.clock(eta - 2400)} UTC`, L('도착 40분 전 · 객실 최종 점검', '40 min before arrival · final cabin check')],
          [L('착륙 예정', 'Landing'), `${sim.clock(eta)} UTC`, `${L('현지', 'Local')} ${sim.clockAt(eta, PST)}`],
        ]}
      />
    </Card>
  );
}
