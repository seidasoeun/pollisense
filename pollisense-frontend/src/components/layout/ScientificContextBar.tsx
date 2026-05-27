import { supportedTargetGroups, targetGroupLabels } from '../../data/mockData';
import type { FieldStation, TargetGroup } from '../../types';
import { Badge } from '../Badge';

interface ScientificContextBarProps {
  station: FieldStation;
  selectedDate: string;
  rangeLabel: string;
  dateFilterLabel: string;
  selectedGroups: TargetGroup[];
}

export function ScientificContextBar({ station, selectedDate, rangeLabel, dateFilterLabel, selectedGroups }: ScientificContextBarProps) {
  const isGeneralMonitoring = selectedGroups.length === supportedTargetGroups.length;

  return (
    <section className="border-b border-slate-200/80 bg-[#fbfcfb] px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <Badge tone="success">{station.site}</Badge>
        <Badge tone={isGeneralMonitoring ? 'info' : 'warning'}>
          {isGeneralMonitoring ? 'General monitoring' : 'Target-group focus'}
        </Badge>
        <span>{selectedDate === 'all' ? rangeLabel : `Daily view: ${dateFilterLabel}`}</span>
        <span className="hidden text-slate-300 sm:inline">|</span>
        <span>{station.habitat}</span>
        <span className="hidden text-slate-300 sm:inline">|</span>
        <span>{selectedGroups.map((group) => targetGroupLabels[group]).join(', ')}</span>
      </div>
    </section>
  );
}
