import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ProcessedRecord } from '../../types';
import { confidenceDistribution } from '../../utils/analytics';

export function DistributionChart({ records }: { records: ProcessedRecord[] }) {
  return (
    <div className="min-w-0 w-full overflow-x-auto">
      <div className="h-64 min-w-full">
      <ResponsiveContainer>
        <BarChart data={confidenceDistribution(records)} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} width={44} />
          <Tooltip />
          <Bar dataKey="count" name="Records" fill="#2f9e44" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
