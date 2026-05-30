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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

const fetchJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`PolliSense API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const withFallback = async <T,>(request: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await request;
  } catch (error) {
    console.warn(error);
    return wait(fallback, 80);
  }
};

const filterRecords = (records: ProcessedRecord[], query: RecordsQuery) =>
  records.filter((record) => {
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

export const pollisenseApi = {
  getStations(): Promise<FieldStation[]> {
    return withFallback(fetchJson<FieldStation[]>('/stations'), polliSenseDataset.stations);
  },
  getDevices(): Promise<DeviceStatus[]> {
    return withFallback(fetchJson<DeviceStatus[]>('/devices'), polliSenseDataset.devices);
  },
  getAlerts(): Promise<Alert[]> {
    return withFallback(fetchJson<Alert[]>('/alerts'), polliSenseDataset.alerts);
  },
  getPreferences(): Promise<DashboardPreferences> {
    return withFallback(fetchJson<DashboardPreferences>('/preferences'), polliSenseDataset.preferences);
  },
  savePreferences(preferences: DashboardPreferences): Promise<DashboardPreferences> {
    polliSenseDataset.preferences = preferences;
    return withFallback(
      fetch(`${API_BASE_URL}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`PolliSense API request failed: ${response.status}`);
        }
        return response.json() as Promise<DashboardPreferences>;
      }),
      preferences,
    );
  },
  async getRecords(query: RecordsQuery = {}): Promise<ProcessedRecord[]> {
    const records = await withFallback(fetchJson<ProcessedRecord[]>('/records?limit=1000'), polliSenseDataset.records);
    return filterRecords(records, query);
  },
};
