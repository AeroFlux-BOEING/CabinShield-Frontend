import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { HISTORY, PLACES, POINTS } from '../../domain/content';
import { PLAN_GS } from '../../domain/flight';
import { D2R, gc, mercY, posAt, ROUTE_NM, trackAt } from '../../domain/geo';
import { LAND } from '../../domain/land';
import { minutesText } from '../../i18n/format';
import { useLang } from '../../i18n/LangContext';
import { useFlight } from '../../state/FlightContext';
import { useTheme } from '../../theme/ThemeProvider';
import { svgFont } from '../../theme/typography';
import { PLANE_PATH } from '../Icon';
import { Segmented } from '../ui/Controls';
import { CardHead, Card } from '../ui/Surfaces';
import { T } from '../ui/T';

/** Coastline in (lon rad, −mercator y) so a single translate+scale projects it. */
const LAND_PATH = LAND.map((r) => 'M' + r.pts.map(([lo, la]) => `${(lo * D2R).toFixed(4)},${(-mercY(la)).toFixed(4)}`).join('L') + 'Z').join('');

type Mode = 'near' | 'all';

export function FlightMap() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { lang, L, P: tr } = useLang();
  const [mode, setMode] = useState<Mode>('near');
  const [W, setW] = useState(0);
  const H = Math.round((W * 10) / 16);

  const est = sim.position;
  const gs = Math.max(sim.groundSpeedShown, 200);
  let cLon: number, cLat: number, span: number;
  if (mode === 'all') { cLon = 182; cLat = 48; span = 128; }
  else { const p = posAt(Math.min(ROUTE_NM, sim.estD + gs * 0.2)); cLon = p.lon; cLat = p.lat; span = 1250 / (60 * Math.cos(cLat * D2R)); }
  const k = W ? W / (span * D2R) : 1;
  const P = (lon: number, lat: number): [number, number] => [W / 2 + (lon - cLon) * D2R * k, H / 2 - (mercY(lat) - mercY(cLat)) * k];
  const pts = (a: [number, number][]) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const seg = (d0: number, d1: number) => {
    const n = Math.max(2, Math.ceil((d1 - d0) / 10)), out: [number, number][] = [];
    for (let i = 0; i <= n; i++) { const q = posAt(d0 + ((d1 - d0) * i) / n); out.push(P(q.lon, q.lat)); }
    return pts(out);
  };
  const inView = ([x, y]: [number, number], m = 0) => x > m && x < W - m && y > m && y < H - m;
  const near = mode === 'near';

  const route: [number, number][] = [];
  for (let i = 0; i <= 240; i++) { const p = gc(i / 240); route.push(P(p.lon, p.lat)); }
  const fi = Math.floor((sim.estD / ROUTE_NM) * 240);
  const me = P(est.lon, est.lat);
  const step = near ? 5 : 10;
  const grid: number[] = [];
  for (let lo = Math.ceil((cLon - span / 2 - 2) / step) * step; lo <= cLon + span / 2 + 2; lo += step) grid.push(lo);
  const next = sim.ex.find((e) => e.t0 > sim.t);
  const LK = sim.look;

  let hint: string | null = null;
  if (LK && LK.cur === 0 && LK.first[1] != null) {
    const e = posAt(Math.min(ROUTE_NM, sim.estD + (gs * LK.first[1]) / 3600));
    if (!inView(P(e.lon, e.lat))) hint = lang === 'ko' ? `1포인트까지 ${minutesText(LK.first[1], lang)} →` : `Point 1 in ${minutesText(LK.first[1], lang)} →`;
  }

  return (
    <Card style={{ flex: 1 }}>
      <CardHead
        title={L('지도', 'Map')}
        right={<Segmented label={L('지도 범위', 'Map range')} value={mode} onChange={setMode} options={[{ value: 'near', label: L('주변', 'Nearby') }, { value: 'all', label: L('전체 항로', 'Whole route') }]} />}
      />
      <View onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))} style={{ width: '100%', aspectRatio: 16 / 10, borderRadius: 14, overflow: 'hidden', backgroundColor: c.ocean }}>
        {W > 0 ? (
          <Svg width={W} height={H} accessibilityLabel={L('실제 지도 위의 현재 위치, 항로, 오늘 예보 구간과 과거 보고 구간', "Map with current position, route, today's forecast and past report segments")}>
            <G stroke={c.grid} strokeWidth={1}>
              {grid.map((lo) => { const [x] = P(lo, 0); return <Line key={'v' + lo} x1={x} x2={x} y1={0} y2={H} />; })}
              {Array.from({ length: 17 }, (_, i) => -80 + i * step).map((la) => { const [, y] = P(cLon, la); return y > 0 && y < H ? <Line key={'h' + la} x1={0} x2={W} y1={y} y2={y} /> : null; })}
            </G>
            <Path d={LAND_PATH} transform={`translate(${W / 2 - cLon * D2R * k},${H / 2 + mercY(cLat) * k}) scale(${k})`} fill={c.land} stroke={c.coast} strokeWidth={0.8 / k} strokeLinejoin="round" />
            {PLACES.map(([n, la, lo, city]) => {
              const [x, y] = P(lo, la);
              if (x < 20 || x > W - 20 || y < 12 || y > H - 12) return null;
              return city ? (
                <G key={n.en}>
                  <Circle cx={x} cy={y} r={2.5} fill={c.ink2} />
                  <SvgText fontFamily={svgFont} x={x} y={y - 7} fontSize={12} fontWeight="600" fill={c.ink} textAnchor="middle">{tr(n)}</SvgText>
                </G>
              ) : (
                <SvgText fontFamily={svgFont} key={n.en} x={x} y={y + 4} fontSize={12} fontStyle="italic" fill={c.sea} textAnchor="middle">{tr(n)}</SvgText>
              );
            })}
            {/* route: flown solid, remaining dashed */}
            <Polyline points={pts([me, ...route.slice(fi + 1)])} fill="none" stroke={c.navy} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="5 6" />
            <Polyline points={pts([...route.slice(0, fi + 1), me])} fill="none" stroke={c.navy} strokeWidth={3} />
            {/* past similar reports (dashed) */}
            {HISTORY.map((h, i) => (
              <Polyline key={'h' + i} points={seg(h.d0, h.d1)} fill="none" stroke={h.cases >= 15 ? c.p2Dot : c.p1Dot} strokeWidth={near ? 9 : 6} strokeLinecap="round" strokeDasharray="2 9" strokeOpacity={0.9} />
            ))}
            {near
              ? HISTORY.map((h, i) => {
                  const m = posAt(h.d0 + (h.d1 - h.d0) * 0.8), [x, y] = P(m.lon, m.lat);
                  if (!(x > 40 && x < W - 40 && y > 30 && y < H - 30)) return null;
                  const t = lang === 'ko' ? `과거 보고 ${h.cases}건` : `${h.cases} past reports`, w = t.length * (lang === 'ko' ? 8 : 6.4) + 14;
                  return (
                    <G key={'hl' + i}>
                      <Rect x={x - w / 2} y={y + 14} width={w} height={20} rx={10} fill={c.card} fillOpacity={0.94} />
                      <SvgText fontFamily={svgFont} x={x} y={y + 28} fontSize={11.5} fontWeight="600" fill={c.ink2} textAnchor="middle">{t}</SvgText>
                    </G>
                  );
                })
              : null}
            {/* today's forecast segments (solid red) and P1–P3 markers */}
            {sim.ex.map((e, i) => {
              const past = e.t1 < sim.t;
              const m = posAt((e.d0 + e.d1) / 2), [mx, my] = P(m.lon, m.lat);
              const showP = !past && (near || e === next);
              return (
                <G key={'e' + i} opacity={past ? 0.35 : 1}>
                  <Polyline points={seg(e.d0, e.d1)} fill="none" stroke={c.p3Dot} strokeWidth={near ? 5 : 4} strokeLinecap="round" />
                  {near && !past && mx > 40 && mx < W - 40 && my > 30 && my < H - 20 ? (
                    <G>
                      <Rect x={mx - 52} y={my - 34} width={104} height={20} rx={10} fill={c.p3Dot} />
                      <SvgText fontFamily={svgFont} x={mx} y={my - 20} fontSize={11.5} fontWeight="700" fill="#FFFFFF" textAnchor="middle">{L('오늘 예보 구간', "Today's forecast")}</SvgText>
                    </G>
                  ) : null}
                  {showP
                    ? POINTS.map((pt) => {
                        const dd = e.d0 - (PLAN_GS * pt.lead) / 3600;
                        if (dd < sim.estD - 1) return null;
                        const q = posAt(dd), [x, y] = P(q.lon, q.lat);
                        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) return null;
                        const col = [c.p1Dot, c.p2Dot, c.p3Dot][pt.n - 1], r = near ? 10 : 7;
                        return (
                          <G key={'p' + pt.n}>
                            <Circle cx={x} cy={y} r={r} fill={c.card} stroke={col} strokeWidth={2.5} />
                            <SvgText fontFamily={svgFont} x={x} y={y + (near ? 3.8 : 3)} fontSize={near ? 10.5 : 8.5} fontWeight="800" fill={col} textAnchor="middle">{'P' + pt.n}</SvgText>
                          </G>
                        );
                      })
                    : null}
                </G>
              );
            })}
            <G transform={`translate(${me[0]},${me[1]}) rotate(${trackAt(sim.estD)}) scale(1.5)`}>
              <Path d={PLANE_PATH} fill={c.navy} stroke="#FFFFFF" strokeWidth={1.2} />
            </G>
            {hint ? (
              <G>
                <Rect x={W - hint.length * (lang === 'ko' ? 8.2 : 6.8) - 36} y={12} width={hint.length * (lang === 'ko' ? 8.2 : 6.8) + 24} height={28} rx={14} fill={c.card} />
                <SvgText fontFamily={svgFont} x={W - hint.length * (lang === 'ko' ? 4.1 : 3.4) - 24} y={30.5} fontSize={12.5} fontWeight="600" fill={c.ink} textAnchor="middle">{hint}</SvgText>
              </G>
            ) : null}
            {near ? (
              <G>
                <Line x1={14} x2={14 + (100 / 60 / Math.cos(cLat * D2R)) * D2R * k} y1={H - 16} y2={H - 16} stroke={c.ink2} strokeWidth={2} />
                <SvgText fontFamily={svgFont} x={14} y={H - 24} fontSize={11} fill={c.ink2}>100 NM</SvgText>
              </G>
            ) : null}
          </Svg>
        ) : null}
      </View>
      <MapLegend />
    </Card>
  );
}

