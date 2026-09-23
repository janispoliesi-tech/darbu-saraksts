'use client';

import { useState } from 'react';
import { getSupabase, googleEnabled } from '@/lib/supabase';
import Icon from './Icon';
import PasswordInput from './PasswordInput';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isRegister = mode === 'register';

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
    setPassword('');
    setPassword2('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const mail = email.trim();
    if (!mail) {
      setError('Ieraksti e-pasta adresi.');
      return;
    }
    if (password.length < 6) {
      setError('Parolei jābūt vismaz 6 rakstzīmes garai.');
      return;
    }
    if (isRegister && password !== password2) {
      setError('Paroles nesakrīt. Pārbaudi abus laukus — ar actiņu var apskatīt ierakstīto.');
      return;
    }

    setBusy(true);
    try {
      const supabase = getSupabase();

      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: mail,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo('Konts izveidots. Uz e-pastu nosūtīta apstiprinājuma saite — atver to un tad piesakies.');
          setMode('login');
          setPassword('');
          setPassword2('');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  }

  async function forgotPassword() {
    const mail = email.trim();
    if (!mail) {
      setError('Vispirms ieraksti savu e-pasta adresi, un tad spied šeit vēlreiz.');
      setInfo(null);
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(mail, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setInfo('Uz e-pastu nosūtīta saite paroles nomaiņai. Atver to šajā pašā ierīcē.');
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
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
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="auth-logo">
          <Icon name="check" />
        </div>
        <div className="auth-title">Darbu saraksts</div>
        <div className="auth-sub">
          {isRegister ? 'Izveido kontu ar e-pastu' : 'Piesakies, lai redzētu savus darbus'}
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {info ? <div className="alert alert-ok">{info}</div> : null}

        <div className="field">
          <label className="label" htmlFor="email">E-pasts</label>
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
          <div className="label-row">
            <label className="label" htmlFor="password">Parole</label>
            {!isRegister ? (
              <button type="button" className="linkish" onClick={forgotPassword} disabled={busy}>
                Aizmirsi paroli?
              </button>
            ) : null}
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder={isRegister ? 'Vismaz 6 rakstzīmes' : 'Tava parole'}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </div>

        {isRegister ? (
          <div className="field">
            <label className="label" htmlFor="password2">Atkārto paroli</label>
            <PasswordInput
              id="password2"
              value={password2}
              onChange={setPassword2}
              placeholder="Tā pati parole vēlreiz"
              autoComplete="new-password"
            />
            {password2.length > 0 && password !== password2 ? (
              <p className="hint" style={{ color: 'var(--danger)' }}>Paroles pagaidām nesakrīt.</p>
            ) : null}
          </div>
        ) : null}

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? 'Uzgaidi…' : isRegister ? 'Reģistrēties' : 'Pieteikties'}
        </button>

        {googleEnabled ? (
          <>
            <div className="divider-or">vai</div>
            <button className="btn btn-block" type="button" onClick={google} disabled={busy}>
              <Icon name="google" strokeWidth={0} />
              Turpināt ar Google
            </button>
          </>
        ) : null}

        <div className="auth-switch">
          {isRegister ? (
            <>
              Jau ir konts?{' '}
              <button type="button" onClick={() => switchMode('login')}>Pieteikties</button>
            </>
          ) : (
            <>
              Vēl nav konta?{' '}
              <button type="button" onClick={() => switchMode('register')}>Reģistrējies</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export function readableError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  const exact: Record<string, string> = {
    'Invalid login credentials': 'Nepareizs e-pasts vai parole.',
    'Email not confirmed': 'E-pasts vēl nav apstiprināts — atver saiti, ko atsūtījām.',
    'User already registered': 'Šāds lietotājs jau pastāv. Mēģini pieteikties.',
    'Password should be at least 6 characters.': 'Parolei jābūt vismaz 6 rakstzīmes garai.',
    'New password should be different from the old password.':
      'Jaunajai parolei jāatšķiras no vecās.',
  };
  if (exact[msg]) return exact[msg];

  if (/invalid path specified/i.test(msg)) {
    return (
      'Nepareiza Supabase adrese. Mainīgajā NEXT_PUBLIC_SUPABASE_URL jābūt tikai ' +
      'https://xxxxxxxx.supabase.co — bez nekā aiz tās. Pielabo to Vercel iestatījumos un veic Redeploy.'
    );
  }
  if (/invalid api key|jwt|api key/i.test(msg)) {
    return (
      'Supabase nepieņem atslēgu. Pārbaudi NEXT_PUBLIC_SUPABASE_ANON_KEY — tai jābūt ' +
      '“Publishable” vai “anon public” atslēgai no tā paša projekta, kura adrese norādīta.'
    );
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return 'Neizdevās sazināties ar Supabase. Pārbaudi projekta adresi un interneta savienojumu.';
  }
  if (/signups? not allowed|signups are disabled/i.test(msg)) {
    return 'Reģistrēšanās ir izslēgta. Supabase → Authentication → Providers → Email → ieslēdz “Allow new users to sign up”.';
  }
  if (/for security purposes/i.test(msg)) {
    return 'Pārāk bieži mēģinājumi. Uzgaidi dažas sekundes un mēģini vēlreiz.';
  }
  if (/unable to validate email|invalid email/i.test(msg)) {
    return 'Nederīga e-pasta adrese.';
  }

  return msg;
}
