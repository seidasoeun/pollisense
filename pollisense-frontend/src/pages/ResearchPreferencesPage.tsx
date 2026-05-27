import { useState } from 'react';
import type { DashboardPreferences } from '../types';
import { Panel } from '../components/Panel';
import { GroupSelector } from '../components/controls/GroupSelector';
import { Select } from '../components/controls/Select';
import { Threshold } from '../components/controls/Threshold';
import { widgetOptions } from '../config/researchPreferences';
import type { DashboardPageProps } from './types';

export function ResearchPreferencesPage({ preferences, setPreferences, stations, setSelectedStation, setSelectedGroups }: DashboardPageProps) {
  const [draft, setDraft] = useState(preferences);
  const save = () => {
    setPreferences(draft);
    setSelectedGroups(draft.targetGroups);
    setSelectedStation(draft.defaultStationId);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <Panel title="Research preferences" eyebrow="Baseline stays active">
        <div className="space-y-4">
          <GroupSelector selectedGroups={draft.targetGroups} setSelectedGroups={(groups) => setDraft({ ...draft, targetGroups: groups })} />
          <Select label="Default station" value={draft.defaultStationId} onChange={(value) => setDraft({ ...draft, defaultStationId: value })} options={stations.map((station) => [station.id, station.name])} />
          <Select label="Default emphasis" value={draft.layoutMode} onChange={(value) => setDraft({ ...draft, layoutMode: value as DashboardPreferences['layoutMode'] })} options={[['combined view', 'Combined'], ['behaviour-focused', 'Activity'], ['environment-focused', 'Environment']]} />
          <Select label="Date range" value={draft.dateRange} onChange={(value) => setDraft({ ...draft, dateRange: value as DashboardPreferences['dateRange'] })} options={[['7d', '7 days'], ['14d', '14 days'], ['30d', '30 days']]} />
        </div>
      </Panel>
      <Panel title="Widgets and thresholds">
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-700">Visible widgets</p>
            <p className="mb-2 text-xs text-slate-500">Baseline activity, environment, status, alerts, and data remain available.</p>
            <div className="grid gap-2">
              {widgetOptions.map(([id, label]) => (
                <label key={id} className="flex items-center gap-3 rounded-md border border-slate-200 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.visibleWidgets.includes(id)}
                    onChange={(event) => {
                      const visibleWidgets = event.target.checked
                        ? [...draft.visibleWidgets, id]
                        : draft.visibleWidgets.filter((widget) => widget !== id);
                      setDraft({ ...draft, visibleWidgets });
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <Threshold label="Min. confidence" value={draft.alertThresholds.minConfidence} step={0.01} max={0.95} onChange={(value) => setDraft({ ...draft, alertThresholds: { ...draft.alertThresholds, minConfidence: value } })} />
          <Threshold label="Low battery" value={draft.alertThresholds.lowBattery} step={1} max={60} suffix="%" onChange={(value) => setDraft({ ...draft, alertThresholds: { ...draft.alertThresholds, lowBattery: value } })} />
          <Threshold label="Offline after" value={draft.alertThresholds.offlineHours} step={1} max={48} suffix="h" onChange={(value) => setDraft({ ...draft, alertThresholds: { ...draft.alertThresholds, offlineHours: value } })} />
          <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800" type="button" onClick={save}>
            Save preferences
          </button>
          <p className="text-sm leading-6 text-slate-600">
            Preferences adjust the researcher layer only. The scientific baseline stays available.
          </p>
        </div>
      </Panel>
    </div>
  );
}
