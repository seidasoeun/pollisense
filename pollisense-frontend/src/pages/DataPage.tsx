import { Download } from 'lucide-react';
import { Badge } from '../components/Badge';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { Panel } from '../components/Panel';
import { FiltersBar } from '../components/controls/FiltersBar';
import { targetGroupLabels } from '../data/mockData';
import { formatDateTime, stationName } from '../utils/analytics';
import { downloadRecordsCsv } from '../utils/exportRecords';
import type { DashboardPageProps } from './types';

export function DataPage({
  records,
  stations,
  selectedGroups,
  setSelectedGroups,
  minConfidence,
  setMinConfidence,
}: DashboardPageProps) {
  return (
    <>
      <Panel
        title="Field records"
        eyebrow="Processed compact data"
        action={
          <button
            className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
            type="button"
            onClick={() => downloadRecordsCsv(records, stations, 'pollisense-processed-records.csv')}
          >
            <Download size={16} /> Export CSV
          </button>
        }
      >
        <FiltersBar
          selectedGroups={selectedGroups}
          setSelectedGroups={setSelectedGroups}
          minConfidence={minConfidence}
          setMinConfidence={setMinConfidence}
        />
        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
          Processed outputs from modular edge devices. Exports contain compact field records, not raw video.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-3">Timestamp</th>
                <th className="py-3 pr-3">Station</th>
                <th className="py-3 pr-3">Target group</th>
                <th className="py-3 pr-3">Count</th>
                <th className="py-3 pr-3">Confidence</th>
                <th className="py-3 pr-3">Temp.</th>
                <th className="py-3 pr-3">Humidity</th>
                <th className="py-3 pr-3">Light</th>
                <th className="py-3 pr-3">Review</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 80).map((record) => (
                <tr key={record.id} className="border-b border-slate-100">
                  <td className="py-3 pr-3 text-slate-600">{formatDateTime(record.timestamp)}</td>
                  <td className="py-3 pr-3">{stationName(stations, record.stationId)}</td>
                  <td className="py-3 pr-3">{targetGroupLabels[record.targetGroup]}</td>
                  <td className="py-3 pr-3 font-semibold">{record.insectCount}</td>
                  <td className="py-3 pr-3"><ConfidenceBadge confidence={record.confidence} /></td>
                  <td className="py-3 pr-3">{record.temperature} C</td>
                  <td className="py-3 pr-3">{record.humidity}%</td>
                  <td className="py-3 pr-3">{record.lightIntensity} lux</td>
                  <td className="py-3 pr-3">{record.flagged ? <Badge tone="warning">Flagged</Badge> : <Badge tone="success">Reviewed</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
