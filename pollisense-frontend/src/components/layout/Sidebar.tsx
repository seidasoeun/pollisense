import { ChevronRight } from 'lucide-react';
import pollisenseLogo from '../../assets/pollisense-logo.svg';
import type { PageId } from '../../config/navigation';
import { dashboardPages } from '../../config/navigation';
import type { FieldStation } from '../../types';
import { Badge } from '../Badge';
import { DeviceIllustration } from './DeviceIllustration';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  selectedStation: FieldStation;
  stationNumber: number;
  activeDevices: number;
  hasIssue: boolean;
}

export function Sidebar({ activePage, onNavigate, selectedStation, stationNumber, activeDevices, hasIssue }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-emerald-950/60 bg-[#061719] text-white lg:flex lg:flex-col">
      <div className="border-b border-white/10 p-5">
        <div className="rounded-md bg-[#f8faf7] px-3 py-2 shadow-sm ring-1 ring-white/10">
          <img className="h-auto w-full object-contain" src={pollisenseLogo} alt="PolliSense" />
        </div>
        <p className="mt-4 text-sm leading-5 text-slate-300">Processed field records with modular device health.</p>
      </div>
      <nav className="p-3 pb-2">
        {dashboardPages.map((page) => {
          const Icon = page.icon;
          return (
            <button
              key={page.id}
              className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm ${
                activePage === page.id
                  ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg shadow-emerald-950/25'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              type="button"
              onClick={() => onNavigate(page.id)}
            >
              <Icon size={17} />
              {page.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20">
          <DeviceIllustration />
          <div className="mt-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{`Station ${String(stationNumber).padStart(2, '0')}`}</p>
              <p className={`mt-1 flex items-center gap-1.5 text-xs ${hasIssue ? 'text-amber-300' : 'text-emerald-300'}`}>
                <span className={`h-2 w-2 rounded-full ${hasIssue ? 'bg-amber-300' : 'bg-emerald-400'}`} />
                {hasIssue ? 'Attention' : 'Online'}
              </p>
            </div>
            <Badge tone={hasIssue ? 'warning' : 'success'}>{activeDevices} online</Badge>
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-slate-400">Location</p>
          <p className="mt-1 text-sm text-slate-100">{selectedStation.site}</p>
          <button className="mt-4 flex w-full items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 hover:bg-white/10" type="button" onClick={() => onNavigate('status')}>
            View device health
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
