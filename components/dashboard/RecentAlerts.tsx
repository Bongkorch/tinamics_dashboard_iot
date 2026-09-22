'use client';

import { alarms } from '@/data/mock';
import { usePreferences } from '@/contexts/AppPreferences';

const severityStyle = {
  critical: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
};

export function RecentAlerts() {
  const { t } = usePreferences();
  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-ink">{t.dashboard.recentAlerts}</h2><p className="mt-1 text-xs text-muted">{t.dashboard.alertsDesc}</p></div><a href="/alerts" className="text-sm font-semibold text-brand">{t.common.viewAll}</a></div>
      <div className="mt-4 space-y-3">{alarms.slice(0, 2).map((alarm) => <article key={alarm.id} className="rounded-xl border border-line bg-surface-soft p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase ${severityStyle[alarm.severity]}`}>{alarm.severity === 'critical' ? t.common.critical : alarm.severity === 'warning' ? t.common.warning : t.common.info}</span><span className="text-xs text-muted">{alarm.timestamp}</span></div><h3 className="mt-3 text-sm font-semibold text-ink">{alarm.title}</h3><p className="mt-1 text-xs leading-5 text-muted">{alarm.device} · {alarm.message}</p></article>)}</div>
    </section>
  );
}
