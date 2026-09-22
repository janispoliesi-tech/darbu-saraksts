'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import type { Board, Section, SectionMember, SortMode } from '@/lib/types';
import {
  ACCENTS,
  type Density,
  type DueMode,
  type Settings,
  type TextSize,
  type ThemeMode,
} from '@/lib/settings';
import { plural } from '@/lib/format';
import { errorText } from '@/lib/errors';
import Icon from './Icon';
import ShareDialog from './ShareDialog';

type Props = {
  settings: Settings;
  onSettings: (s: Settings) => void;
  board: Board | null;
  userId: string;
  userEmail: string;
  displayName: string;
  onDisplayName: (n: string) => void;
  onBoardsChanged: (nextId?: string) => void | Promise<void>;
  onBack: () => void;
  onHome: () => void;
};

export default function SettingsPage(props: Props) {
  const { settings, onSettings, board, userId, userEmail, onBack, onHome } = props;
  const supabase = getSupabase();
  const isOwner = board?.owner_id === userId;

  const [name, setName] = useState(props.displayName);
  const [boardName, setBoardName] = useState(board?.name ?? '');
  const [sections, setSections] = useState<Section[]>([]);
  const [members, setMembers] = useState<SectionMember[]>([]);
  const [shareFor, setShareFor] = useState<Section | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const set = (patch: Partial<Settings>) => onSettings({ ...settings, ...patch });

  const loadSections = useCallback(async () => {
    if (!board) { setSections([]); setMembers([]); return; }
    const [{ data: s }, { data: m }] = await Promise.all([
      supabase.from('sections').select('*').eq('board_id', board.id).order('position'),
      supabase.from('section_members').select('*'),
    ]);
    setSections((s ?? []) as Section[]);
    setMembers((m ?? []) as SectionMember[]);
  }, [supabase, board]);

  useEffect(() => { loadSections(); }, [loadSections]);
  useEffect(() => { setBoardName(board?.name ?? ''); }, [board?.name]);

  function flash(msg: string) {
    setOk(msg);
    setError(null);
    setTimeout(() => setOk(null), 3500);
  }

  async function saveName() {
    const v = name.trim();
    if (!v) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('set_display_name', { p_name: v });
    setBusy(false);
    if (error) { setError(errorText(error)); return; }
    props.onDisplayName(typeof data === 'string' ? data : v);
    await props.onBoardsChanged();
    await loadSections();
    flash('Vārds saglabāts.');
  }

  async function saveBoardName() {
    if (!board || !boardName.trim()) return;
    setBusy(true);
    const { error } = await supabase.from('boards').update({ name: boardName.trim() }).eq('id', board.id);
    setBusy(false);
    if (error) { setError(errorText(error)); return; }
    await props.onBoardsChanged();
    flash('Saraksta nosaukums saglabāts.');
  }

  async function deleteBoard() {
    if (!board) return;
    if (!confirm(`Dzēst sarakstu “${board.name}” ar visām sadaļām un darbiem? To nevar atsaukt.`)) return;
    setBusy(true);
    const { error } = await supabase.from('boards').delete().eq('id', board.id);
    setBusy(false);
    if (error) { setError(errorText(error)); return; }
    await props.onBoardsChanged();
    onHome();
  }

  async function leaveBoard() {
    if (!board) return;
    if (!confirm(`Pamest sarakstu “${board.name}”? Zaudēsi pieeju visām tā sadaļām.`)) return;
    setBusy(true);
    const ids = sections.map((s) => s.id);
    const { error } = await supabase
      .from('section_members')
      .delete()
      .eq('user_id', userId)
      .in('section_id', ids);
    setBusy(false);
    if (error) { setError(errorText(error)); return; }
    await props.onBoardsChanged();
    onHome();
  }

  const memberCount = (sectionId: string) => members.filter((m) => m.section_id === sectionId).length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner pagebar">
          <button className="icon-btn" onClick={onBack} aria-label="Atpakaļ">
            <Icon name="back" />
          </button>
          <div className="pagebar-title">Iestatījumi</div>
          <div className="topbar-actions">
            <button className="icon-btn" onClick={onHome} aria-label="Uz sākumu" title="Visi saraksti">
              <Icon name="home" />
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        {error ? <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div> : null}
        {ok ? <div className="alert alert-ok" style={{ marginBottom: 12 }}>{ok}</div> : null}

        {/* ---------------- Profils ---------------- */}
        <div className="card">
          <div className="card-head">Profils</div>

          <div className="row row-stack">
            <div className="row-label"><Icon name="user" />Lietotāja vārds</div>
            <div className="row-hint">Šis vārds redzams pārējiem, ar ko kopīgo sadaļas.</div>
            <div className="inline-form">
              <input
                className="input"
                value={name}
                maxLength={40}
                placeholder="Piem., Jānis"
                onChange={(e) => setName(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={saveName}
                disabled={busy || !name.trim() || name.trim() === props.displayName}
              >
                Saglabāt
              </button>
            </div>
          </div>

          <div className="row">
            <div className="row-main">
              <div className="row-label"><Icon name="mail" />E-pasts</div>
              <div className="row-hint">{userEmail}</div>
            </div>
          </div>

          <button className="row danger" onClick={() => signOut(supabase)}>
            <div className="row-main">
              <div className="row-label"><Icon name="logout" />Iziet no konta</div>
            </div>
          </button>
        </div>

        {/* ---------------- Izskats ---------------- */}
        <div className="card">
          <div className="card-head">Izskats</div>

          <SegRow icon="palette" label="Tēma" hint="Gaišs vai tumšs noformējums"
            value={settings.theme}
            options={[['system', 'Sistēmas'], ['light', 'Gaišs'], ['dark', 'Tumšs']]}
            onChange={(v) => set({ theme: v as ThemeMode })} />

          <div className="row row-stack">
            <div className="row-label"><Icon name="brush" />Pamatkrāsa</div>
            <div className="row-hint">Pogas, ķeksīši un izceltie elementi</div>
            <div className="color-row" style={{ marginTop: 9 }}>
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className={`color-dot${a.key === settings.accent ? ' on' : ''}`}
                  data-ac={a.key}
                  onClick={() => set({ accent: a.key })}
                  title={a.label}
                  aria-label={a.label}
                  aria-pressed={a.key === settings.accent}
                >
                  <i />
                </button>
              ))}
            </div>
          </div>

          <SegRow icon="text" label="Teksta izmērs" hint="Darbu un sadaļu nosaukumu lielums"
            value={settings.textSize}
            options={[['small', 'Mazs'], ['normal', 'Vidējs'], ['large', 'Liels']]}
            onChange={(v) => set({ textSize: v as TextSize })} />

          <SegRow icon="list" label="Rindu blīvums" hint="Cik daudz vietas aizņem viens darbs"
            value={settings.density}
            options={[['compact', 'Kompakts'], ['cozy', 'Plašāks']]}
            onChange={(v) => set({ density: v as Density })} />

          <SegRow icon="calendar" label="Termiņi sarakstā" hint="Datums parasti ir paslēpts, lai saraksts būtu kompakts"
            value={settings.showDue}
            options={[['never', 'Nerādīt'], ['overdue', 'Nokavētos'], ['always', 'Vienmēr']]}
            onChange={(v) => set({ showDue: v as DueMode })} />

          <SwitchRow icon="flag" label="Prioritāte ar krāsu"
            hint="Sarkans = augsta, dzeltens = vidēja, pelēks = zema"
            value={settings.priorityColor} onChange={(v) => set({ priorityColor: v })} />

          <SwitchRow icon="note" label="Rādīt piezīmes"
            hint="Ja izslēgts, pie darba ar piezīmi redzama tikai maza ikona"
            value={settings.showNotes} onChange={(v) => set({ showNotes: v })} />

          <SwitchRow icon="check" label="Rādīt izpildītos"
            hint="Izpildītie darbi nosvītroti saraksta apakšā"
            value={settings.showDone} onChange={(v) => set({ showDone: v })} />

          <SwitchRow icon="chart" label="Skaitlis uz cilnēm"
            hint="Neizpildīto darbu skaits pie sadaļas nosaukuma"
            value={settings.showCounts} onChange={(v) => set({ showCounts: v })} />

          <SegRow icon="filter" label="Kārtošana" hint="Kādā secībā rādīt neizpildītos darbus"
            value={settings.sort}
            options={[['priority', 'Prioritāte'], ['due', 'Termiņš'], ['added', 'Secība']]}
            onChange={(v) => set({ sort: v as SortMode })} />
        </div>

        {/* ---------------- Sadaļu kopīgošana ---------------- */}
        {board ? (
          <div className="card">
            <div className="card-head">Saraksts “{board.name}”</div>

            {isOwner ? (
              <div className="row row-stack">
                <div className="row-label"><Icon name="pencil" />Saraksta nosaukums</div>
                <div className="inline-form">
                  <input className="input" value={boardName} maxLength={50} onChange={(e) => setBoardName(e.target.value)} />
                  <button className="btn" onClick={saveBoardName}
                    disabled={busy || !boardName.trim() || boardName.trim() === board.name}>
                    Saglabāt
                  </button>
                </div>
              </div>
            ) : null}

            {sections.map((s) => {
              const n = memberCount(s.id);
              return (
                <button className="row" key={s.id} onClick={() => setShareFor(s)}>
                  <div className="row-main">
                    <div className="row-label" data-color={s.color}>
                      <Icon name={s.icon} />
                      {s.name}
                    </div>
                    <div className="row-hint">
                      {n === 0 ? 'Privāta — redzi tikai tu' : `Kopīgota · ${plural(n, 'cilvēks', 'cilvēki', 'cilvēku')}`}
                    </div>
                  </div>
                  <div className="row-end">
                    <Icon name={n === 0 ? 'lock' : 'users'} />
                    <Icon name="next" />
                  </div>
                </button>
              );
            })}

            {isOwner ? (
              <button className="row danger" onClick={deleteBoard} disabled={busy}>
                <div className="row-main">
                  <div className="row-label"><Icon name="trash" />Dzēst šo sarakstu</div>
                  <div className="row-hint">Kopā ar visām sadaļām un darbiem</div>
                </div>
              </button>
            ) : (
              <button className="row danger" onClick={leaveBoard} disabled={busy}>
                <div className="row-main">
                  <div className="row-label"><Icon name="logout" />Pamest šo sarakstu</div>
                  <div className="row-hint">Zaudēsi pieeju visām tā sadaļām</div>
                </div>
              </button>
            )}
          </div>
        ) : null}

        <div className="card">
          <button className="row" onClick={onHome}>
            <div className="row-main">
              <div className="row-label"><Icon name="home" />Visi saraksti</div>
              <div className="row-hint">Sākuma lapa ar taviem un kopīgotajiem sarakstiem</div>
            </div>
            <div className="row-end"><Icon name="next" /></div>
          </button>
        </div>

        <p className="hint" style={{ marginTop: 14, textAlign: 'center' }}>
          Izskats tiek saglabāts tavā kontā — tāds pats telefonā, planšetē un datorā.
        </p>
      </main>

      {shareFor ? (
        <ShareDialog
          section={shareFor}
          isOwner={!!isOwner}
          userId={userId}
          onClose={() => setShareFor(null)}
          onChanged={loadSections}
        />
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Palīgrindas */

function SegRow({
  icon, label, hint, value, options, onChange,
}: {
  icon: string; label: string; hint?: string; value: string;
  options: [string, string][]; onChange: (v: string) => void;
}) {
  return (
    <div className="row row-seg">
      <div className="row-main">
        <div className="row-label"><Icon name={icon} />{label}</div>
        {hint ? <div className="row-hint">{hint}</div> : null}
      </div>
      <div className="seg" role="group" aria-label={label}>
        {options.map(([v, text]) => (
          <button key={v} className={v === value ? 'on' : ''} onClick={() => onChange(v)} aria-pressed={v === value}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function SwitchRow({
  icon, label, hint, value, onChange,
}: {
  icon: string; label: string; hint?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="row">
      <div className="row-main">
        <div className="row-label"><Icon name={icon} />{label}</div>
        {hint ? <div className="row-hint">{hint}</div> : null}
      </div>
      <button
        className={`switch${value ? ' on' : ''}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        aria-label={label}
      />
    </div>
  );
}
