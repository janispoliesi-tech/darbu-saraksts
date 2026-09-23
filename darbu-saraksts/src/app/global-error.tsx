'use client';

import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="lv">
      <body>
        <div className="auth">
          <div className="auth-card">
            <div className="auth-title">Radās kļūda</div>
            <div className="alert alert-error" style={{ whiteSpace: 'pre-wrap' }}>
              {error.message || 'Nezināma kļūda'}
            </div>
            <p className="hint">
              Pārbaudi Vercel vides mainīgos (Settings → Environment Variables) un pēc labošanas
              veic Redeploy.
            </p>
            <button className="btn btn-primary btn-block" onClick={reset}>
              Mēģināt vēlreiz
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
