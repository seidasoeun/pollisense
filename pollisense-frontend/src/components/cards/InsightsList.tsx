import type { PageId } from '../../config/navigation';
import type { ProcessedRecord } from '../../types';
import { buildInsightItems } from '../../utils/insights';

export function InsightsList({ records, onOpenPage }: { records: ProcessedRecord[]; onOpenPage: (page: PageId) => void }) {
  const insights = buildInsightItems(records);

  return (
    <div className="space-y-4">
      {insights.map((insight) => {
        const Icon = insight.icon;
        return (
          <article key={insight.title} className="flex gap-3 rounded-lg border border-slate-100 p-3 sm:border-transparent sm:p-0">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${insight.iconClass}`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-950">{insight.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{insight.description}</p>
                </div>
                <button
                  className="min-h-9 shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                  type="button"
                  onClick={() => onOpenPage(insight.page)}
                >
                  Open
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
