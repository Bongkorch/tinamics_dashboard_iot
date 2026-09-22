'use client';

import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { TopHeader } from './TopHeader';
import { AppPreferencesProvider } from '@/contexts/AppPreferences';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppPreferencesProvider>
      <Sidebar />
      <TopHeader />
      <main className="min-h-[calc(100vh-64px)] px-4 pb-24 pt-6 sm:px-6 lg:ml-[232px] lg:px-8 lg:pb-10">
        <div className="mx-auto max-w-[1500px]">{children}</div>
      </main>
      <MobileNav />
    </AppPreferencesProvider>
  );
}