function MapLegend() {
  const { c } = useTheme();
  const { L } = useLang();
  const items: [React.ReactNode, string, string][] = [
    [<View style={{ width: 22, height: 5, borderRadius: 3, backgroundColor: c.p3Dot }} />, L('빨간 실선', 'Red line'), L('오늘 예보 난기류 구간', "today's forecast turbulence segment")],
    [<View style={{ flexDirection: 'row', gap: 3 }}>{[c.p2Dot, c.p1Dot, c.p2Dot].map((x, i) => <View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: x }} />)}</View>, L('주황 · 노란 점선', 'Orange / yellow dots'), L('과거 유사 난기류 보고 참고 구간', 'past similar turbulence reports')],
    [<Svg width={16} height={16} viewBox="-11 -11 22 22"><Path d={PLANE_PATH} fill={c.navy} transform="rotate(45)" /></Svg>, L('비행기', 'Aircraft'), L('현재 위치', 'current position')],
    [<View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.p2Dot, alignItems: 'center', justifyContent: 'center' }}><T size={8} weight={800} color={c.p2}>P</T></View>, 'P1 · P2 · P3', L('구간 진입 23분 · 13분 · 5분 전 대응 포인트', 'response points 23, 13 and 5 min before the segment')],
  ];
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 16 }}>
        {items.map(([icon, b, t]) => (
          <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, flexBasis: '46%', flexGrow: 1, minWidth: 220 }}>
            <View style={{ width: 22, alignItems: 'center' }}>{icon}</View>
            <T size={13} color={c.ink2} style={{ flexShrink: 1 }}>
              <T size={13} weight={600}>{b} </T>
              {t}
            </T>
          </View>
        ))}
      </View>
      <T size={12.5} color={c.ink2}>{L('지도 데이터: Natural Earth · 과거 보고는 데모용 예시 값', 'Map data: Natural Earth · past reports are demo values')}</T>
    </View>
  );
}
