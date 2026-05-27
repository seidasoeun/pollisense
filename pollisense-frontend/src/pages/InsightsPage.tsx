import { AlertTriangle, CheckCircle2, Database, LineChart } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import { InsightsList } from '../components/cards/InsightsList';
import { average, formatNumber } from '../utils/analytics';
import type { DashboardPageProps } from './types';

export function InsightsPage({ records, alerts, navigate }: DashboardPageProps) {
  const flagged = records.filter((record) => record.flagged).length;
  const reviewed = records.filter((record) => record.reviewed).length;
  const avgConfidence = average(records.map((record) => record.confidence));
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical').length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Records" value={formatNumber(records.length)} detail="Selected scope" icon={<Database size={22} />} accent="green" />
        <KpiCard label="Reviewed" value={formatNumber(reviewed)} detail="Ready for export" icon={<CheckCircle2 size={22} />} accent="teal" />
        <KpiCard label="Flagged" value={formatNumber(flagged)} detail="Needs review" icon={<AlertTriangle size={22} />} accent="orange" tone={flagged ? 'attention' : 'default'} />
        <KpiCard label="Confidence" value={`${Math.round(avgConfidence * 100)}%`} detail={`${criticalAlerts} critical alerts`} icon={<LineChart size={22} />} accent="blue" tone={criticalAlerts ? 'attention' : 'default'} />
      </div>

      <Panel title="Insight review" eyebrow="Patterns to verify">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <InsightsList records={records} onOpenPage={navigate} />
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-950">How to read this page</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use these signals as prompts for review, not conclusions. Confirm patterns against station uptime,
              sampling notes, and aligned environment data before reporting.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                type="button"
                onClick={() => navigate('activity')}
              >
                Activity
              </button>
              <button
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                type="button"
                onClick={() => navigate('environment')}
              >
                Environment
              </button>
              <button
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                type="button"
                onClick={() => navigate('status')}
              >
                Device health
              </button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Field notebook prompts" eyebrow="Research workflow">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            'Compare high-activity days with bloom stage and maintenance notes.',
            'Review low-confidence target-group records before export.',
            'Annotate station downtime before estimating continuity.',
            'Use aligned timelines to separate environment effects from sync gaps.',
          ].map((item) => (
            <div key={item} className="rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
