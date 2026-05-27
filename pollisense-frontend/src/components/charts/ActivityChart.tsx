import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProcessedRecord } from '../../types';
import { aggregateByInterval, type TimeInterval } from '../../utils/analytics';

export function ActivityChart({ records, interval = 'daily' }: { records: ProcessedRecord[]; interval?: TimeInterval }) {
  const data = aggregateByInterval(records, interval);

  return (
    <div className="min-w-0 w-full overflow-x-auto">
      <div className="h-72 min-w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} minTickGap={22} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} width={44} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="detections"
            name="Detections"
            stroke="#2f9e44"
            fill="#dcfce7"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
