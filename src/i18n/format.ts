/** Language-aware duration and date formatting. */
import type { Lang, Txt } from './LangContext';

export const pad = (n: number) => String(n).padStart(2, '0');

/** "about 7 min" / "약 7분" */
export function minutesText(s: number, lang: Lang): string {
  if (s < 90) return lang === 'ko' ? '1분 이내' : 'under 1 min';
  const m = Math.round(s / 60);
  return lang === 'ko' ? `약 ${m}분` : `about ${m} min`;
}
export const minutesTx = (s: number): Txt => ({ ko: minutesText(s, 'ko'), en: minutesText(s, 'en') });

/** "2 h 15 min" / "2시간 15분" */
export function hoursText(s: number, lang: Lang): string {
  const m = Math.round(s / 60);
  if (m >= 60) return lang === 'ko' ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${Math.floor(m / 60)} h ${m % 60} min`;
  return lang === 'ko' ? `${m}분` : `${m} min`;
}

/** "1 h 3 min ahead" / "1시간 3분 뒤" */
export function aheadText(s: number, lang: Lang): string {
  if (s <= 0) return lang === 'ko' ? '지금' : 'now';
  return lang === 'ko' ? `${hoursText(s, lang)} 뒤` : `in ${hoursText(s, lang)}`;
}

/** "3 min 20 s" / "3분 20초" */
export function secText(s: number, lang: Lang): string {
  const x = Math.max(0, Math.round(s));
  if (x >= 60) return lang === 'ko' ? `${Math.floor(x / 60)}분 ${x % 60}초` : `${Math.floor(x / 60)} min ${x % 60} s`;
  return lang === 'ko' ? `${x}초` : `${x} s`;
}

export const hm = (s: number) => {
  const m = Math.max(0, Math.round(s / 60));
  return Math.floor(m / 60) + ':' + pad(m % 60);
};

/** Big countdown parts. */
export function countdown(s: number, lang: Lang) {
  const x = Math.max(0, Math.round(s));
  const mu = lang === 'ko' ? '분' : 'min', su = lang === 'ko' ? '초' : 's';
  return x >= 600 ? { big: String(Math.round(x / 60)), unit: mu, sec: null as string | null, secUnit: su } : { big: String(Math.floor(x / 60)), unit: mu, sec: pad(x % 60), secUnit: su };
}

export const WEEKDAYS: Txt[] = [
  { ko: '일', en: 'Sun' }, { ko: '월', en: 'Mon' }, { ko: '화', en: 'Tue' }, { ko: '수', en: 'Wed' },
  { ko: '목', en: 'Thu' }, { ko: '금', en: 'Fri' }, { ko: '토', en: 'Sat' },
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "11월 12일" / "Nov 12" */
export const dateLabel = (d: Date, lang: Lang) => (lang === 'ko' ? `${d.getMonth() + 1}월 ${d.getDate()}일` : `${MONTHS[d.getMonth()]} ${d.getDate()}`);
export const monthLabel = (d: Date, lang: Lang) => (lang === 'ko' ? `${d.getMonth() + 1}월` : MONTHS[d.getMonth()]);
