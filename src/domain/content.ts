/** Crew-facing copy and reference data, in Korean and English. Demo values only. */
import { tx, type Txt } from '../i18n/LangContext';
import { ROUTE_NM } from './geo';

export interface PointStage {
  n: 1 | 2 | 3;
  /** seconds before entering the forecast segment */
  lead: number;
  name: Txt;
  tag: string;
  todo: Txt[];
  short: Txt[];
  sayLabel: Txt;
  say: Txt;
}

const CREW_SHARE = tx('승무원 공유 예시', 'Crew briefing example');
const PA = tx('안내방송 예시', 'PA announcement example');

/** Turbulence Preparation Timeline: T-23 / T-13 / T-5 minutes. */
export const POINTS: PointStage[] = [
  {
    n: 1, lead: 1380, name: tx('사전 준비', 'Preparation'), tag: 'PREPARATION',
    todo: [
      tx('조종실로부터 난기류 예상 정보 수신', 'Receive the turbulence forecast from the flight deck'),
      tx('예상 난기류 강도와 위치 확인', 'Check the expected intensity and location'),
      tx('객실승무원에게 사전 상황 공유', 'Brief the cabin crew'),
      tx('담당 구역별 안전 점검 준비', 'Prepare safety checks for each zone'),
      tx('승무원 간 업무 분담과 대응 계획 확인', 'Confirm task split and response plan'),
    ],
    short: [tx('조종실 정보 수신 · 강도와 위치 확인', 'Flight deck info · intensity and location'), tx('승무원 상황 공유', 'Brief the crew'), tx('업무 분담 · 점검 준비', 'Split tasks · prepare checks')],
    sayLabel: CREW_SHARE,
    say: tx('조종실 정보입니다. 진행 경로 앞쪽에 1포인트 구간이 있습니다. 담당 구역 점검을 준비하고, 서비스 마무리 순서를 확인해 주세요.', 'Flight deck update: Point 1 segment ahead on our route. Prepare your zone checks and confirm how we wrap up the service.'),
  },
  {
    n: 2, lead: 780, name: tx('객실 정리', 'Cabin securing'), tag: 'CABIN SECURING',
    todo: [
      tx('기내 서비스 종료 준비, 진행 상황 확인', 'Prepare to end the service and check progress'),
      tx('서비스 카트와 갤리 장비 정리', 'Stow service carts and galley equipment'),
      tx('뜨거운 음료와 위험 물품 정리', 'Clear hot drinks and loose items'),
      tx('통로와 비상구 주변 장애물 확인', 'Check aisles and exits for obstructions'),
      tx('승객 안전벨트 착용 안내 시작', 'Start seatbelt announcements to passengers'),
    ],
    short: [tx('서비스 종료 준비', 'Prepare to end service'), tx('카트 · 갤리 · 뜨거운 음료 정리', 'Carts · galley · hot drinks'), tx('통로 확인 · 벨트 안내 시작', 'Check aisles · seatbelt PA')],
    sayLabel: PA,
    say: tx('손님 여러분, 잠시 후 비행기가 흔들릴 수 있습니다. 자리에 계신 동안에는 좌석벨트를 매 주시고, 화장실 이용은 잠시 미뤄 주시기 바랍니다.', 'Ladies and gentlemen, we may experience some turbulence shortly. Please keep your seatbelt fastened while seated and hold off on using the lavatories for now.'),
  },
  {
    n: 3, lead: 300, name: tx('최종 안전 확보', 'Final safety check'), tag: 'FINAL SAFETY CHECK',
    todo: [
      tx('기내 서비스 완전 중단', 'Stop the service completely'),
      tx('서비스 카트와 갤리 장비 고정 완료', 'Secure carts and galley equipment'),
      tx('승객 착석과 안전벨트 착용 확인', 'Confirm passengers are seated and belted'),
      tx('담당 구역 최종 점검 (안전하게 가능한 경우)', 'Final zone check (only if safe)'),
      tx('지정 좌석에 착석하고 안전벨트 체결', 'Take your jump seat and fasten your belt'),
      tx('조종실에 객실 준비 완료 보고', 'Report cabin secure to the flight deck'),
    ],
    short: [tx('서비스 완전 중단 · 장비 고정', 'Stop service · secure equipment'), tx('승객 착석 · 벨트 확인', 'Passengers seated · belts'), tx('승무원 착석 · 조종실 보고', 'Crew seated · report')],
    sayLabel: PA,
    say: tx('좌석벨트 표시등이 켜졌습니다. 지금 바로 자리에 앉아 좌석벨트를 단단히 매 주십시오. 승무원도 착석합니다.', 'The seatbelt sign is on. Please return to your seat now and fasten your seatbelt securely. Cabin crew, please be seated.'),
  },
];

