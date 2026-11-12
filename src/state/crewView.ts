/** Turns the simulation state into crew-facing banner and to-do content. */
import { AFTER, POINTS, STAY } from '../domain/content';
import { minutesText, type FlightSim } from './FlightSim';

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

export function bannerView(sim: FlightSim): BannerView {
  const { g, cur, look: L } = sim, tE = sim.tEntry, after = sim.after;
  if (cur > 0 && L)
    return { level: 4, chip: '3포인트 · 구간 통과 중', head: '3포인트 · 착석 유지', sub: `${minutesText(L.exit)} 뒤 해제 예정 · 자리에서 벨트를 맨 채 기다리세요`, countLabel: '해제까지', countSec: L.exit, sideTitle: '3포인트', sideSub: '구간 통과 중' };
  if (after) return { level: 0, chip: '해제', head: '포인트가 해제되었습니다', sub: '조종실 안내가 나오면 서비스를 다시 시작하세요', countLabel: '다음 포인트', countSec: null, sideTitle: '해제', sideSub: '해제됨' };
  if (g > 0 && tE != null) {
    const P = POINTS[g - 1];
    if (g < 3) {
      const tn = tE - POINTS[g].lead;
      return { level: g, chip: `${g}포인트 · ${P.tag}`, head: `${g}포인트 · ${P.name} 단계입니다`, sub: `${g + 1}포인트까지 ${minutesText(tn)} · 아래 할 일을 확인하세요`, countLabel: `${g + 1}포인트까지`, countSec: tn, sideTitle: `${g}포인트`, sideSub: '준비 단계' };
    }
    return { level: 3, chip: `3포인트 · ${P.tag}`, head: `3포인트 · ${P.name} 단계입니다`, sub: '착석을 마치고 조종실에 보고하세요', countLabel: '착석 완료까지', countSec: tE, sideTitle: '3포인트', sideSub: '준비 단계' };
  }
  return { level: 0, chip: '평상', head: '평상 운항 중입니다', sub: '평소대로 서비스하세요', countLabel: '다음 포인트', countSec: null, sideTitle: '평상', sideSub: '평상 운항 중' };
}

export interface TodoView {
  title: string;
  items: string[];
  sayLabel: string;
  say: string;
}

export function todoView(sim: FlightSim): TodoView | null {
  if (sim.cur > 0) return { title: '지금 할 일 · 착석 유지', items: STAY.todo, sayLabel: STAY.sayLabel, say: STAY.say };
  if (sim.g > 0) {
    const P = POINTS[sim.g - 1];
    return { title: `지금 할 일 · ${sim.g}포인트 ${P.name}`, items: P.todo, sayLabel: P.sayLabel, say: P.say };
  }
  if (sim.after) return { title: '지금 할 일 · 구역 통과 후', items: AFTER.todo, sayLabel: AFTER.sayLabel, say: AFTER.say };
  return null;
}
