import { View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Mask, Path, Polygon, Rect, Stop } from 'react-native-svg';

/**
 * AeroFlux "AF" mark — vector port of assets/brand/AF_color_logo.svg (mark only, no wordmark).
 * Pass `color` for the single-colour version (AF_mono_icon.svg); otherwise the brand gradient is used.
 */
const SKEW = 'skewX(-16) translate(36,0)';
const SWOOSH = 'M-6 116 C 28 74, 70 62, 124 62 L 186 62 L 186 84 L 126 84 C 84 84, 44 94, -6 116 Z';
// Tight bounds of the mark in its own coordinate space (measured from the source SVG).
const VIEWBOX = '-4 7 235 114';
const ASPECT = 235 / 114;

export const AEROFLUX_GRADIENT = { from: '#0B2E73', to: '#2AA7F5' } as const;

interface Props {
  /** Rendered width in px; height follows the mark's aspect ratio. */
  width?: number;
  /** Solid fill (mono mark). Omit for the colour gradient. */
  color?: string;
  accessibilityLabel?: string;
}

export function AeroFluxMark({ width = 40, color, accessibilityLabel = 'AeroFlux' }: Props) {
  const fill = color ?? 'url(#af-gradient)';
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={{ width, height: width / ASPECT }}>
      <Svg width="100%" height="100%" viewBox={VIEWBOX}>
        <Defs>
          <LinearGradient id="af-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="130" x2="210" y2="0">
            <Stop offset="0" stopColor={AEROFLUX_GRADIENT.from} />
            <Stop offset="1" stopColor={AEROFLUX_GRADIENT.to} />
          </LinearGradient>
          {/* Cuts a gap around the swoosh so it reads as passing in front of the letters. */}
          <Mask id="af-mask" maskUnits="userSpaceOnUse" x="-50" y="-20" width="300" height="180">
            <Rect x="-50" y="-20" width="300" height="180" fill="#FFFFFF" />
            <Path d={SWOOSH} fill="#000000" stroke="#000000" strokeWidth={12} strokeLinejoin="round" transform={SKEW} />
          </Mask>
        </Defs>
        <G mask="url(#af-mask)">
          <G transform={SKEW} fill={fill}>
            <Polygon points="4,120 60,8 82,8 110,120 84,120 66,48 32,120" />
            <Rect x="116" y="8" width="26" height="112" />
            <Polygon points="116,8 196,8 190,32 116,32" />
          </G>
        </G>
        <G transform={SKEW}>
          <Path d={SWOOSH} fill={fill} />
        </G>
      </Svg>
    </View>
  );
}
