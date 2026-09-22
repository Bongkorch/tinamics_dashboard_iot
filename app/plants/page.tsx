'use client';

import { plants } from '@/data/mock';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePreferences } from '@/contexts/AppPreferences';

export default function PlantsPage() {
  const { t } = usePreferences();
  return <div className="space-y-6"><PageHeader title={t.plants.title} description={t.plants.desc}/><div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{plants.map((item)=><article key={item.id} className="rounded-card border border-line bg-surface p-5 shadow-card"><div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-ink">{item.name}</h2><p className="mt-1 text-xs text-muted">{item.location}</p></div><StatusBadge status={item.status}/></div><div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4"><div><p className="text-xs text-muted">{t.plants.currentPower}</p><p className="mt-1 text-xl font-semibold tabular-nums text-ink">{item.currentPowerKw} <span className="text-xs font-medium text-muted">kW</span></p></div><div><p className="text-xs text-muted">{t.plants.today}</p><p className="mt-1 text-xl font-semibold tabular-nums text-ink">{item.todayEnergyKwh} <span className="text-xs font-medium text-muted">kWh</span></p></div><div><p className="text-xs text-muted">{t.plants.selfConsumption}</p><p className="mt-1 text-sm font-semibold text-ink">{item.selfConsumptionPct}%</p></div><div><p className="text-xs text-muted">{t.plants.battery}</p><p className="mt-1 text-sm font-semibold text-ink">{item.batterySocPct}%</p></div></div><p className="mt-4 text-[11px] text-muted">{t.common.updated} {item.updatedAt.toLowerCase()}</p></article>)}</div></div>;
}
