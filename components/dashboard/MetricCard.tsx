import type { ReactNode } from 'react';

export function MetricCard({ title, value, unit, helper, icon }: { title: string; value: string | number; unit?: string; helper?: string; icon?: ReactNode }) {
  return (
    <article className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{title}</p>
        {icon ? <div className="rounded-lg bg-surface-soft p-2 text-muted">{icon}</div> : null}
      </div>
      <div className="mt-4 flex items-end gap-1.5">
        <span className="text-[30px] font-semibold leading-none tracking-tight tabular-nums text-ink sm:text-[34px]">{value}</span>
        {unit ? <span className="pb-0.5 text-sm font-medium text-muted">{unit}</span> : null}
      </div>
      {helper ? <p className="mt-2 text-xs text-muted">{helper}</p> : null}
    </article>
  );
}
