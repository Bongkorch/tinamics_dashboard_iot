'use client';

import { devices } from '@/data/mock';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePreferences } from '@/contexts/AppPreferences';

export function DeviceList() {
  const { t } = usePreferences();
  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-base font-semibold text-ink">{t.dashboard.deviceHealth}</h2><p className="mt-1 text-xs text-muted">{t.dashboard.connectedDevices}</p></div>
        <a href="/devices" className="text-sm font-semibold text-brand">{t.common.viewAll}</a>
      </div>
      <div className="mt-4 divide-y divide-line">{devices.slice(0, 4).map((device) => <div key={device.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-0"><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold text-ink">{device.name}</p><span className="hidden text-xs text-muted sm:inline">{device.type}</span></div><p className="mt-0.5 truncate text-xs text-muted">{device.primaryValue} · {device.updatedAt}</p></div><StatusBadge status={device.status} /></div>)}</div>
    </section>
  );
}
