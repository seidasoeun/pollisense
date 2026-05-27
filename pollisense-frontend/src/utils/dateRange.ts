import type { DateRangePreset } from '../types';

export const dateRangeDays: Record<DateRangePreset, number> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
};

export function getLatestRecordDate(records: { timestamp: string }[]) {
  const latestTime = Math.max(...records.map((record) => new Date(record.timestamp).getTime()));
  return new Date(latestTime);
}

export function getRangeStart(latestRecordDate: Date, dateRange: DateRangePreset) {
  const start = new Date(latestRecordDate);
  start.setUTCDate(start.getUTCDate() - dateRangeDays[dateRange] + 1);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export function formatRangeLabel(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
  const year = end.getUTCFullYear();
  return `${formatter.format(start)} - ${formatter.format(end)}, ${year}`;
}

export function formatDateOption(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00.000Z`));
}

