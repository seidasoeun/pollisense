import type {
  Alert,
  DashboardPreferences,
  DeviceStatus,
  FieldStation,
  PolliSenseDataset,
  ProcessedRecord,
  TargetGroup,
} from '../types';

export const supportedTargetGroups: TargetGroup[] = [
  'honeybee',
  'bumblebee',
  'butterfly',
  'hoverfly',
];

export const targetGroupLabels: Record<TargetGroup, string> = {
  honeybee: 'Honeybee',
  bumblebee: 'Bumblebee',
  butterfly: 'Butterfly',
  hoverfly: 'Hoverfly',
};

export const stations: FieldStation[] = [
  {
    id: 'station-meadow-01',
    name: 'Meadow Edge A',
    site: 'North Meadow Plot',
    habitat: 'Wildflower meadow edge',
    latitude: 52.5224,
    longitude: 13.376,
  },
  {
    id: 'station-orchard-02',
    name: 'Orchard Row C',
    site: 'Experimental Orchard',
    habitat: 'Mixed fruit tree row',
    latitude: 52.5191,
    longitude: 13.3697,
  },
  {
    id: 'station-wetland-03',
    name: 'Wetland Transect B',
    site: 'Riparian Buffer Zone',
    habitat: 'Wetland margin',
    latitude: 52.5286,
    longitude: 13.3842,
  },
];

export const devices: DeviceStatus[] = [
  {
    id: 'ps-001',
    stationId: 'station-meadow-01',
    label: 'PolliSense PS-001',
    status: 'online',
    lastSync: '2026-05-09T17:42:00.000Z',
    signalQuality: 86,
    batteryLevel: 72,
    connectivity: 'LTE-M',
    modules: { vision: 'ok', environment: 'ok', compute: 'ok', power: 'ok' },
  },
  {
    id: 'ps-002',
    stationId: 'station-meadow-01',
    label: 'PolliSense PS-002',
    status: 'degraded',
    lastSync: '2026-05-09T15:18:00.000Z',
    signalQuality: 58,
    batteryLevel: 29,
    connectivity: 'NB-IoT',
    modules: { vision: 'attention', environment: 'ok', compute: 'ok', power: 'attention' },
  },
  {
    id: 'ps-003',
    stationId: 'station-orchard-02',
    label: 'PolliSense PS-003',
    status: 'online',
    lastSync: '2026-05-09T17:55:00.000Z',
    signalQuality: 91,
    batteryLevel: 81,
    connectivity: 'LTE-M',
    modules: { vision: 'ok', environment: 'ok', compute: 'ok', power: 'ok' },
  },
  {
    id: 'ps-004',
    stationId: 'station-wetland-03',
    label: 'PolliSense PS-004',
    status: 'offline',
    lastSync: '2026-05-08T21:16:00.000Z',
    signalQuality: 0,
    batteryLevel: 16,
    connectivity: 'offline',
    modules: { vision: 'offline', environment: 'offline', compute: 'offline', power: 'attention' },
  },
  {
    id: 'ps-005',
    stationId: 'station-wetland-03',
    label: 'PolliSense PS-005',
    status: 'online',
    lastSync: '2026-05-09T17:49:00.000Z',
    signalQuality: 74,
    batteryLevel: 64,
    connectivity: 'NB-IoT',
    modules: { vision: 'ok', environment: 'attention', compute: 'ok', power: 'ok' },
  },
];

const deviceByStation = devices.reduce<Record<string, string[]>>((acc, device) => {
  acc[device.stationId] = [...(acc[device.stationId] ?? []), device.id];
  return acc;
}, {});

const groupWeight: Record<TargetGroup, number> = {
  honeybee: 1,
  bumblebee: 0.55,
  butterfly: 0.34,
  hoverfly: 0.62,
};

