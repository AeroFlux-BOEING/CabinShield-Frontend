import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName = 'grid' | 'target' | 'people' | 'plane' | 'wifi';

/** 24-pt line icons, stroke follows `color`. */
export function Icon({ name, color, size = 18 }: { name: IconName; color: string; size?: number }) {
  const p = { stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'grid' ? (
        <>
          <Rect x={3.5} y={3.5} width={7} height={7} rx={2} {...p} />
          <Rect x={13.5} y={3.5} width={7} height={7} rx={2} {...p} />
          <Rect x={3.5} y={13.5} width={7} height={7} rx={2} {...p} />
          <Rect x={13.5} y={13.5} width={7} height={7} rx={2} {...p} />
        </>
      ) : null}
      {name === 'target' ? (
        <>
          <Circle cx={12} cy={12} r={8.5} {...p} />
          <Circle cx={12} cy={12} r={5} {...p} />
          <Circle cx={12} cy={12} r={1.6} {...p} />
        </>
      ) : null}
      {name === 'people' ? (
        <>
          <Circle cx={9} cy={8} r={3} {...p} />
          <Path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" {...p} />
          <Circle cx={17} cy={9} r={2.3} {...p} />
          <Path d="M15.5 14.2c2.6-.3 4.5 1.3 5 4.3" {...p} />
        </>
      ) : null}
      {name === 'plane' ? <Path d="M2.5 13.5 21 7.5c.9-.3 1.3.9.5 1.4l-5.5 3.4-3 7.2-2-.6.8-5.4-5.3 1.8-1.6 2.3-1.4-.4.5-3.2Z" {...p} /> : null}
      {name === 'wifi' ? (
        <>
          <Path d="M4 9a12 12 0 0 1 16 0" {...p} />
          <Path d="M7 12.5a7.5 7.5 0 0 1 10 0" {...p} />
          <Path d="M10 16a3 3 0 0 1 4 0" {...p} />
          <Circle cx={12} cy={19} r={0.8} {...p} />
        </>
      ) : null}
    </Svg>
  );
}

/** Aircraft silhouette path, nose up, centred at 0,0 (±10). */
export const PLANE_PATH =
  'M0,-10 L1.8,-3 L10,2 L10,4.2 L1.8,1.8 L1.4,7 L4.2,9.2 L4.2,10.4 L0,9.4 L-4.2,10.4 L-4.2,9.2 L-1.4,7 L-1.8,1.8 L-10,4.2 L-10,2 L-1.8,-3 Z';
