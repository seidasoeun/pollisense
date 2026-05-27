import { confidenceLabel } from '../utils/analytics';
import { Badge } from './Badge';

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const label = confidenceLabel(confidence);
  const tone = label === 'High' ? 'success' : label === 'Moderate' ? 'info' : 'warning';
  return <Badge tone={tone}>{`${label} ${(confidence * 100).toFixed(0)}%`}</Badge>;
}
