'use client';

import { usePathname } from 'next/navigation';
import { BellAlertIcon, BuildingOffice2Icon, CpuChipIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/contexts/AppPreferences';

export function MobileNav() {
  const pathname = usePathname();
  const { t } = usePreferences();
  const items = [
    { href: '/', label: t.nav.home, icon: Squares2X2Icon },
    { href: '/plants', label: t.nav.plants, icon: BuildingOffice2Icon },
    { href: '/devices', label: t.nav.devices, icon: CpuChipIcon },
    { href: '/alerts', label: t.nav.alerts, icon: BellAlertIcon },
  ];
  return <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[68px] grid-cols-4 border-t border-line bg-surface/95 px-2 backdrop-blur lg:hidden">{items.map((item) => { const Icon = item.icon; const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href); return <a key={item.href} href={item.href} className={cn('flex flex-col items-center justify-center gap-1 text-[10px] font-semibold', active ? 'text-brand' : 'text-muted')}><Icon className="h-5 w-5"/><span>{item.label}</span></a>; })}</nav>;
}
