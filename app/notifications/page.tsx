'use client';

import { useState } from 'react';
import { BellIcon, ChartBarSquareIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/shared/PageHeader';
import { usePreferences } from '@/contexts/AppPreferences';

export default function NotificationsPage() {
  const { t } = usePreferences();
  const [read, setRead] = useState<string[]>(['n3']);
  const items = [
    { id: 'n1', type: t.notifications.system, title: t.notifications.n1Title, body: t.notifications.n1Body, time: '5 min ago', icon: BellIcon },
    { id: 'n2', type: t.notifications.maintenance, title: t.notifications.n2Title, body: t.notifications.n2Body, time: '12 min ago', icon: WrenchScrewdriverIcon },
    { id: 'n3', type: t.notifications.report, title: t.notifications.n3Title, body: t.notifications.n3Body, time: '1 hr ago', icon: ChartBarSquareIcon },
  ];
  const unread = items.filter((item) => !read.includes(item.id)).length;
  return <div className="space-y-6">
    <PageHeader title={t.notifications.title} description={t.notifications.desc} action={<button type="button" onClick={() => setRead(items.map((item) => item.id))} className="text-sm font-semibold text-brand">{t.notifications.markAll}</button>}/>
    <section className="rounded-card border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4"><p className="text-sm font-semibold text-ink">{t.notifications.unread}</p><span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">{unread}</span></div>
      <div className="divide-y divide-line">{items.map((item) => { const Icon = item.icon; const isRead = read.includes(item.id); return <button type="button" key={item.id} onClick={() => setRead((current) => current.includes(item.id) ? current : [...current, item.id])} className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-surface-soft"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-soft text-muted"><Icon className="h-5 w-5"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-brand">{item.type}</span>{!isRead && <span className="h-2 w-2 rounded-full bg-brand"/>}</div><h2 className="mt-1 text-sm font-semibold text-ink">{item.title}</h2><p className="mt-1 text-sm leading-5 text-muted">{item.body}</p><p className="mt-2 text-xs text-muted">{item.time}</p></div></button>; })}</div>
    </section>
  </div>;
}
