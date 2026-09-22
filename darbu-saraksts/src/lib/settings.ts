/* ============================================================================
   Lietotāja iestatījumi (glabājas šajā ierīcē — localStorage).
   ========================================================================= */

import type { SortMode } from './types';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Density = 'compact' | 'cozy';
export type DueMode = 'never' | 'overdue' | 'always';

export type Settings = {
  theme: ThemeMode;
  density: Density;
  /** Rādīt piezīmes zem darba nosaukuma */
  showNotes: boolean;
  /** Kad rādīt termiņu sarakstā */
  showDue: DueMode;
  /** Prioritāti attēlot ar krāsainu svītru */
  priorityColor: boolean;
  /** Rādīt izpildīto darbu sadaļu saraksta apakšā */
  showDone: boolean;
  /** Rādīt neizpildīto darbu skaitu uz sadaļu cilnēm */
  showCounts: boolean;
  sort: SortMode;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  density: 'compact',
  showNotes: false,
  showDue: 'never',
  priorityColor: true,
  showDone: true,
  showCounts: true,
  sort: 'priority',
};

const KEY = 'ds.settings';

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* localStorage var nebūt pieejams */
  }
}

/** Uzstāda gaišo/tumšo režīmu uz <html> elementa. */
export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}
