/**
 * Flight schedule used to auto-fill the route from a flight number.
 * - Real Seoul Incheon → San Francisco nonstops (published airline schedules, 2026; times can change by season).
 *   The cabin model is always the demo B787-9 (10 cabin crew), whatever the real aircraft type.
 * - Fictional AeroFlux (AFX) demo flights.
 */
import { tx, type Lang, type Txt } from '../i18n/LangContext';
import { WEEKDAYS } from '../i18n/format';

export interface ScheduledFlight {
  from: string;
  to: string;
  toName: Txt;
  /** scheduled departure, Korea time "HH:MM" */
  dep: string;
  /** block time, minutes */
  dur: number;
  aircraft: string;
  aircraftNote: Txt;
  /** operating weekdays, 0 = Sunday */
  days: number[];
  /** route available in this demo */
  supported: boolean;
  /** operating airline (real flights only) */
  airline?: Txt;
  /** a real, published flight (vs. a fictional AFX demo flight) */
  real?: boolean;
}

const DEMO_CABIN = tx('기내 모델: B787-9 · 승무원 10명 (데모)', 'Cabin model: B787-9 · 10 crew (demo)');
const SFO = tx('샌프란시스코', 'San Francisco');

export const SCHEDULE: Record<string, ScheduledFlight> = {
  // real ICN → SFO nonstops, in departure order (Korea time)
  UA806: { from: 'ICN', to: 'SFO', toName: SFO, dep: '11:30', dur: 640, aircraft: 'B787-9', aircraftNote: DEMO_CABIN, days: [0, 1, 2, 3, 4, 5, 6], supported: true, airline: tx('유나이티드항공', 'United Airlines'), real: true },
  KE023: { from: 'ICN', to: 'SFO', toName: SFO, dep: '16:00', dur: 640, aircraft: 'B787-10', aircraftNote: DEMO_CABIN, days: [0, 1, 2, 3, 4, 5, 6], supported: true, airline: tx('대한항공', 'Korean Air'), real: true },
  UA892: { from: 'ICN', to: 'SFO', toName: SFO, dep: '16:50', dur: 640, aircraft: 'B787-9', aircraftNote: DEMO_CABIN, days: [0, 1, 2, 3, 4, 5, 6], supported: true, airline: tx('유나이티드항공', 'United Airlines'), real: true },
  YP111: { from: 'ICN', to: 'SFO', toName: SFO, dep: '18:55', dur: 635, aircraft: 'B787-9', aircraftNote: DEMO_CABIN, days: [0, 1, 3, 5], supported: true, airline: tx('에어프레미아', 'Air Premia'), real: true },
  OZ212: { from: 'ICN', to: 'SFO', toName: SFO, dep: '20:50', dur: 610, aircraft: 'A350-900', aircraftNote: DEMO_CABIN, days: [0, 1, 2, 3, 4, 5, 6], supported: true, airline: tx('아시아나항공', 'Asiana Airlines'), real: true },
  // fictional AeroFlux demo flights
  AFX017: { from: 'ICN', to: 'SFO', toName: tx('샌프란시스코', 'San Francisco'), dep: '20:40', dur: 590, aircraft: 'B787-9', aircraftNote: tx('승무원 10명', '10 cabin crew'), days: [0, 1, 2, 3, 4, 5, 6], supported: true },
  AFX011: { from: 'ICN', to: 'SFO', toName: tx('샌프란시스코', 'San Francisco'), dep: '13:05', dur: 595, aircraft: 'B787-9', aircraftNote: tx('승무원 10명', '10 cabin crew'), days: [1, 3, 5], supported: true },
  AFX023: { from: 'ICN', to: 'SFO', toName: tx('샌프란시스코', 'San Francisco'), dep: '09:30', dur: 600, aircraft: 'B787-9', aircraftNote: tx('승무원 10명', '10 cabin crew'), days: [2, 4, 6], supported: true },
  AFX201: { from: 'ICN', to: 'LAX', toName: tx('로스앤젤레스', 'Los Angeles'), dep: '21:50', dur: 640, aircraft: 'B777-300ER', aircraftNote: tx('승무원 14명', '14 cabin crew'), days: [0, 1, 2, 3, 4, 5, 6], supported: false },
  AFX075: { from: 'ICN', to: 'JFK', toName: tx('뉴욕 JFK', 'New York JFK'), dep: '10:20', dur: 845, aircraft: 'B777-300ER', aircraftNote: tx('승무원 14명', '14 cabin crew'), days: [0, 2, 4, 6], supported: false },
};

export const daysText = (d: number[], lang: Lang) =>
  d.length === 7
    ? lang === 'ko' ? '매일 운항' : 'Daily'
    : WEEKDAYS.filter((_, i) => d.includes(i)).map((w) => w[lang]).join(lang === 'ko' ? '·' : ' · ') + (lang === 'ko' ? ' 운항' : '');

export const normaliseFlightNo = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

/** Ground API schedule row (src/api/types.ts ApiScheduledFlight) → app shape. */
export const fromApiFlight = (f: {
  origin: string; destination: string; destination_name: Txt; dep_local: string; block_min: number;
  aircraft: string; aircraft_note: Txt; days: number[]; supported: boolean; airline?: Txt | null; real?: boolean;
}): ScheduledFlight => ({
  from: f.origin, to: f.destination, toName: f.destination_name, dep: f.dep_local, dur: f.block_min,
  aircraft: f.aircraft, aircraftNote: f.aircraft_note, days: f.days, supported: f.supported,
  airline: f.airline ?? undefined, real: !!f.real,
});
