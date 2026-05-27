import { Panel } from '../components/Panel';
import { CorrelationChart } from '../components/charts/CorrelationChart';
import { GroupSelector } from '../components/controls/GroupSelector';
import { Select } from '../components/controls/Select';
import { pearsonCorrelation } from '../utils/analytics';
import type { DashboardPageProps } from './types';

export function CorrelationsPage({ records, selectedGroups, setSelectedGroups, selectedStation, setSelectedStation, stations }: DashboardPageProps) {
  const metrics: Array<'temperature' | 'humidity' | 'lightIntensity'> = ['temperature', 'humidity', 'lightIntensity'];
  const notes = {
    temperature: 'Positive values suggest activity tends to rise with warmer periods in this subset.',
    humidity: 'Negative values can indicate activity is lower during wetter or cooler intervals.',
    lightIntensity: 'Light response should be read alongside temperature and station habitat.',
  };

  return (
    <>
      <Panel title="Correlation scope" eyebrow="Station and target-group focus">
        <div className="grid gap-3 md:grid-cols-2">
          <Select label="Field station" value={selectedStation} onChange={setSelectedStation} options={stations.map((station) => [station.id, station.name])} />
          <GroupSelector selectedGroups={selectedGroups} setSelectedGroups={setSelectedGroups} />
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Panel key={metric} title={`Target-group activity vs ${metric === 'lightIntensity' ? 'light' : metric}`} eyebrow={`r = ${pearsonCorrelation(records, metric)}`}>
            <CorrelationChart records={records} metric={metric} />
            <p className="mt-3 text-sm leading-6 text-slate-600">{notes[metric]} This is an exploratory summary, not causal proof.</p>
          </Panel>
        ))}
      </div>
    </>
  );
}
