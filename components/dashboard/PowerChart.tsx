'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { powerSeries } from '@/data/mock';
import { usePreferences } from '@/contexts/AppPreferences';

export function PowerChart() {
  const { t } = usePreferences();
  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-ink">{t.dashboard.powerToday}</h2><p className="mt-1 text-xs text-muted">{t.dashboard.chartDesc}</p></div><div className="flex items-center gap-3 text-xs text-muted"><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400"/>{t.dashboard.solar}</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-600"/>{t.dashboard.load}</span></div></div>
      <div className="mt-5 h-[260px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={powerSeries} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}><defs><linearGradient id="solarFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f4b942" stopOpacity={0.22}/><stop offset="95%" stopColor="#f4b942" stopOpacity={0}/></linearGradient><linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2b9ba5" stopOpacity={0.15}/><stop offset="95%" stopColor="#2b9ba5" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)"/><XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false}/><YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ borderRadius: 12, borderColor: 'var(--tooltip-border)', background: 'var(--tooltip-bg)', color: 'var(--text-primary)', boxShadow: '0 8px 24px rgba(0,0,0,.08)', fontSize: 12 }}/><Area type="monotone" dataKey="solar" stroke="#d79b24" fill="url(#solarFill)" strokeWidth={2}/><Area type="monotone" dataKey="load" stroke="#2b9ba5" fill="url(#loadFill)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
    </section>
  );
}
