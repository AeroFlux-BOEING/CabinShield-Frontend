import { Pressable, View } from 'react-native';

import { ROUTE_NM, trackAt } from '../../domain/geo';
import { useLang } from '../../i18n/LangContext';
import { useFlight } from '../../state/FlightContext';
import { todoView } from '../../state/crewView';
import { useTheme } from '../../theme/ThemeProvider';
import { CardHead, Card, Tag, Tile } from '../ui/Surfaces';
import { T } from '../ui/T';

const DIRS = [['북', 'N'], ['북동', 'NE'], ['동', 'E'], ['남동', 'SE'], ['남', 'S'], ['남서', 'SW'], ['서', 'W'], ['북서', 'NW']] as const;
const dm = (v: number) => {
  const a = Math.abs(v);
  return `${Math.floor(a)}°${((a % 1) * 60).toFixed(1).padStart(4, '0')}'`;
};

/** Shows live flight data normally; switches to the point checklist when a point starts. */
export function InfoTodoCard() {
  const { c } = useTheme();
  const { sim, refresh } = useFlight();
  const { lang, L } = useLang();
  const todo = todoView(sim, lang);

  if (todo) {
    return (
      <Card style={{ flex: 1 }}>
        <CardHead title={todo.title} />
        <View style={{ backgroundColor: c.soft, borderRadius: 14, overflow: 'hidden' }}>
          {todo.items.map((t, i) => {
            const on = !!sim.done[i];
            return (
              <Pressable
                key={i}
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
  const dir = DIRS[Math.round(tr / 45) % 8];
  const rows: [string, string, string][] = [
    [L('위도', 'Latitude'), dm(p.lat), p.lat >= 0 ? 'N' : 'S'],
    [L('경도', 'Longitude'), p.lon <= 180 ? dm(p.lon) : dm(360 - p.lon), p.lon <= 180 ? 'E' : 'W'],
    [L('고도', 'Altitude'), (Math.round(fl) * 100).toLocaleString(), 'ft'],
    [L('속도', 'Ground speed'), String(Math.round(gs)), `kt · ${Math.round(gs * 1.852).toLocaleString()} km/h`],
    [L('진행 방향', 'Heading'), String(Math.round(tr) % 360).padStart(3, '0') + '°', lang === 'ko' ? dir[0] : dir[1]],
    [L('샌프란시스코까지', 'To San Francisco'), Math.round(ROUTE_NM - sim.estD).toLocaleString(), 'NM'],
  ];
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title={L('현재 비행 정보', 'Current flight data')} right={<Tag tone={sim.aid ? 'ok' : 'p2'}>{sim.aid ? L('위치 실시간', 'Live position') : L('예측 위치', 'Estimated position')}</Tag>} />
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {rows.map(([k, v, u]) => (
          <Tile key={k} label={k} value={v} unit={u} style={{ flexBasis: '46%', flexGrow: 1, minHeight: 84 }} />
        ))}
      </View>
      <T size={13} color={c.ink2}>{L('포인트 준비가 시작되면 이 자리에 지금 할 일이 나타납니다.', 'When a point starts, the to-do list appears here.')}</T>
    </Card>
  );
}
