export type TargetGroup = 'honeybee' | 'bumblebee' | 'butterfly' | 'hoverfly';
export type LayoutMode = 'behaviour-focused' | 'environment-focused' | 'combined view';
export type DateRangePreset = '7d' | '14d' | '30d';
export type StationStatus = 'online' | 'offline' | 'degraded';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface FieldStation {
  id: string;
  name: string;
  site: string;
  habitat: string;
  latitude: number;
  longitude: number;
}

export interface DeviceStatus {
  id: string;
  stationId: string;
  label: string;
  status: StationStatus;
  lastSync: string;
  signalQuality: number;
  batteryLevel: number;
  connectivity: 'LTE-M' | 'NB-IoT' | 'offline';
  modules: {
    vision: 'ok' | 'attention' | 'offline';
    environment: 'ok' | 'attention' | 'offline';
    compute: 'ok' | 'attention' | 'offline';
    power: 'ok' | 'attention' | 'offline';
  };
}

export interface ProcessedRecord {
  id: string;
  timestamp: string;
  stationId: string;
  deviceId: string;
  targetGroup: TargetGroup;
  insectCount: number;
  confidence: number;
  temperature: number;
  humidity: number;
  lightIntensity: number;
  reviewed: boolean;
  flagged: boolean;
}

export interface Alert {
  id: string;
  timestamp: string;
  stationId: string;
  deviceId?: string;
  severity: AlertSeverity;
  title: string;
  message: string;
}

export interface DashboardPreferences {
  targetGroups: TargetGroup[];
  visibleWidgets: string[];
  defaultStationId: string;
  dateRange: DateRangePreset;
  layoutMode: LayoutMode;
  alertThresholds: {
    minConfidence: number;
    lowBattery: number;
    offlineHours: number;
    activityDropPercent: number;
  };
}

export interface PolliSenseDataset {
  stations: FieldStation[];
  devices: DeviceStatus[];
  records: ProcessedRecord[];
  alerts: Alert[];
  preferences: DashboardPreferences;
}
