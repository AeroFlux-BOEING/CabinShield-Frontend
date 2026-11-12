/** Turns the simulation state into crew-facing banner and to-do content. */
import { AFTER, POINTS, STAY } from '../domain/content';
import { minutesText } from '../i18n/format';
import type { Lang } from '../i18n/LangContext';
import type { FlightSim } from './FlightSim';

export interface BannerView {
  level: number; // 0 normal, 1–3 points, 4 inside segment
  chip: string;
  head: string;
  sub: string;
  countLabel: string;
  countSec: number | null;
  sideTitle: string;
  sideSub: string;
}

export function bannerView(sim: FlightSim, lang: Lang): BannerView {
  const ko = lang === 'ko';
  const { g, cur, look: L } = sim, tE = sim.tEntry, after = sim.after;
  const pt = (n: number) => (ko ? `${n}포인트` : `Point ${n}`);
  if (cur > 0 && L)
    return {
      level: 4, chip: ko ? '3포인트 · 구간 통과 중' : 'Point 3 · in segment', head: ko ? '3포인트 · 착석 유지' : 'Point 3 · stay seated',
      sub: ko ? `${minutesText(L.exit, lang)} 뒤 해제 예정 · 자리에서 벨트를 맨 채 기다리세요` : `Clear in ${minutesText(L.exit, lang)} · stay seated with your belt fastened`,
      countLabel: ko ? '해제까지' : 'Until clear', countSec: L.exit, sideTitle: pt(3), sideSub: ko ? '구간 통과 중' : 'In segment',
    };
  if (after)
    return { level: 0, chip: ko ? '해제' : 'Cleared', head: ko ? '포인트가 해제되었습니다' : 'Points cleared', sub: ko ? '조종실 안내가 나오면 서비스를 다시 시작하세요' : 'Resume service once the flight deck clears it', countLabel: ko ? '다음 포인트' : 'Next point', countSec: null, sideTitle: ko ? '해제' : 'Cleared', sideSub: ko ? '해제됨' : 'Cleared' };
  if (g > 0 && tE != null) {
    const P = POINTS[g - 1], name = P.name[lang];
    const head = ko ? `${g}포인트 · ${name} 단계입니다` : `Point ${g} · ${name}`;
    if (g < 3) {
      const tn = tE - POINTS[g].lead;
      return { level: g, chip: `${pt(g)} · ${P.tag}`, head, sub: ko ? `${g + 1}포인트까지 ${minutesText(tn, lang)} · 아래 할 일을 확인하세요` : `Point ${g + 1} in ${minutesText(tn, lang)} · check the tasks below`, countLabel: ko ? `${g + 1}포인트까지` : `To Point ${g + 1}`, countSec: tn, sideTitle: pt(g), sideSub: ko ? '준비 단계' : 'Preparing' };
    }
    return { level: 3, chip: `${pt(3)} · ${P.tag}`, head, sub: ko ? '착석을 마치고 조종실에 보고하세요' : 'Be seated and report to the flight deck', countLabel: ko ? '착석 완료까지' : 'Be seated within', countSec: tE, sideTitle: pt(3), sideSub: ko ? '준비 단계' : 'Preparing' };
  }
  return { level: 0, chip: ko ? '평상' : 'Normal', head: ko ? '평상 운항 중입니다' : 'Normal operations', sub: ko ? '평소대로 서비스하세요' : 'Continue service as usual', countLabel: ko ? '다음 포인트' : 'Next point', countSec: null, sideTitle: ko ? '평상' : 'Normal', sideSub: ko ? '평상 운항 중' : 'Normal operations' };
}

export interface TodoView {
  title: string;
  items: string[];
  sayLabel: string;
  say: string;
}

export function todoView(sim: FlightSim, lang: Lang): TodoView | null {
  const ko = lang === 'ko';
  const pick = (b: { todo: { ko: string; en: string }[]; sayLabel: { ko: string; en: string }; say: { ko: string; en: string } }, title: string): TodoView => ({
    title, items: b.todo.map((t) => t[lang]), sayLabel: b.sayLabel[lang], say: b.say[lang],
  });
  if (sim.cur > 0) return pick(STAY, ko ? '지금 할 일 · 착석 유지' : 'To do now · stay seated');
  if (sim.g > 0) {
    const P = POINTS[sim.g - 1];
    return pick(P, ko ? `지금 할 일 · ${sim.g}포인트 ${P.name.ko}` : `To do now · Point ${sim.g} ${P.name.en}`);
  }
  if (sim.after) return pick(AFTER, ko ? '지금 할 일 · 구역 통과 후' : 'To do now · after the segment');
  return null;
}
