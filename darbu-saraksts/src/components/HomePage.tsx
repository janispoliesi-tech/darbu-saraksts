'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Board, Section, Task } from '@/lib/types';
import { plural } from '@/lib/format';
import Icon from './Icon';

type Props = {
  boards: Board[];
  userId: string;
  displayName: string;
  onOpen: (boardId: string) => void;
  onSettings: () => void;
  onBoardsChanged: (nextId?: string) => void | Promise<void>;
};

type Stats = Record<string, { sections: number; open: number }>;

export default function HomePage({ boards, userId, displayName, onOpen, onSettings, onBoardsChanged }: Props) {
  const supabase = getSupabase();
  const [stats, setStats] = useState<Stats>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: secs }, { data: tsk }] = await Promise.all([
      supabase.from('sections').select('id,board_id'),
      supabase.from('tasks').select('board_id,is_done'),
    ]);
    const out: Stats = {};
    for (const s of (secs ?? []) as Pick<Section, 'id' | 'board_id'>[]) {
      out[s.board_id] = out[s.board_id] ?? { sections: 0, open: 0 };
      out[s.board_id].sections += 1;
    }
    for (const t of (tsk ?? []) as Pick<Task, 'board_id' | 'is_done'>[]) {
      out[t.board_id] = out[t.board_id] ?? { sections: 0, open: 0 };
      if (!t.is_done) out[t.board_id].open += 1;
    }
    setStats(out);
  }, [supabase]);

  useEffect(() => { load(); }, [load, boards.length]);

  async function createBoard() {
    const title = prompt('Jaunā saraksta nosaukums:', 'Jauns saraksts');
    if (!title?.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('create_board', { p_name: title.trim() });
    setBusy(false);
    if (error) { setError(error.message); return; }
    await onBoardsChanged();
    if (typeof data === 'string') onOpen(data);
  }

  const mine = boards.filter((b) => b.owner_id === userId);
  const shared = boards.filter((b) => b.owner_id !== userId);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand-mark"><Icon name="check" /></span>
          <span className="home-brand">Darbu saraksts</span>
          <div className="topbar-actions">
            <button className="icon-btn" onClick={onSettings} aria-label="Iestatījumi" title="Iestatījumi">
              <Icon name="gear" />
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        <div className="home-greet">
          <h1 className="home-title">Sveiks{displayName ? `, ${displayName}` : ''}!</h1>
          <p className="home-sub">Izvēlies sarakstu, ko atvērt.</p>
        </div>

        {error ? <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <div className="home-head">Mani saraksti</div>
        <div className="board-grid">
          {mine.map((b) => (
            <BoardCard key={b.id} board={b} stats={stats[b.id]} onOpen={onOpen} />
          ))}
          <button className="board-card board-card-new" onClick={createBoard} disabled={busy}>
            <span className="board-card-icon dashed"><Icon name="plus" /></span>
            <span className="board-card-main">
              <span className="board-card-name">Jauns saraksts</span>
              <span className="board-card-meta">Ar trim sākuma sadaļām</span>
            </span>
          </button>
        </div>

        {shared.length > 0 ? (
          <>
            <div className="home-head">Kopīgots ar mani</div>
            <div className="board-grid">
              {shared.map((b) => (
                <BoardCard key={b.id} board={b} stats={stats[b.id]} onOpen={onOpen} shared />
              ))}
            </div>
          </>
        ) : null}

        <p className="hint" style={{ marginTop: 18, textAlign: 'center' }}>
          Cilvēkus uzaicina uz atsevišķām sadaļām. Sadaļa, uz kuru neviens nav uzaicināts,
          paliek redzama tikai tev.
        </p>
      </main>
    </div>
  );
}

function BoardCard({
  board, stats, onOpen, shared,
}: {
  board: Board;
  stats?: { sections: number; open: number };
  onOpen: (id: string) => void;
  shared?: boolean;
}) {
  const s = stats ?? { sections: 0, open: 0 };
  const meta = shared
    ? `${board.owner_name ?? 'Cits lietotājs'} · ${plural(s.sections, 'sadaļa', 'sadaļas', 'sadaļu')}`
    : `${plural(s.sections, 'sadaļa', 'sadaļas', 'sadaļu')} · ${plural(s.open, 'darbs', 'darbi', 'darbu')}`;

  return (
    <button className="board-card" onClick={() => onOpen(board.id)}>
      <span className="board-card-icon">
        <Icon name={shared ? 'users' : 'list'} />
      </span>
      <span className="board-card-main">
        <span className="board-card-name">{board.name}</span>
        <span className="board-card-meta">{meta}</span>
      </span>
      {s.open > 0 && !shared ? <span className="board-card-count">{s.open}</span> : null}
      <Icon name="chevron" className="board-card-chev" />
    </button>
  );
}