const stationWeight: Record<string, number> = {
  'station-meadow-01': 1.12,
  'station-orchard-02': 0.92,
  'station-wetland-03': 0.72,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const records: ProcessedRecord[] = Array.from({ length: 30 }).flatMap((_, dayIndex) => {
  const date = new Date(Date.UTC(2026, 3, 10 + dayIndex));
  const dayWave = Math.sin((dayIndex / 30) * Math.PI);

  return stations.flatMap((station, stationIndex) =>
    supportedTargetGroups.map((targetGroup, groupIndex) => {
      const hour = 8 + ((dayIndex + groupIndex + stationIndex) % 9);
      const timestamp = new Date(date);
      timestamp.setUTCHours(hour, groupIndex * 11, 0, 0);
      const temperature = 12.8 + dayWave * 8.4 + stationIndex * 0.9 + Math.sin(dayIndex + groupIndex) * 1.2;
      const humidity = clamp(76 - dayWave * 22 + stationIndex * 5 + Math.cos(dayIndex / 3 + groupIndex) * 7, 35, 96);
      const lightIntensity = clamp(230 + dayWave * 520 + Math.sin(dayIndex / 2 + groupIndex) * 90, 75, 980);
      const environmentalFactor = clamp((temperature - 8) / 19, 0.18, 1.18) * clamp(lightIntensity / 620, 0.25, 1.35);
      const count = Math.round(
        (8 + dayWave * 32 + Math.sin(dayIndex / 2 + groupIndex) * 7) *
          groupWeight[targetGroup] *
          stationWeight[station.id] *
          environmentalFactor,
      );
      const confidence = clamp(0.61 + dayWave * 0.22 + groupWeight[targetGroup] * 0.08 - stationIndex * 0.025 + Math.sin(dayIndex + groupIndex) * 0.06, 0.42, 0.97);
      const flagged = confidence < 0.68 || (dayIndex % 13 === 0 && targetGroup === 'butterfly');
      const stationDevices = deviceByStation[station.id];

      return {
        id: `rec-${dayIndex + 1}-${stationIndex + 1}-${targetGroup}`,
        timestamp: timestamp.toISOString(),
        stationId: station.id,
        deviceId: stationDevices[(dayIndex + groupIndex) % stationDevices.length],
        targetGroup,
        insectCount: Math.max(0, count),
        confidence: Number(confidence.toFixed(2)),
        temperature: Number(temperature.toFixed(1)),
        humidity: Number(humidity.toFixed(1)),
        lightIntensity: Math.round(lightIntensity),
        reviewed: dayIndex < 21 || confidence > 0.78,
        flagged,
      };
    }),
  );
});

export const alerts: Alert[] = [
  {
    id: 'alert-001',
    timestamp: '2026-05-09T16:25:00.000Z',
    stationId: 'station-wetland-03',
    deviceId: 'ps-004',
    severity: 'critical',
    title: 'Device offline',
    message: 'PS-004 has not synced for more than 20 hours. Continuity gap likely after 2026-05-08 21:16 UTC.',
  },
  {
    id: 'alert-002',
    timestamp: '2026-05-09T14:08:00.000Z',
    stationId: 'station-meadow-01',
    deviceId: 'ps-002',
    severity: 'warning',
    title: 'Low battery reserve',
    message: 'Battery is below the configured reserve threshold. Power module reports attention state.',
  },
  {
    id: 'alert-003',
    timestamp: '2026-05-08T10:33:00.000Z',
    stationId: 'station-wetland-03',
    deviceId: 'ps-005',
    severity: 'warning',
    title: 'Humidity sensor drift',
    message: 'Environmental module reported intermittent readings outside local station variance.',
  },
  {
    id: 'alert-004',
    timestamp: '2026-05-06T12:12:00.000Z',
    stationId: 'station-orchard-02',
    severity: 'info',
    title: 'Unusual activity peak',
    message: 'Hoverfly detections exceeded the 30-day station median during high light intensity.',
  },
];

export const defaultPreferences: DashboardPreferences = {
  targetGroups: ['honeybee', 'bumblebee', 'hoverfly'],
  visibleWidgets: ['activity', 'environment', 'correlations', 'alerts', 'station-status', 'insights'],
  defaultStationId: 'station-meadow-01',
  dateRange: '30d',
  layoutMode: 'combined view',
  alertThresholds: {
    minConfidence: 0.7,
    lowBattery: 25,
    offlineHours: 12,
    activityDropPercent: 35,
  },
};

export const polliSenseDataset: PolliSenseDataset = {
  stations,
  devices,
  records,
  alerts,
  preferences: defaultPreferences,
};
