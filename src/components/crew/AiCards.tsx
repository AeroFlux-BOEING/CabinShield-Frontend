import { useMemo } from 'react';
import { View } from 'react-native';

import { cabinState, features } from '../../ai/cabinState';
import { decide, MODEL_INFO, PLANS, SAFETY_BUFFER_S, selfCheck, VERDICT_LABEL } from '../../ai/cstModel';
import { secText } from '../../i18n/format';
import { useLang } from '../../i18n/LangContext';
import { useFlight } from '../../state/FlightContext';
import { useTheme } from '../../theme/ThemeProvider';
import { Card, CardHead, KV, Tag, type TagTone } from '../ui/Surfaces';
import { T } from '../ui/T';

/** Live recommendation from the on-device CST model + Safety Kernel. */
export function AiDecisionCard() {
  const { c } = useTheme();
  const { sim } = useFlight();
  const { lang, L, P } = useLang();
  const cab = cabinState(sim);
  const r = decide(features(cab), sim.qLow);
  const loose = cab.carts.filter((k) => k.unsecured).length;
  const hot = cab.carts.filter((k) => k.hot).length;
  const lav = cab.lavs.filter(Boolean).length;
  const galley = cab.galleyOpen.filter(Boolean).length;
  const rest = cab.resting.filter(Boolean).length;
  const chips: [string, string, boolean][] = [
    [L('서비스', 'Service'), cab.active && cab.serviceName ? L(`${cab.serviceName.ko} 진행 중`, cab.serviceName.en) : cab.serviceName ? L('중단됨', 'Stopped') : L('없음', 'None'), cab.active],
    [L('미고정 카트', 'Loose carts'), L(`${loose}대`, `${loose}`), loose > 0],
    [L('뜨거운 음료', 'Hot drinks'), L(`${hot}대`, `${hot} carts`), hot > 0],
    [L('화장실 사용', 'Lavs occupied'), `${lav}/6`, lav > 0],
    [L('갤리 열림', 'Galleys open'), `${galley}/3`, galley > 0],
    [L('휴식 승무원', 'Crew resting'), L(`${rest}명`, `${rest}`), rest > 0],
  ];
  const q = sim.qLow;
  const maxCst = Math.max(...r.cst);
  const scale = q == null ? maxCst + 20 : Math.max(maxCst + 20, Math.min(q, 240));
  const pct = (v: number) => `${Math.min(100, (v / scale) * 100)}%` as const;
  const tone = (v: string | null): TagTone => (v === 'ok' ? 'ok' : v === 'tight' ? 'p2' : v === 'no' ? 'p3' : 'mute');

  return (
    <Card>
      <CardHead title={L('온디바이스 AI 판단', 'On-device AI decision')} en={lang === 'ko' ? 'On-device AI' : undefined} right={<Tag tone="navy">{`${L('이 기기에서 계산', 'Computed on this device')} · ${r.ms < 0.01 ? '<0.01' : r.ms.toFixed(2)} ms`}</Tag>} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {chips.map(([k, v, warn]) => (
          <View key={k} style={{ flexBasis: '15%', flexGrow: 1, minWidth: 110, backgroundColor: warn ? c.p2Soft : c.soft, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 }}>
            <T size={12} color={c.ink2}>{k}</T>
            <T size={15} weight={600} color={warn ? c.p2 : c.ink}>{v}</T>
          </View>
        ))}
      </View>
      <View style={{ gap: 10 }}>
        {PLANS.map((p, j) => {
          const picked = j === r.pick;
          return (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, backgroundColor: picked ? c.navySoft : c.soft }}>
              <View style={{ width: 150, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <T size={15} weight={600} color={picked ? c.navy : c.ink}>{P(p.name)}</T>
                  {picked ? (
                    <View style={{ backgroundColor: c.navy, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>
                      <T size={11} weight={700} color="#FFFFFF">{L('AI 권고', 'AI pick')}</T>
                    </View>
                  ) : null}
                </View>
                <T size={11.5} color={c.ink2} lines={2}>{P(p.desc)}</T>
              </View>
              <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: c.fill, overflow: 'hidden' }}>
                <View style={{ width: pct(r.cst[j]), height: '100%', borderRadius: 5, backgroundColor: picked ? c.navy : c.ink3 }} />
                {q != null && q < scale ? <View style={{ position: 'absolute', left: pct(q), top: -2, bottom: -2, width: 2, backgroundColor: c.p3Dot }} /> : null}
              </View>
              <View style={{ width: 160, alignItems: 'flex-end', gap: 3 }}>
                <T size={15} weight={600} num>{L(`약 ${Math.round(r.cst[j])}초`, `~${Math.round(r.cst[j])} s`)}</T>
                {r.verdict[j] ? <Tag tone={tone(r.verdict[j])}>{`${P(VERDICT_LABEL[r.verdict[j]!])} · ${L('여유', 'margin')} ${r.csm![j] >= 0 ? secText(r.csm![j], lang) : L('없음', 'none')}`}</Tag> : <Tag tone="mute">{L('여유 충분', 'Plenty of time')}</Tag>}
              </View>
            </View>
          );
        })}
      </View>
      <T size={13} color={c.ink2} lh={1.55}>
        {q == null
          ? L('60분 안에 예보 구간이 없어 모든 정리 방식이 가능합니다. 막대는 지금 객실 상태에서 승무원 전원이 착석까지 걸리는 시간(보수값)입니다.', 'No forecast segment within 60 min, so every option works. Bars show how long it takes (conservatively) until all crew are seated, given the current cabin.')
          : sim.cur > 0
            ? L('난기류 구간 안입니다. 남은 시간이 없어 즉시 착석을 권고합니다.', 'Inside the turbulence segment. No time left, so sit down now.')
            : L(`준비 가능 시간(보수값) ${secText(q, lang)} · 안전 버퍼 ${SAFETY_BUFFER_S}초. 빨간 선 안쪽에 막대가 끝나면 그 방식으로 정리할 수 있어요. 체크리스트를 누르면 객실 상태가 바뀌고 AI가 바로 다시 계산합니다.`, `Time available (conservative) ${secText(q, lang)} · safety buffer ${SAFETY_BUFFER_S} s. If a bar ends before the red line, that option fits. Ticking the checklist updates the cabin state and the AI recalculates instantly.`)}
      </T>
    </Card>
  );
}

