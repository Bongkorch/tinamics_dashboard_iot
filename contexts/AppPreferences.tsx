'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from '@/locales/en';
import { th } from '@/locales/th';

type Language = 'en' | 'th';
type Theme = 'light' | 'dark';
type Dictionary = typeof en | typeof th;

type PreferencesContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: Dictionary;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('tinamics-language') as Language | null;
    const savedTheme = window.localStorage.getItem('tinamics-theme') as Theme | null;
    if (savedLanguage === 'en' || savedLanguage === 'th') setLanguageState(savedLanguage);
    if (savedTheme === 'light' || savedTheme === 'dark') setThemeState(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
    window.localStorage.setItem('tinamics-language', value);
  };

  const setTheme = (value: Theme) => {
    setThemeState(value);
    window.localStorage.setItem('tinamics-theme', value);
  };

  const value = useMemo(() => ({ language, setLanguage, theme, setTheme, toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'), t: language === 'th' ? th : en }), [language, theme]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside AppPreferencesProvider');
  return context;
}
