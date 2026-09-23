'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import type { Board, Priority, Section, SectionMember, Task } from '@/lib/types';
import {
  ACCENTS,
  DEFAULT_SETTINGS,
  FONTS,
  FONT_SCALE,
  PRESETS,
  presetMatches,
  type Settings,
} from '@/lib/settings';
import { plural, sortTasks } from '@/lib/format';
import { errorText } from '@/lib/errors';
import Icon from './Icon';
import ShareDialog from './ShareDialog';
import TaskList from './TaskList';

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

function isoInDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function sampleTasks(): Task[] {
  const base = { board_id: 'demo', section_id: 'demo', created_by: null, done_at: null, is_done: false };
  const now = Date.now();
  const at = (min: number) => new Date(now - min * 60000).toISOString();
  return [
    { ...base, id: 'd1', title: 'Nopirkt krāsu fasādei', note: '2 spaiņi, balta, matēta', due_date: isoInDays(0), priority: 1, position: 1, created_at: at(40) },
    { ...base, id: 'd2', title: 'Nopļaut zālienu', note: null, due_date: isoInDays(3), priority: 2, position: 2, created_at: at(30) },
    { ...base, id: 'd3', title: 'Salabot vārtu eņģes', note: 'Vajag 2 jaunas eņģes un skrūves', due_date: isoInDays(-2), priority: 2, position: 3, created_at: at(20) },
    { ...base, id: 'd4', title: 'Aizvest vecās riepas', note: null, due_date: null, priority: 3, position: 4, created_at: at(10) },
    { ...base, id: 'd5', title: 'Iznest atkritumus', note: null, due_date: null, priority: 2, position: 5, created_at: at(50), is_done: true, done_at: at(5) },
  ];
}

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
  const [demo, setDemo] = useState<Task[]>(sampleTasks);

  const set = (patch: Partial<Settings>) => onSettings({ ...settings, ...patch });

  const nav = useMemo(() => {
    const items: [string, string][] = [
      ['profile', 'Profils'],
      ['styles', 'Stili'],
      ['colors', 'Krāsas'],
      ['text', 'Teksts'],
      ['layout', 'Izkārtojums'],
      ['tasks', 'Darbi'],
      ['behavior', 'Uzvedība'],
    ];
    if (board) items.push(['board', 'Saraksts']);
    return items;
  }, [board]);

  const [activeNav, setActiveNav] = useState('profile');
  const navScroller = useRef<HTMLDivElement>(null);

  const navLock = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (Date.now() < navLock.current) return;
      const doc = document.documentElement;
      let current = nav[0][0];
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
        current = nav[nav.length - 1][0];
      } else {
        for (const [id] of nav) {
          const el = document.getElementById(`set-${id}`);
          if (el && el.getBoundingClientRect().top <= 150) current = id;
        }
      }
      setActiveNav(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [nav]);

  useEffect(() => {
    const box = navScroller.current;
    const tab = box?.querySelector<HTMLElement>(`[data-nav='${activeNav}']`);
    if (!box || !tab) return;
    const left = tab.offsetLeft - box.clientWidth / 2 + tab.clientWidth / 2;
    box.scrollTo({ left, behavior: settings.motion ? 'smooth' : 'auto' });
  }, [activeNav, settings.motion]);

  function jump(id: string) {
    navLock.current = Date.now() + 900;
    setActiveNav(id);
    document.getElementById(`set-${id}`)?.scrollIntoView({
      behavior: settings.motion ? 'smooth' : 'auto',
      block: 'start',
    });
  }

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

  function resetLook() {
    if (!confirm('Atjaunot visus izskata un saraksta iestatījumus uz noklusētajiem?')) return;
    onSettings({ ...DEFAULT_SETTINGS });
    flash('Iestatījumi atjaunoti.');
  }

  const memberCount = (sectionId: string) => members.filter((m) => m.section_id === sectionId).length;
  const demoTasks = useMemo(() => sortTasks(demo, settings.sort), [demo, settings.sort]);
  const isCustom = settings.accent === 'custom';

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

      <nav className="tabs-outer settings-nav" aria-label="Iestatījumu sadaļas">
        <div className="tabs-scroller" ref={navScroller}>
          {nav.map(([id, label]) => (
            <button
              key={id}
              data-nav={id}
              className={`tab${activeNav === id ? ' is-active' : ''}`}
              onClick={() => jump(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="page">
        {error ? <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div> : null}
        {ok ? <div className="alert alert-ok" style={{ marginBottom: 12 }}>{ok}</div> : null}

        <div className="card" id="set-profile">
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

        <div className="card" id="set-styles">
          <div className="card-head">
            Priekšskatījums un stili
            <button className="linkbtn" onClick={resetLook}>
              Atjaunot noklusējumu
            </button>
          </div>

          <div className="preview">
            <div className="preview-tabs" aria-hidden="true">
              {[
                { color: 'green', icon: 'home', name: 'Mājas', n: 4 },
                { color: 'orange', icon: 'hammer', name: 'Būvniecība', n: 7 },
                { color: 'blue', icon: 'tree', name: 'Teritorija', n: 0 },
              ].map((t, i) => (
                <span key={t.name} className={`tab${i === 0 ? ' is-active' : ''}`} data-color={t.color}>
                  <Icon name={t.icon} className="tab-icon" />
                  {t.name}
                  {settings.showCounts && t.n > 0 ? <span className="tab-count">{t.n}</span> : null}
                </span>
              ))}
            </div>
            <TaskList
              tasks={demoTasks}
              settings={settings}
              onToggle={(t) =>
                setDemo((prev) =>
                  prev.map((x) =>
                    x.id === t.id
                      ? { ...x, is_done: !x.is_done, done_at: x.is_done ? null : new Date().toISOString() }
                      : x
                  )
                )
              }
              onDelete={() => {}}
              onOpen={() => {}}
              onClearDone={() => setDemo(sampleTasks())}
            />
          </div>

          <div className="row row-stack">
            <div className="row-label"><Icon name="sparkles" />Gatavie stili</div>
            <div className="row-hint">Vienā klikšķī nomaina formu, blīvumu un teksta izskatu. Krāsas paliek tavas.</div>
            <div className="choice-grid">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`choice${presetMatches(settings, p.look) ? ' on' : ''}`}
                  onClick={() => set(p.look)}
                  aria-pressed={presetMatches(settings, p.look)}
                >
                  <b>{p.label}</b>
                  <small>{p.hint}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" id="set-colors">
          <div className="card-head">Krāsas</div>

          <SegRow icon="palette" label="Tēma" hint="Melnā ir tumšākā — ietaupa bateriju OLED ekrānos"
            value={settings.theme}
            options={[['system', 'Sistēmas'], ['light', 'Gaiša'], ['dark', 'Tumša'], ['black', 'Melna']]}
            onChange={(v) => set({ theme: v })} />

          <div className="row row-stack">
            <div className="row-label"><Icon name="brush" />Pamatkrāsa</div>
            <div className="row-hint">Pogas, ķeksīši un izceltie elementi. Pēdējā poga — sava krāsa.</div>
            <div className="color-row" style={{ marginTop: 9 }}>
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className={`color-dot${a.key === settings.accent ? ' on' : ''}`}
                  data-color={a.key}
                  onClick={() => set({ accent: a.key })}
                  title={a.label}
                  aria-label={a.label}
                  aria-pressed={a.key === settings.accent}
                >
                  <i />
                </button>
              ))}
              <label
                className={`color-dot custom${isCustom ? ' on' : ''}`}
                title="Sava krāsa"
                style={{ '--custom': settings.customAccent } as React.CSSProperties}
              >
                <input
                  type="color"
                  value={settings.customAccent}
                  aria-label="Sava krāsa"
                  onClick={() => { if (!isCustom) set({ accent: 'custom' }); }}
                  onChange={(e) => set({ accent: 'custom', customAccent: e.target.value })}
                />
                <i />
              </label>
            </div>
          </div>

          <SegRow icon="layers" label="Fona tonis" hint="Viegls tonis fonam, kartītēm un līnijām"
            value={settings.surface}
            options={[['neutral', 'Neitrāls'], ['warm', 'Silts'], ['cool', 'Vēss'], ['tinted', 'Pamatkrāsas']]}
            onChange={(v) => set({ surface: v })} />

          <SegRow icon="contrast" label="Kontrasts" hint="Tumšāks teksts un skaidrākas līnijas"
            value={settings.contrast}
            options={[['normal', 'Parasts'], ['high', 'Augsts']]}
            onChange={(v) => set({ contrast: v })} />

          <SwitchRow icon="tabs" label="Sadaļas krāsa kā pamatkrāsa"
            hint="Atvērtajā sadaļā pogas un ķeksīši pieņem sadaļas krāsu"
            value={settings.sectionAccent} onChange={(v) => set({ sectionAccent: v })} />
        </div>

        <div className="card" id="set-text">
          <div className="card-head">Teksts</div>

          <div className="row row-stack">
            <div className="row-label"><Icon name="font" />Fonts</div>
            <div className="row-hint">Visai lietotnei. Izskatās vienādi visās ierīcēs.</div>
            <div className="choice-grid">
              {FONTS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`choice${settings.font === f.key ? ' on' : ''}`}
                  onClick={() => set({ font: f.key })}
                  aria-pressed={settings.font === f.key}
                >
                  <span className="aa" style={{ fontFamily: f.stack }}>Aa Āā Šš</span>
                  <small>{f.label}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="row row-stack">
            <div className="row-label">
              <Icon name="text" />Teksta izmērs
              <span className="row-value" style={{ marginLeft: 'auto' }}>{Math.round(settings.fontScale * 100)}%</span>
            </div>
            <div className="row-hint">Darbu, piezīmju un sadaļu nosaukumu lielums</div>
            <div className="range-wrap">
              <span className="aa" style={{ fontSize: 13 }}>A</span>
              <input
                className="range"
                type="range"
                min={FONT_SCALE.min}
                max={FONT_SCALE.max}
                step={FONT_SCALE.step}
                value={settings.fontScale}
                onChange={(e) => set({ fontScale: Number(e.target.value) })}
                aria-label="Teksta izmērs"
              />
              <span className="aa" style={{ fontSize: 20 }}>A</span>
            </div>
          </div>

          <SegRow icon="bold" label="Darbu teksts" hint="Cik trekni rakstīti darbu nosaukumi"
            value={settings.titleWeight}
            options={[['normal', 'Parasts'], ['medium', 'Vidējs'], ['semibold', 'Pustrekns'], ['bold', 'Trekns']]}
            onChange={(v) => set({ titleWeight: v })} />
        </div>

        <div className="card" id="set-layout">
          <div className="card-head">Izkārtojums</div>

          <SegRow icon="corner" label="Stūri" hint="Pogu, kartīšu un logu stūru noapaļojums"
            value={settings.radius}
            options={[['none', 'Taisni'], ['small', 'Nedaudz'], ['medium', 'Vidēji'], ['round', 'Apaļi']]}
            onChange={(v) => set({ radius: v })} />

          <SegRow icon="list" label="Rindu blīvums" hint="Cik daudz vietas aizņem viens darbs"
            value={settings.density}
            options={[['tight', 'Blīvs'], ['compact', 'Kompakts'], ['cozy', 'Ērts'], ['spacious', 'Plašs']]}
            onChange={(v) => set({ density: v })} />

          <SegRow icon="width" label="Satura platums" hint="Cik plati saraksts izvēršas uz datora ekrāna"
            value={settings.width}
            options={[['narrow', 'Šaurs'], ['normal', 'Vidējs'], ['wide', 'Plats'], ['full', 'Pilns']]}
            onChange={(v) => set({ width: v })} />

          <SegRow icon="rows" label="Saraksta izskats" hint="Viens bloks, atsevišķas kartītes vai bez rāmja"
            value={settings.listStyle}
            options={[['block', 'Bloks'], ['cards', 'Kartītes'], ['plain', 'Bez rāmja']]}
            onChange={(v) => set({ listStyle: v })} />

          <SegRow icon="filter" label="Atdalītāji" hint="Kā atdalītas rindas (kartītēm neattiecas)"
            value={settings.dividers}
            options={[['lines', 'Līnijas'], ['zebra', 'Svītrains'], ['none', 'Nav']]}
            onChange={(v) => set({ dividers: v })} />

          <SegRow icon="square" label="Ķeksītis" hint="Atzīmēšanas lodziņa forma"
            value={settings.tickShape}
            options={[['square', 'Kvadrāts'], ['circle', 'Aplis']]}
            onChange={(v) => set({ tickShape: v })} />

          <SegRow icon="header" label="Augšējā josla"
            hint="Caurspīdīga, vienkrāsaina vai pamatkrāsā"
            value={settings.header}
            options={[['glass', 'Stikla'], ['solid', 'Vienkrāsaina'], ['accent', 'Krāsaina']]}
            onChange={(v) => set({ header: v })} />

          <SegRow icon="tabs" label="Sadaļu cilnes" hint="Cilņu izskats saraksta augšā"
            value={settings.tabStyle}
            options={[['pills', 'Pogas'], ['underline', 'Pasvītrotas'], ['filled', 'Iekrāsotas']]}
            onChange={(v) => set({ tabStyle: v })} />

          <SwitchRow icon="star" label="Ikonas cilnēs" hint="Sadaļas ikona pirms nosaukuma"
            value={settings.tabIcons} onChange={(v) => set({ tabIcons: v })} />

          <SwitchRow icon="motion" label="Animācijas" hint="Pāreju un logu kustība"
            value={settings.motion} onChange={(v) => set({ motion: v })} />
        </div>

        <div className="card" id="set-tasks">
          <div className="card-head">Darbi sarakstā</div>

          <SegRow icon="filter" label="Kārtošana" hint="Kādā secībā rādīt neizpildītos darbus"
            value={settings.sort}
            options={[['priority', 'Prioritāte'], ['due', 'Termiņš'], ['added', 'Secība'], ['newest', 'Jaunākie'], ['alpha', 'A–Z']]}
            onChange={(v) => set({ sort: v })} />

          <SegRow icon="calendar" label="Termiņi sarakstā" hint="Datums parasti ir paslēpts, lai saraksts būtu kompakts"
            value={settings.showDue}
            options={[['never', 'Nerādīt'], ['overdue', 'Nokavētos'], ['always', 'Vienmēr']]}
            onChange={(v) => set({ showDue: v })} />

          <SegRow icon="clock" label="Datuma formāts" hint="Šodien, Rīt un Vakar raksta vienmēr ar vārdiem"
            value={settings.dateStyle}
            options={[['text', '15. sept.'], ['numeric', '15.09.'], ['relative', 'pēc 3 d.']]}
            onChange={(v) => set({ dateStyle: v })} />

          <SegRow icon="flag" label="Prioritāte" hint="Sarkans = augsta, dzeltens = vidēja, pelēks = zema"
            value={settings.priorityStyle}
            options={[['bar', 'Svītra'], ['dot', 'Punkts'], ['tint', 'Fons'], ['tick', 'Ķeksis'], ['off', 'Nav']]}
            onChange={(v) => set({ priorityStyle: v })} />

          <SegRow icon="note" label="Piezīmes" hint="Cik daudz no piezīmes rādīt zem darba"
            value={settings.notes}
            options={[['icon', 'Ikona'], ['one', '1 rinda'], ['two', '2 rindas'], ['all', 'Visu']]}
            onChange={(v) => set({ notes: v })} />

          <SegRow icon="pencil" label="Pogas rindā" hint="Rediģēt un dzēst pogas. „Zem peles“ — datorā redzamas, kad pele ir virs darba"
            value={settings.rowActions}
            options={[['always', 'Vienmēr'], ['hover', 'Zem peles'], ['hidden', 'Nerādīt']]}
            onChange={(v) => set({ rowActions: v })} />

          <SwitchRow icon="check" label="Rādīt izpildītos"
            hint="Izpildītie darbi saraksta apakšā"
            value={settings.showDone} onChange={(v) => set({ showDone: v })} />

          <SwitchRow icon="chevron" label="Izpildītie sakļauti"
            hint="Izpildīto grupa sākumā ir aizvērta"
            value={settings.doneCollapsed} onChange={(v) => set({ doneCollapsed: v })} />

          <SegRow icon="eye" label="Izpildīto izskats" hint="Kā izskatās atzīmētie darbi"
            value={settings.doneStyle}
            options={[['strike', 'Nosvītroti'], ['fade', 'Tikai blāvi']]}
            onChange={(v) => set({ doneStyle: v })} />

          <SwitchRow icon="chart" label="Skaitlis uz cilnēm"
            hint="Neizpildīto darbu skaits pie sadaļas nosaukuma"
            value={settings.showCounts} onChange={(v) => set({ showCounts: v })} />
        </div>

        <div className="card" id="set-behavior">
          <div className="card-head">Uzvedība</div>

          <SegRow<Priority> icon="plus" label="Jauna darba prioritāte" hint="Ar kādu prioritāti pievieno ātrajā joslā"
            value={settings.defaultPriority}
            options={[[1, 'Augsta'], [2, 'Vidēja'], [3, 'Zema']]}
            onChange={(v) => set({ defaultPriority: v })} />

          <SwitchRow icon="trash" label="Apstiprināt dzēšanu"
            hint="Pirms darba dzēšanas pajautāt, vai tiešām"
            value={settings.confirmDelete} onChange={(v) => set({ confirmDelete: v })} />

          <SegRow icon="home" label="Atverot lietotni" hint="Ko rādīt pēc ielādes"
            value={settings.startView}
            options={[['home', 'Sākuma lapu'], ['last', 'Pēdējo sarakstu']]}
            onChange={(v) => set({ startView: v })} />
        </div>

        {board ? (
          <div className="card" id="set-board">
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
          Iestatījumi tiek saglabāti tavā kontā — tādi paši telefonā, planšetē un datorā.
        </p>
      </main>

      {shareFor ? (
        <ShareDialog
          key={shareFor.id}
          section={shareFor}
          sections={sections}
          isOwner={!!isOwner}
          userId={userId}
          onClose={() => setShareFor(null)}
          onChanged={loadSections}
        />
      ) : null}
    </div>
  );
}

function SegRow<T extends string | number>({
  icon, label, hint, value, options, onChange,
}: {
  icon: string; label: string; hint?: string; value: T;
  options: [T, string][]; onChange: (v: T) => void;
}) {
  return (
    <div className="row row-seg">
      <div className="row-main">
        <div className="row-label"><Icon name={icon} />{label}</div>
        {hint ? <div className="row-hint">{hint}</div> : null}
      </div>
      <div className="seg" role="group" aria-label={label}>
        {options.map(([v, text]) => (
          <button key={String(v)} className={v === value ? 'on' : ''} onClick={() => onChange(v)} aria-pressed={v === value}>
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
