/** Crew-facing copy and reference data. Demo values only. */
import { ROUTE_NM } from './geo';

export interface PointStage {
  n: 1 | 2 | 3;
  /** seconds before entering the forecast segment */
  lead: number;
  name: string;
  tag: string;
  todo: string[];
  short: string[];
  sayLabel: string;
  say: string;
}

/** Turbulence Preparation Timeline: T-23 / T-13 / T-5 minutes. */
export const POINTS: PointStage[] = [
  {
    n: 1, lead: 1380, name: '사전 준비', tag: 'PREPARATION',
    todo: ['조종실로부터 난기류 예상 정보 수신', '예상 난기류 강도와 위치 확인', '객실승무원에게 사전 상황 공유', '담당 구역별 안전 점검 준비', '승무원 간 업무 분담과 대응 계획 확인'],
    short: ['조종실 정보 수신 · 강도와 위치 확인', '승무원 상황 공유', '업무 분담 · 점검 준비'],
    sayLabel: '승무원 공유 예시',
    say: '조종실 정보입니다. 진행 경로 앞쪽에 1포인트 구간이 있습니다. 담당 구역 점검을 준비하고, 서비스 마무리 순서를 확인해 주세요.',
  },
  {
    n: 2, lead: 780, name: '객실 정리', tag: 'CABIN SECURING',
    todo: ['기내 서비스 종료 준비, 진행 상황 확인', '서비스 카트와 갤리 장비 정리', '뜨거운 음료와 위험 물품 정리', '통로와 비상구 주변 장애물 확인', '승객 안전벨트 착용 안내 시작'],
    short: ['서비스 종료 준비', '카트 · 갤리 · 뜨거운 음료 정리', '통로 확인 · 벨트 안내 시작'],
    sayLabel: '안내방송 예시',
    say: '손님 여러분, 잠시 후 비행기가 흔들릴 수 있습니다. 자리에 계신 동안에는 좌석벨트를 매 주시고, 화장실 이용은 잠시 미뤄 주시기 바랍니다.',
  },
  {
    n: 3, lead: 300, name: '최종 안전 확보', tag: 'FINAL SAFETY CHECK',
    todo: ['기내 서비스 완전 중단', '서비스 카트와 갤리 장비 고정 완료', '승객 착석과 안전벨트 착용 확인', '담당 구역 최종 점검 (안전하게 가능한 경우)', '지정 좌석에 착석하고 안전벨트 체결', '조종실에 객실 준비 완료 보고'],
    short: ['서비스 완전 중단 · 장비 고정', '승객 착석 · 벨트 확인', '승무원 착석 · 조종실 보고'],
    sayLabel: '안내방송 예시',
    say: '좌석벨트 표시등이 켜졌습니다. 지금 바로 자리에 앉아 좌석벨트를 단단히 매 주십시오. 승무원도 착석합니다.',
  },
];

export const STAY = {
  todo: ['자리에서 벨트를 맨 채 기다리세요', '일어나거나 카트를 움직이지 마세요', '조종실 해제 안내를 기다리세요'],
  sayLabel: '안내방송 예시',
  say: '비행기가 심하게 흔들리고 있습니다. 좌석벨트를 단단히 매고 자리에 앉아 계십시오.',
};

export const AFTER = {
  todo: ['조종실 해제 안내를 확인하세요', '객실과 승객 상태를 살펴보세요', '안내가 나오면 서비스를 다시 시작하세요'],
  sayLabel: '안내방송 예시',
  say: '흔들림 구간을 지났습니다. 좌석벨트 표시등이 꺼질 때까지 자리에서 벨트를 매 주시기 바랍니다.',
};

export interface HistSegment {
  d0: number;
  d1: number;
  name: string;
  cases: number;
  band: [number, number];
  pattern: string;
  sev: string;
  season: string;
}

