import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  tone?: 'default' | 'attention' | 'critical';
  accent?: 'green' | 'blue' | 'purple' | 'orange' | 'teal';
}

const toneClass = {
  default: 'border-slate-200/80 bg-white',
  attention: 'border-amber-200 bg-amber-50',
  critical: 'border-rose-200 bg-rose-50',
};

const accentClass = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  blue: 'bg-blue-50 text-blue-600 ring-blue-100',
  purple: 'bg-violet-50 text-violet-600 ring-violet-100',
  orange: 'bg-orange-50 text-orange-600 ring-orange-100',
  teal: 'bg-teal-50 text-teal-700 ring-teal-100',
};

export function KpiCard({ label, value, detail, icon, tone = 'default', accent = 'green' }: KpiCardProps) {
  return (
    <section className={`min-w-0 rounded-lg border p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-4 ${toneClass[tone]}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        {icon ? (
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ring-1 sm:h-14 sm:w-14 ${accentClass[accent]}`}>
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{value}</p>
          {detail ? <p className="mt-1 text-sm leading-5 text-slate-600">{detail}</p> : null}
        </div>
      </div>
    </section>
  );
}
