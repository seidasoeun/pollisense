import type { DeviceStatus, ProcessedRecord } from '../types';
import { aggregateDaily, average, deviceStatusSummary } from './analytics';

export function buildDashboardSummary(records: ProcessedRecord[], devices: DeviceStatus[]) {
  const daily = aggregateDaily(records);
  const totalDetections = records.reduce((sum, record) => sum + record.insectCount, 0);
  const peak = daily.reduce((best, day) => (day.detections > best.detections ? day : best), daily[0] ?? { label: 'n/a', detections: 0 });
  return {
    totalDetections,
    dailyAverage: daily.length ? totalDetections / daily.length : 0,
    peakLabel: peak.label,
    avgTemperature: average(records.map((record) => record.temperature)),
    status: deviceStatusSummary(devices),
  };
}

export type DashboardSummary = ReturnType<typeof buildDashboardSummary>;

