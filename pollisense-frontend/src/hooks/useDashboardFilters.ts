import { useState } from 'react';
import type { DashboardPreferences, ProcessedRecord, TargetGroup } from '../types';
import { useDateRange } from './useDateRange';
import { useFilteredRecords } from './useFilteredRecords';

export function useDashboardFilters(records: ProcessedRecord[], initialPreferences: DashboardPreferences) {
  const [preferences, setPreferences] = useState<DashboardPreferences>(initialPreferences);
  const [selectedStation, setSelectedStation] = useState(preferences.defaultStationId);
  const [selectedGroups, setSelectedGroups] = useState<TargetGroup[]>(preferences.targetGroups);
  const [selectedDate, setSelectedDate] = useState('all');
  const [minConfidence, setMinConfidence] = useState(0);
  const dateRange = useDateRange(records, preferences.dateRange);
  const filtered = useFilteredRecords({
    records,
    selectedStation,
    selectedGroups,
    minConfidence,
    rangeStart: dateRange.rangeStart,
    latestRecordDate: dateRange.latestRecordDate,
    selectedDate,
  });

  return {
    preferences,
    setPreferences,
    selectedStation,
    setSelectedStation,
    selectedGroups,
    setSelectedGroups,
    selectedDate: filtered.effectiveSelectedDate,
    setSelectedDate,
    minConfidence,
    setMinConfidence,
    ...dateRange,
    ...filtered,
  };
}

