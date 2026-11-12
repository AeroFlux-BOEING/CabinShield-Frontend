/** Apple-style crew tablet palette. Brand blue for actions; iOS system tints for point levels. */
export const lightPalette = {
  page: '#F5F5F7',
  sidebar: 'rgba(242,242,247,0.96)',
  card: '#FFFFFF',
  soft: '#F5F5F7',
  fill: '#EDEDF0',
  line: '#E5E5EA',
  seat: '#C7C7CC',
  ink: '#1D1D1F',
  ink2: '#6E6E73',
  ink3: '#AEAEB2',
  navy: '#0033A1',
  navySoft: '#EEF3FC',
  onNavy: '#FFFFFF',
  ok: '#1E7B3A',
  okSoft: '#EAF7EE',
  okDot: '#34C759',
  p1: '#8A6100',
  p1Soft: '#FFF7DF',
  p1Dot: '#FFB800',
  p2: '#B34D00',
  p2Soft: '#FFF0E3',
  p2Dot: '#FF9500',
  p3: '#C4241C',
  p3Soft: '#FFEDEC',
  p3Dot: '#FF3B30',
  ocean: '#DCE8F4',
  land: '#F9F8F5',
  coast: '#BFCAD6',
  grid: 'rgba(30,60,100,0.07)',
  sea: 'rgba(60,90,130,0.55)',
  shadow: 'rgba(0,0,0,0.06)',
  scrim: 'rgba(245,245,247,0.82)',
  toast: 'rgba(29,29,31,0.94)',
};

export type Palette = typeof lightPalette;

export const darkPalette: Palette = {
  page: '#000000',
  sidebar: 'rgba(28,28,30,0.96)',
  card: '#1C1C1E',
  soft: '#2C2C2E',
  fill: '#3A3A3C',
  line: '#38383A',
  seat: '#48484A',
  ink: '#F5F5F7',
  ink2: '#AEAEB2',
  ink3: '#6E6E73',
  navy: '#5B8CFF',
  navySoft: '#1A2645',
  onNavy: '#FFFFFF',
  ok: '#5CD07A',
  okSoft: '#16301E',
  okDot: '#30D158',
  p1: '#FFD45C',
  p1Soft: '#33290F',
  p1Dot: '#FFCC00',
  p2: '#FFAD5C',
  p2Soft: '#3A2410',
  p2Dot: '#FF9F0A',
  p3: '#FF7B72',
  p3Soft: '#3D1716',
  p3Dot: '#FF453A',
  ocean: '#0E1B2A',
  land: '#23262B',
  coast: '#3E4A58',
  grid: 'rgba(200,220,255,0.06)',
  sea: 'rgba(160,190,230,0.45)',
  shadow: 'rgba(0,0,0,0.4)',
  scrim: 'rgba(0,0,0,0.72)',
  toast: 'rgba(58,58,60,0.96)',
};

export const radius = { card: 20, inner: 14, pill: 999 } as const;

/** Point level 0–3 → [text, soft background, dot] keys */
export function levelColors(c: Palette, level: number) {
  if (level >= 3) return { fg: c.p3, bg: c.p3Soft, dot: c.p3Dot };
  if (level === 2) return { fg: c.p2, bg: c.p2Soft, dot: c.p2Dot };
  if (level === 1) return { fg: c.p1, bg: c.p1Soft, dot: c.p1Dot };
  return { fg: c.ok, bg: c.okSoft, dot: c.okDot };
}
