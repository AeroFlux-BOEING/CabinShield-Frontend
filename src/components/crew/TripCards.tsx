import { View } from 'react-native';

import { AIRPORTS, PLACES } from '../../domain/content';
import { TAS } from '../../domain/flight';
import { distanceNm, ROUTE_NM } from '../../domain/geo';
import { hm, hoursText, pad } from '../../state/FlightSim';
import { useFlight } from '../../state/FlightContext';
import { useTheme } from '../../theme/ThemeProvider';
import { Card, CardHead, KV } from '../ui/Surfaces';
import { T } from '../ui/T';

const PST = -8;
const KST = 9;

export function FlightInfoCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const est = sim.position, eta = sim.eta, gs = Math.max(sim.groundSpeedShown, 200);
  const fl = sim.flightLevel;
  const oat = Math.round(-56 + ((390 - Math.min(fl, 390)) / 40) * 6 + 2 * Math.sin(sim.t / 1900));
  const wind = Math.round(gs - TAS);
  let region = '북태平양', best = Infinity;
  for (const [n, la, lo, city] of PLACES) if (!city) { const d = distanceNm(est, { lat: la, lon: lo }); if (d < best) { best = d; region = n; } }
  const solar = ((((sim.depUtc + sim.t) / 3600 + est.lon / 15) % 24) + 24) % 24;
  const night = solar < 6 || solar >= 18.5;
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title="비행 정보" />
      <View style={{ gap: 6 }}>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: c.fill, overflow: 'hidden' }}>
          <View style={{ width: `${(sim.estD / ROUTE_NM) * 100}%`, height: '100%', backgroundColor: c.navy, borderRadius: 3 }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T size={12.5} color={c.ink2} num>{`경과 ${hm(sim.t)}`}</T>
          <T size={12.5} color={c.ink2} num>{`남은 ${hm(eta - sim.t)}`}</T>
        </View>
      </View>
      <KV
        rows={[
          ['출발', `인천 ICN ${sim.clock(0)} UTC`, `한국 시각 ${sim.clockAt(0, KST)}${sim.flight?.dateLabel ? ' · ' + sim.flight.dateLabel : ''}`],
          ['도착 예정', `샌프란시스코 ${sim.clock(eta)} UTC`, `현지 ${sim.clockAt(eta, PST)} · 한국 ${sim.clockAt(eta, KST)}`],
          ['현재 위치', `${region} 부근`, sim.aid ? '실시간 위치' : '예측 위치'],
          ['바깥 온도', `${oat}°C`],
          ['바람', `${wind >= 0 ? '뒷바람' : '맞바람'} ${Math.abs(wind)} kt`, wind >= 0 ? '도착이 빨라지는 방향' : '도착이 늦어지는 방향'],
          ['바깥', night ? '밤' : '낮', `현지 태양시 ${pad(Math.floor(solar))}:${pad(Math.floor((solar % 1) * 60))}`],
        ]}
      />
    </Card>
  );
}

export function AirportsCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const est = sim.position, gs = Math.max(sim.groundSpeedShown, 200);
  const list = AIRPORTS.map((a) => ({ a, d: distanceNm(est, { lat: a[2], lon: a[3] }) })).sort((x, y) => x.d - y.d).slice(0, 4);
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title="가까운 공항" right={<T size={12.5} color={c.ink2}>응급 상황 대비</T>} />
      <View>
        {list.map(({ a, d }, i) => (
          <View key={a[0]} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <View style={{ width: 44, paddingVertical: 5, borderRadius: 8, backgroundColor: c.navySoft, alignItems: 'center' }}>
              <T size={13} weight={700} color={c.navy}>{a[0]}</T>
            </View>
            <T size={14.5} weight={600} style={{ flex: 1 }}>{a[1]}</T>
            <View style={{ alignItems: 'flex-end' }}>
              <T size={14} weight={600} num>{`${Math.round(d).toLocaleString()} NM`}</T>
              <T size={12} color={c.ink2}>{`약 ${hoursText((d / gs) * 3600)}`}</T>
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
  const eta = sim.eta, m2 = sim.plan?.find((v) => v.id === 'm2');
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title="도착 준비" right={<T size={12.5} color={c.ink2}>샌프란시스코 SFO</T>} />
      <KV
        rows={[
          ['도착지 날씨', '맑음 · 15°C', '서풍 12 kt · 시뮬레이션 값'],
          ['현지 시각', `${sim.clockAt(sim.t, PST)} PST`, '한국보다 17시간 느림'],
          ['2차 식사', m2 && m2.start != null && m2.end != null ? `${sim.clock(m2.start)}–${sim.clock(m2.end)} UTC` : '조정 필요'],
          ['세관 신고 안내', `${sim.clock(eta - 7200)} UTC`, '도착 2시간 전 · 미국 입국 안내'],
          ['하강 준비 시작', `${sim.clock(eta - 2400)} UTC`, '도착 40분 전 · 객실 최종 점검'],
          ['착륙 예정', `${sim.clock(eta)} UTC`, `현지 ${sim.clockAt(eta, PST)}`],
        ]}
      />
    </Card>
  );
}