/** Past similar turbulence reports along the route (demo data). */
export const HISTORY: HistSegment[] = [
  { f0: 0.14, f1: 0.25, name: '일본 북부 · 쿠릴 열도 동쪽', cases: 18, band: [330, 370] as [number, number], pattern: '제트기류 · 청천난류(CAT) 보고', sev: '보통 위주 · 심함 3건', season: '11~2월에 집중' },
  { f0: 0.45, f1: 0.57, name: '알류샨 열도 남쪽', cases: 27, band: [340, 380] as [number, number], pattern: '저기압 전선 · 제트기류 남하', sev: '심함 6건', season: '연중, 겨울에 증가' },
  { f0: 0.63, f1: 0.69, name: '알래스카만 남서쪽', cases: 11, band: [350, 390] as [number, number], pattern: '청천난류(CAT) 보고', sev: '보통 위주', season: '겨울철' },
  { f0: 0.79, f1: 0.86, name: '미국 서해안 앞바다', cases: 9, band: [300, 360] as [number, number], pattern: '해안 제트 · 대류운', sev: '약함 위주', season: '봄·가을' },
].map(({ f0, f1, ...h }) => ({ ...h, d0: f0 * ROUTE_NM, d1: f1 * ROUTE_NM }));

/** [name, lat, lon(0–360), isCity] */
export const PLACES: [string, number, number, boolean][] = [
  ['인천', 37.46, 126.44, true], ['도쿄', 35.68, 139.69, true], ['삿포로', 43.06, 141.35, true], ['앵커리지', 61.22, 210.1, true],
  ['밴쿠버', 49.28, 236.88, true], ['샌프란시스코', 37.62, 237.62, true], ['호놀룰루', 21.3, 202.14, true],
  ['북태평양', 36, 178, false], ['베링해', 58.5, 180, false], ['알류샨 열도', 50.6, 184, false], ['캄차카', 56.5, 159.5, false],
  ['알래스카', 64, 208, false], ['오호츠크해', 54, 147, false], ['동해', 40, 134, false],
];

/** [code, name, lat, lon(0–360)] */
export const AIRPORTS: [string, string, number, number][] = [
  ['ICN', '인천', 37.46, 126.44], ['NRT', '도쿄 나리타', 35.77, 140.39], ['CTS', '삿포로 신치토세', 42.78, 141.69],
  ['PKC', '페트로파블롭스크', 53.17, 158.45], ['SYA', '셰미야', 52.71, 174.11], ['ADK', '에이닥', 51.88, 183.36],
  ['CDB', '콜드베이', 55.21, 197.29], ['ANC', '앵커리지', 61.17, 210.0], ['SEA', '시애틀', 47.45, 237.69],
  ['YVR', '밴쿠버', 49.19, 236.82], ['SFO', '샌프란시스코', 37.62, 237.62], ['HNL', '호놀룰루', 21.32, 202.08],
];

/** B787-9, 10 cabin crew: [position, role] */
export const CREW: [string, string][] = [
  ['L1', '사무장'], ['R1', ''], ['L2', ''], ['R2', ''], ['G2', '갤리'],
  ['L3', ''], ['R3', ''], ['L4', ''], ['R4', ''], ['G4', '갤리'],
];
export const REST_A = ['R1', 'L3', 'R4'];
export const REST_B = ['L2', 'R3', 'G4'];

export interface ServiceDef {
  id: string;
  name: string;
  /** preferred start, seconds after departure */
  pref: number;
  dur: number;
  simp?: number;
  optional?: boolean;
}

export const SERVICES: ServiceDef[] = [
  { id: 'm1', name: '1차 식사', pref: 25 * 60, dur: 95 * 60, simp: 70 * 60 },
  { id: 'sn', name: '중간 스낵', pref: 295 * 60, dur: 30 * 60, optional: true },
  { id: 'm2', name: '2차 식사', pref: 436 * 60, dur: 75 * 60, simp: 50 * 60 },
];
