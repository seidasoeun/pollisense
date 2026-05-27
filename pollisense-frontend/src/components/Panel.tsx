import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, eyebrow, action, children, className = '' }: PanelProps) {
  return (
    <section className={`min-w-0 rounded-lg border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5 ${className}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{eyebrow}</p> : null}
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
