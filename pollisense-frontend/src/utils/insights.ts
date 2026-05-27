import { Droplets, Sun, Thermometer, TrendingUp } from 'lucide-react';
import type { PageId } from '../config/navigation';
import type { ProcessedRecord } from '../types';
import { aggregateDaily, average, formatNumber } from './analytics';

export function buildInsightItems(records: ProcessedRecord[]) {
  const daily = aggregateDaily(records);
  const peakDay = daily.reduce(
    (best, day) => (day.detections > best.detections ? day : best),
    daily[0] ?? { label: 'n/a', detections: 0 },
  );
  const peakHour = records.reduce<Record<number, number>>((acc, record) => {
    const hour = new Date(record.timestamp).getHours();
    acc[hour] = (acc[hour] ?? 0) + record.insectCount;
    return acc;
  }, {});
  const bestHour = Number(
    Object.entries(peakHour).sort(([, left], [, right]) => right - left)[0]?.[0] ?? 11,
  );
  const highTempRecords = records.filter((record) => record.temperature >= 18);
  const coolRecords = records.filter((record) => record.temperature < 18);
  const highLightRecords = records.filter((record) => record.lightIntensity >= 650);
  const lowLightRecords = records.filter((record) => record.lightIntensity < 650);
  const humidRecords = records.filter((record) => record.humidity >= 80);
  const normalHumidityRecords = records.filter((record) => record.humidity < 80);
  const flagged = records.filter((record) => record.flagged).length;
  const lowConfidence = records.filter((record) => record.confidence < 0.7).length;
  const temperatureLift = average(highTempRecords.map((record) => record.insectCount)) - average(coolRecords.map((record) => record.insectCount));
  const lightLift = average(highLightRecords.map((record) => record.insectCount)) - average(lowLightRecords.map((record) => record.insectCount));
  const humidityLift = average(humidRecords.map((record) => record.insectCount)) - average(normalHumidityRecords.map((record) => record.insectCount));

  return [
    {
      title: 'Peak activity',
      description: `Highest processed activity is around ${formatHourWindow(bestHour)}. Peak day is ${peakDay.label} with ${formatNumber(peakDay.detections)} detections.`,
      icon: TrendingUp,
      iconClass: 'bg-emerald-50 text-emerald-700',
      page: 'activity' as PageId,
    },
    {
      title: 'Temperature effect',
      description:
        temperatureLift >= 0
          ? `Activity is higher when temperature is above 18 C in the selected records.`
          : `Activity is not higher above 18 C in this selected period; check the aligned environment view.`,
      icon: Thermometer,
      iconClass: 'bg-blue-50 text-blue-600',
      page: 'environment' as PageId,
    },
    {
      title: 'Light influence',
      description:
        lightLift >= 0
          ? 'Higher light intensity is associated with higher detectable activity during daytime records.'
          : 'Light intensity does not show a strong positive pattern in this selected dataset.',
      icon: Sun,
      iconClass: 'bg-amber-50 text-amber-600',
      page: 'correlations' as PageId,
    },
    {
      title: 'Humidity and uncertainty',
      description:
        humidityLift < 0
          ? `Very high humidity corresponds with lower activity. Also check ${flagged} flagged and ${lowConfidence} low-confidence records.`
          : `Humidity does not show a lower-activity pattern here. Still check ${flagged} flagged and ${lowConfidence} low-confidence records.`,
      icon: Droplets,
      iconClass: 'bg-violet-50 text-violet-600',
      page: 'data' as PageId,
    },
  ];
}

function formatHourWindow(hour: number) {
  const start = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true }).format(new Date(Date.UTC(2026, 0, 1, hour)));
  const end = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true }).format(new Date(Date.UTC(2026, 0, 1, hour + 2)));
  return `${start} - ${end}`;
}

