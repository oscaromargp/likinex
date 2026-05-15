'use client';

import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    const theme = localStorage.getItem('likinex_theme');
    const isLight = theme === 'light' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
    
    if (isLight) {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, []);

  return null;
}
