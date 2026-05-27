import type { AlertSeverity } from '../types';

interface BadgeProps {
  children: string;
  tone?: AlertSeverity | 'success' | 'neutral';
}

const toneClass: Record<NonNullable<BadgeProps['tone']>, string> = {
  critical: 'border-rose-200 bg-rose-50 text-rose-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
