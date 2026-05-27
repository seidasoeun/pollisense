import type { PageId } from '../config/navigation';
import type { Alert, DashboardPreferences, DeviceStatus, FieldStation, ProcessedRecord, TargetGroup } from '../types';
import type { TimeInterval } from '../utils/analytics';
import type { DashboardSummary } from '../utils/dashboardSummary';

export interface DashboardPageProps {
  records: ProcessedRecord[];
  stations: FieldStation[];
  devices: DeviceStatus[];
  selectedStation: string;
  setSelectedStation: (stationId: string) => void;
  selectedGroups: TargetGroup[];
  setSelectedGroups: (groups: TargetGroup[]) => void;
  alerts: Alert[];
  summary: DashboardSummary;
  preferences: DashboardPreferences;
  setPreferences: (preferences: DashboardPreferences) => void;
  viewInterval: TimeInterval;
  setViewInterval: (interval: TimeInterval) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dateOptions: string[][];
  minConfidence: number;
  setMinConfidence: (confidence: number) => void;
  navigate: (page: PageId) => void;
}

