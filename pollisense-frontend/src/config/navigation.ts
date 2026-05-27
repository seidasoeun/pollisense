import { Activity, CloudSun, Database, LayoutDashboard, Lightbulb, LineChart, Radio, Settings } from 'lucide-react';

export type PageId = 'overview' | 'activity' | 'environment' | 'correlations' | 'insights' | 'data' | 'status' | 'settings';

export const dashboardPages: Array<{ id: PageId; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'environment', label: 'Environment', icon: CloudSun },
  { id: 'correlations', label: 'Correlations', icon: LineChart },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'status', label: 'Stations', icon: Radio },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const mobilePrimaryPages = dashboardPages.filter((page) =>
  ['overview', 'activity', 'environment', 'data', 'status'].includes(page.id),
);

export const mobilePageLabels: Record<PageId, string> = {
  overview: 'Home',
  activity: 'Activity',
  environment: 'Env',
  correlations: 'Compare',
  insights: 'Insights',
  data: 'Data',
  status: 'Status',
  settings: 'Settings',
};
