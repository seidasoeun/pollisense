import type { Alert } from '../../types';
import { formatDateTime } from '../../utils/analytics';
import { Badge } from '../Badge';

export function AlertsList({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return <p className="text-sm text-slate-600">No current continuity or reliability alerts for this station.</p>;
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="rounded-md border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-950">{alert.title}</h3>
            <Badge tone={alert.severity}>{alert.severity}</Badge>
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-600">{alert.message}</p>
          <p className="mt-2 text-xs text-slate-500">{formatDateTime(alert.timestamp)}</p>
        </div>
      ))}
    </div>
  );
}
