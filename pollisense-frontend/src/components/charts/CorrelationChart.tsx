import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import type { ProcessedRecord } from '../../types';

interface CorrelationChartProps {
  records: ProcessedRecord[];
  metric: 'temperature' | 'humidity' | 'lightIntensity';
}

const metricLabel = {
  temperature: 'Temperature C',
  humidity: 'Humidity %',
  lightIntensity: 'Light lux',
};

export function CorrelationChart({ records, metric }: CorrelationChartProps) {
  const data = records.map((record) => ({
    x: record[metric],
    y: record.insectCount,
    z: Math.max(60, record.confidence * 120),
    targetGroup: record.targetGroup,
  }));

  return (
    <div className="min-w-0 w-full overflow-x-auto">
      <div className="h-72 min-w-full">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" dataKey="x" name={metricLabel[metric]} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis type="number" dataKey="y" name="Detections" tick={{ fill: '#64748b', fontSize: 12 }} width={44} />
          <ZAxis type="number" dataKey="z" range={[50, 140]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Processed records" data={data} fill="#2f9e44" />
        </ScatterChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
