'use client';

import type { ConfigProblem } from '@/lib/supabase';
import Icon from './Icon';

export default function ConfigError({ problem }: { problem: ConfigProblem }) {
  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-logo" style={{ background: 'var(--danger)' }}>
          <Icon name="close" strokeWidth={2.6} />
        </div>
        <div className="auth-title">{problem.title}</div>

        <div className="alert alert-error">{problem.what}</div>

        {problem.seen ? (
          <p className="hint">
            Pašlaik ievadīts: <code>{problem.seen}</code>
          </p>
        ) : null}

        <div className="field">
          <div className="label">Kā salabot</div>
          <p className="hint">{problem.fix}</p>
        </div>

        <p className="hint">
          Pilna instrukcija ir projekta failā <b>README.md</b>, sadaļā „1. solis — Supabase“
          un „3. solis — Vercel“.
        </p>
      </div>
    </div>
  );
}