export const STAY = {
  todo: [tx('자리에서 벨트를 맨 채 기다리세요', 'Stay seated with your belt fastened'), tx('일어나거나 카트를 움직이지 마세요', 'Do not get up or move carts'), tx('조종실 해제 안내를 기다리세요', 'Wait for the flight deck all-clear')],
  sayLabel: PA,
  say: tx('비행기가 심하게 흔들리고 있습니다. 좌석벨트를 단단히 매고 자리에 앉아 계십시오.', 'We are experiencing strong turbulence. Please remain seated with your seatbelt securely fastened.'),
};

export const AFTER = {
  todo: [tx('조종실 해제 안내를 확인하세요', 'Confirm the flight deck all-clear'), tx('객실과 승객 상태를 살펴보세요', 'Check the cabin and passengers'), tx('안내가 나오면 서비스를 다시 시작하세요', 'Resume service once cleared')],
  sayLabel: PA,
  say: tx('흔들림 구간을 지났습니다. 좌석벨트 표시등이 꺼질 때까지 자리에서 벨트를 매 주시기 바랍니다.', 'We have passed the area of turbulence. Please keep your seatbelt fastened until the sign is turned off.'),
};

export interface HistSegment {
  d0: number;
  d1: number;
  name: Txt;
  cases: number;
  band: [number, number];
  pattern: Txt;
  sev: Txt;
  season: Txt;
}

/** Past similar turbulence reports along the route (demo data). */
export const HISTORY: HistSegment[] = [
  { f0: 0.14, f1: 0.25, name: tx('일본 북부 · 쿠릴 열도 동쪽', 'Northern Japan · east of the Kurils'), cases: 18, band: [330, 370] as [number, number], pattern: tx('제트기류 · 청천난류(CAT) 보고', 'Jet stream · clear-air turbulence (CAT)'), sev: tx('보통 위주 · 심함 3건', 'Mostly moderate · 3 severe'), season: tx('11~2월에 집중', 'Mostly Nov–Feb') },
  { f0: 0.45, f1: 0.57, name: tx('알류샨 열도 남쪽', 'South of the Aleutians'), cases: 27, band: [340, 380] as [number, number], pattern: tx('저기압 전선 · 제트기류 남하', 'Frontal lows · jet stream dips'), sev: tx('심함 6건', '6 severe'), season: tx('연중, 겨울에 증가', 'Year-round, more in winter') },
  { f0: 0.63, f1: 0.69, name: tx('알래스카만 남서쪽', 'Southwest Gulf of Alaska'), cases: 11, band: [350, 390] as [number, number], pattern: tx('청천난류(CAT) 보고', 'Clear-air turbulence (CAT)'), sev: tx('보통 위주', 'Mostly moderate'), season: tx('겨울철', 'Winter') },
  { f0: 0.79, f1: 0.86, name: tx('미국 서해안 앞바다', 'Off the US West Coast'), cases: 9, band: [300, 360] as [number, number], pattern: tx('해안 제트 · 대류운', 'Coastal jet · convection'), sev: tx('약함 위주', 'Mostly light'), season: tx('봄·가을', 'Spring and autumn') },
].map(({ f0, f1, ...h }) => ({ ...h, d0: f0 * ROUTE_NM, d1: f1 * ROUTE_NM }));

