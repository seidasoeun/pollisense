import { useMemo } from 'react';
import type { DateRangePreset, ProcessedRecord } from '../types';
import { formatRangeLabel, getLatestRecordDate, getRangeStart } from '../utils/dateRange';

export function useDateRange(records: ProcessedRecord[], dateRange: DateRangePreset) {
  const latestRecordDate = useMemo(() => getLatestRecordDate(records), [records]);
  const rangeStart = useMemo(() => getRangeStart(latestRecordDate, dateRange), [latestRecordDate, dateRange]);
  const rangeLabel = useMemo(() => formatRangeLabel(rangeStart, latestRecordDate), [rangeStart, latestRecordDate]);

  return { latestRecordDate, rangeStart, rangeLabel };
}

