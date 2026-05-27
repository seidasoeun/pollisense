import { Filter } from 'lucide-react';
import type { TargetGroup } from '../../types';
import { GroupSelector } from './GroupSelector';

interface FiltersBarProps {
  selectedGroups: TargetGroup[];
  setSelectedGroups: (groups: TargetGroup[]) => void;
  minConfidence: number;
  setMinConfidence: (confidence: number) => void;
}

export function FiltersBar({
  selectedGroups,
  setSelectedGroups,
  minConfidence,
  setMinConfidence,
}: FiltersBarProps) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Filter size={16} />
        Filters
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <GroupSelector selectedGroups={selectedGroups} setSelectedGroups={setSelectedGroups} />
        <label className="block text-sm">
          <span className="mb-2 block font-semibold text-slate-700">Minimum confidence</span>
          <input className="w-full" type="range" min={0} max={0.95} step={0.05} value={minConfidence} onChange={(event) => setMinConfidence(Number(event.target.value))} />
          <span className="mt-1 block text-slate-600">{(minConfidence * 100).toFixed(0)}%</span>
        </label>
      </div>
    </div>
  );
}
