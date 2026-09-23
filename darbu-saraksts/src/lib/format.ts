import type { Section, SortMode, Task } from './types';
import type { DateStyle } from './settings';

function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

const MONTHS = [
  'janv.', 'febr.', 'martā', 'apr.', 'maijā', 'jūn.',
  'jūl.', 'aug.', 'sept.', 'okt.', 'nov.', 'dec.',
];

export function formatDue(iso: string, style: DateStyle = 'text'): string {
  const today = todayISO();
  const diff = daysBetween(today, iso);
  if (diff === 0) return 'Šodien';
  if (diff === 1) return 'Rīt';
  if (diff === -1) return 'Vakar';

  if (style === 'relative') {
    const n = Math.abs(diff);
    const span =
      n < 14 ? `${n} d.`
      : n < 60 ? `${Math.round(n / 7)} ned.`
      : n < 365 ? `${Math.round(n / 30)} mēn.`
      : `${Math.round(n / 365)} g.`;
    return diff > 0 ? `pēc ${span}` : `pirms ${span}`;
  }

  const [y, m, d] = iso.split('-').map(Number);
  const sameYear = y === Number(today.slice(0, 4));

  if (style === 'numeric') {
    const dm = `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.`;
    return sameYear ? dm : `${dm}${y}.`;
  }

  const label = `${d}. ${MONTHS[(m || 1) - 1]}`;
  return sameYear ? label : `${label} ${y}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  const a = Date.parse(`${fromISO}T00:00:00`);
  const b = Date.parse(`${toISO}T00:00:00`);
  return Math.round((b - a) / 86400000);
}

export function dueState(iso: string | null): 'none' | 'overdue' | 'today' | 'future' {
  if (!iso) return 'none';
  const diff = daysBetween(todayISO(), iso);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  return 'future';
}

export function sortTasks(list: Task[], mode: SortMode): Task[] {
  const copy = [...list];
  copy.sort((a, b) => {
    if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;

    if (a.is_done && b.is_done) {
      return (b.done_at ?? b.created_at).localeCompare(a.done_at ?? a.created_at);
    }

    if (mode === 'alpha') {
      const byName = a.title.localeCompare(b.title, 'lv', { sensitivity: 'base' });
      if (byName !== 0) return byName;
    }

    if (mode === 'newest') return b.created_at.localeCompare(a.created_at);

    if (mode === 'priority' && a.priority !== b.priority) return a.priority - b.priority;

    if (mode === 'due' || mode === 'priority') {
      const ad = a.due_date ?? '9999-12-31';
      const bd = b.due_date ?? '9999-12-31';
      if (ad !== bd) return ad.localeCompare(bd);
    }

    if (a.position !== b.position) return a.position - b.position;
    return a.created_at.localeCompare(b.created_at);
  });
  return copy;
}

export function sortSections(list: Section[]): Section[] {
  return [...list].sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at));
}

export function initialsOf(value: string | null | undefined): string {
  if (!value) return '?';
  return value.trim().charAt(0) || '?';
}

export function memberLabel(m: { name?: string | null; email?: string | null }): string {
  const name = m.name?.trim();
  if (name) return name;
  const email = m.email?.trim();
  if (email) return email.split('@')[0] || email;
  return 'Nezināms lietotājs';
}

export function plural(n: number, one: string, many: string, zero?: string): string {
  if (n === 0) return `${n} ${zero ?? many}`;
  if (n % 10 === 1 && n % 100 !== 11) return `${n} ${one}`;
  return `${n} ${many}`;
}
