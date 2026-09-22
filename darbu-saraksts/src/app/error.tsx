'use client';

import { useEffect } from 'react';

/**
 * Drošības tīkls: ja kaut kur rodas negaidīta kļūda, lietotājs redz
 * saprotamu paziņojumu latviski, nevis tukšu ekrānu.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Darbu saraksts — kļūda:', error);
  }, [error]);

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-title">Radās kļūda</div>
        <p className="auth-sub">Aplikāciju neizdevās ielādēt.</p>

        <div className="alert alert-error" style={{ whiteSpace: 'pre-wrap' }}>
          {error.message || 'Nezināma kļūda'}
        </div>

        <div className="field">
          <div className="label">Ko pārbaudīt vispirms</div>
          <p className="hint">
            1. Vercel → Settings → <b>Environment Variables</b>: vai ir pievienoti{' '}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> un <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>?
            <br />
            2. Vai pēc to pievienošanas veikts <b>Redeploy</b>? Bez tā jaunās vērtības netiek
            izmantotas.
            <br />
            3. Supabase → SQL Editor: vai ir palaists fails <code>supabase/schema.sql</code>?
          </p>
        </div>

        <button className="btn btn-primary btn-block" onClick={reset}>
          Mēģināt vēlreiz
        </button>
        {error.digest ? <p className="hint">Kļūdas kods: {error.digest}</p> : null}
      </div>
    </div>
  );
}
