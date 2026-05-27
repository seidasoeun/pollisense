import { targetGroupLabels } from '../data/mockData';
import type { TargetGroup } from '../types';
import { aggregateByTarget, formatNumber } from '../utils/analytics';
import { KpiCard } from '../components/KpiCard';
import { Panel } from '../components/Panel';
import { ActivityChart } from '../components/charts/ActivityChart';
import { DistributionChart } from '../components/charts/DistributionChart';
import { FiltersBar } from '../components/controls/FiltersBar';
import { Segmented } from '../components/controls/Segmented';
import type { DashboardPageProps } from './types';

export function ActivityPage({
  records,
  selectedGroups,
  setSelectedGroups,
  viewInterval,
  setViewInterval,
  minConfidence,
  setMinConfidence,
}: DashboardPageProps) {
  const reviewed = records.filter((record) => record.reviewed).length;
  const flagged = records.filter((record) => record.flagged).length;
  const byTarget = aggregateByTarget(records);

  return (
    <>
      <FiltersBar
        selectedGroups={selectedGroups}
        setSelectedGroups={setSelectedGroups}
        minConfidence={minConfidence}
        setMinConfidence={setMinConfidence}
      />
      <Panel
        title="Target-group detections over time"
        eyebrow="Edge-processed biological activity"
        action={<Segmented value={viewInterval} onChange={setViewInterval} values={['daily', 'weekly', 'monthly']} />}
      >
        <ActivityChart records={records} interval={viewInterval} />
      </Panel>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Reviewed vs flagged field records">
          <div className="grid gap-3 sm:grid-cols-2">
            <KpiCard label="Reviewed" value={formatNumber(reviewed)} detail="Records already checked or high-confidence" accent="green" />
            <KpiCard label="Flagged" value={formatNumber(flagged)} detail="Lower confidence or unusual context" accent="orange" tone={flagged ? 'attention' : 'default'} />
          </div>
        </Panel>
        <Panel title="Confidence distribution" className="xl:col-span-2">
          <DistributionChart records={records} />
        </Panel>
      </div>
      <Panel title="Supported target-group totals" eyebrow="Group-level labels only">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {byTarget.map((item) => (
            <KpiCard key={item.targetGroup} label={targetGroupLabels[item.targetGroup as TargetGroup]} value={formatNumber(item.detections)} detail="Processed detections" accent="green" />
          ))}
        </div>
      </Panel>
    </>
  );
}
