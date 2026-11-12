import { View } from 'react-native';

import { useFlight } from '../../state/FlightContext';
import { useTheme } from '../../theme/ThemeProvider';
import { PillButton, Segmented } from '../ui/Controls';
import { Card, CardHead } from '../ui/Surfaces';
import { T } from '../ui/T';

function Status({ ok, title, text }: { ok: boolean; title: string; text: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 7, backgroundColor: ok ? c.okDot : c.p2Dot }} />
      <View style={{ flex: 1, gap: 2 }}>
        <T size={15} weight={600}>{title}</T>
        <T size={13} color={c.ink2} lh={1.55}>{text}</T>
      </View>
    </View>
  );
}

export function StatusCard() {
  const { sim } = useFlight();
  const gs = Math.max(sim.groundSpeedShown, 200), age = Math.round((sim.t - sim.lastUplink) / 60);
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title="정보 상태" />
      {sim.aid ? (
        <Status ok title="비행기 위치 정상" text="항공기에서 위치를 1초마다 받고 있습니다." />
      ) : (
        <Status ok={false} title="비행기 위치 신호 끊김 · 예측 중" text={`비행 계획과 최근 속도로 위치를 계산하고 있습니다. 남은 시간은 ±${Math.max(1, Math.round((sim.sigma / gs) * 3600))}초 정도 다를 수 있어요.`} />
      )}
      {sim.sat ? (
        <Status ok title="지상 연결 정상" text={`흔들림 예보를 ${age < 1 ? '방금' : age + '분 전에'} 받았습니다. 객실 상황도 지상에 전달되고 있어요.`} />
      ) : (
        <Status ok={false} title="지상 연결 끊김" text={`흔들림 예보가 ${age}분 전 것입니다. 이 태블릿이 계속 판단하고, 연결되면 기록을 한꺼번에 보냅니다.`} />
      )}
    </Card>
  );
}

export function LogCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title="알림 기록" />
      <View>
        {sim.log.map((l, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <T size={14} color={c.ink2} num style={{ width: 46 }}>{sim.clock(l.t)}</T>
            <T size={14} style={{ flex: 1 }}>{l.msg}</T>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function DemoCard() {
  const { c } = useTheme();
  const { sim, refresh } = useFlight();
  const act = (f: () => void) => () => { f(); refresh(); };
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title="발표용 데모 조작" />
      <T size={13} color={c.ink2}>실제 승무원 화면에는 없는 버튼입니다.</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <PillButton onPress={act(() => sim.toggleRun())}>{sim.arrived ? '도착' : sim.running ? '일시정지' : '재생'}</PillButton>
        <PillButton onPress={act(() => sim.jumpToNext())}>다음 구역 30분 전으로</PillButton>
        <PillButton onPress={act(() => sim.restart())}>처음부터</PillButton>
      </View>
      <Segmented label="빨리 감기" value={sim.speed} onChange={(v) => { sim.setSpeed(v); refresh(); }} options={[{ value: 10, label: '10배' }, { value: 60, label: '60배' }, { value: 300, label: '300배' }]} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <PillButton tone="warn" active={!sim.aid} onPress={act(() => sim.toggleAid())}>{sim.aid ? '비행기 위치 신호 끊기' : '위치 신호 복구'}</PillButton>
        <PillButton tone="warn" active={!sim.sat} onPress={act(() => sim.toggleSat())}>{sim.sat ? '지상 연결 끊기' : '지상 연결 복구'}</PillButton>
      </View>
      <T size={13} color={c.ink2}>{`지금 ${sim.effectiveSpeed}배 속도${sim.effectiveSpeed < sim.speed ? ' (1포인트 준비 직전부터 자동으로 느리게)' : ''}`}</T>
    </Card>
  );
}
