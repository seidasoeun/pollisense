import pollisenseLogo from '../../assets/pollisense-logo.svg';
import type { PageId } from '../../config/navigation';
import { dashboardPages } from '../../config/navigation';
import type { DashboardPreferences, FieldStation, ProcessedRecord } from '../../types';
import { Select } from '../controls/Select';
import { MobileStationSummary } from './MobileStationSummary';

interface DashboardHeaderProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  preferences: DashboardPreferences;
  setPreferences: (preferences: DashboardPreferences) => void;
  selectedStationId: string;
  setSelectedStation: (stationId: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dateOptions: string[][];
  stations: FieldStation[];
  records: ProcessedRecord[];
  rangeLabel: string;
  dateFilterLabel: string;
  selectedStation: FieldStation;
  stationNumber: number;
  activeDevices: number;
  hasIssue: boolean;
}

export function DashboardHeader({
  activePage,
  setActivePage,
  preferences,
  setPreferences,
  selectedStationId,
  setSelectedStation,
  selectedDate,
  setSelectedDate,
  dateOptions,
  stations,
  selectedStation,
  stationNumber,
  activeDevices,
  hasIssue,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <img className="mb-3 h-12 w-auto lg:hidden" src={pollisenseLogo} alt="PolliSense" />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-950 sm:text-2xl">PolliSense Research Dashboard</h1>
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]" />
              Field system online
            </span>
          </div>
          <p className="mt-2 hidden max-w-3xl text-sm leading-6 text-slate-600 sm:block">
            Edge devices send processed compact JSON with group-level detections and environmental context. No raw video is shown.
          </p>
        </div>
      </div>
      <MobileStationSummary
        activeDevices={activeDevices}
        hasIssue={hasIssue}
        station={selectedStation}
        stationNumber={stationNumber}
        onOpenStatus={() => setActivePage('status')}
      />
      <div className="grid gap-2 border-t border-slate-100 px-4 py-3 sm:px-5 md:grid-cols-3">
        <Select label="Station" value={selectedStationId} onChange={setSelectedStation} options={stations.map((station) => [station.id, station.name])} />
        <Select label="Date range" value={preferences.dateRange} onChange={(value) => setPreferences({ ...preferences, dateRange: value as DashboardPreferences['dateRange'] })} options={[['7d', 'Last 7 days'], ['14d', 'Last 14 days'], ['30d', 'Last 30 days']]} />
        <Select label="Day" value={selectedDate} onChange={setSelectedDate} options={[['all', 'All days'], ...dateOptions]} />
      </div>
      <div className="border-t border-slate-100 px-4 pb-4 pt-3 lg:hidden">
        <Select
          label="Dashboard page"
          value={activePage}
          onChange={(value) => setActivePage(value as PageId)}
          options={dashboardPages.map((page) => [page.id, page.label])}
        />
      </div>
    </header>
  );
}
