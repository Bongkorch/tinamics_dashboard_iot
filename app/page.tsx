'use client';

import { BoltIcon, ChartBarIcon, CircleStackIcon, SunIcon } from '@heroicons/react/24/outline';
import { plant } from '@/data/mock';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { EnergyFlow } from '@/components/dashboard/EnergyFlow';
import { PowerChart } from '@/components/dashboard/PowerChart';
import { DeviceList } from '@/components/dashboard/DeviceList';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { usePreferences } from '@/contexts/AppPreferences';

export default function DashboardPage() {
  const { t } = usePreferences();
  return <div className="space-y-6">
    <PageHeader title={t.dashboard.title} description={t.dashboard.desc} action={<div className="flex items-center gap-2"><StatusBadge status={plant.status}/><span className="hidden text-xs text-muted sm:inline">{t.common.updated} {plant.updatedAt.toLowerCase()}</span></div>}/>
    <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t.dashboard.selectedPlant}</p><h2 className="mt-1 text-xl font-semibold text-ink">{plant.name}</h2><p className="mt-1 text-sm text-muted">{plant.location} · {plant.capacityKw} kWp {t.dashboard.installedCapacity}</p></div><a href="/plants" className="text-sm font-semibold text-brand">{t.dashboard.changePlant}</a></div></section>
    <EnergyFlow/>
    <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"><MetricCard title={t.dashboard.currentPower} value={plant.currentPowerKw} unit="kW" helper={t.dashboard.currentPowerHelp} icon={<BoltIcon className="h-5 w-5"/>}/><MetricCard title={t.dashboard.todayEnergy} value={plant.todayEnergyKwh} unit="kWh" helper={t.dashboard.todayEnergyHelp} icon={<SunIcon className="h-5 w-5"/>}/><MetricCard title={t.dashboard.selfConsumption} value={plant.selfConsumptionPct} unit="%" helper={t.dashboard.selfConsumptionHelp} icon={<ChartBarIcon className="h-5 w-5"/>}/><MetricCard title={t.dashboard.battery} value={plant.batterySocPct} unit="%" helper={t.dashboard.batteryHelp} icon={<CircleStackIcon className="h-5 w-5"/>}/></section>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,.85fr)]"><PowerChart/><DeviceList/></section>
    <RecentAlerts/>
  </div>;
}
