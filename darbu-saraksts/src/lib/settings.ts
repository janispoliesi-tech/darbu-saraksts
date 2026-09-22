/* ============================================================================
   Lietotāja iestatījumi.
   Glabājas gan šajā ierīcē (ātrai ielādei), gan kontā (lai seko līdzi
   citās ierīcēs) — sk. AppShell.tsx.
   ========================================================================= */

import type { SortMode } from './types';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Density = 'compact' | 'cozy';
export type DueMode = 'never' | 'overdue' | 'always';
export type TextSize = 'small' | 'normal' | 'large';
export type AccentKey =
  | 'teal' | 'green' | 'amber' | 'orange' | 'red' | 'pink' | 'violet' | 'blue' | 'slate';

export const ACCENTS: { key: AccentKey; label: string }[] = [
  { key: 'teal', label: 'Tirkīza' },
  { key: 'green', label: 'Zaļa' },
  { key: 'amber', label: 'Dzintara' },
  { key: 'orange', label: 'Oranža' },
  { key: 'red', label: 'Sarkana' },
  { key: 'pink', label: 'Rozā' },
  { key: 'violet', label: 'Violeta' },
  { key: 'blue', label: 'Zila' },
  { key: 'slate', label: 'Grafīta' },
];

export type Settings = {
  theme: ThemeMode;
  /** Aplikācijas pamatkrāsa — pogas, ķeksīši, izceltie elementi */
  accent: AccentKey;
  /** Teksta izmērs sarakstā */
  textSize: TextSize;
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
  accent: 'teal',
  textSize: 'normal',
  density: 'compact',
  showNotes: false,
  showDue: 'never',
  priorityColor: true,
  showDone: true,
  showCounts: true,
  sort: 'priority',
};

const KEY = 'ds.settings';

/** Atmet svešas vai bojātas vērtības, lai izskats nekad nesalūztu. */
export function normalizeSettings(raw: unknown): Settings {
  const s = (raw ?? {}) as Partial<Settings>;
  const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(v as T) ? (v as T) : fallback;

  return {
    theme: pick(s.theme, ['system', 'light', 'dark'] as const, DEFAULT_SETTINGS.theme),
    accent: pick(s.accent, ACCENTS.map((a) => a.key) as AccentKey[], DEFAULT_SETTINGS.accent),
    textSize: pick(s.textSize, ['small', 'normal', 'large'] as const, DEFAULT_SETTINGS.textSize),
    density: pick(s.density, ['compact', 'cozy'] as const, DEFAULT_SETTINGS.density),
    showNotes: typeof s.showNotes === 'boolean' ? s.showNotes : DEFAULT_SETTINGS.showNotes,
    showDue: pick(s.showDue, ['never', 'overdue', 'always'] as const, DEFAULT_SETTINGS.showDue),
    priorityColor:
      typeof s.priorityColor === 'boolean' ? s.priorityColor : DEFAULT_SETTINGS.priorityColor,
    showDone: typeof s.showDone === 'boolean' ? s.showDone : DEFAULT_SETTINGS.showDone,
    showCounts: typeof s.showCounts === 'boolean' ? s.showCounts : DEFAULT_SETTINGS.showCounts,
    sort: pick(s.sort, ['priority', 'due', 'added'] as const, DEFAULT_SETTINGS.sort),
  };
}

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return normalizeSettings(JSON.parse(raw));
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

/** Uzstāda tēmu, pamatkrāsu un teksta izmēru uz <html> elementa. */
export function applyAppearance(s: Settings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (s.theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', s.theme);

  root.setAttribute('data-accent', s.accent);
  root.setAttribute('data-text', s.textSize);
}
