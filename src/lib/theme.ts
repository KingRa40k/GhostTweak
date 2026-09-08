// Personalization & Customization Manager for GhostTweak
// Stores preferences in localStorage and applies dynamic CSS variables

export type ThemeId = 'cyan' | 'emerald' | 'amber' | 'violet' | 'monochrome';
export type AvatarId = 'ghost' | 'falcon' | 'vortex' | 'crosshair' | 'crown';
export type SoundStyle = 'mechanical' | 'soft' | 'scifi' | 'mute';
export type Language = 'ru' | 'en';

export interface ThemePreset {
  id: ThemeId;
  name: string;
  hex: string;
  rgb: string;
  glow: string;
  border: string;
  bgSubtle: string;
  tag: string;
}

export const THEMES: Record<ThemeId, ThemePreset> = {
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    hex: '#00f0ff',
    rgb: '0 240 255',
    glow: '0 0 24px rgba(0, 240, 255, 0.35)',
    border: 'rgba(0, 240, 255, 0.4)',
    bgSubtle: 'rgba(0, 240, 255, 0.12)',
    tag: 'Аэрокосмический титан',
  },
  emerald: {
    id: 'emerald',
    name: 'Phosphor Emerald',
    hex: '#10b981',
    rgb: '16 185 129',
    glow: '0 0 24px rgba(16, 185, 129, 0.35)',
    border: 'rgba(16, 185, 129, 0.4)',
    bgSubtle: 'rgba(16, 185, 129, 0.12)',
    tag: 'Тактический зеленый',
  },
  amber: {
    id: 'amber',
    name: 'Porsche Amber',
    hex: '#f59e0b',
    rgb: '245 158 11',
    glow: '0 0 24px rgba(245, 158, 11, 0.35)',
    border: 'rgba(245, 158, 11, 0.4)',
    bgSubtle: 'rgba(245, 158, 11, 0.12)',
    tag: 'Автоспорт GT',
  },
  violet: {
    id: 'violet',
    name: 'Neon Violet',
    hex: '#a855f7',
    rgb: '168 85 247',
    glow: '0 0 24px rgba(168, 85, 247, 0.35)',
    border: 'rgba(168, 85, 247, 0.4)',
    bgSubtle: 'rgba(168, 85, 247, 0.12)',
    tag: 'Киберпанк',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Titanium Stealth',
    hex: '#f1f5f9',
    rgb: '241 245 249',
    glow: '0 0 24px rgba(255, 255, 255, 0.25)',
    border: 'rgba(255, 255, 255, 0.35)',
    bgSubtle: 'rgba(255, 255, 255, 0.12)',
    tag: 'Матовый монохром',
  },
};

export interface UserPreferences {
  themeId: ThemeId;
  callsign: string;
  avatar: AvatarId;
  refreshRate: number;
  soundStyle: SoundStyle;
  soundVolume: number;
  lang: Language;
  activeProfile: 'esports' | 'cinematic' | 'streamer' | 'quiet';
}

const STORAGE_KEY = 'ghosttweak_user_prefs_v2';

const DEFAULT_PREFERENCES: UserPreferences = {
  themeId: 'cyan',
  callsign: 'OPERATOR-01',
  avatar: 'ghost',
  refreshRate: 60, // Universal baseline until real display hardware probe completes
  soundStyle: 'mechanical',
  soundVolume: 80,
  lang: 'ru',
  activeProfile: 'esports',
};

export function getPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  applyThemeToCss(prefs.themeId);
  try {
    window.dispatchEvent(new CustomEvent('ghosttweak:prefs-changed', { detail: prefs }));
  } catch {}
}

// Applies active theme colors as CSS root variables and dispatches event
export function applyThemeToCss(themeId: ThemeId): void {
  const theme = THEMES[themeId] || THEMES.cyan;
  const root = document.documentElement;
  root.style.setProperty('--accent-color', theme.hex);
  root.style.setProperty('--accent-rgb', theme.rgb);
  root.style.setProperty('--accent-glow', theme.glow);
  root.style.setProperty('--accent-border', theme.border);
  root.style.setProperty('--accent-bg-subtle', theme.bgSubtle);

  // Notify any active React listener
  try {
    window.dispatchEvent(new CustomEvent('ghosttweak:theme-changed', { detail: theme }));
  } catch {}
}

// Calculate frame budget based on monitor Hz
export function calculateFrameBudget(hz: number): string {
  if (hz <= 0) return '16.6ms';
  const ms = (1000 / hz).toFixed(2);
  return `${ms}ms`;
}
