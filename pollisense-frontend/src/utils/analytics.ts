import type { DeviceStatus, FieldStation, ProcessedRecord, TargetGroup } from '../types';

export const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);
export type TimeInterval = 'daily' | 'weekly' | 'monthly';

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric' }).format(new Date(iso));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

export const confidenceLabel = (confidence: number) => {
  if (confidence >= 0.85) return 'High';
  if (confidence >= 0.7) return 'Moderate';
  return 'Review';
};

export const aggregateDaily = (records: ProcessedRecord[]) => {
  const daily = records.reduce<Record<string, ProcessedRecord[]>>((acc, record) => {
    const date = record.timestamp.slice(0, 10);
    acc[date] = [...(acc[date] ?? []), record];
    return acc;
  }, {});

  return Object.entries(daily)
    .map(([date, items]) => ({
      date,
      label: formatDate(date),
      detections: items.reduce((sum, item) => sum + item.insectCount, 0),
      temperature: average(items.map((item) => item.temperature)),
      humidity: average(items.map((item) => item.humidity)),
      lightIntensity: Math.round(average(items.map((item) => item.lightIntensity))),
      confidence: average(items.map((item) => item.confidence)),
      flagged: items.filter((item) => item.flagged).length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const aggregateByInterval = (records: ProcessedRecord[], interval: TimeInterval) => {
  if (interval === 'daily') return aggregateDaily(records);

  const grouped = records.reduce<Record<string, ProcessedRecord[]>>((acc, record) => {
    const date = new Date(record.timestamp);
    const key = interval === 'weekly' ? getWeekKey(date) : record.timestamp.slice(0, 7);
    acc[key] = [...(acc[key] ?? []), record];
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, items]) => ({
      date,
      label: interval === 'weekly' ? formatWeekLabel(date) : formatMonthLabel(date),
      detections: items.reduce((sum, item) => sum + item.insectCount, 0),
      temperature: average(items.map((item) => item.temperature)),
      humidity: average(items.map((item) => item.humidity)),
      lightIntensity: Math.round(average(items.map((item) => item.lightIntensity))),
      confidence: average(items.map((item) => item.confidence)),
      flagged: items.filter((item) => item.flagged).length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const aggregateByTarget = (records: ProcessedRecord[]) =>
  Object.entries(
    records.reduce<Record<TargetGroup, number>>(
      (acc, record) => {
        acc[record.targetGroup] += record.insectCount;
        return acc;
      },
      { honeybee: 0, bumblebee: 0, butterfly: 0, hoverfly: 0 },
    ),
  ).map(([targetGroup, detections]) => ({ targetGroup, detections }));

export const confidenceDistribution = (records: ProcessedRecord[]) => [
  { label: '< 0.60', count: records.filter((item) => item.confidence < 0.6).length },
  { label: '0.60-0.69', count: records.filter((item) => item.confidence >= 0.6 && item.confidence < 0.7).length },
  { label: '0.70-0.84', count: records.filter((item) => item.confidence >= 0.7 && item.confidence < 0.85).length },
  { label: '>= 0.85', count: records.filter((item) => item.confidence >= 0.85).length },
];

export const stationName = (stations: FieldStation[], stationId: string) =>
  stations.find((station) => station.id === stationId)?.name ?? stationId;

export const deviceStatusSummary = (devices: DeviceStatus[]) => ({
  activeStations: new Set(devices.filter((device) => device.status === 'online').map((device) => device.stationId)).size,
  onlineDevices: devices.filter((device) => device.status === 'online').length,
  degradedDevices: devices.filter((device) => device.status === 'degraded').length,
  offlineDevices: devices.filter((device) => device.status === 'offline').length,
});

export const average = (values: number[]) => {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
};

const getWeekKey = (date: Date) => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = start.getUTCDay() || 7;
  start.setUTCDate(start.getUTCDate() - day + 1);
  return start.toISOString().slice(0, 10);
};

const formatWeekLabel = (isoDate: string) => `Week of ${formatDate(isoDate)}`;

const formatMonthLabel = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(new Date(Date.UTC(year, month - 1, 1)));
};

export const pearsonCorrelation = (records: ProcessedRecord[], metric: 'temperature' | 'humidity' | 'lightIntensity') => {
  if (records.length < 2) return 0;
  const x = records.map((record) => record[metric]);
  const y = records.map((record) => record.insectCount);
  const avgX = average(x);
  const avgY = average(y);
  const numerator = x.reduce((sum, value, index) => sum + (value - avgX) * (y[index] - avgY), 0);
  const denominator = Math.sqrt(
    x.reduce((sum, value) => sum + (value - avgX) ** 2, 0) *
      y.reduce((sum, value) => sum + (value - avgY) ** 2, 0),
  );
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(2));
};
