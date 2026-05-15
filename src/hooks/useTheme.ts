'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light' | 'system';

const THEME_KEY = 'likinex_theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const initialTheme = saved || 'dark';
    setThemeState(initialTheme);
    setResolvedTheme(initialTheme === 'system' ? getSystemTheme() : initialTheme);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyTheme = (t: Theme) => {
      const resolved = t === 'system' ? getSystemTheme() : t;
      setResolvedTheme(resolved);

      if (resolved === 'light') {
        document.documentElement.classList.add('theme-light');
      } else {
        document.documentElement.classList.remove('theme-light');
      }
    };

    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        setResolvedTheme(getSystemTheme());
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }, []);

  return { theme, setTheme, resolvedTheme };
}
