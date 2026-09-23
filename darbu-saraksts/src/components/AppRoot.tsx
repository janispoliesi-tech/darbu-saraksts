'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { CONFIG_PROBLEM, getSupabase } from '@/lib/supabase';
import { applyAppearance, loadSettings } from '@/lib/settings';
import AuthScreen from './AuthScreen';
import AppShell from './AppShell';
import ConfigError from './ConfigError';
import NewPasswordScreen from './NewPasswordScreen';

export default function AppRoot() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    applyAppearance(loadSettings());
  }, []);

  useEffect(() => {
    if (CONFIG_PROBLEM) {
      setReady(true);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    try {
      const supabase = getSupabase();

      supabase.auth
        .getSession()
        .then(({ data }) => {
          setSession(data.session);
          setReady(true);
        })
        .catch((err) => {
          setFatal(msgOf(err));
          setReady(true);
        });

      const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
        if (event === 'PASSWORD_RECOVERY') setRecovery(true);
        if (event === 'SIGNED_OUT') setRecovery(false);
        setSession(s);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    } catch (err) {
      setFatal(msgOf(err));
      setReady(true);
    }

    return () => unsubscribe?.();
  }, []);

  if (CONFIG_PROBLEM) return <ConfigError problem={CONFIG_PROBLEM} />;

  if (fatal) {
    return (
      <ConfigError
        problem={{
          title: 'Neizdevās izveidot savienojumu',
          what: fatal,
          fix:
            'Pārbaudi, vai Vercel Environment Variables ievadītā Supabase adrese un atslēga ' +
            'atbilst tavam projektam (Supabase → Project Settings → API), un vai pēc labošanas ' +
            'ir veikts Redeploy.',
        }}
      />
    );
  }

  if (!ready) return <div className="center-note">Ielādē…</div>;
  if (!session) return <AuthScreen />;
  if (recovery) return <NewPasswordScreen onDone={() => setRecovery(false)} />;

  return <AppShell session={session} />;
}

function msgOf(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: string }).message);
  }
  return String(err);
}
