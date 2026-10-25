import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'overview'
  | 'twin'
  | 'kernel'
  | 'plans'
  | 'scenario'
  | 'incidents'
  | 'settings'
  | 'brand'
  | 'plane';

const SHIELD = 'M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z';

function glyph(name: IconName) {
  switch (name) {
    case 'overview':
      return (
        <>
          <Rect x={3} y={3} width={7} height={7} rx={2} />
          <Rect x={14} y={3} width={7} height={7} rx={2} />
          <Rect x={3} y={14} width={7} height={7} rx={2} />
          <Rect x={14} y={14} width={7} height={7} rx={2} />
        </>
      );
    case 'twin':
      return (
        <>
          <Rect x={7} y={2.5} width={10} height={19} rx={5} />
          <Path d="M7 9h10M7 15h10M12 2.5v19" />
        </>
      );
    case 'kernel':
      return (
        <>
          <Path d={SHIELD} />
          <Path d="M12 8v5M12 16h.01" />
        </>
      );
    case 'plans':
      return (
        <>
          <Path d="M9 6h11M9 12h11M9 18h11" />
          <Path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
        </>
      );
    case 'scenario':
      return (
        <>
          <Path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
          <Circle cx={16} cy={7} r={2} />
          <Circle cx={10} cy={17} r={2} />
        </>
      );
    case 'incidents':
      return (
        <>
          <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
          <Path d="M14 3v5h5M9 13h6M9 17h4" />
        </>
      );
    case 'settings':
      return (
        <>
          <Circle cx={12} cy={12} r={3} />
          <Path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
        </>
      );
    case 'brand':
      return (
        <>
          <Path d={SHIELD} />
          <Path d="M8.5 12.5l2.5 2.5 4.5-5" />
        </>
      );
    case 'plane':
      return (
        <Path d="M12 2.5c.9 0 1.5 1 1.5 2.3v5l7.5 4.2v2l-7.5-2.2v4.4l2.2 1.6v1.6L12 20.6l-3.7.8v-1.6l2.2-1.6v-4.4L3 16v-2l7.5-4.2v-5c0-1.3.6-2.3 1.5-2.3z" />
      );
  }
}

export function Icon({ name, size = 20, color, strokeWidth = 1.8 }: { name: IconName; size?: number; color: string; strokeWidth?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {glyph(name)}
    </Svg>
  );
}
