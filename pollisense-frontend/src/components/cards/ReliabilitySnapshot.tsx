import type { DeviceStatus } from '../../types';
import { formatDateTime } from '../../utils/analytics';
import { Badge } from '../Badge';

interface ReliabilitySnapshotProps {
  devices: DeviceStatus[];
}

export function ReliabilitySnapshot({ devices }: ReliabilitySnapshotProps) {
  if (!devices.length) return <p className="text-sm text-slate-600">No modular devices registered for this station.</p>;

  const offlineDevices = devices.filter((device) => device.status === 'offline').length;
  const degradedDevices = devices.filter((device) => device.status === 'degraded').length;
  const lowestBattery = Math.min(...devices.map((device) => device.batteryLevel));
  const latestSync = devices
    .map((device) => device.lastSync)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];
  const moduleAttention = devices.reduce(
    (total, device) => total + Object.values(device.modules).filter((status) => status !== 'ok').length,
    0,
  );
  const connectivity = Array.from(new Set(devices.map((device) => device.connectivity))).join(', ');

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Battery</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{lowestBattery}%</p>
        <p className="mt-1 text-sm text-slate-600">Lowest device reserve</p>
      </article>
      <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Network</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">{connectivity}</p>
        <p className="mt-1 text-sm text-slate-600">Active link type</p>
      </article>
      <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last sync</p>
        <p className="mt-2 text-lg font-semibold text-slate-950">{formatDateTime(latestSync)}</p>
        <p className="mt-1 text-sm text-slate-600">Latest processed update</p>
      </article>
      <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modules</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone={offlineDevices ? 'critical' : degradedDevices ? 'warning' : 'success'}>
            {offlineDevices ? `${offlineDevices} offline` : degradedDevices ? `${degradedDevices} degraded` : 'operational'}
          </Badge>
          <Badge tone={moduleAttention ? 'warning' : 'success'}>{`${moduleAttention} module flags`}</Badge>
        </div>
        <p className="mt-2 text-sm text-slate-600">Vision, environment, compute, power</p>
      </article>
    </div>
  );
}
