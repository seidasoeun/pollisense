import type { ReactNode } from 'react';
import type { PageId } from '../../config/navigation';
import type { DashboardPreferences, FieldStation, ProcessedRecord, TargetGroup } from '../../types';
import { DashboardHeader } from './DashboardHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { ScientificContextBar } from './ScientificContextBar';
import { Sidebar } from './Sidebar';

interface DashboardShellProps {
  children: ReactNode;
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  preferences: DashboardPreferences;
  setPreferences: (preferences: DashboardPreferences) => void;
  selectedStationId: string;
  setSelectedStation: (stationId: string) => void;
  selectedGroups: TargetGroup[];
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

export function DashboardShell(props: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f8f6] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar
          activePage={props.activePage}
          onNavigate={props.setActivePage}
          selectedStation={props.selectedStation}
          stationNumber={props.stationNumber}
          activeDevices={props.activeDevices}
          hasIssue={props.hasIssue}
        />
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <DashboardHeader {...props} />
          <ScientificContextBar
            station={props.selectedStation}
            selectedDate={props.selectedDate}
            rangeLabel={props.rangeLabel}
            dateFilterLabel={props.dateFilterLabel}
            selectedGroups={props.selectedGroups}
          />
          <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">{props.children}</div>
        </main>
      </div>
      <MobileBottomNav activePage={props.activePage} setActivePage={props.setActivePage} />
    </div>
  );
}

