'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'cyan' | 'emerald' | 'amber' | 'violet' | 'monochrome';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  hex: string;
  rgb: string;
  glow: string;
  border: string;
  bgSubtle: string;
  tag: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    hex: '#00F0FF',
    rgb: '0 240 255',
    glow: '0 0 28px rgba(0, 240, 255, 0.4)',
    border: 'rgba(0, 240, 255, 0.45)',
    bgSubtle: 'rgba(0, 240, 255, 0.1)',
    tag: 'Аэрокосмический титан',
  },
  emerald: {
    id: 'emerald',
    name: 'Phosphor Emerald',
    hex: '#10B981',
    rgb: '16 185 129',
    glow: '0 0 28px rgba(16, 185, 129, 0.4)',
    border: 'rgba(16, 185, 129, 0.45)',
    bgSubtle: 'rgba(16, 185, 129, 0.1)',
    tag: 'Тактический зеленый',
  },
  amber: {
    id: 'amber',
    name: 'Porsche Amber',
    hex: '#F59E0B',
    rgb: '245 158 11',
    glow: '0 0 28px rgba(245, 158, 11, 0.4)',
    border: 'rgba(245, 158, 11, 0.45)',
    bgSubtle: 'rgba(245, 158, 11, 0.1)',
    tag: 'Автоспорт GT',
  },
  violet: {
    id: 'violet',
    name: 'Neon Violet',
    hex: '#A855F7',
    rgb: '168 85 247',
    glow: '0 0 28px rgba(168, 85, 247, 0.4)',
    border: 'rgba(168, 85, 247, 0.45)',
    bgSubtle: 'rgba(168, 85, 247, 0.1)',
    tag: 'Киберпанк',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Titanium Stealth',
    hex: '#F1F5F9',
    rgb: '241 245 249',
    glow: '0 0 28px rgba(255, 255, 255, 0.25)',
    border: 'rgba(255, 255, 255, 0.35)',
    bgSubtle: 'rgba(255, 255, 255, 0.1)',
    tag: 'Матовый монохром',
  },
};

interface ThemeContextType {
  activeTheme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  activeTheme: THEMES.cyan,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('cyan');

  const applyTheme = (theme: ThemeConfig) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--accent-color', theme.hex);
    root.style.setProperty('--accent-rgb', theme.rgb);
    root.style.setProperty('--accent-glow', theme.glow);
    root.style.setProperty('--accent-border', theme.border);
    root.style.setProperty('--accent-bg-subtle', theme.bgSubtle);
  };

  const setTheme = (id: ThemeId) => {
    const theme = THEMES[id] || THEMES.cyan;
    setCurrentThemeId(id);
    applyTheme(theme);
  };

  useEffect(() => {
    applyTheme(THEMES.cyan);
  }, []);

  return (
    <ThemeContext.Provider value={{ activeTheme: THEMES[currentThemeId], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
