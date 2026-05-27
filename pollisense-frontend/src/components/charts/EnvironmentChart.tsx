import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProcessedRecord } from '../../types';
import { aggregateByInterval, type TimeInterval } from '../../utils/analytics';

export function EnvironmentChart({ records, interval = 'daily' }: { records: ProcessedRecord[]; interval?: TimeInterval }) {
  const data = aggregateByInterval(records, interval);

  return (
    <div className="min-w-0 w-full overflow-x-auto">
      <div className="h-72 min-w-[520px]">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} minTickGap={22} />
          <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} width={44} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} width={44} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature C" stroke="#f97316" strokeWidth={2} dot={false} />
          <Line yAxisId="left" type="monotone" dataKey="humidity" name="Humidity %" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="lightIntensity" name="Light lux" stroke="#fbbf24" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