/** [name, lat, lon(0–360), isCity] */
export const PLACES: [Txt, number, number, boolean][] = [
  [tx('인천', 'Incheon'), 37.46, 126.44, true], [tx('도쿄', 'Tokyo'), 35.68, 139.69, true], [tx('삿포로', 'Sapporo'), 43.06, 141.35, true],
  [tx('앵커리지', 'Anchorage'), 61.22, 210.1, true], [tx('밴쿠버', 'Vancouver'), 49.28, 236.88, true], [tx('샌프란시스코', 'San Francisco'), 37.62, 237.62, true],
  [tx('호놀룰루', 'Honolulu'), 21.3, 202.14, true],
  [tx('북태평양', 'North Pacific'), 36, 178, false], [tx('베링해', 'Bering Sea'), 58.5, 180, false], [tx('알류샨 열도', 'Aleutians'), 50.6, 184, false],
  [tx('캄차카', 'Kamchatka'), 56.5, 159.5, false], [tx('알래스카', 'Alaska'), 64, 208, false], [tx('오호츠크해', 'Sea of Okhotsk'), 54, 147, false], [tx('동해', 'East Sea'), 40, 134, false],
];

/** [code, name, lat, lon(0–360)] */
export const AIRPORTS: [string, Txt, number, number][] = [
  ['ICN', tx('인천', 'Incheon'), 37.46, 126.44], ['NRT', tx('도쿄 나리타', 'Tokyo Narita'), 35.77, 140.39], ['CTS', tx('삿포로 신치토세', 'Sapporo New Chitose'), 42.78, 141.69],
  ['PKC', tx('페트로파블롭스크', 'Petropavlovsk'), 53.17, 158.45], ['SYA', tx('셰미야', 'Shemya'), 52.71, 174.11], ['ADK', tx('에이닥', 'Adak'), 51.88, 183.36],
  ['CDB', tx('콜드베이', 'Cold Bay'), 55.21, 197.29], ['ANC', tx('앵커리지', 'Anchorage'), 61.17, 210.0], ['SEA', tx('시애틀', 'Seattle'), 47.45, 237.69],
  ['YVR', tx('밴쿠버', 'Vancouver'), 49.19, 236.82], ['SFO', tx('샌프란시스코', 'San Francisco'), 37.62, 237.62], ['HNL', tx('호놀룰루', 'Honolulu'), 21.32, 202.08],
];

/** B787-9, 10 cabin crew: [position, role] */
export const CREW: [string, Txt | null][] = [
  ['L1', tx('사무장', 'Purser')], ['R1', null], ['L2', null], ['R2', null], ['G2', tx('갤리', 'Galley')],
  ['L3', null], ['R3', null], ['L4', null], ['R4', null], ['G4', tx('갤리', 'Galley')],
];
export const REST_A = ['R1', 'L3', 'R4'];
export const REST_B = ['L2', 'R3', 'G4'];

export interface ServiceDef {
  id: string;
  name: Txt;
  /** preferred start, seconds after departure */
  pref: number;
  dur: number;
  simp?: number;
  optional?: boolean;
}

export const SERVICES: ServiceDef[] = [
  { id: 'm1', name: tx('1차 식사', 'First meal'), pref: 25 * 60, dur: 95 * 60, simp: 70 * 60 },
  { id: 'sn', name: tx('중간 스낵', 'Mid-flight snack'), pref: 295 * 60, dur: 30 * 60, optional: true },
  { id: 'm2', name: tx('2차 식사', 'Second meal'), pref: 436 * 60, dur: 75 * 60, simp: 50 * 60 },
];
