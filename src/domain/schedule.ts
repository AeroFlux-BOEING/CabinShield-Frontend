/** Fictional AeroFlux (AFX) flight schedule used to auto-fill the route from a flight number. */
export interface ScheduledFlight {
  from: string;
  to: string;
  toName: string;
  /** scheduled departure, Korea time "HH:MM" */
  dep: string;
  /** block time, minutes */
  dur: number;
  aircraft: string;
  aircraftNote: string;
  /** operating weekdays, 0 = Sunday */
  days: number[];
  /** route available in this demo */
  supported: boolean;
}

export const SCHEDULE: Record<string, ScheduledFlight> = {
  AFX017: { from: 'ICN', to: 'SFO', toName: '샌프란시스코', dep: '20:40', dur: 590, aircraft: 'B787-9', aircraftNote: '승무원 10명', days: [0, 1, 2, 3, 4, 5, 6], supported: true },
  AFX011: { from: 'ICN', to: 'SFO', toName: '샌프란시스코', dep: '13:05', dur: 595, aircraft: 'B787-9', aircraftNote: '승무원 10명', days: [1, 3, 5], supported: true },
  AFX023: { from: 'ICN', to: 'SFO', toName: '샌프란시스코', dep: '09:30', dur: 600, aircraft: 'B787-9', aircraftNote: '승무원 10명', days: [2, 4, 6], supported: true },
  AFX201: { from: 'ICN', to: 'LAX', toName: '로스앤젤레스', dep: '21:50', dur: 640, aircraft: 'B777-300ER', aircraftNote: '승무원 14명', days: [0, 1, 2, 3, 4, 5, 6], supported: false },
  AFX075: { from: 'ICN', to: 'JFK', toName: '뉴욕 JFK', dep: '10:20', dur: 845, aircraft: 'B777-300ER', aircraftNote: '승무원 14명', days: [0, 2, 4, 6], supported: false },
};

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const daysText = (d: number[]) =>
  d.length === 7 ? '매일 운항' : WEEKDAYS.filter((_, i) => d.includes(i)).join('·') + ' 운항';

export const normaliseFlightNo = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
