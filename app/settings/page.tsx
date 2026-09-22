'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/shared/PageHeader';
import { usePreferences } from '@/contexts/AppPreferences';

export default function SettingsPage() {
  const { language, setLanguage, theme, setTheme, t } = usePreferences();
  return <div className="space-y-6">
    <PageHeader title={t.settings.title} description={t.settings.desc}/>
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"><h2 className="text-base font-semibold text-ink">{t.settings.appearance}</h2><p className="mt-1 text-sm text-muted">{t.settings.appearanceDesc}</p><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => setTheme('light')} className={`flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left transition ${theme === 'light' ? 'border-brand bg-brand/5 text-ink' : 'border-line bg-surface-soft text-muted hover:text-ink'}`}><SunIcon className="h-5 w-5"/><span className="text-sm font-semibold">{t.common.light}</span></button><button type="button" onClick={() => setTheme('dark')} className={`flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left transition ${theme === 'dark' ? 'border-brand bg-brand/5 text-ink' : 'border-line bg-surface-soft text-muted hover:text-ink'}`}><MoonIcon className="h-5 w-5"/><span className="text-sm font-semibold">{t.common.dark}</span></button></div></section>
      <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"><h2 className="text-base font-semibold text-ink">{t.settings.language}</h2><p className="mt-1 text-sm text-muted">{t.settings.languageDesc}</p><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => setLanguage('en')} className={`min-h-14 rounded-xl border p-3 text-left transition ${language === 'en' ? 'border-brand bg-brand/5 text-ink' : 'border-line bg-surface-soft text-muted hover:text-ink'}`}><span className="text-sm font-semibold">English</span><span className="ml-2 text-xs text-muted">EN</span></button><button type="button" onClick={() => setLanguage('th')} className={`min-h-14 rounded-xl border p-3 text-left transition ${language === 'th' ? 'border-brand bg-brand/5 text-ink' : 'border-line bg-surface-soft text-muted hover:text-ink'}`}><span className="text-sm font-semibold">ภาษาไทย</span><span className="ml-2 text-xs text-muted">TH</span></button></div></section>
    </div>
    <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"><h2 className="text-base font-semibold text-ink">{t.settings.workspace}</h2><p className="mt-1 text-sm text-muted">{t.settings.workspaceDesc}</p><dl className="mt-5 divide-y divide-line rounded-xl border border-line bg-surface-soft px-4"><div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-muted">{t.settings.workspaceName}</dt><dd className="text-sm font-semibold text-ink">Tinamics Lab</dd></div><div className="flex items-center justify-between gap-4 py-4"><dt className="text-sm text-muted">{t.settings.mode}</dt><dd className="text-sm font-semibold text-ink">{t.settings.mockData}</dd></div></dl><p className="mt-4 text-xs text-muted">{t.settings.note}</p></section>
  </div>;
}
