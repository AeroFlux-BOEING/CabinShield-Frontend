import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { useTheme } from '../theme/ThemeProvider';
import { FONT_FAMILY } from '../theme/typography';

const SEAT = '#5D6F84';
const WING = '#9AA4B0';

/** Boeing 737-8 side view with the aft cabin (PoC scope) highlighted. Illustrative. */
export function PlaneArt() {
  const { c } = useTheme();

  const windows = [];
  for (let x = 180; x < 820; x += 19) {
    windows.push(<Rect key={x} x={x} y={134} width={9} height={13} rx={4.5} fill={c.planeDark} />);
  }
  const seats = [];
  for (let i = 0; i < 7; i++) {
    const x = 652 + i * 20 + 4;
    seats.push(<Rect key={`b${i}`} x={x} y={132} width={6} height={30} rx={3} fill={SEAT} />);
    seats.push(<Rect key={`s${i}`} x={x} y={156} width={14} height={6} rx={3} fill={SEAT} />);
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Boeing 737-8 side view with the aft cabin highlighted"
      style={{ width: '100%', aspectRatio: 1000 / 300 }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 1000 300">
        <Defs>
          <LinearGradient id="cs-fus" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.plane} />
            <Stop offset="1" stopColor={c.plane2} />
          </LinearGradient>
        </Defs>
        <Ellipse cx={500} cy={282} rx={400} ry={10} fill={c.shadow} />
        {/* tail */}
        <Path d="M832 116 L902 20 L946 20 L962 112 Z" fill="url(#cs-fus)" stroke={c.planeLine} strokeWidth={1.5} />
        <Path d="M902 20 L946 20 L948 34 L893 34 Z" fill={c.accent} />
        {/* fuselage */}
        <Path
          d="M38 158 C40 134 82 116 160 114 L860 114 C910 112 950 108 978 104 L980 120 C940 138 860 176 760 186 L150 186 C90 186 40 176 38 158 Z"
          fill="url(#cs-fus)"
          stroke={c.planeLine}
          strokeWidth={1.5}
        />
        <Path d="M896 132 L992 122 L994 130 L912 142 Z" fill={c.plane2} stroke={c.planeLine} strokeWidth={1.2} />
        <Path d="M70 166 L860 166 C905 164 945 154 972 134" fill="none" stroke={c.accent} strokeWidth={3} strokeLinecap="round" />
        {/* cockpit windows */}
        <Path d="M68 142 L92 129 L108 128 L106 139 L74 145 Z" fill={c.planeDark} />
        <Path d="M112 128 L128 128 L127 138 L110 139 Z" fill={c.planeDark} />
        {/* doors */}
        <Rect x={146} y={124} width={22} height={52} rx={6} fill="none" stroke={c.planeLine} strokeWidth={1.5} />
        <Rect x={828} y={124} width={22} height={50} rx={6} fill="none" stroke={c.planeLine} strokeWidth={1.5} />
        {windows}
        {/* aft cabin cut-away */}
        <Rect x={648} y={122} width={158} height={54} rx={14} fill="#1B2330" stroke="#FFFFFF" strokeWidth={3} />
        {seats}
        <Rect x={768} y={146} width={16} height={22} rx={3} fill="#E58A2E" />
        <Line x1={727} y1={122} x2={727} y2={74} stroke={c.accent} strokeWidth={1.5} />
        <Circle cx={727} cy={122} r={4} fill={c.accent} />
        <Rect x={662} y={48} width={130} height={28} rx={14} fill={c.accent} />
        <SvgText x={727} y={67} textAnchor="middle" fontFamily={FONT_FAMILY[700]} fontSize={12} fill="#FFFFFF" letterSpacing={0.6}>
          AFT CABIN · PoC
        </SvgText>
        {/* wing + engine */}
        <Path d="M388 172 L604 206 L640 210 L652 202 L566 172 Z" fill={WING} />
        <Path d="M636 210 L652 172 L662 174 L650 212 Z" fill={c.accent} />
        <Path d="M398 190 L472 188 L520 176 L436 176 Z" fill={c.plane2} />
        <Rect x={326} y={186} width={150} height={46} rx={23} fill="url(#cs-fus)" stroke={c.planeLine} strokeWidth={1.5} />
        <Ellipse cx={334} cy={209} rx={8} ry={21} fill={c.planeDark} />
        <Path d="M472 196 L502 204 L502 214 L472 222 Z" fill={WING} />
      </Svg>
    </View>
  );
}
