import { polliSenseDataset } from '../data/mockData';
import type { Alert, DashboardPreferences, DeviceStatus, FieldStation, ProcessedRecord, TargetGroup } from '../types';

export interface RecordsQuery {
  stationId?: string;
  targetGroups?: TargetGroup[];
  minConfidence?: number;
  startDate?: string;
  endDate?: string;
}

const wait = <T,>(payload: T, delay = 160) =>
  new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(payload), delay);
  });

export const pollisenseApi = {
  getStations(): Promise<FieldStation[]> {
    return wait(polliSenseDataset.stations);
  },
  getDevices(): Promise<DeviceStatus[]> {
    return wait(polliSenseDataset.devices);
  },
  getAlerts(): Promise<Alert[]> {
    return wait(polliSenseDataset.alerts);
  },
  getPreferences(): Promise<DashboardPreferences> {
    return wait(polliSenseDataset.preferences);
  },
  savePreferences(preferences: DashboardPreferences): Promise<DashboardPreferences> {
    polliSenseDataset.preferences = preferences;
    return wait(preferences, 220);
  },
  getRecords(query: RecordsQuery = {}): Promise<ProcessedRecord[]> {
    const filtered = polliSenseDataset.records.filter((record) => {
      const time = new Date(record.timestamp).getTime();
      const afterStart = query.startDate ? time >= new Date(query.startDate).getTime() : true;
      const beforeEnd = query.endDate ? time <= new Date(query.endDate).getTime() : true;
      return (
        (!query.stationId || record.stationId === query.stationId) &&
        (!query.targetGroups?.length || query.targetGroups.includes(record.targetGroup)) &&
        (!query.minConfidence || record.confidence >= query.minConfidence) &&
        afterStart &&
        beforeEnd
      );
    });
    return wait(filtered);
  },
};
