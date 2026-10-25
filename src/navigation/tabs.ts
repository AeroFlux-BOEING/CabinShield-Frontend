import type { IconName } from '../components/Icon';

export type TabRoute = 'overview' | 'twin' | 'kernel' | 'plans' | 'scenario' | 'incidents' | 'settings';

export interface TabItem {
  route: TabRoute;
  label: string;
  icon: IconName;
}

export const TABS: TabItem[] = [
  { route: 'overview', label: 'Overview', icon: 'overview' },
  { route: 'twin', label: 'Cabin Twin', icon: 'twin' },
  { route: 'kernel', label: 'Safety Kernel', icon: 'kernel' },
  { route: 'plans', label: 'Response Plans', icon: 'plans' },
  { route: 'scenario', label: 'Scenario Input', icon: 'scenario' },
  { route: 'incidents', label: 'Incident Data', icon: 'incidents' },
  { route: 'settings', label: 'Settings', icon: 'settings' },
];
