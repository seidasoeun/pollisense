import { useMemo } from 'react';
import type { ProcessedRecord, TargetGroup } from '../types';
import { formatDateOption } from '../utils/dateRange';

interface UseFilteredRecordsArgs {
  records: ProcessedRecord[];
  selectedStation: string;
  selectedGroups: TargetGroup[];
  minConfidence: number;
  rangeStart: Date;
  latestRecordDate: Date;
  selectedDate: string;
}

export function useFilteredRecords({
  records,
  selectedStation,
  selectedGroups,
  minConfidence,
  rangeStart,
  latestRecordDate,
  selectedDate,
}: UseFilteredRecordsArgs) {
  const baseFilteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const recordTime = new Date(record.timestamp).getTime();
        return (
          record.stationId === selectedStation &&
          selectedGroups.includes(record.targetGroup) &&
          record.confidence >= minConfidence &&
          recordTime >= rangeStart.getTime() &&
          recordTime <= latestRecordDate.getTime()
        );
      }),
    [records, selectedStation, selectedGroups, minConfidence, rangeStart, latestRecordDate],
  );

  const dateOptions = useMemo(
    () =>
      Array.from(new Set(baseFilteredRecords.map((record) => record.timestamp.slice(0, 10))))
        .sort()
        .map((date) => [date, formatDateOption(date)]),
    [baseFilteredRecords],
  );

  const effectiveSelectedDate =
    selectedDate === 'all' || dateOptions.some(([value]) => value === selectedDate) ? selectedDate : 'all';

  const filteredRecords = useMemo(
    () =>
      effectiveSelectedDate === 'all'
        ? baseFilteredRecords
        : baseFilteredRecords.filter((record) => record.timestamp.startsWith(effectiveSelectedDate)),
    [baseFilteredRecords, effectiveSelectedDate],
  );

  return { baseFilteredRecords, dateOptions, effectiveSelectedDate, filteredRecords };
}

