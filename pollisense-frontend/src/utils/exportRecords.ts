import type { FieldStation, ProcessedRecord } from '../types';
import { stationName } from './analytics';

function csvEscape(value: string | number | boolean) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function buildRecordsCsv(records: ProcessedRecord[], stations: FieldStation[]) {
  const header = [
    'timestamp',
    'station',
    'device',
    'target_group',
    'count',
    'confidence',
    'temperature',
    'humidity',
    'light_lux',
    'reviewed',
    'flagged',
  ];
  const rows = records.map((record) => [
    record.timestamp,
    stationName(stations, record.stationId),
    record.deviceId,
    record.targetGroup,
    record.insectCount,
    record.confidence,
    record.temperature,
    record.humidity,
    record.lightIntensity,
    record.reviewed,
    record.flagged,
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
}

export function downloadRecordsCsv(records: ProcessedRecord[], stations: FieldStation[], filename: string) {
  const csv = buildRecordsCsv(records, stations);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