/** What runs on the tablet and what it needs from outside. */
export function AiModelCard() {
  const { c } = useTheme();
  const { L } = useLang();
  const err = useMemo(() => selfCheck(), []);
  return (
    <Card style={{ flex: 1 }}>
      <CardHead title={L('온디바이스 AI', 'On-device AI')} right={<Tag tone="ok">{L('오프라인 동작', 'Works offline')}</Tag>} />
      <KV
        rows={[
          [L('정리 시간 예측', 'Securing-time model'), MODEL_INFO.arch, L(`${MODEL_INFO.params.toLocaleString()}개 파라미터 · 약 ${MODEL_INFO.sizeKb} KB · 앱에 포함`, `${MODEL_INFO.params.toLocaleString()} parameters · ~${MODEL_INFO.sizeKb} KB · bundled in the app`)],
          [L('안전 판정', 'Safety check'), L('Safety Kernel (규칙)', 'Safety Kernel (rules)'), L('CSM = 준비 가능 시간 − (예측 + 보정 마진) − 버퍼', 'CSM = time available − (prediction + margin) − buffer')],
          [L('위치 추정', 'Position estimate'), L('비행계획 경로 + 최근 속도', 'Flight plan + recent speed'), L('AID 신호가 끊겨도 기기 안에서 계산', 'Computed on-device even if AID drops')],
          [L('포인트 · 서비스 계획', 'Points · service plan'), L('기기 안 계산', 'On-device'), L('지상 연결 없이도 계속 동작', 'Keeps working without a ground link')],
          [L('모델 자체 점검', 'Model self-check'), err < 0.01 ? L('정상', 'OK') : L('확인 필요', 'Check needed'), L(`학습 모델과 앱 결과 차이 ${err.toFixed(4)}초`, `Gap vs trained model ${err.toFixed(4)} s`)],
        ]}
      />
      <T size={12.5} color={c.ink2} lh={1.55}>{L('서버나 인터넷 없이 태블릿 안에서만 계산합니다. 위성 연결은 예보 업데이트와 기록 전송에만 쓰고, 끊겨도 판단은 계속됩니다.', 'Everything is computed on the tablet, with no server or internet. The satellite link is only used for forecast updates and sending logs; decisions continue if it drops.')}</T>
    </Card>
  );
}
