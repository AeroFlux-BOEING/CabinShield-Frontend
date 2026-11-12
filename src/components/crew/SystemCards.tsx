import { View } from 'react-native';

import { useLang } from '../../i18n/LangContext';
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
  const { L } = useLang();
  const gs = Math.max(sim.groundSpeedShown, 200), age = Math.round((sim.t - sim.lastUplink) / 60);
  const err = Math.max(1, Math.round((sim.sigma / gs) * 3600));
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title={L('정보 상태', 'Data status')} />
      {sim.aid ? (
        <Status ok title={L('비행기 위치 정상', 'Aircraft position OK')} text={L('항공기에서 위치를 1초마다 받고 있습니다.', 'Receiving position from the aircraft every second.')} />
      ) : (
        <Status ok={false} title={L('비행기 위치 신호 끊김 · 예측 중', 'Position signal lost · estimating')} text={L(`비행 계획과 최근 속도로 위치를 계산하고 있습니다. 남은 시간은 ±${err}초 정도 다를 수 있어요.`, `Estimating position from the flight plan and recent speed. Times may be off by about ±${err} s.`)} />
      )}
      {sim.sat ? (
        <Status ok title={L('지상 연결 정상', 'Ground link OK')} text={age < 1 ? L('흔들림 예보를 방금 받았습니다. 객실 상황도 지상에 전달되고 있어요.', 'Turbulence forecast just received. Cabin status is being sent to the ground.') : L(`흔들림 예보를 ${age}분 전에 받았습니다. 객실 상황도 지상에 전달되고 있어요.`, `Turbulence forecast received ${age} min ago. Cabin status is being sent to the ground.`)} />
      ) : (
        <Status ok={false} title={L('지상 연결 끊김', 'Ground link lost')} text={L(`흔들림 예보가 ${age}분 전 것입니다. 이 태블릿이 계속 판단하고, 연결되면 기록을 한꺼번에 보냅니다.`, `Forecast is ${age} min old. The tablet keeps deciding on its own and sends the log once reconnected.`)} />
      )}
    </Card>
  );
}

export function LogCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { L, P } = useLang();
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title={L('알림 기록', 'Alert log')} />
      <View>
        {sim.log.map((l, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <T size={14} color={c.ink2} num style={{ width: 46 }}>{sim.clock(l.t)}</T>
            <T size={14} style={{ flex: 1 }}>{P(l.msg)}</T>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function DemoCard() {
  const { c } = useTheme();
  const { sim, refresh } = useFlight();
  const { L } = useLang();
  const act = (f: () => void) => () => { f(); refresh(); };
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title={L('발표용 데모 조작', 'Demo controls')} />
      <T size={13} color={c.ink2}>{L('실제 승무원 화면에는 없는 버튼입니다.', 'These controls are not part of the real crew app.')}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <PillButton onPress={act(() => sim.toggleRun())}>{sim.arrived ? L('도착', 'Arrived') : sim.running ? L('일시정지', 'Pause') : L('재생', 'Play')}</PillButton>
        <PillButton onPress={act(() => sim.jumpToNext())}>{L('다음 구역 30분 전으로', 'Jump to 30 min before next segment')}</PillButton>
        <PillButton onPress={act(() => sim.restart())}>{L('처음부터', 'Restart')}</PillButton>
      </View>
      <Segmented label={L('빨리 감기', 'Speed')} value={sim.speed} onChange={(v) => { sim.setSpeed(v); refresh(); }} options={[{ value: 10, label: '10×' }, { value: 60, label: '60×' }, { value: 300, label: '300×' }]} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <PillButton tone="warn" active={!sim.aid} onPress={act(() => sim.toggleAid())}>{sim.aid ? L('비행기 위치 신호 끊기', 'Cut position signal') : L('위치 신호 복구', 'Restore position signal')}</PillButton>
        <PillButton tone="warn" active={!sim.sat} onPress={act(() => sim.toggleSat())}>{sim.sat ? L('지상 연결 끊기', 'Cut ground link') : L('지상 연결 복구', 'Restore ground link')}</PillButton>
      </View>
      <T size={13} color={c.ink2}>{L(`지금 ${sim.effectiveSpeed}배 속도`, `Running at ${sim.effectiveSpeed}×`) + (sim.effectiveSpeed < sim.speed ? L(' (1포인트 준비 직전부터 자동으로 느리게)', ' (slowed automatically near Point 1)') : '')}</T>
    </Card>
  );
}
