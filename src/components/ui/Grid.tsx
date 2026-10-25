import { Children, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

interface GridProps {
  /** CSS `repeat(auto-fit, minmax(<min>px, 1fr))`. Ignored when `columns` is set. */
  min?: number;
  columns?: number;
  gap?: number;
  rowGap?: number;
  children: ReactNode;
}

/** Equal-width responsive grid; cells stretch to the tallest item in their row. */
export function Grid({ min = 220, columns, gap = 16, rowGap, children }: GridProps) {
  const [width, setWidth] = useState(0);
  const items = Children.toArray(children);
  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.floor(e.nativeEvent.layout.width);
    if (w !== width) setWidth(w);
  };

  let cols = columns ?? 1;
  if (!columns && width > 0) cols = Math.max(1, Math.min(items.length, Math.floor((width + gap) / (min + gap))));
  // Floor to whole pixels so sub-pixel rounding never pushes the last cell onto a new row.
  const cellWidth = width > 0 ? Math.floor((width - gap * (cols - 1)) / cols) : undefined;

  return (
    <View onLayout={onLayout} style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: gap, rowGap: rowGap ?? gap }}>
      {items.map((child, i) => (
        <View key={i} style={{ width: cellWidth ?? '100%', minWidth: 0 }}>
          {child}
        </View>
      ))}
    </View>
  );
}
