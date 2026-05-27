import { useMemo } from 'react';
import type { DeviceStatus, ProcessedRecord } from '../types';
import { buildDashboardSummary } from '../utils/dashboardSummary';

export function useDashboardSummary(records: ProcessedRecord[], devices: DeviceStatus[]) {
  return useMemo(() => buildDashboardSummary(records, devices), [records, devices]);
}

