import type { Section, SortMode, Task } from './types';

/** Šodienas datums formātā YYYY-MM-DD pēc lietotāja laika joslas. */
function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

const MONTHS = [
  'janv.', 'febr.', 'martā', 'apr.', 'maijā', 'jūn.',
  'jūl.', 'aug.', 'sept.', 'okt.', 'nov.', 'dec.',
];

/** "15. sept." / "Šodien" / "Rīt" / "Vakar" */
export function formatDue(iso: string): string {
  const today = todayISO();
  const diff = daysBetween(today, iso);
  if (diff === 0) return 'Šodien';
  if (diff === 1) return 'Rīt';
  if (diff === -1) return 'Vakar';

  const [y, m, d] = iso.split('-').map(Number);
  const label = `${d}. ${MONTHS[(m || 1) - 1]}`;
  const nowYear = Number(today.slice(0, 4));
  return y === nowYear ? label : `${label} ${y}`;
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

/**
 * Kārtošana. Izpildītie darbi VIENMĒR nonāk saraksta apakšā
 * (tos atsevišķi atdala saskarne), šeit kārto tikai vienas grupas ietvaros.
 */
export function sortTasks(list: Task[], mode: SortMode): Task[] {
  const copy = [...list];
  copy.sort((a, b) => {
    if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;

    if (a.is_done && b.is_done) {
      return (b.done_at ?? b.created_at).localeCompare(a.done_at ?? a.created_at);
    }

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

/** Dalībnieka redzamais vārds: profila vārds -> e-pasta sākums -> "Nezināms". */
export function memberLabel(m: { name?: string | null; email?: string | null }): string {
  const name = m.name?.trim();
  if (name) return name;
  const email = m.email?.trim();
  if (email) return email.split('@')[0] || email;
  return 'Nezināms lietotājs';
}

/** "3 darbi" / "1 darbs" / "0 darbu" */
export function plural(n: number, one: string, many: string, zero?: string): string {
  if (n === 0) return `${n} ${zero ?? many}`;
  if (n % 10 === 1 && n % 100 !== 11) return `${n} ${one}`;
  return `${n} ${many}`;
}
