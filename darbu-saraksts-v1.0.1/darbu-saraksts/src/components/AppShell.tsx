'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import type { Board } from '@/lib/types';
import {
  applyAppearance,
  loadSettings,
  normalizeSettings,
  saveSettings,
  type Settings,
} from '@/lib/settings';
import { errorText } from '@/lib/errors';
import HomePage from './HomePage';
import BoardView from './BoardView';
import SettingsPage from './SettingsPage';

const LS_BOARD = 'ds.board';

type View = 'home' | 'board' | 'settings';

export default function AppShell({ session }: { session: Session }) {
  const supabase = getSupabase();
  const userId = session.user.id;
  const userEmail = session.user.email ?? '';

  const [settings, setSettingsState] = useState<Settings>(loadSettings);
  const [displayName, setDisplayName] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [view, setView] = useState<View>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setSettings(next: Settings) {
    setSettingsState(next);
    saveSettings(next);
    applyAppearance(next);

    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      supabase.from('profiles').update({ settings: next }).eq('id', userId).then(() => {});
    }, 700);
  }

  useEffect(() => {
    applyAppearance(settings);
  }, [settings]);

  useEffect(() => () => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
  }, []);

  const loadBoards = useCallback(async () => {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Board[];
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { error: rpcErr } = await supabase.rpc('bootstrap_user');
        if (rpcErr) throw rpcErr;

        const [list, profile] = await Promise.all([
          loadBoards(),
          supabase.from('profiles').select('display_name,settings').eq('id', userId).maybeSingle(),
        ]);
        if (cancelled) return;
        setBoards(list);
        setDisplayName(profile.data?.display_name ?? userEmail.split('@')[0] ?? '');

        let effective = loadSettings();
        const remote = profile.data?.settings;
        if (remote && typeof remote === 'object') {
          effective = normalizeSettings({ ...effective, ...remote });
          setSettingsState(effective);
          saveSettings(effective);
          applyAppearance(effective);
        }

        if (effective.startView === 'last') {
          let last: string | null = null;
          try { last = localStorage.getItem(LS_BOARD); } catch { last = null; }
          if (last && list.some((b) => b.id === last)) {
            setBoardId(last);
            setView('board');
          }
        }
      } catch (err) {
        if (!cancelled) setError(errorText(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase, loadBoards, userId, userEmail]);

  const refreshBoards = useCallback(
    async (nextId?: string) => {
      try {
        const list = await loadBoards();
        setBoards(list);
        if (nextId && list.some((b) => b.id === nextId)) setBoardId(nextId);
        else if (boardId && !list.some((b) => b.id === boardId)) {
          setBoardId(null);
          setView('home');
        }
      } catch (err) {
        setError(errorText(err));
      }
    },
    [loadBoards, boardId]
  );

  function openBoard(id: string) {
    setBoardId(id);
    try { localStorage.setItem(LS_BOARD, id); } catch {}
    setView('board');
  }

  if (loading) return <div className="center-note">Ielādē…</div>;

  if (error) {
    return (
      <div className="auth">
        <div className="auth-card">
          <div className="auth-title">Neizdevās ielādēt</div>
          <div className="alert alert-error">{error}</div>
          <button className="btn btn-primary btn-block" onClick={() => window.location.reload()}>
            Mēģināt vēlreiz
          </button>
        </div>
      </div>
    );
  }

  const currentBoard = boards.find((b) => b.id === boardId) ?? null;

  if (view === 'settings') {
    return (
      <SettingsPage
        settings={settings}
        onSettings={setSettings}
        board={currentBoard}
        userId={userId}
        userEmail={userEmail}
        displayName={displayName}
        onDisplayName={setDisplayName}
        onBoardsChanged={refreshBoards}
        onBack={() => setView(currentBoard ? 'board' : 'home')}
        onHome={() => { setBoardId(null); setView('home'); }}
      />
    );
  }

  if (view === 'board' && currentBoard) {
    return (
      <BoardView
        board={currentBoard}
        settings={settings}
        userId={userId}
        onBack={() => { setBoardId(null); setView('home'); }}
        onSettings={() => setView('settings')}
        onBoardsChanged={refreshBoards}
      />
    );
  }

  return (
    <HomePage
      boards={boards}
      userId={userId}
      displayName={displayName}
      onOpen={openBoard}
      onSettings={() => setView('settings')}
      onBoardsChanged={refreshBoards}
    />
  );
}

