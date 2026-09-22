'use client';

import { BellIcon, BoltIcon, Cog6ToothIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { usePreferences } from '@/contexts/AppPreferences';

export function TopHeader() {
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6 lg:ml-[232px] lg:px-8">
      <div className="flex min-w-0 items-center gap-3 lg:hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white"><BoltIcon className="h-5 w-5" /></div>
        <div className="hidden min-w-0 sm:block"><p className="truncate text-sm font-bold text-ink">Tinamics Energy</p><p className="truncate text-[10px] text-muted">{t.header.smartMonitoring}</p></div>
      </div>
      <div className="hidden lg:block"><p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{t.header.energyOperations}</p></div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="inline-flex h-10 items-center rounded-xl border border-line bg-surface p-1" aria-label={t.common.language}>
          <button type="button" onClick={() => setLanguage('en')} className={`h-8 rounded-lg px-2 text-[11px] font-bold transition ${language === 'en' ? 'bg-surface-soft text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>EN</button>
          <span className="text-[10px] text-line">|</span>
          <button type="button" onClick={() => setLanguage('th')} className={`h-8 rounded-lg px-2 text-[11px] font-bold transition ${language === 'th' ? 'bg-surface-soft text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>TH</button>
        </div>
        <button type="button" onClick={toggleTheme} aria-label={theme === 'light' ? t.common.dark : t.common.light} title={theme === 'light' ? t.common.dark : t.common.light} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:bg-surface-soft hover:text-ink">
          {theme === 'light' ? <MoonIcon className="h-5 w-5"/> : <SunIcon className="h-5 w-5"/>}
        </button>
        <a href="/notifications" aria-label={t.header.notifications} title={t.header.notifications} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:bg-surface-soft hover:text-ink">
          <BellIcon className="h-5 w-5"/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand ring-2 ring-surface" />
        </a>
        <a href="/settings" aria-label={t.header.settings} title={t.header.settings} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:bg-surface-soft hover:text-ink lg:hidden"><Cog6ToothIcon className="h-5 w-5"/></a>
        <div className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-2.5 py-1.5 xl:flex"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">TL</div><div className="pr-1"><p className="text-xs font-semibold text-ink">Tinamics Lab</p><p className="text-[10px] text-muted">{t.header.workspace}</p></div></div>
      </div>
    </header>
  );
}
