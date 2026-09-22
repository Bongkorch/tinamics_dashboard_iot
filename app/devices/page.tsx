'use client';

import { devices } from '@/data/mock';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePreferences } from '@/contexts/AppPreferences';

export default function DevicesPage() {
  const { t } = usePreferences();
  return <div className="space-y-6"><PageHeader title={t.devices.title} description={t.devices.desc}/><div className="rounded-card border border-line bg-surface shadow-card"><div className="hidden grid-cols-[1.2fr_1fr_.8fr_1fr_.8fr] gap-4 border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted md:grid"><span>{t.devices.device}</span><span>{t.devices.model}</span><span>{t.devices.status}</span><span>{t.devices.primaryValue}</span><span>{t.devices.updated}</span></div><div className="divide-y divide-line">{devices.map((item)=><article key={item.id} className="grid gap-3 p-5 md:grid-cols-[1.2fr_1fr_.8fr_1fr_.8fr] md:items-center md:gap-4"><div><p className="text-sm font-semibold text-ink">{item.name}</p><p className="mt-0.5 text-xs text-muted md:hidden">{item.type}</p></div><p className="text-xs text-muted md:text-sm">{item.model}</p><div><StatusBadge status={item.status}/></div><div><p className="text-sm font-semibold text-ink">{item.primaryValue}</p><p className="mt-0.5 text-xs text-muted md:hidden">{item.secondaryValue}</p></div><p className="text-xs text-muted">{item.updatedAt}</p></article>)}</div></div></div>;
}
