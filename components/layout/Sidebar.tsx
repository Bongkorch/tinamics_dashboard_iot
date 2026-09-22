'use client';

import { usePathname } from 'next/navigation';
import { BellAlertIcon, BellIcon, BoltIcon, BuildingOffice2Icon, CloudIcon, Cog6ToothIcon, CpuChipIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/contexts/AppPreferences';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = usePreferences();
  const items = [
    { href: '/', label: t.nav.dashboard, icon: Squares2X2Icon },
    { href: '/plants', label: t.nav.plants, icon: BuildingOffice2Icon },
    { href: '/temperature', label: t.nav.temperature, icon: CloudIcon },
    { href: '/devices', label: t.nav.devices, icon: CpuChipIcon },
    { href: '/alerts', label: t.nav.alerts, icon: BellAlertIcon },
    { href: '/notifications', label: t.nav.notifications, icon: BellIcon },
    { href: '/settings', label: t.nav.settings, icon: Cog6ToothIcon },
  ];
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] border-r border-line bg-surface lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-line px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white"><BoltIcon className="h-5 w-5" /></div>
        <div><p className="text-sm font-bold tracking-tight text-ink">Tinamics Energy</p><p className="text-[10px] uppercase tracking-[0.18em] text-muted">{t.sidebar.console}</p></div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return <a key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', active ? 'bg-brand/10 text-brand' : 'text-muted hover:bg-surface-soft hover:text-ink')}><Icon className="h-5 w-5" />{item.label}</a>;
        })}
      </nav>
      <div className="border-t border-line p-4"><div className="rounded-xl bg-surface-soft p-3"><p className="text-xs font-semibold text-ink">{t.sidebar.prototype}</p><p className="mt-1 text-[11px] leading-4 text-muted">{t.sidebar.prototypeDesc}</p></div></div>
    </aside>
  );
}
