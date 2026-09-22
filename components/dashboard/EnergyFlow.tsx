'use client';

import { BoltIcon, BuildingOffice2Icon, CloudIcon } from '@heroicons/react/24/outline';
import { plant } from '@/data/mock';
import { usePreferences } from '@/contexts/AppPreferences';

function Node({ icon, label, value, className }: { icon: React.ReactNode; label: string; value: string; className: string }) {
  return <div className="flex min-w-[112px] flex-col items-center text-center"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${className}`}>{icon}</div><p className="mt-2 text-xs font-medium text-muted">{label}</p><p className="mt-0.5 text-base font-semibold tabular-nums text-ink">{value}</p></div>;
}

export function EnergyFlow() {
  const { t } = usePreferences();
  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold text-ink">{t.dashboard.energyFlow}</h2><p className="mt-1 text-xs text-muted">{t.common.updated} {plant.updatedAt.toLowerCase()}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{t.common.live}</span></div>
      <div className="mt-8">
        <div className="md:hidden"><div className="flex flex-col items-center"><Node icon={<CloudIcon className="h-6 w-6"/>} label={t.dashboard.solar} value="125.4 kW" className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"/><div className="my-2 flex h-9 flex-col items-center" aria-hidden="true"><div className="w-px flex-1 bg-amber-300 dark:bg-amber-500/50"/><span className="text-amber-500">↓</span></div><Node icon={<BuildingOffice2Icon className="h-6 w-6"/>} label={t.dashboard.factoryLoad} value="92.0 kW" className="bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300"/></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border border-line bg-surface-soft p-3 text-center"><p className="text-xs font-medium text-muted">{t.dashboard.battery}</p><p className="mt-1 text-lg font-semibold tabular-nums text-ink">76%</p><p className="mt-1 text-[11px] text-muted">{t.dashboard.charging} 18.2 kW</p></div><div className="rounded-xl border border-line bg-surface-soft p-3 text-center"><p className="text-xs font-medium text-muted">{t.dashboard.gridExport}</p><p className="mt-1 text-lg font-semibold tabular-nums text-ink">15.2 kW</p><p className="mt-1 text-[11px] text-muted">{t.dashboard.exportingNow}</p></div></div></div>
        <div className="hidden items-center justify-center gap-3 md:flex md:gap-5"><Node icon={<CloudIcon className="h-6 w-6"/>} label={t.dashboard.solar} value="125.4 kW" className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"/><div className="flex min-w-16 flex-1 items-center" aria-hidden="true"><div className="h-px flex-1 bg-amber-300 dark:bg-amber-500/50"/><span className="px-2 text-amber-500">→</span></div><Node icon={<BuildingOffice2Icon className="h-6 w-6"/>} label={t.dashboard.factoryLoad} value="92.0 kW" className="bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300"/><div className="flex min-w-16 flex-1 items-center" aria-hidden="true"><div className="h-px flex-1 bg-blue-300 dark:bg-blue-500/50"/><span className="px-2 text-blue-500">→</span></div><Node icon={<BoltIcon className="h-6 w-6"/>} label={t.dashboard.gridExport} value="15.2 kW" className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"/></div>
      </div>
      <div className="mt-7 hidden items-center justify-center gap-3 border-t border-line pt-5 text-sm md:flex"><span className="h-2.5 w-2.5 rounded-full bg-battery"/><span className="text-muted">{t.dashboard.battery}</span><strong className="font-semibold text-ink">76% SOC</strong><span className="text-muted">• {t.dashboard.charging} 18.2 kW</span></div>
    </section>
  );
}
