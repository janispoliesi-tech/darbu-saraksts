'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Board, Priority, Section, SectionMember, Task } from '@/lib/types';
import type { Settings } from '@/lib/settings';
import { sortSections, sortTasks } from '@/lib/format';
import Icon from './Icon';
import SectionTabs from './SectionTabs';
import QuickAdd from './QuickAdd';
import TaskList from './TaskList';
import SectionDialog from './SectionDialog';
import TaskDialog, { type TaskDraft } from './TaskDialog';
import ShareDialog from './ShareDialog';

type Props = {
  board: Board;
  settings: Settings;
  userId: string;
  onBack: () => void;
  onSettings: () => void;
  onBoardsChanged: (nextId?: string) => void | Promise<void>;
};

type TaskDialogState = { isNew: boolean; draft: TaskDraft; task: Task | null };

export default function BoardView({ board, settings, userId, onBack, onSettings }: Props) {
  const supabase = getSupabase();
  const isOwner = board.owner_id === userId;

  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<SectionMember[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sectionDialog, setSectionDialog] = useState<{ section: Section | null } | null>(null);
  const [taskDialog, setTaskDialog] = useState<TaskDialogState | null>(null);
  const [shareFor, setShareFor] = useState<Section | null>(null);

  /* ---------- Ielāde ---------- */
  const reqId = useRef(0);

  const refresh = useCallback(async () => {
    const my = ++reqId.current;
    try {
      const [{ data: secs, error: e1 }, { data: tsk, error: e2 }, { data: mem }] = await Promise.all([
        supabase.from('sections').select('*').eq('board_id', board.id).order('position'),
        supabase.from('tasks').select('*').eq('board_id', board.id),
        supabase.from('section_members').select('*'),
      ]);
      if (my !== reqId.current) return;
      if (e1) throw e1;
      if (e2) throw e2;

      const list = sortSections((secs ?? []) as Section[]);
      setSections(list);
      setTasks((tsk ?? []) as Task[]);
      setMembers((mem ?? []) as SectionMember[]);
      setActiveId((cur) => (cur && list.some((s) => s.id === cur) ? cur : list[0]?.id ?? null));
      setError(null);
    } catch (err) {
      if (my === reqId.current) setError(msgOf(err));
    } finally {
      if (my === reqId.current) setLoading(false);
    }
  }, [supabase, board.id]);

  useEffect(() => {
    setLoading(true);
    setSections([]);
    setTasks([]);
    setActiveId(null);
    refresh();
  }, [refresh]);

  /* ---------- Realtime ---------- */
  useEffect(() => {
    const channel = supabase
      .channel(`board-${board.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `board_id=eq.${board.id}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sections', filter: `board_id=eq.${board.id}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, board.id, refresh]);

  /* ---------- Atvasinātie dati ---------- */
  const activeSection = useMemo(() => sections.find((s) => s.id === activeId) ?? null, [sections, activeId]);

  const sectionTasks = useMemo(
    () => sortTasks(tasks.filter((t) => t.section_id === activeId), settings.sort),
    [tasks, activeId, settings.sort]
  );

  const openCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tasks) if (!t.is_done) map[t.section_id] = (map[t.section_id] ?? 0) + 1;
    return map;
  }, [tasks]);

  const shareCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of members) map[m.section_id] = (map[m.section_id] ?? 0) + 1;
    return map;
  }, [members]);

  /* ---------- Darbi ---------- */
  async function createTask(v: TaskDraft) {
    const sectionId = v.sectionId || activeId;
    if (!sectionId) return;
    const maxPos = Math.max(0, ...tasks.filter((t) => t.section_id === sectionId).map((t) => t.position));
    const tmpId = `tmp-${Math.random().toString(36).slice(2)}`;
    const optimistic: Task = {
      id: tmpId, board_id: board.id, section_id: sectionId, title: v.title,
      note: v.note || null, due_date: v.due || null, priority: v.priority,
      is_done: false, done_at: null, position: maxPos + 1,
      created_by: userId, created_at: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, optimistic]);

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        board_id: board.id, section_id: sectionId, title: v.title,
        note: v.note || null, due_date: v.due || null, priority: v.priority,
        position: maxPos + 1, created_by: userId,
      })
      .select()
      .single();

    if (error) {
      setTasks((prev) => prev.filter((t) => t.id !== tmpId));
      setError(msgOf(error));
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === tmpId ? (data as Task) : t)));
  }

  async function toggleTask(task: Task) {
    const next = !task.is_done;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_done: next, done_at: next ? new Date().toISOString() : null } : t)));
    const { error } = await supabase.from('tasks').update({ is_done: next }).eq('id', task.id);
    if (error) { setError(msgOf(error)); refresh(); }
  }

  async function saveTask(task: Task, patch: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));
    const { error } = await supabase.from('tasks').update(patch).eq('id', task.id);
    if (error) { setError(msgOf(error)); refresh(); }
  }

  async function deleteTask(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    const { error } = await supabase.from('tasks').delete().eq('id', task.id);
    if (error) { setError(msgOf(error)); refresh(); }
  }

  async function clearDone() {
    if (!activeId) return;
    const ids = tasks.filter((t) => t.section_id === activeId && t.is_done).map((t) => t.id);
    if (!ids.length) return;
    if (!confirm(`Dzēst ${ids.length} izpildīto darbu?`)) return;
    setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
    const { error } = await supabase.from('tasks').delete().in('id', ids);
    if (error) { setError(msgOf(error)); refresh(); }
  }

  /* ---------- Sadaļas ---------- */
  async function saveSection(values: { name: string; icon: string; color: string }, existing: Section | null) {
    if (existing) {
      const { error } = await supabase.from('sections').update(values).eq('id', existing.id);
      if (error) { setError(msgOf(error)); return; }
      setSections((prev) => prev.map((s) => (s.id === existing.id ? { ...s, ...values } : s)));
    } else {
      const pos = Math.max(-1, ...sections.map((s) => s.position)) + 1;
      const { data, error } = await supabase
        .from('sections')
        .insert({ ...values, board_id: board.id, position: pos })
        .select()
        .single();
      if (error) { setError(msgOf(error)); return; }
      const created = data as Section;
      setSections((prev) => sortSections([...prev, created]));
      setActiveId(created.id);
    }
    setSectionDialog(null);
  }

  async function deleteSection(section: Section) {
    const count = tasks.filter((t) => t.section_id === section.id).length;
    const warn = count
      ? `Dzēst sadaļu “${section.name}” un visus tās ${count} darbus?`
      : `Dzēst sadaļu “${section.name}”?`;
    if (!confirm(warn)) return;
    const { error } = await supabase.from('sections').delete().eq('id', section.id);
    if (error) { setError(msgOf(error)); return; }
    setSections((prev) => prev.filter((s) => s.id !== section.id));
    setTasks((prev) => prev.filter((t) => t.section_id !== section.id));
    setActiveId((cur) => (cur === section.id ? sections.find((s) => s.id !== section.id)?.id ?? null : cur));
    setSectionDialog(null);
  }

  /* ---------- Attēlojums ---------- */
  const shared = activeSection ? (shareCount[activeSection.id] ?? 0) : 0;

  return (
    <div
      className="app"
      data-color={activeSection?.color ?? 'teal'}
      data-density={settings.density}
      data-prio={settings.priorityColor ? 'on' : 'off'}
    >
      <header className="topbar">
        <div className="topbar-inner">
          <button className="icon-btn" onClick={onBack} aria-label="Uz sākumu" title="Visi saraksti">
            <Icon name="back" />
          </button>
          <button className="board-pick" onClick={onBack} title="Visi saraksti">
            <span>{board.name}</span>
          </button>
          <div className="topbar-actions">
            {!isOwner ? <span className="badge">Kopīgots</span> : null}
            <button className="icon-btn" onClick={onSettings} aria-label="Iestatījumi" title="Iestatījumi">
              <Icon name="gear" />
            </button>
          </div>
        </div>
      </header>

      <SectionTabs
        sections={sections}
        activeId={activeId}
        counts={settings.showCounts ? openCounts : {}}
        shared={shareCount}
        onSelect={setActiveId}
        onAdd={isOwner ? () => setSectionDialog({ section: null }) : undefined}
      />

      <main className="main">
        {error ? (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            {error}{' '}
            <button className="linkbtn" onClick={() => { setError(null); refresh(); }}>Mēģināt vēlreiz</button>
          </div>
        ) : null}

        {loading ? (
          <div className="center-note">Ielādē…</div>
        ) : !activeSection ? (
          <div className="empty">
            <Icon name="inbox" />
            <b>{isOwner ? 'Vēl nav nevienas sadaļas' : 'Šajā sarakstā tev nav nevienas sadaļas'}</b>
            <p>
              {isOwner
                ? 'Izveido pirmo sadaļu, piemēram, “Darbi mājās”.'
                : 'Saraksta īpašnieks var tevi uzaicināt uz konkrētu sadaļu.'}
            </p>
            {isOwner ? (
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setSectionDialog({ section: null })}>
                <Icon name="plus" />
                Jauna sadaļa
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="section-head">
              <h1 className="section-title">
                <Icon name={activeSection.icon} />
                <span>{activeSection.name}</span>
              </h1>
              <div className="section-tools">
                <button
                  className={`chip-btn${shared ? ' on' : ''}`}
                  onClick={() => setShareFor(activeSection)}
                  title={shared ? 'Kopīgota sadaļa — dalībnieki' : 'Privāta sadaļa — kopīgot'}
                >
                  <Icon name={shared ? 'users' : 'lock'} />
                  {shared ? shared : 'Privāta'}
                </button>
                {isOwner ? (
                  <button
                    className="icon-btn"
                    onClick={() => setSectionDialog({ section: activeSection })}
                    aria-label="Rediģēt sadaļu"
                    title="Rediģēt sadaļu"
                  >
                    <Icon name="pencil" />
                  </button>
                ) : null}
              </div>
            </div>

            <TaskList
              tasks={sectionTasks}
              settings={settings}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onOpen={(t) =>
                setTaskDialog({
                  isNew: false,
                  task: t,
                  draft: {
                    title: t.title, note: t.note ?? '', due: t.due_date ?? '',
                    priority: t.priority, sectionId: t.section_id,
                  },
                })
              }
              onClearDone={clearDone}
            />
          </>
        )}
      </main>

      <QuickAdd
        disabled={!activeSection}
        onAdd={(title) => createTask({ title, note: '', due: '', priority: 2, sectionId: activeId ?? '' })}
        onOpenFull={(title) =>
          setTaskDialog({
            isNew: true, task: null,
            draft: { title, note: '', due: '', priority: 2, sectionId: activeId ?? '' },
          })
        }
      />

      {sectionDialog ? (
        <SectionDialog
          section={sectionDialog.section}
          onClose={() => setSectionDialog(null)}
          onSave={(v) => saveSection(v, sectionDialog.section)}
          onDelete={
            sectionDialog.section && sections.length > 1
              ? () => deleteSection(sectionDialog.section as Section)
              : undefined
          }
        />
      ) : null}

      {taskDialog ? (
        <TaskDialog
          initial={taskDialog.draft}
          isNew={taskDialog.isNew}
          sections={sections}
          onClose={() => setTaskDialog(null)}
          onSave={(v) => {
            if (taskDialog.isNew) createTask(v);
            else if (taskDialog.task) {
              saveTask(taskDialog.task, {
                title: v.title, note: v.note || null, due_date: v.due || null,
                priority: v.priority as Priority, section_id: v.sectionId,
              });
            }
            setTaskDialog(null);
          }}
          onDelete={taskDialog.task ? () => { deleteTask(taskDialog.task as Task); setTaskDialog(null); } : undefined}
        />
      ) : null}

      {shareFor ? (
        <ShareDialog
          section={shareFor}
          isOwner={isOwner}
          userId={userId}
          onClose={() => setShareFor(null)}
          onChanged={refresh}
        />
      ) : null}
    </div>
  );
}

function msgOf(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: string }).message);
  return String(err);
}
