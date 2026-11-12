import { ScrollView, View } from 'react-native';

import { POINTS } from '../../domain/content';
import { HAZARDS, STRENGTH } from '../../domain/flight';
import { aheadText, hm, minutesText } from '../../i18n/format';
import { useLang } from '../../i18n/LangContext';
import { useFlight } from '../../state/FlightContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useTheme } from '../../theme/ThemeProvider';
import { levelColors } from '../../theme/tokens';
import { Card, CardHead, Tag, type TagTone } from '../ui/Surfaces';
import { T } from '../ui/T';

export function PointCards() {
  const { c, scheme } = useTheme();
  const { sim } = useFlight();
  const { compact } = useResponsive();
  const { lang, L, P } = useLang();
  const tE = sim.tEntry, g = sim.g, cur = sim.cur;
  return (
    <View style={{ flexDirection: compact ? 'column' : 'row', gap: 16 }}>
      {POINTS.map((p) => {
        const on = g === p.n, here = (on && cur === 0) || (cur > 0 && p.n === 3), past = g > p.n;
        const col = levelColors(c, p.n);
        const when = tE != null && tE - p.lead > 0 ? (lang === 'ko' ? `${minutesText(tE - p.lead, lang)} 뒤` : `in ${minutesText(tE - p.lead, lang)}`) : on ? L('진행 중', 'Active') : past ? L('지남', 'Done') : '';
        return (
          <View
            key={p.n}
            style={{
              flex: 1, gap: 10, borderRadius: 20, padding: 20, backgroundColor: on ? col.bg : c.card, opacity: past ? 0.5 : 1,
              shadowColor: '#000', shadowOpacity: scheme === 'dark' ? 0 : 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <T size={22} weight={700} tracking={-0.03} color={on ? col.fg : c.ink}>{L(`${p.n}포인트`, `Point ${p.n}`)}</T>
              {here ? (
                <View style={{ backgroundColor: c.ink, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
                  <T size={12} weight={600} color={c.card}>{L('지금 여기', 'Now')}</T>
                </View>
              ) : null}
              <View style={{ flex: 1 }} />
              <T size={13} color={c.ink2}>{when}</T>
            </View>
            <T size={16} weight={600}>{`T-${Math.round(p.lead / 60)}${L('분', ' min')} · ${P(p.name)}`}</T>
            <View style={{ alignSelf: 'flex-start', backgroundColor: on ? c.card : col.bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
              <T size={11} weight={600} color={col.fg} tracking={0.06}>{p.tag}</T>
            </View>
            <T size={13} color={c.ink2}>{L(`난기류 구간 진입 ${Math.round(p.lead / 60)}분 전부터`, `From ${Math.round(p.lead / 60)} min before the segment`)}</T>
            <View style={{ gap: 6 }}>
              {p.short.map((s) => (
                <View key={s.en} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c.ink3, marginTop: 9 }} />
                  <T size={15} style={{ flex: 1 }}>{P(s)}</T>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Simple table: header + rows of cells with flex weights. */
export function Table({ cols, rows, minWidth = 640 }: { cols: [string, number][]; rows: { key: string; cells: React.ReactNode[]; dim?: boolean }[]; minWidth?: number }) {
  const { c } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, minWidth }}>
        <View style={{ flexDirection: 'row', paddingBottom: 8 }}>
          {cols.map(([h, f]) => (
            <View key={h} style={{ flex: f, paddingRight: 10 }}>
              <T size={12} weight={500} color={c.ink2}>{h}</T>
            </View>
          ))}
        </View>
        {rows.map((r) => (
          <View key={r.key} style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: c.line, paddingVertical: 11, opacity: r.dim ? 0.45 : 1 }}>
            {r.cells.map((cell, i) => (
              <View key={i} style={{ flex: cols[i][1], paddingRight: 10 }}>
                {typeof cell === 'string' ? <T size={14} num>{cell}</T> : cell}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function ZoneTable() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { lang, L, P } = useLang();
  const rows = HAZARDS.map((h) => {
    const e = sim.ex.find((z) => z.h === h);
    if (!e) return { key: h.name.en, dim: true, cells: [String(h.idx + 1), P(h.name), L('경로에서 벗어남', 'Off route'), '—', '—', '—', ''] };
    const past = e.t1 < sim.t, now = e.t0 <= sim.t && !past;
    const tone: TagTone = past ? 'mute' : (['ok', 'p1', 'p2', 'p3'] as const)[e.max];
    return {
      key: h.name.en,
      dim: past,
      cells: [
        String(h.idx + 1),
        <T key="n" size={14}>{P(h.name)}</T>,
        <Tag key="s" tone={tone}>{L(`강도 ${STRENGTH[e.max].ko}`, STRENGTH[e.max].en)}</Tag>,
        <T key="t" size={14} num>{`${sim.clock(e.t0)} `}<T size={12} color={c.ink2} num>{`T+${hm(e.t0)}`}</T></T>,
        L(`약 ${Math.max(1, Math.round((e.t1 - e.t0) / 60))}분`, `about ${Math.max(1, Math.round((e.t1 - e.t0) / 60))} min`),
        L(`동쪽 ${h.kt} kt`, `East ${h.kt} kt`),
        past ? <Tag key="st" tone="mute">{L('지남', 'Passed')}</Tag> : now ? <Tag key="st" tone="p3">{L('통과 중', 'In segment')}</Tag> : <Tag key="st" tone="navy">{aheadText(e.t0 - sim.t, lang)}</Tag>,
      ],
    };
  });
  return (
    <Card>
      <CardHead title={L('포인트 구역 일정', 'Segment schedule')} right={<T size={12.5} color={c.ink2}>{L('경로 위 모든 구역 · 구역은 바람을 타고 천천히 이동합니다', 'All segments on the route · they drift slowly with the wind')}</T>} />
      <Table cols={[[L('구역', '#'), 0.5], [L('위치', 'Location'), 3], [L('예상 강도', 'Intensity'), 1.4], [L('진입 예정', 'Entry'), 1.6], [L('머무는 시간', 'Duration'), 1.1], [L('이동', 'Drift'), 1], [L('상태', 'Status'), 1.4]]} rows={rows} minWidth={760} />
    </Card>
  );
}
