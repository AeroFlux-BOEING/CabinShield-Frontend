import { View } from 'react-native';

import { useLang } from '../../i18n/LangContext';
import { useFlight } from '../../state/FlightContext';
import { useTheme } from '../../theme/ThemeProvider';
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

function GroundStatus() {
  const { ground: g, sim } = useFlight();
  const { L, P } = useLang();
  if (!g.enabled) return null;
  const pending = g.queue.length;
  const synced = g.lastSyncT != null ? Math.max(0, Math.round(sim.t - g.lastSyncT)) : null;
  const audit = g.audit.total ? L(` · AI 판단 지상 검증 ${g.audit.agree}/${g.audit.total} 일치`, ` · ground AI check ${g.audit.agree}/${g.audit.total} agree`) : '';
  const fc = sim.forecastVersion ? L(`예보 v${sim.forecastVersion}`, `forecast v${sim.forecastVersion}`) : L('기본 예보', 'bundled forecast');
  if (g.state === 'online')
    return (
      <Status ok title={L('지상 서버 연결됨', 'Ground server connected')}
        text={`${g.flightId ?? L('비행편 시작 전', 'no flight yet')} · ${fc} · ${g.wsOpen ? L('실시간 수신 중', 'live stream on') : L('주기적 확인', 'polling')} · ${synced != null ? L(`${synced}초 전 동기화`, `synced ${synced}s ago`) : L('동기화 대기', 'not synced yet')}${pending ? L(` · 보낼 기록 ${pending}건`, ` · ${pending} queued`) : ''}${audit}`} />
    );
  return (
    <Status ok={false} title={g.state === 'connecting' ? L('지상 서버 연결 중…', 'Connecting to ground server…') : L('지상 서버 연결 안 됨', 'Ground server unreachable')}
      text={`${g.lastError ? P(g.lastError) + ' · ' : ''}${L(`태블릿 데이터로 계속 판단합니다 · 보낼 기록 ${pending}건`, `Continuing on tablet data · ${pending} records queued`)}`} />
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
      <GroundStatus />
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
