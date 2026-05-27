import { supportedTargetGroups, targetGroupLabels } from '../../data/mockData';
import type { TargetGroup } from '../../types';

export function GroupSelector({ selectedGroups, setSelectedGroups }: { selectedGroups: TargetGroup[]; setSelectedGroups: (groups: TargetGroup[]) => void }) {
  const isGeneralMonitoring = selectedGroups.length === supportedTargetGroups.length;

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Supported target groups</p>
          <p className="mt-1 text-xs text-slate-500">
            {isGeneralMonitoring
              ? 'General monitoring: all supported groups are included.'
              : 'Focus view: only selected groups are included.'}
          </p>
        </div>
        <button
          className="w-fit rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-default disabled:bg-slate-50 disabled:text-slate-400"
          type="button"
          disabled={isGeneralMonitoring}
          onClick={() => setSelectedGroups(supportedTargetGroups)}
        >
          Select all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {supportedTargetGroups.map((group) => (
          <label key={group} className="inline-flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={selectedGroups.includes(group)}
              onChange={(event) => {
                if (event.target.checked) {
                  setSelectedGroups([...selectedGroups, group]);
                } else if (selectedGroups.length > 1) {
                  setSelectedGroups(selectedGroups.filter((selected) => selected !== group));
                }
              }}
            />
            {targetGroupLabels[group]}
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">PolliSense reports supported target-group labels only; it does not claim reliable full species-level classification.</p>
    </div>
  );
}
