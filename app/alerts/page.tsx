'use client';

import { alarms } from '@/data/mock';
import { PageHeader } from '@/components/shared/PageHeader';
import { usePreferences } from '@/contexts/AppPreferences';

const severityStyle = { critical: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300', warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300', info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300' };

export default function AlertsPage() {
  const { t } = usePreferences();
  return <div className="space-y-6"><PageHeader title={t.alerts.title} description={t.alerts.desc}/><div className="space-y-3">{alarms.map((item)=><article key={item.id} className="rounded-card border border-line bg-surface p-5 shadow-card"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase ${severityStyle[item.severity]}`}>{item.severity === 'critical' ? t.common.critical : item.severity === 'warning' ? t.common.warning : t.common.info}</span>{item.acknowledged ? <span className="text-xs text-muted">{t.common.acknowledged}</span> : <span className="text-xs font-medium text-danger">{t.common.needsAttention}</span>}</div><h2 className="mt-3 text-base font-semibold text-ink">{item.title}</h2><p className="mt-1 text-sm text-muted">{item.device} · {item.message}</p></div><span className="shrink-0 text-xs text-muted">{item.timestamp}</span></div></article>)}</div></div>;
}
