import { View } from 'react-native';

import { CREW, REST_A, REST_B } from '../../domain/content';
import { bufferBefore } from '../../domain/planner';
import { useFlight } from '../../state/FlightContext';
import { useTheme } from '../../theme/ThemeProvider';
import { Card, CardHead, Tag } from '../ui/Surfaces';
import { T } from '../ui/T';
import { Table } from './PointsCards';

export function CrewCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const g = sim.g, cur = sim.cur;
  const svcNow = sim.plan?.find((v) => v.start != null && v.end != null && sim.t >= v.start && sim.t < v.end);
  const T_ = sim.t / 3600;
  const rest = T_ >= 2.6 && T_ < 4.6 ? REST_A : T_ >= 5.6 && T_ < 7.0 ? REST_B : [];
  const belt = cur > 0 || g >= 2;
  const solar = ((((sim.depUtc + sim.t) / 3600 + sim.position.lon / 15) % 24) + 24) % 24;
  const night = solar < 6 || solar >= 18.5;
  return (
    <Card>
      <CardHead title="객실 · 승무원" right={<Tag tone={belt ? 'p2' : 'mute'}>{belt ? '좌석벨트 표시등 켜짐' : '좌석벨트 표시등 꺼짐'}</Tag>} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {CREW.map(([pos, role]) => {
          let txt: string, dot: string = c.seat, bg = c.soft;
          if (cur > 0 || g >= 3) { txt = '착석'; dot = c.okDot; bg = c.okSoft; }
          else if (g === 2) { txt = '객실 정리'; dot = c.p2Dot; }
          else if (g === 1) { txt = '준비'; dot = c.p1Dot; }
          else if (rest.includes(pos)) txt = '휴식 (벙크)';
          else if (svcNow) { txt = svcNow.name.replace(' 식사', '식') + ' 서비스'; dot = c.navy; }
          else txt = '대기';
          return (
            <View key={pos} style={{ flexBasis: '18%', flexGrow: 1, minWidth: 92, backgroundColor: bg, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, gap: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <T size={15} weight={600}>{pos}</T>
                {role ? <T size={11} weight={500} color={c.ink2}>{role}</T> : null}
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
          ['탑승 승객', '290', '명', '비즈니스 30 · 프리미엄 28 · 일반 232'],
          ['객실 고도', '6,000', 'ft', '787 가압 기준'],
          ['기내 온도', night ? '22' : '23', '°C', night ? '조명 · 야간 모드 권장' : '조명 · 낮 모드'],
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
  const next = sim.ex.find((e) => e.t0 > sim.t);
  const due = next ? '카트 회수 기한 ' + sim.clock(next.t0 - bufferBefore(next, sim.t)) : '카트 회수 기한 없음';
  const rows = (sim.plan ?? []).map((v) => {
    const done = v.end != null && sim.t >= v.end;
    const st =
      v.start == null ? <Tag key="s" tone={v.mode === '생략' ? 'mute' : 'p2'}>{v.mode === '생략' ? '생략' : '결정 필요'}</Tag>
      : done ? <Tag key="s" tone="mute">완료</Tag>
      : sim.t >= v.start ? <Tag key="s" tone="ok">진행 중</Tag>
      : <Tag key="s" tone="navy">예정</Tag>;
    const shift = v.shift ? `${v.shift > 0 ? '+' : '−'}${Math.abs(Math.round(v.shift / 60))}분` : '';
    const change = v.start == null ? '구역과 겹쳐 배치 불가' : !shift && v.mode === '정상' ? '—' : [shift, v.mode === '간소화' ? '간소화' : ''].filter(Boolean).join(' · ');
    return {
      key: v.id,
      dim: done,
      cells: [
        v.name,
        v.start == null || v.end == null ? '—' : `${sim.clock(v.start)}–${sim.clock(v.end)}`,
        v.start != null && v.end != null ? `${v.mode} · ${Math.round((v.end - v.start) / 60)}분` : v.mode,
        change,
        st,
      ],
    };
  });
  return (
    <Card>
      <CardHead title="서비스 계획" right={<Tag tone="navy">{due}</Tag>} />
      <Table cols={[['서비스', 1.2], ['시간 (UTC)', 1.5], ['방식', 1.3], ['변경', 1.4], ['상태', 1]]} rows={rows} minWidth={560} />
      <T size={12.5} color={c.ink2}>포인트 구역과 겹치지 않게 AI가 서비스 시간을 미리 조정합니다. 이미 시작한 서비스는 그대로 둡니다.</T>
    </Card>
  );
}
