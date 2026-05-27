import { CloudSun, SlidersHorizontal, Thermometer } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import { AlignedTimelineChart } from '../components/charts/AlignedTimelineChart';
import { EnvironmentChart } from '../components/charts/EnvironmentChart';
import { Segmented } from '../components/controls/Segmented';
import { average } from '../utils/analytics';
import type { DashboardPageProps } from './types';

export function EnvironmentPage({ records, viewInterval, setViewInterval }: DashboardPageProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Temperature" value={`${average(records.map((record) => record.temperature)).toFixed(1)} C`} detail="Mean over processed field records" icon={<Thermometer size={22} />} accent="orange" />
        <KpiCard label="Humidity" value={`${average(records.map((record) => record.humidity)).toFixed(1)}%`} detail="Mean relative humidity" icon={<CloudSun size={22} />} accent="blue" />
        <KpiCard label="Light intensity" value={`${Math.round(average(records.map((record) => record.lightIntensity)))} lux`} detail="Mean measured light" icon={<SlidersHorizontal size={22} />} accent="purple" />
      </div>
      <Panel
        title="Temperature, humidity, and light intensity"
        eyebrow="Environmental baseline"
        action={<Segmented value={viewInterval} onChange={setViewInterval} values={['daily', 'weekly', 'monthly']} />}
      >
        <EnvironmentChart records={records} interval={viewInterval} />
      </Panel>
      <Panel title="Aligned environmental and biological timeline" eyebrow="Field context for target-group activity">
        <AlignedTimelineChart records={records} interval={viewInterval} />
      </Panel>
    </>
  );
}
