import type { Priority, SortMode } from './types';
import { COLORS, COLOR_KEYS, isHexColor, readableOn, type ColorKey } from './colors';

export type ThemeMode = 'system' | 'light' | 'dark' | 'black';
export type AccentKey = ColorKey | 'custom';
export type Surface = 'neutral' | 'warm' | 'cool' | 'tinted';
export type Contrast = 'normal' | 'high';
export type FontKey = 'system' | 'inter' | 'roboto' | 'nunito' | 'montserrat' | 'serif' | 'mono';
export type TitleWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type Radius = 'none' | 'small' | 'medium' | 'round';
export type Density = 'tight' | 'compact' | 'cozy' | 'spacious';
export type ContentWidth = 'narrow' | 'normal' | 'wide' | 'full';
export type ListStyle = 'block' | 'cards' | 'plain';
export type Dividers = 'lines' | 'zebra' | 'none';
export type TickShape = 'square' | 'circle';
export type HeaderStyle = 'glass' | 'solid' | 'accent';
export type TabStyle = 'pills' | 'underline' | 'filled';
export type DueMode = 'never' | 'overdue' | 'always';
export type DateStyle = 'text' | 'numeric' | 'relative';
export type PriorityStyle = 'bar' | 'dot' | 'tint' | 'tick' | 'off';
export type NotesMode = 'icon' | 'one' | 'two' | 'all';
export type DoneStyle = 'strike' | 'fade';
export type RowActions = 'always' | 'hover' | 'hidden';
export type StartView = 'home' | 'last';

export const ACCENTS = COLORS;

export const FONTS: { key: FontKey; label: string; stack: string }[] = [
  {
    key: 'system',
    label: 'Sistēmas',
    stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  },
  { key: 'inter', label: 'Inter', stack: "'Inter Variable', system-ui, sans-serif" },
  { key: 'roboto', label: 'Roboto', stack: "'Roboto Variable', system-ui, sans-serif" },
  { key: 'nunito', label: 'Nunito', stack: "'Nunito Variable', system-ui, sans-serif" },
  { key: 'montserrat', label: 'Montserrat', stack: "'Montserrat Variable', system-ui, sans-serif" },
  { key: 'serif', label: 'Source Serif', stack: "'Source Serif 4 Variable', Georgia, serif" },
  { key: 'mono', label: 'JetBrains Mono', stack: "'JetBrains Mono Variable', ui-monospace, Menlo, Consolas, monospace" },
];

export const FONT_SCALE = { min: 0.85, max: 1.3, step: 0.05 };

const WEIGHTS: Record<TitleWeight, number> = { normal: 400, medium: 500, semibold: 600, bold: 700 };

export type Settings = {
  theme: ThemeMode;
  accent: AccentKey;
  customAccent: string;
  surface: Surface;
  contrast: Contrast;
  sectionAccent: boolean;
  font: FontKey;
  fontScale: number;
  titleWeight: TitleWeight;
  radius: Radius;
  density: Density;
  width: ContentWidth;
  listStyle: ListStyle;
  dividers: Dividers;
  tickShape: TickShape;
  header: HeaderStyle;
  tabStyle: TabStyle;
  tabIcons: boolean;
  motion: boolean;
  sort: SortMode;
  showDue: DueMode;
  dateStyle: DateStyle;
  priorityStyle: PriorityStyle;
  notes: NotesMode;
  rowActions: RowActions;
  showDone: boolean;
  doneCollapsed: boolean;
  doneStyle: DoneStyle;
  showCounts: boolean;
  defaultPriority: Priority;
  confirmDelete: boolean;
  startView: StartView;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  accent: 'teal',
  customAccent: '#0d8a7e',
  surface: 'neutral',
  contrast: 'normal',
  sectionAccent: false,
  font: 'system',
  fontScale: 1,
  titleWeight: 'bold',
  radius: 'small',
  density: 'compact',
  width: 'normal',
  listStyle: 'block',
  dividers: 'lines',
  tickShape: 'square',
  header: 'glass',
  tabStyle: 'pills',
  tabIcons: true,
  motion: true,
  sort: 'priority',
  showDue: 'never',
  dateStyle: 'text',
  priorityStyle: 'bar',
  notes: 'icon',
  rowActions: 'always',
  showDone: true,
  doneCollapsed: false,
  doneStyle: 'strike',
  showCounts: true,
  defaultPriority: 2,
  confirmDelete: false,
  startView: 'home',
};

type ChoiceKey = {
  [K in keyof Settings]: Settings[K] extends string ? K : never;
}[keyof Settings];

const CHOICES: { [K in ChoiceKey]: readonly string[] } = {
  theme: ['system', 'light', 'dark', 'black'],
  accent: [...COLOR_KEYS, 'custom'],
  customAccent: [],
  surface: ['neutral', 'warm', 'cool', 'tinted'],
  contrast: ['normal', 'high'],
  font: FONTS.map((f) => f.key),
  titleWeight: ['normal', 'medium', 'semibold', 'bold'],
  radius: ['none', 'small', 'medium', 'round'],
  density: ['tight', 'compact', 'cozy', 'spacious'],
  width: ['narrow', 'normal', 'wide', 'full'],
  listStyle: ['block', 'cards', 'plain'],
  dividers: ['lines', 'zebra', 'none'],
  tickShape: ['square', 'circle'],
  header: ['glass', 'solid', 'accent'],
  tabStyle: ['pills', 'underline', 'filled'],
  sort: ['priority', 'due', 'added', 'newest', 'alpha'],
  showDue: ['never', 'overdue', 'always'],
  dateStyle: ['text', 'numeric', 'relative'],
  priorityStyle: ['bar', 'dot', 'tint', 'tick', 'off'],
  notes: ['icon', 'one', 'two', 'all'],
  rowActions: ['always', 'hover', 'hidden'],
  doneStyle: ['strike', 'fade'],
  startView: ['home', 'last'],
};

