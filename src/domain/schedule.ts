/** Fictional AeroFlux (AFX) flight schedule used to auto-fill the route from a flight number. */
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
}

export const SCHEDULE: Record<string, ScheduledFlight> = {
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
