'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import Icon from './Icon';
import PasswordInput from './PasswordInput';
import { readableError } from './AuthScreen';

export default function NewPasswordScreen({ onDone }: { onDone: () => void }) {
  const supabase = getSupabase();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Parolei jābūt vismaz 6 rakstzīmes garai.');
      return;
    }
    if (password !== password2) {
      setError('Paroles nesakrīt.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      onDone();
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="auth-logo">
          <Icon name="lock" />
        </div>
        <div className="auth-title">Jauna parole</div>
        <div className="auth-sub">Izdomā jaunu paroli savam kontam</div>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="field">
          <label className="label" htmlFor="np1">Jaunā parole</label>
          <PasswordInput
            id="np1"
            value={password}
            onChange={setPassword}
            placeholder="Vismaz 6 rakstzīmes"
            autoComplete="new-password"
            autoFocus
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="np2">Atkārto paroli</label>
          <PasswordInput
            id="np2"
            value={password2}
            onChange={setPassword2}
            placeholder="Tā pati parole vēlreiz"
            autoComplete="new-password"
          />
          {password2.length > 0 && password !== password2 ? (
            <p className="hint" style={{ color: 'var(--danger)' }}>Paroles pagaidām nesakrīt.</p>
          ) : null}
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? 'Saglabā…' : 'Saglabāt paroli'}
        </button>

        <button className="btn btn-ghost btn-block" type="button" onClick={() => signOut(supabase)}>
          Atcelt un iziet
        </button>
      </form>
    </div>
  );
}
