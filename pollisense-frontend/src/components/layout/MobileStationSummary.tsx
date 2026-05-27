import type { FieldStation } from '../../types';
import { Badge } from '../Badge';

export function MobileStationSummary({
  activeDevices,
  hasIssue,
  onOpenStatus,
  station,
  stationNumber,
}: {
  activeDevices: number;
  hasIssue: boolean;
  onOpenStatus: () => void;
  station: FieldStation;
  stationNumber: number;
}) {
  return (
    <section className="border-t border-slate-100 px-4 py-3 lg:hidden">
      <button
        className="flex min-h-16 w-full items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-3 text-left"
        type="button"
        onClick={onOpenStatus}
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            {`Station ${String(stationNumber).padStart(2, '0')}`}
          </p>
          <p className="mt-1 truncate text-base font-semibold text-slate-950">{station.name}</p>
          <p className="mt-1 truncate text-sm text-slate-600">{station.site}</p>
        </div>
        <div className="shrink-0 text-right">
          <Badge tone={hasIssue ? 'warning' : 'success'}>{hasIssue ? 'Attention' : 'Online'}</Badge>
          <p className="mt-2 text-xs font-semibold text-slate-600">{activeDevices} online</p>
        </div>
      </button>
    </section>
  );
}
