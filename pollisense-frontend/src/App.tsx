import { useState } from 'react';
import { polliSenseDataset } from './data/mockData';
import { DashboardShell } from './components/layout/DashboardShell';
import { OverviewPage } from './pages/OverviewPage';
import { ActivityPage } from './pages/ActivityPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { CorrelationsPage } from './pages/CorrelationsPage';
import { InsightsPage } from './pages/InsightsPage';
import { DataPage } from './pages/DataPage';
import { StatusPage } from './pages/StatusPage';
import { ResearchPreferencesPage } from './pages/ResearchPreferencesPage';
import type { PageId } from './config/navigation';
import type { TimeInterval } from './utils/analytics';
import { useDashboardFilters } from './hooks/useDashboardFilters';
import { useDashboardSummary } from './hooks/useDashboardSummary';
import { formatDateOption } from './utils/dateRange';
import { getStationOperationalSummary } from './utils/stationLookup';

function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [viewInterval, setViewInterval] = useState<TimeInterval>('daily');
  const stations = polliSenseDataset.stations;
  const devices = polliSenseDataset.devices;
  const dashboardFilters = useDashboardFilters(polliSenseDataset.records, polliSenseDataset.preferences);
  const alerts = polliSenseDataset.alerts.filter((alert) => alert.stationId === dashboardFilters.selectedStation);
  const summary = useDashboardSummary(dashboardFilters.filteredRecords, devices);
  const stationStatus = getStationOperationalSummary(stations, devices, dashboardFilters.selectedStation);
  const dateFilterLabel = dashboardFilters.selectedDate === 'all' ? 'All days' : formatDateOption(dashboardFilters.selectedDate);

  const pageProps = {
    records: dashboardFilters.filteredRecords,
    stations,
    devices,
    selectedStation: dashboardFilters.selectedStation,
    setSelectedStation: dashboardFilters.setSelectedStation,
    selectedGroups: dashboardFilters.selectedGroups,
    setSelectedGroups: dashboardFilters.setSelectedGroups,
    alerts,
    summary,
    preferences: dashboardFilters.preferences,
    setPreferences: dashboardFilters.setPreferences,
    viewInterval,
    setViewInterval,
    selectedDate: dashboardFilters.selectedDate,
    setSelectedDate: dashboardFilters.setSelectedDate,
    dateOptions: dashboardFilters.dateOptions,
    minConfidence: dashboardFilters.minConfidence,
    setMinConfidence: dashboardFilters.setMinConfidence,
    navigate: setActivePage,
  };

  return (
    <DashboardShell
      activePage={activePage}
      setActivePage={setActivePage}
      preferences={dashboardFilters.preferences}
      setPreferences={dashboardFilters.setPreferences}
      selectedStationId={dashboardFilters.selectedStation}
      setSelectedStation={dashboardFilters.setSelectedStation}
      selectedGroups={dashboardFilters.selectedGroups}
      selectedDate={dashboardFilters.selectedDate}
      setSelectedDate={dashboardFilters.setSelectedDate}
      dateOptions={dashboardFilters.dateOptions}
      stations={stations}
      records={dashboardFilters.filteredRecords}
      rangeLabel={dashboardFilters.rangeLabel}
      dateFilterLabel={dateFilterLabel}
      selectedStation={stationStatus.selectedStation}
      stationNumber={stationStatus.stationNumber}
      activeDevices={stationStatus.onlineDevices}
      hasIssue={stationStatus.hasIssue}
    >
      {activePage === 'overview' && <OverviewPage {...pageProps} />}
      {activePage === 'activity' && <ActivityPage {...pageProps} />}
      {activePage === 'environment' && <EnvironmentPage {...pageProps} />}
      {activePage === 'correlations' && <CorrelationsPage {...pageProps} />}
      {activePage === 'insights' && <InsightsPage {...pageProps} />}
      {activePage === 'data' && <DataPage {...pageProps} />}
      {activePage === 'status' && <StatusPage {...pageProps} />}
      {activePage === 'settings' && <ResearchPreferencesPage {...pageProps} />}
    </DashboardShell>
  );
}

export default App;

