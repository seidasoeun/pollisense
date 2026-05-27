import { Badge } from '../components/Badge';
import { Panel } from '../components/Panel';
import { Meter } from '../components/controls/Meter';
import { formatDateTime } from '../utils/analytics';
import type { DashboardPageProps } from './types';

export function StatusPage({ stations, devices }: DashboardPageProps) {
  return (
    <div className="space-y-5">
      {stations.map((station) => {
        const stationDevices = devices.filter((device) => device.stationId === station.id);
        return (
          <Panel key={station.id} title={station.name} eyebrow={`${station.site} | ${station.habitat} | modular field devices`}>
            <div className="grid gap-3 xl:grid-cols-2">
              {stationDevices.map((device) => (
                <div key={device.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">{device.label}</h3>
                      <p className="mt-1 text-sm text-slate-600">Last compact JSON sync {formatDateTime(device.lastSync)}</p>
                    </div>
                    <Badge tone={device.status === 'online' ? 'success' : device.status === 'degraded' ? 'warning' : 'critical'}>{device.status}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Meter label="Signal quality" value={device.signalQuality} suffix="%" />
                    <Meter label="Battery reserve" value={device.batteryLevel} suffix="%" />
                    <div className="rounded-md bg-slate-50 p-3 text-sm">
                      <p className="text-slate-500">Connectivity mode</p>
                      <p className="mt-1 font-semibold text-slate-950">{device.connectivity}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Module health</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    {Object.entries(device.modules).map(([module, status]) => (
                      <Badge key={module} tone={status === 'ok' ? 'success' : status === 'attention' ? 'warning' : 'critical'}>
                        {`${module}: ${status}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
