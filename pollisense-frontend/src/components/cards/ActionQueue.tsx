import type { Alert, ProcessedRecord } from '../../types';
import { average } from '../../utils/analytics';
import { Badge } from '../Badge';

type ActionItem = {
  label: string;
  detail: string;
  tone: 'critical' | 'warning' | 'info';
};

const isActionItem = (item: ActionItem | null): item is ActionItem => item !== null;

export function ActionQueue({ records, alerts }: { records: ProcessedRecord[]; alerts: Alert[] }) {
  const flagged = records.filter((record) => record.flagged).length;
  const lowConfidence = records.filter((record) => record.confidence < 0.7).length;
  const averageConfidence = average(records.map((record) => record.confidence));
  const actionItems = [
    alerts.some((alert) => alert.severity === 'critical')
      ? {
          label: 'Resolve continuity gap',
          detail: 'A critical station/device alert is active. Check compact JSON sync history before using this period for trend reporting.',
          tone: 'critical' as const,
        }
      : null,
    flagged
      ? {
          label: 'Review flagged records',
          detail: `${flagged} records need review before export. Prioritise lower-confidence target groups first.`,
          tone: 'warning' as const,
        }
      : null,
    lowConfidence
      ? {
          label: 'Check confidence threshold',
          detail: `${lowConfidence} records sit below 70% confidence. Use target-group focus or raise the minimum confidence filter for stricter reporting.`,
          tone: 'warning' as const,
        }
      : null,
    {
      label: 'Sampling note',
      detail:
        averageConfidence >= 0.8
          ? 'Confidence is strong for the selected scope. Add field context such as bloom stage or maintenance events.'
          : 'Confidence is mixed in this scope. Keep the export annotated and avoid over-reading group-level patterns.',
      tone: 'info' as const,
    },
  ].filter(isActionItem);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {actionItems.map((item) => (
        <article
          key={item.label}
          className={`rounded-lg border p-4 ${
            item.tone === 'critical'
              ? 'border-rose-200 bg-rose-50'
              : item.tone === 'warning'
                ? 'border-amber-200 bg-amber-50'
                : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-950">{item.label}</h3>
            <Badge tone={item.tone === 'critical' ? 'critical' : item.tone === 'warning' ? 'warning' : 'info'}>
              {item.tone}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
        </article>
      ))}
    </div>
  );
}
