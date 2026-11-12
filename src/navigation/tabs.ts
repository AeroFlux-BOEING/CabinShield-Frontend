import type { IconName } from '../components/Icon';

export interface TabItem {
  route: 'overview' | 'points' | 'cabin' | 'trip' | 'system';
  label: string;
  title: string;
  desc: string;
  icon: IconName;
}

export const TABS: TabItem[] = [
  { route: 'overview', label: '운항 현황', title: '운항 현황', desc: '', icon: 'grid' },
  { route: 'points', label: '포인트 · 구역', title: '포인트 · 구역', desc: '단계별 할 일과 경로 위 난기류 구간 일정입니다.', icon: 'target' },
  { route: 'cabin', label: '객실 · 서비스', title: '객실 · 서비스', desc: '승무원 상태, 객실 환경, AI가 조정한 서비스 시간표입니다.', icon: 'people' },
  { route: 'trip', label: '비행 · 도착', title: '비행 · 도착', desc: '비행 정보, 가까운 공항, 도착 전에 챙길 일입니다.', icon: 'plane' },
  { route: 'system', label: '상태 · 기록', title: '상태 · 기록', desc: '연결 상태와 알림 기록, 발표용 데모 버튼입니다.', icon: 'wifi' },
];