type LegacySettings = {
  textSize?: unknown;
  priorityColor?: unknown;
  showNotes?: unknown;
};

function fromLegacy(s: Record<string, unknown> & LegacySettings): Record<string, unknown> {
  const out = { ...s };
  if (out.fontScale === undefined && typeof s.textSize === 'string') {
    out.fontScale = ({ small: 0.9, normal: 1, large: 1.15 } as Record<string, number>)[s.textSize];
  }
  if (out.priorityStyle === undefined && typeof s.priorityColor === 'boolean') {
    out.priorityStyle = s.priorityColor ? 'bar' : 'off';
  }
  if (out.notes === undefined && typeof s.showNotes === 'boolean') {
    out.notes = s.showNotes ? 'two' : 'icon';
  }
  return out;
}

function clampScale(v: unknown): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return DEFAULT_SETTINGS.fontScale;
  const stepped = Math.round(v / FONT_SCALE.step) * FONT_SCALE.step;
  return Math.min(FONT_SCALE.max, Math.max(FONT_SCALE.min, Number(stepped.toFixed(2))));
}

export function normalizeSettings(raw: unknown): Settings {
  const s = fromLegacy((raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>);
  const out = { ...DEFAULT_SETTINGS } as Record<string, unknown>;

  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
    const def = DEFAULT_SETTINGS[key];
    const v = s[key];
    if (typeof def === 'boolean') {
      if (typeof v === 'boolean') out[key] = v;
    } else if (typeof def === 'string' && key in CHOICES) {
      if (CHOICES[key as ChoiceKey].includes(v as string)) out[key] = v;
    }
  }

  out.customAccent = isHexColor(s.customAccent) ? s.customAccent.toLowerCase() : DEFAULT_SETTINGS.customAccent;
  out.fontScale = clampScale(s.fontScale);
  out.defaultPriority = [1, 2, 3].includes(s.defaultPriority as number)
    ? s.defaultPriority
    : DEFAULT_SETTINGS.defaultPriority;

  return out as Settings;
}

const LOOK_KEYS = [
  'radius', 'density', 'listStyle', 'dividers', 'tickShape', 'header', 'tabStyle',
  'tabIcons', 'titleWeight', 'fontScale', 'contrast', 'priorityStyle', 'rowActions',
] as const;

type Look = Pick<Settings, (typeof LOOK_KEYS)[number]>;

const BASE_LOOK = Object.fromEntries(LOOK_KEYS.map((k) => [k, DEFAULT_SETTINGS[k]])) as Look;

export const PRESETS: { key: string; label: string; hint: string; look: Look }[] = [
  { key: 'default', label: 'Noklusētais', hint: 'Nedaudz noapaļots, trekns teksts', look: BASE_LOOK },
  {
    key: 'minimal',
    label: 'Minimālisms',
    hint: 'Bez rāmjiem, taisni stūri',
    look: {
      ...BASE_LOOK, radius: 'none', listStyle: 'plain', header: 'solid', tabStyle: 'underline',
      tabIcons: false, titleWeight: 'medium', priorityStyle: 'dot', rowActions: 'hover',
    },
  },
  {
    key: 'soft',
    label: 'Mīksts',
    hint: 'Apaļas formas, atsevišķas kartītes',
    look: {
      ...BASE_LOOK, radius: 'round', density: 'cozy', listStyle: 'cards', tickShape: 'circle',
      titleWeight: 'semibold', priorityStyle: 'tick',
    },
  },
  {
    key: 'bold',
    label: 'Liels un skaidrs',
    hint: 'Liels teksts, augsts kontrasts',
    look: {
      ...BASE_LOOK, fontScale: 1.2, density: 'cozy', contrast: 'high', header: 'accent', tabStyle: 'filled',
    },
  },
  {
    key: 'dense',
    label: 'Blīvs',
    hint: 'Maksimāli daudz darbu ekrānā',
    look: {
      ...BASE_LOOK, fontScale: 0.9, density: 'tight', dividers: 'zebra', tabIcons: false,
      titleWeight: 'semibold', rowActions: 'hover',
    },
  },
];

export function presetMatches(s: Settings, look: Look): boolean {
  return LOOK_KEYS.every((k) => s[k] === look[k]);
}

const KEY = 'ds.settings';

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalizeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function applyAppearance(s: Settings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const attrs: Record<string, string | null> = {
    'data-theme': s.theme === 'system' ? null : s.theme,
    'data-accent': s.accent,
    'data-surface': s.surface,
    'data-contrast': s.contrast,
    'data-radius': s.radius,
    'data-density': s.density,
    'data-width': s.width,
    'data-list': s.listStyle,
    'data-dividers': s.dividers,
    'data-tick': s.tickShape,
    'data-header': s.header,
    'data-tabs': s.tabStyle,
    'data-tab-icons': s.tabIcons ? 'on' : 'off',
    'data-motion': s.motion ? 'on' : 'off',
    'data-prio': s.priorityStyle,
    'data-notes': s.notes,
    'data-done': s.doneStyle,
    'data-actions': s.rowActions,
  };
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null) root.removeAttribute(name);
    else root.setAttribute(name, value);
  }

  root.style.setProperty('--fs', String(s.fontScale));
  root.style.setProperty('--title-weight', String(WEIGHTS[s.titleWeight]));
  root.style.setProperty('--font', FONTS.find((f) => f.key === s.font)?.stack ?? FONTS[0].stack);

  if (s.accent === 'custom') {
    root.style.setProperty('--accent', s.customAccent);
    root.style.setProperty('--accent-text', readableOn(s.customAccent));
  } else {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-text');
  }
}
