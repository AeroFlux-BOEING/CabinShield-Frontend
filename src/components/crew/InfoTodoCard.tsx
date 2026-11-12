import { Pressable, View } from 'react-native';

import { ROUTE_NM, trackAt } from '../../domain/geo';
import { useFlight } from '../../state/FlightContext';
import { todoView } from '../../state/crewView';
import { useTheme } from '../../theme/ThemeProvider';
import { CardHead, Card, Tag, Tile } from '../ui/Surfaces';
import { T } from '../ui/T';

const DIRS = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
const dm = (v: number) => {
  const a = Math.abs(v);
  return `${Math.floor(a)}°${((a % 1) * 60).toFixed(1).padStart(4, '0')}'`;
};

/** Shows live flight data normally; switches to the point checklist when a point starts. */
export function InfoTodoCard() {
  const { c } = useTheme();
  const { sim, refresh } = useFlight();
  const todo = todoView(sim);

  if (todo) {
    return (
      <Card style={{ flex: 1 }}>
        <CardHead title={todo.title} />
        <View style={{ backgroundColor: c.soft, borderRadius: 14, overflow: 'hidden' }}>
          {todo.items.map((t, i) => {
            const on = !!sim.done[i];
            return (
              <Pressable
                key={t}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => { sim.toggleDone(i); refresh(); }}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, paddingHorizontal: 18, borderTopWidth: i ? 1 : 0, borderTopColor: c.line, backgroundColor: pressed ? c.fill : 'transparent' })}
              >
                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: on ? c.navy : c.seat, backgroundColor: on ? c.navy : c.card, alignItems: 'center', justifyContent: 'center' }}>
                  {on ? <T size={13} weight={700} color="#FFFFFF">✓</T> : null}
                </View>
                <T size={17} weight={500} color={on ? c.ink3 : c.ink} style={{ flex: 1 }}>{t}</T>
              </Pressable>
            );
          })}
        </View>
        <View style={{ backgroundColor: c.navySoft, borderRadius: 14, padding: 16, gap: 6 }}>
          <T size={13} weight={600} color={c.navy}>{todo.sayLabel}</T>
          <T size={16} lh={1.65}>{`“${todo.say}”`}</T>
        </View>
      </Card>
    );
  }

  const p = sim.position, fl = sim.flightLevel, tr = trackAt(sim.estD);
  const gs = sim.groundSpeedShown;
  const rows: [string, string, string][] = [
    ['위도', dm(p.lat), p.lat >= 0 ? 'N' : 'S'],
    ['경도', p.lon <= 180 ? dm(p.lon) : dm(360 - p.lon), p.lon <= 180 ? 'E' : 'W'],
    ['고도', (Math.round(fl) * 100).toLocaleString(), 'ft'],
    ['속도', String(Math.round(gs)), `kt · ${Math.round(gs * 1.852).toLocaleString()} km/h`],
    ['진행 방향', String(Math.round(tr) % 360).padStart(3, '0') + '°', DIRS[Math.round(tr / 45) % 8]],
    ['샌프란시스코까지', Math.round(ROUTE_NM - sim.estD).toLocaleString(), 'NM'],
  ];
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title="현재 비행 정보" right={<Tag tone={sim.aid ? 'ok' : 'p2'}>{sim.aid ? '위치 실시간' : '예측 위치'}</Tag>} />
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {rows.map(([k, v, u]) => (
          <Tile key={k} label={k} value={v} unit={u} style={{ flexBasis: '46%', flexGrow: 1, minHeight: 84 }} />
        ))}
      </View>
      <T size={13} color={c.ink2}>포인트 준비가 시작되면 이 자리에 지금 할 일이 나타납니다.</T>
    </Card>
  );
}
