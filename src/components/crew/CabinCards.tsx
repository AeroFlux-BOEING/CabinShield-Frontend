import { View } from 'react-native';

import { CREW, REST_A, REST_B } from '../../domain/content';
import { bufferBefore, MODE_LABEL } from '../../domain/planner';
import { useLang } from '../../i18n/LangContext';
import { useFlight } from '../../state/FlightContext';
import { useTheme } from '../../theme/ThemeProvider';
import { Card, CardHead, Tag } from '../ui/Surfaces';
import { T } from '../ui/T';
import { Table } from './PointsCards';

export function CrewCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { lang, L, P } = useLang();
  const g = sim.g, cur = sim.cur;
  const svcNow = sim.plan?.find((v) => v.start != null && v.end != null && sim.t >= v.start && sim.t < v.end);
  const h = sim.t / 3600;
  const rest = h >= 2.6 && h < 4.6 ? REST_A : h >= 5.6 && h < 7.0 ? REST_B : [];
  const belt = cur > 0 || g >= 2;
  const solar = ((((sim.depUtc + sim.t) / 3600 + sim.position.lon / 15) % 24) + 24) % 24;
  const night = solar < 6 || solar >= 18.5;
  return (
    <Card>
      <CardHead title={L('객실 · 승무원', 'Cabin · Crew')} right={<Tag tone={belt ? 'p2' : 'mute'}>{belt ? L('좌석벨트 표시등 켜짐', 'Seatbelt sign ON') : L('좌석벨트 표시등 꺼짐', 'Seatbelt sign OFF')}</Tag>} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {CREW.map(([pos, role]) => {
          let txt: string, dot: string = c.seat, bg = c.soft;
          if (cur > 0 || g >= 3) { txt = L('착석', 'Seated'); dot = c.okDot; bg = c.okSoft; }
          else if (g === 2) { txt = L('객실 정리', 'Securing'); dot = c.p2Dot; }
          else if (g === 1) { txt = L('준비', 'Preparing'); dot = c.p1Dot; }
          else if (rest.includes(pos)) txt = L('휴식 (벙크)', 'Resting (bunk)');
          else if (svcNow) { txt = lang === 'ko' ? svcNow.name.ko.replace(' 식사', '식') + ' 서비스' : svcNow.name.en; dot = c.navy; }
          else txt = L('대기', 'Standby');
          return (
            <View key={pos} style={{ flexBasis: '18%', flexGrow: 1, minWidth: 92, backgroundColor: bg, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, gap: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <T size={15} weight={600}>{pos}</T>
                {role ? <T size={11} weight={500} color={c.ink2}>{P(role)}</T> : null}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot }} />
                <T size={12} color={c.ink2} lines={1}>{txt}</T>
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {([
          [L('탑승 승객', 'Passengers'), '290', L('명', 'pax'), L('비즈니스 30 · 프리미엄 28 · 일반 232', 'Business 30 · Premium 28 · Economy 232')],
          [L('객실 고도', 'Cabin altitude'), '6,000', 'ft', L('787 가압 기준', '787 pressurisation')],
          [L('기내 온도', 'Cabin temp'), night ? '22' : '23', '°C', night ? L('조명 · 야간 모드 권장', 'Lighting · night mode') : L('조명 · 낮 모드', 'Lighting · day mode')],
        ] as const).map(([k, v, u, n]) => (
          <View key={k} style={{ flex: 1, gap: 1 }}>
            <T size={12.5} color={c.ink2}>{k}</T>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
              <T size={22} weight={600} tracking={-0.03} num>{v}</T>
              <T size={12} weight={500} color={c.ink2}>{u}</T>
            </View>
            <T size={12} color={c.ink2}>{n}</T>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function ServiceCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { L, P } = useLang();
  const next = sim.ex.find((e) => e.t0 > sim.t);
  const due = next ? `${L('카트 회수 기한', 'Carts stowed by')} ${sim.clock(next.t0 - bufferBefore(next, sim.t))}` : L('카트 회수 기한 없음', 'No cart deadline');
  const rows = (sim.plan ?? []).map((v) => {
    const done = v.end != null && sim.t >= v.end;
    const st =
      v.start == null ? <Tag key="s" tone={v.mode === 'skipped' ? 'mute' : 'p2'}>{v.mode === 'skipped' ? L('생략', 'Skipped') : L('결정 필요', 'Decision needed')}</Tag>
      : done ? <Tag key="s" tone="mute">{L('완료', 'Done')}</Tag>
      : sim.t >= v.start ? <Tag key="s" tone="ok">{L('진행 중', 'In progress')}</Tag>
      : <Tag key="s" tone="navy">{L('예정', 'Planned')}</Tag>;
    const shift = v.shift ? `${v.shift > 0 ? '+' : '−'}${Math.abs(Math.round(v.shift / 60))}${L('분', ' min')}` : '';
    const change = v.start == null ? L('구역과 겹쳐 배치 불가', 'Overlaps a segment') : !shift && v.mode === 'normal' ? '—' : [shift, v.mode === 'simplified' ? P(MODE_LABEL.simplified) : ''].filter(Boolean).join(' · ');
    return {
      key: v.id,
      dim: done,
      cells: [
        P(v.name),
        v.start == null || v.end == null ? '—' : `${sim.clock(v.start)}–${sim.clock(v.end)}`,
        v.start != null && v.end != null ? `${P(MODE_LABEL[v.mode])} · ${Math.round((v.end - v.start) / 60)}${L('분', ' min')}` : P(MODE_LABEL[v.mode]),
        change,
        st,
      ],
    };
  });
  return (
    <Card>
      <CardHead title={L('서비스 계획', 'Service plan')} right={<Tag tone="navy">{due}</Tag>} />
      <Table cols={[[L('서비스', 'Service'), 1.2], [L('시간 (UTC)', 'Time (UTC)'), 1.5], [L('방식', 'Mode'), 1.3], [L('변경', 'Change'), 1.4], [L('상태', 'Status'), 1]]} rows={rows} minWidth={560} />
      <T size={12.5} color={c.ink2}>{L('포인트 구역과 겹치지 않게 AI가 서비스 시간을 미리 조정합니다. 이미 시작한 서비스는 그대로 둡니다.', 'AI shifts services ahead of time so they do not overlap turbulence segments. Services already under way stay as they are.')}</T>
    </Card>
  );
}
