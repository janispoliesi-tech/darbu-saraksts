'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isConfigured } from '@/lib/supabase';
import { applyTheme, loadSettings } from '@/lib/settings';
import AuthScreen from './AuthScreen';
import AppShell from './AppShell';

export default function AppRoot() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  // Gaišais/tumšais režīms jāuzstāda arī pirms pieteikšanās
  useEffect(() => {
    applyTheme(loadSettings().theme);
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setReady(true);
      return;
    }
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isConfigured) {
    return (
      <div className="auth">
        <div className="auth-card">
          <div className="auth-title">Trūkst Supabase datu</div>
          <div className="alert alert-error">
            Nav norādīts <code>NEXT_PUBLIC_SUPABASE_URL</code> vai{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </div>
          <p className="hint">
            Uz sava datora izveido failu <b>.env.local</b> (paraugs ir <b>.env.example</b>). Uz Vercel
            šos mainīgos pievieno sadaļā <b>Settings → Environment Variables</b> un pēc tam vēlreiz
            izvieto projektu. Sīkāk — README.md.
          </p>
        </div>
      </div>
    );
  }

  if (!ready) return <div className="center-note">Ielādē…</div>;
  if (!session) return <AuthScreen />;

  return <AppShell session={session} />;
}
