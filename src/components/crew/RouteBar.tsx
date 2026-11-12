import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { HISTORY, POINTS } from '../../domain/content';
import { PLAN_GS } from '../../domain/flight';
import { ROUTE_NM } from '../../domain/geo';
import { aheadText } from '../../i18n/format';
import { useLang } from '../../i18n/LangContext';
import { useFlight } from '../../state/FlightContext';
import { useTheme } from '../../theme/ThemeProvider';
import { svgFont } from '../../theme/typography';
import { PLANE_PATH } from '../Icon';
import { Card, CardHead } from '../ui/Surfaces';
import { T } from '../ui/T';

const W = 1000;
const H = 86;

/** Whole-flight progress bar with today's forecast segments, past-report segments and P markers. */
export function RouteBar() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { lang, L } = useLang();
  const [w, setW] = useState(0);
  const x0 = 40, x1 = 960, X = (d: number) => x0 + ((x1 - x0) * d) / ROUTE_NM;
  const next = sim.ex.find((e) => e.t0 > sim.t);
  let labelled = false;
  const ago = (tt: number) => aheadText(tt, lang);

  return (
    <Card style={{ gap: 8, paddingVertical: 16 }}>
      <CardHead title={L('전체 비행', 'Whole flight')} />
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: '100%', aspectRatio: W / H, maxHeight: 86 }}>
        {w > 0 ? (
          <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} accessibilityLabel={L('인천에서 샌프란시스코까지 진행 상황과 난기류 구간', 'Progress from Incheon to San Francisco with turbulence segments')}>
            <Line x1={x0} x2={x1} y1={40} y2={40} stroke={c.line} strokeWidth={6} strokeLinecap="round" />
            <Line x1={x0} x2={X(sim.estD)} y1={40} y2={40} stroke={c.navy} strokeWidth={6} strokeLinecap="round" />
            {HISTORY.map((h, i) => (
              <Rect key={i} x={X(h.d0)} y={29} width={X(h.d1) - X(h.d0)} height={22} rx={6} fill="none" stroke={h.cases >= 15 ? c.p2Dot : c.p1Dot} strokeWidth={2} strokeDasharray="4 4" />
            ))}
            {sim.ex.map((e, i) => {
              const past = e.t1 < sim.t;
              return (
                <G key={i} opacity={past ? 0.35 : 1}>
                  <Rect x={X(e.d0)} y={36} width={Math.max(4, X(e.d1) - X(e.d0))} height={8} rx={4} fill={c.p3Dot} />
                  {!past ? <SvgText fontFamily={svgFont} x={(X(e.d0) + X(e.d1)) / 2} y={17} fontSize={12} fontWeight="700" fill={c.ink2} textAnchor="middle">{ago(e.t0 - sim.t)}</SvgText> : null}
                </G>
              );
            })}
            {next
              ? POINTS.map((pt) => {
                  const dd = next.d0 - (PLAN_GS * pt.lead) / 3600;
                  if (dd < sim.estD) return null;
                  const col = [c.p1Dot, c.p2Dot, c.p3Dot][pt.n - 1];
                  const lab = !labelled;
                  labelled = true;
                  return (
                    <G key={pt.n}>
                      <Line x1={X(dd)} x2={X(dd)} y1={30} y2={50} stroke={col} strokeWidth={2} strokeLinecap="round" />
                      {lab ? <SvgText fontFamily={svgFont} x={X(dd)} y={27} fontSize={10} fontWeight="800" fill={[c.p1, c.p2, c.p3][pt.n - 1]} textAnchor="middle">{'P' + pt.n}</SvgText> : null}
                    </G>
                  );
                })
              : null}
            <Circle cx={x0} cy={40} r={6} fill={c.card} stroke={c.ink2} strokeWidth={2} />
            <Circle cx={x1} cy={40} r={6} fill={c.card} stroke={c.ink2} strokeWidth={2} />
            <SvgText fontFamily={svgFont} x={x0} y={74} fontSize={13} fontWeight="700" fill={c.ink} textAnchor="middle">{L('인천', 'Incheon')}</SvgText>
            <SvgText fontFamily={svgFont} x={x1} y={74} fontSize={13} fontWeight="700" fill={c.ink} textAnchor="end">{L('샌프란시스코', 'San Francisco')}</SvgText>
            <G transform={`translate(${X(sim.estD)},40) rotate(90) scale(1.25)`}>
              <Path d={PLANE_PATH} fill={c.navy} stroke={c.card} strokeWidth={1.2} />
            </G>
            <SvgText fontFamily={svgFont} x={Math.max(lang === "en" ? 130 : 90, Math.min(880, X(sim.estD)))} y={74} fontSize={12} fill={c.ink2} textAnchor="middle">{`${L('지금 여기', 'You are here')} · ${Math.round((sim.estD / ROUTE_NM) * 100)}%`}</SvgText>
          </Svg>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 6 }}>
        <Legend swatch={<View style={{ width: 18, height: 6, borderRadius: 3, backgroundColor: c.p3Dot }} />} text={L('오늘 예보 난기류 구간', "Today's forecast turbulence")} />
        <Legend swatch={<View style={{ width: 18, height: 6, borderRadius: 3, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.p2Dot }} />} text={L('과거 유사 난기류 보고 구간', 'Past similar turbulence reports')} />
        <Legend swatch={<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.navy }} />} text={L('지나온 길', 'Flown')} />
        <Legend text={L('P1 · P2 · P3 대응 포인트', 'P1 · P2 · P3 response points')} />
      </View>
    </Card>
  );
}

function Legend({ swatch, text }: { swatch?: React.ReactNode; text: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      {swatch}
      <T size={13} color={c.ink2}>{text}</T>
    </View>
  );
}
