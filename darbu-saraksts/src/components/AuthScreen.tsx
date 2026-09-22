'use client';

import { useState } from 'react';
import { getSupabase, googleEnabled } from '@/lib/supabase';
import Icon from './Icon';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const supabase = getSupabase();
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo('Uz e-pastu nosūtīta apstiprinājuma saite. Atver to un tad piesakies.');
          setMode('login');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  }

  async function magicLink() {
    if (!email.trim()) {
      setError('Vispirms ieraksti e-pasta adresi.');
      return;
    }
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setInfo('Pārbaudi e-pastu — nosūtījām pieteikšanās saiti.');
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      setError(readableError(err));
    }
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo">
          <Icon name="check" />
        </div>
        <div className="auth-title">Darbu saraksts</div>
        <div className="auth-sub">
          {mode === 'login' ? 'Piesakies, lai redzētu savus darbus' : 'Izveido kontu ar e-pastu'}
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {info ? <div className="alert alert-ok">{info}</div> : null}

        <div className="field">
          <label className="label" htmlFor="email">
            E-pasts
          </label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="vards@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="password">
            Parole
          </label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="Vismaz 6 rakstzīmes"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? 'Uzgaidi…' : mode === 'login' ? 'Pieteikties' : 'Reģistrēties'}
        </button>

        <div className="divider-or">vai</div>

        <button className="btn btn-block" type="button" onClick={magicLink} disabled={busy}>
          <Icon name="mail" />
          Atsūtīt pieteikšanās saiti
        </button>

        {googleEnabled ? (
          <button className="btn btn-block" type="button" onClick={google} disabled={busy}>
            <Icon name="google" strokeWidth={0} />
            Turpināt ar Google
          </button>
        ) : null}

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Vēl nav konta?{' '}
              <button type="button" onClick={() => { setMode('register'); setError(null); setInfo(null); }}>
                Reģistrējies
              </button>
            </>
          ) : (
            <>
              Jau ir konts?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(null); setInfo(null); }}>
                Pieteikties
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

function readableError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const map: Record<string, string> = {
    'Invalid login credentials': 'Nepareizs e-pasts vai parole.',
    'Email not confirmed': 'E-pasts vēl nav apstiprināts — atver saiti, ko atsūtījām.',
    'User already registered': 'Šāds lietotājs jau pastāv. Mēģini pieteikties.',
    'Password should be at least 6 characters.': 'Parolei jābūt vismaz 6 rakstzīmes garai.',
  };
  return map[msg] ?? msg;
}
