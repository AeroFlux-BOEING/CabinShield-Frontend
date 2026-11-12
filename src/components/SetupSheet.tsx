import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { daysText, normaliseFlightNo, SCHEDULE, type ScheduledFlight } from '../domain/schedule';
import { dateLabel, monthLabel, WEEKDAYS } from '../i18n/format';
import { tx, useLang, type Txt } from '../i18n/LangContext';
import { LangToggle } from './LangToggle';
import { pad } from '../state/FlightSim';
import { useFlight } from '../state/FlightContext';
import { useUi } from '../state/UiContext';
import { useTheme } from '../theme/ThemeProvider';
import { fontFamily } from '../theme/typography';
import { AeroFluxMark } from './AeroFluxMark';
import { T } from './ui/T';

const ITEM = 40;

type Lookup = { st: 'idle' } | { st: 'busy' } | { st: 'none'; no: string } | { st: 'found'; no: string; f: ScheduledFlight };

const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** iOS-style wheel column built on a snapping ScrollView. */
function Wheel({ count, label, value, onChange, format }: { count: number; label: string; value: number; onChange: (i: number) => void; format: (i: number) => string }) {
  const { c } = useTheme();
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [shown, setShown] = useState(value);
  const prog = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    prog.current = Date.now() + 700;
    setShown(value);
    ref.current?.scrollTo({ y: value * ITEM, animated: true });
  }, [value]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(0, Math.min(count - 1, Math.round(e.nativeEvent.contentOffset.y / ITEM)));
    if (Date.now() < prog.current) return;
    setShown(i);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(i), 140);
  };

  return (
    <ScrollView
      ref={ref}
      accessibilityLabel={label}
      style={{ width: 62, height: ITEM * 5 }}
      contentContainerStyle={{ paddingVertical: ITEM * 2 }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM}
      decelerationRate="fast"
      onScroll={onScroll}
      scrollEventThrottle={16}
      onLayout={() => ref.current?.scrollTo({ y: value * ITEM, animated: false })}
    >
      {Array.from({ length: count }, (_, i) => (
        <Pressable key={i} onPress={() => onChange(i)} style={{ height: ITEM, alignItems: 'center', justifyContent: 'center' }}>
          <T size={22} weight={i === shown ? 600 : 400} color={i === shown ? c.ink : c.ink3} num>{format(i)}</T>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function SetupSheet() {
  const { c } = useTheme();
  const { sim, refresh } = useFlight();
  const { setupOpen, closeSetup } = useUi();
  const router = useRouter();
  const { lang, L, P } = useLang();

  const days = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    return Array.from({ length: 14 }, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return d; });
  }, []);
  const [no, setNo] = useState(sim.flight?.no ?? '');
  const [date, setDate] = useState(ymd(days[0]));
  const [h, setH] = useState(20);
  const [m5, setM5] = useState(8);
  const [look, setLook] = useState<Lookup>({ st: 'idle' });
  const [note, setNote] = useState<Txt | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const v = no.trim();
    setErr('');
    if (!v) { setLook({ st: 'idle' }); return; }
    setLook({ st: 'busy' });
    const id = setTimeout(() => {
      const f = SCHEDULE[v];
      if (!f) return setLook({ st: 'none', no: v });
      setLook({ st: 'found', no: v, f });
      const [hh, mm] = f.dep.split(':').map(Number);
      setH(hh);
      setM5(Math.round(mm / 5));
      setNote(null);
      if (f.supported && !f.days.includes(fromYmd(date).getDay())) {
        const nd = days.find((d) => f.days.includes(d.getDay()));
        if (nd) {
          const d0 = fromYmd(date);
          setDate(ymd(nd));
          setNote(tx(`${d0.getMonth() + 1}월 ${d0.getDate()}일(${WEEKDAYS[d0.getDay()].ko})은 운항하지 않아 가장 가까운 운항일로 바꿨어요`, `No flight on ${WEEKDAYS[d0.getDay()].en}, ${dateLabel(d0, 'en')}, so we moved to the nearest operating day`));
        }
      }
    }, 400);
    return () => clearTimeout(id);
    // date intentionally excluded: only re-run the lookup when the flight number changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [no]);

  if (!setupOpen) return null;

  const F = look.st === 'found' ? look.f : null;
  const dObj = fromYmd(date);
  const dayOk = !F || F.days.includes(dObj.getDay());
  const canStart = !!F && F.supported && dayOk;
  const mins = h * 60 + m5 * 5;
  const utc = (((mins - 540) % 1440) + 1440) % 1440;
  const sched = F ? F.dep.split(':').map(Number) : null;
  const delay = sched ? mins - (sched[0] * 60 + sched[1]) : 0;

  let card: { tone: 'idle' | 'ok' | 'warn' | 'bad' | 'busy'; icon: string; title: string; sub: string };
  const wdS = WEEKDAYS[dObj.getDay()][lang];
  const icn = L('인천', 'Seoul');
  if (look.st === 'idle') card = { tone: 'idle', icon: '✈', title: L('편명을 입력하면 노선이 자동으로 채워집니다', 'Enter a flight number and the route fills in automatically'), sub: L('데모 편명을 눌러 바로 시작할 수 있어요', 'Tap a demo flight to start right away') };
  else if (look.st === 'busy') card = { tone: 'busy', icon: '↻', title: L('운항 스케줄에서 찾는 중…', 'Searching the schedule…'), sub: no };
  else if (look.st === 'none') card = { tone: 'bad', icon: '?', title: L(`${look.no} 편을 스케줄에서 찾을 수 없습니다`, `${look.no} is not in the schedule`), sub: L('편명을 다시 확인해 주세요 · 예: AFX017', 'Please check the flight number · e.g. AFX017') };
  else if (!look.f.supported) card = { tone: 'warn', icon: '!', title: `${look.no} · ${icn} → ${P(look.f.toName)}`, sub: L('이 노선은 데모에서 아직 준비 중입니다. AFX017, AFX011, AFX023으로 시작해 주세요.', 'This route is not ready in the demo yet. Please start with AFX017, AFX011 or AFX023.') };
  else if (!dayOk) card = { tone: 'warn', icon: '!', title: L(`${look.no}은 ${dateLabel(dObj, 'ko')}(${wdS})에 운항하지 않아요`, `${look.no} does not operate on ${wdS}, ${dateLabel(dObj, 'en')}`), sub: `${daysText(look.f.days, lang)} · ${L('흐리게 표시된 날짜는 운항하지 않는 날입니다', 'Dimmed dates have no flight')}` };
  else {
    const [a, b] = look.f.dep.split(':').map(Number);
    const arr = ((((a * 60 + b - 540 + look.f.dur) % 1440) + 1440) % 1440 - 480 + 1440) % 1440;
    card = { tone: 'ok', icon: '✓', title: `${look.no} · ${icn} ${look.f.dep} → ${P(look.f.toName)} ${pad(Math.floor(arr / 60))}:${pad(arr % 60)} ${L('(현지)', '(local)')}`, sub: note ? P(note) : `${look.f.aircraft} · ${daysText(look.f.days, lang)} · ${L('스케줄에서 찾았어요', 'found in schedule')}` };
  }
  const toneBg = { idle: c.soft, busy: c.soft, ok: c.okSoft, warn: c.p2Soft, bad: c.p3Soft }[card.tone];
  const toneDot = { idle: c.card, busy: c.card, ok: c.okDot, warn: c.p2Dot, bad: c.p3Dot }[card.tone];

  const start = () => {
    if (!canStart || !F) {
      setErr(!no ? L('편명을 입력해 주세요.', 'Please enter a flight number.') : !F ? L('스케줄에 있는 편명을 입력해 주세요.', 'Please enter a flight number from the schedule.') : !F.supported ? L('이 노선은 데모에서 아직 준비 중입니다.', 'This route is not ready in the demo yet.') : L('선택한 날짜에 운항하지 않는 편입니다.', 'This flight does not operate on the selected date.'));
      return;
    }
    sim.start({ no: no.trim(), date: dObj, depUtc: utc * 60 });
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.title = `${no.trim()} · CabinShield`;
    refresh();
    closeSetup();
    router.navigate('/overview');
  };

  const field = { backgroundColor: c.soft, borderRadius: 12 } as const;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.scrim, zIndex: 50 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <View accessibilityRole="none" style={{ width: '100%', maxWidth: 520, backgroundColor: c.card, borderRadius: 24, padding: 26, gap: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 40, shadowOffset: { width: 0, height: 20 } }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
              <AeroFluxMark width={30} />
            </View>
            <View style={{ flex: 1 }}>
              <T size={26} weight={700} tracking={-0.03}>{L('비행편 시작', 'Start a flight')}</T>
              <T size={14} color={c.ink2}>{L('운항할 비행편을 입력하면 승무원 화면이 준비됩니다.', 'Enter your flight and the crew screens get ready.')}</T>
            </View>
            <LangToggle />
          </View>

          <View style={{ gap: 6 }}>
            <T size={13} weight={600} color={c.ink2}>{L('편명', 'Flight number')}</T>
            <TextInput
              value={no}
              onChangeText={(t) => setNo(normaliseFlightNo(t))}
              placeholder={L('예: AFX017', 'e.g. AFX017')}
              placeholderTextColor={c.ink3}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              accessibilityLabel={L('편명', 'Flight number')}
              onSubmitEditing={start}
              style={{ ...field, fontFamily, fontSize: 22, fontWeight: '600', color: c.ink, paddingHorizontal: 14, paddingVertical: 12, letterSpacing: 0.4, borderWidth: 1.5, borderColor: err ? c.p3Dot : 'transparent' }}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, backgroundColor: toneBg, marginTop: -6 }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: toneDot, alignItems: 'center', justifyContent: 'center' }}>
              <T size={14} weight={700} color={card.tone === 'idle' || card.tone === 'busy' ? c.ink2 : '#FFFFFF'}>{card.icon}</T>
            </View>
            <View style={{ flex: 1 }}>
              <T size={14.5} weight={600}>{card.title}</T>
              <T size={12.5} color={c.ink2}>{card.sub}</T>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: -6 }}>
            {Object.entries(SCHEDULE).map(([k, v]) => (
              <Pressable key={k} onPress={() => setNo(k)} style={({ pressed }) => ({ flexDirection: 'row', gap: 5, alignItems: 'baseline', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: pressed ? c.navySoft : c.soft })}>
                <T size={12.5} weight={600}>{k}</T>
                <T size={11.5} color={c.ink2}>{`${v.from}→${v.to}`}</T>
              </Pressable>
            ))}
          </View>

          <View style={{ gap: 6 }}>
            <T size={13} weight={600} color={c.ink2}>{L('운항일', 'Date')}</T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
              {days.map((d, i) => {
                const v = ymd(d), on = v === date, off = !!F && !F.days.includes(d.getDay()), wd = d.getDay();
                return (
                  <Pressable
                    key={v}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${dateLabel(d, lang)} ${WEEKDAYS[wd][lang]}`}
                    onPress={() => { setDate(v); setNote(null); }}
                    style={{ width: 60, paddingTop: 9, paddingBottom: 8, borderRadius: 14, alignItems: 'center', backgroundColor: on ? c.navy : c.soft, opacity: off && !on ? 0.38 : 1 }}
                  >
                    <T size={11.5} weight={600} color={on ? 'rgba(255,255,255,0.82)' : wd === 0 ? c.p3 : wd === 6 ? c.navy : c.ink2}>{i === 0 ? L('오늘', 'Today') : i === 1 ? L('내일', 'Tmrw') : WEEKDAYS[wd][lang]}</T>
                    <T size={21} weight={600} tracking={-0.02} color={on ? '#FFFFFF' : c.ink} num>{String(d.getDate())}</T>
                    <T size={11} color={on ? 'rgba(255,255,255,0.82)' : c.ink3}>{monthLabel(d, lang)}</T>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={{ gap: 6 }}>
            <T size={13} weight={600} color={c.ink2}>{L('출발 시각 (한국)', 'Departure time (Korea)')}</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.soft, borderRadius: 18, paddingHorizontal: 10, height: ITEM * 5, overflow: 'hidden' }}>
                <View pointerEvents="none" style={{ position: 'absolute', left: 8, right: 8, top: ITEM * 2, height: ITEM, borderRadius: 11, backgroundColor: c.card }} />
                <Wheel count={24} label={L('시', 'Hour')} value={h} onChange={setH} format={(i) => pad(i)} />
                <T size={22} weight={600}>:</T>
                <Wheel count={12} label={L('분', 'Minute')} value={m5} onChange={setM5} format={(i) => pad(i * 5)} />
              </View>
              <View style={{ flex: 1, minWidth: 200, gap: 2 }}>
                <T size={44} weight={600} tracking={-0.04} num>{`${pad(h)}:${pad(m5 * 5)}`}</T>
                <T size={13} color={c.ink2}>
                  {L(`한국 시각 · ${dateLabel(dObj, 'ko')} (${wdS}) 출발`, `Korea time · departs ${wdS}, ${dateLabel(dObj, 'en')}`)}
                  {delay ? <T size={13} weight={600} color={c.p2}>{` · ${L('스케줄 대비', 'vs schedule')} ${delay > 0 ? '+' : ''}${delay}${L('분', ' min')}`}</T> : null}
                </T>
                <T size={13} color={c.ink2} num>{`UTC ${pad(Math.floor(utc / 60))}:${pad(utc % 60)}${mins < 540 ? L(' · UTC 기준 전날', ' · previous day in UTC') : ''}`}</T>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {['09:30', '13:05', '20:40', '23:55'].map((q) => (
                    <Pressable key={q} onPress={() => { const [a, b] = q.split(':').map(Number); setH(a); setM5(Math.round(b / 5)); }} style={({ pressed }) => ({ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: pressed ? c.navySoft : c.soft })}>
                      <T size={12.5} weight={500} num>{q}</T>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[
              [L('노선', 'Route'), F ? `${icn} ${F.from} → ${P(F.toName)} ${F.to}` : null, F ? L(`스케줄 ${F.dep} 출발 · 약 ${Math.floor(F.dur / 60)}시간 ${F.dur % 60}분`, `Scheduled ${F.dep} · about ${Math.floor(F.dur / 60)}h ${F.dur % 60}m`) : ''],
              [L('기종', 'Aircraft'), F ? F.aircraft : null, F ? P(F.aircraftNote) : ''],
            ].map(([k, v, s]) => (
              <View key={k as string} style={{ flex: 1, gap: 6 }}>
                <T size={13} weight={600} color={c.ink2}>{k}</T>
                <View style={{ ...field, minHeight: 50, paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'center' }}>
                  {v ? (
                    <>
                      <T size={15} weight={600}>{v}</T>
                      <T size={12} color={c.ink2}>{s}</T>
                    </>
                  ) : (
                    <T size={15} color={c.ink3}>{L('자동 입력', 'Auto-filled')}</T>
                  )}
                </View>
              </View>
            ))}
          </View>

          {err ? <T size={13.5} color={c.p3}>{err}</T> : null}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canStart }} onPress={start} style={({ pressed }) => ({ borderRadius: 14, paddingVertical: 15, alignItems: 'center', backgroundColor: canStart ? (pressed ? '#0A3FB5' : c.navy) : c.seat })}>
            <T size={17} weight={600} color="#FFFFFF">{L('시작하기', 'Start')}</T>
          </Pressable>
          {sim.flight ? (
            <Pressable onPress={closeSetup} style={{ alignItems: 'center' }}>
              <T size={14} weight={500} color={c.navy}>{L('취소하고 돌아가기', 'Cancel and go back')}</T>
            </Pressable>
          ) : null}
          <T size={12.5} color={c.ink3} align="center">{L('가상 운항 스케줄 기준입니다. 실제 서비스에서는 항공사 운항 시스템이나 항공기 비행계획에서 받아옵니다.', 'Based on a fictional schedule. In service, this comes from the airline operations system or the aircraft flight plan.')}</T>
        </View>
      </ScrollView>
    </View>
  );
}
