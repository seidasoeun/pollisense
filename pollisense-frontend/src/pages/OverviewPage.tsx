import { Bug, Gauge, Info, LineChart, Radio, Thermometer } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import { ActionQueue } from '../components/cards/ActionQueue';
import { AlertsList } from '../components/cards/AlertsList';
import { InsightsList } from '../components/cards/InsightsList';
import { ReliabilitySnapshot } from '../components/cards/ReliabilitySnapshot';
import { ActivityChart } from '../components/charts/ActivityChart';
import { EnvironmentChart } from '../components/charts/EnvironmentChart';
import { formatNumber } from '../utils/analytics';
import type { DashboardPageProps } from './types';

export function OverviewPage({ records, alerts, summary, navigate, viewInterval, devices, selectedStation, preferences }: DashboardPageProps) {
  const selectedStationDevices = devices.filter((device) => device.stationId === selectedStation);
  const isVisible = (widgetId: string) => preferences.visibleWidgets.includes(widgetId);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Detections" value={formatNumber(summary.totalDetections)} detail="Processed events" icon={<Bug size={22} />} accent="green" />
        <KpiCard label="Daily avg." value={summary.dailyAverage.toFixed(1)} detail="Selected scope" icon={<Gauge size={22} />} accent="blue" />
        <KpiCard label="Peak day" value={summary.peakLabel} detail="Highest activity" icon={<LineChart size={22} />} accent="purple" />
        <KpiCard label="Avg. temp." value={`${summary.avgTemperature.toFixed(1)} C`} detail="Aligned context" icon={<Thermometer size={22} />} accent="orange" />
        <KpiCard label="Stations online" value={`${summary.status.activeStations}/3`} detail={`${summary.status.offlineDevices} offline device`} icon={<Radio size={22} />} accent="teal" tone={summary.status.offlineDevices ? 'attention' : 'default'} />
      </div>
      {(isVisible('activity') || isVisible('alerts')) && (
        <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
          {isVisible('activity') && (
            <Panel title="Activity over time" eyebrow="Shared baseline">
              <ActivityChart records={records} interval={viewInterval} />
            </Panel>
          )}
          {isVisible('alerts') && (
            <Panel title="Latest alerts" eyebrow="Continuity and reliability">
              <AlertsList alerts={alerts} />
            </Panel>
          )}
        </div>
      )}
      {isVisible('station-status') && (
        <Panel title="Station reliability" eyebrow="Device health">
          <ReliabilitySnapshot devices={selectedStationDevices} />
        </Panel>
      )}
      {(isVisible('environment') || isVisible('insights')) && (
        <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
          {isVisible('environment') && (
            <Panel title="Environment" eyebrow="Shared baseline">
              <EnvironmentChart records={records} interval={viewInterval} />
            </Panel>
          )}
          {isVisible('insights') && (
            <Panel
              title="Insights"
              eyebrow="Check field data"
              action={<Info size={17} className="text-slate-400" />}
            >
              <InsightsList records={records} onOpenPage={navigate} />
            </Panel>
          )}
        </div>
      )}
      {isVisible('correlations') && (
        <Panel title="Correlation check" eyebrow="Activity and environment">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-600">
              Compare target-group activity against temperature, humidity, and light for the selected station and date range.
            </p>
            <button
              className="min-h-9 shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              type="button"
              onClick={() => navigate('correlations')}
            >
              Open correlations
            </button>
          </div>
        </Panel>
      )}
      <Panel title="Field action queue" eyebrow="Recommended next steps">
        <ActionQueue records={records} alerts={alerts} />
      </Panel>
    </>
  );
}
