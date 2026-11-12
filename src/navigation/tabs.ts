import type { IconName } from '../components/Icon';
import { tx, type Txt } from '../i18n/LangContext';

export interface TabItem {
  route: 'overview' | 'points' | 'cabin' | 'trip' | 'system';
  label: Txt;
  desc: Txt;
  icon: IconName;
}

export const TABS: TabItem[] = [
  { route: 'overview', label: tx('운항 현황', 'Flight status'), desc: tx('', ''), icon: 'grid' },
  { route: 'points', label: tx('포인트 · 구역', 'Points · Segments'), desc: tx('단계별 할 일과 경로 위 난기류 구간 일정입니다.', 'What to do at each point, and every turbulence segment on the route.'), icon: 'target' },
  { route: 'cabin', label: tx('객실 · 서비스', 'Cabin · Service'), desc: tx('승무원 상태, 객실 환경, AI가 조정한 서비스 시간표입니다.', 'Crew status, cabin conditions and the service plan adjusted by AI.'), icon: 'people' },
  { route: 'trip', label: tx('비행 · 도착', 'Flight · Arrival'), desc: tx('비행 정보, 가까운 공항, 도착 전에 챙길 일입니다.', 'Flight data, nearest airports and what to prepare before arrival.'), icon: 'plane' },
  { route: 'system', label: tx('상태 · 기록', 'Status · Log'), desc: tx('연결 상태, 기기 안에서 도는 AI, 알림 기록입니다.', 'Connection status, the on-device AI and the alert log.'), icon: 'wifi' },
];
