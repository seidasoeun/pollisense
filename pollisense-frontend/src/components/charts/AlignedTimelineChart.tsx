import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProcessedRecord } from '../../types';
import { aggregateByInterval, type TimeInterval } from '../../utils/analytics';

export function AlignedTimelineChart({ records, interval = 'daily' }: { records: ProcessedRecord[]; interval?: TimeInterval }) {
  const data = aggregateByInterval(records, interval);

  return (
    <div className="min-w-0 w-full overflow-x-auto">
      <div className="h-80 min-w-[540px]">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} minTickGap={22} />
          <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} width={44} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} width={44} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="detections" name="Detections" fill="#4caf50" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" dataKey="temperature" name="Temperature C" stroke="#f97316" strokeWidth={2} dot={false} />
          <Line yAxisId="right" dataKey="humidity" name="Humidity %" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
