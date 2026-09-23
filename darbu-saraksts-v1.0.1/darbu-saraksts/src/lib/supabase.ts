'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function clean(value: string | undefined): string {
  return (value ?? '')
    .replace(/^\s*['"`]?|['"`]?\s*$/g, '')
    .replace(/[\s​]/g, '')
    .replace(/\/+$/, '');
}

function withScheme(value: string): string {
  if (!value) return '';
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return value;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i.test(value)) return `https://${value}`;
  return value;
}

function stripApiPath(value: string): string {
  try {
    const u = new URL(value);
    const isSupabaseCloud = /\.supabase\.(co|in)$/i.test(u.hostname);
    const isApiPath = /^\/(rest|auth|storage|realtime|functions|graphql)\/v\d+\/?$/i.test(u.pathname);
    if (isSupabaseCloud || isApiPath) return u.origin;
    return `${u.origin}${u.pathname.replace(/\/+$/, '')}`;
  } catch {
    return value;
  }
}

const url = stripApiPath(withScheme(clean(process.env.NEXT_PUBLIC_SUPABASE_URL)));
const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export type ConfigProblem = {
  title: string;
  what: string;
  fix: string;
  seen?: string;
};

function detectProblem(): ConfigProblem | null {
  const missing: string[] = [];
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (missing.length) {
    return {
      title: 'Nav ievadīti Supabase dati',
      what: `Trūkst ${missing.length === 2 ? 'abu vides mainīgo' : 'vides mainīgā'}: ${missing.join(' un ')}.`,
      fix:
        'Biežākā kļūda ir nosaukums: tam OBLIGĀTI jāsākas ar NEXT_PUBLIC_ — tikai tā nosauktus ' +
        'mainīgos Next.js nodod pārlūkam. Vercel: Settings → Environment Variables → pārliecinies, ' +
        'ka nosaukumi ir tieši NEXT_PUBLIC_SUPABASE_URL un NEXT_PUBLIC_SUPABASE_ANON_KEY (nevis ' +
        'SUPABASE_URL un SUPABASE_ANON_KEY) → pēc tam Deployments → pēdējais izvietojums → ⋯ → ' +
        'Redeploy. Bez Redeploy izmaiņas nesāk darboties.',
    };
  }

  if (/^(sb_publishable_|sb_secret_|eyJ)/.test(url)) {
    return {
      title: 'Adreses laukā ievadīta atslēga',
      what: 'Mainīgajā NEXT_PUBLIC_SUPABASE_URL ir ierakstīta Supabase atslēga, nevis projekta adrese.',
      fix:
        'Adreses laukā jāieraksta projekta adrese — https://xxxxxxxxxxxx.supabase.co. ' +
        'To atrod: Supabase → Project Settings → API → “Project URL”. ' +
        'Bet atslēga (sb_publishable_… vai eyJ…) pieder otram mainīgajam — NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      seen: `${url.slice(0, 22)}…`,
    };
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(url);
  } catch {
    parsed = null;
  }

  if (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) {
    return {
      title: 'Nederīga Supabase adrese',
      what: 'NEXT_PUBLIC_SUPABASE_URL nav derīga interneta adrese.',
      fix: 'Tai jāizskatās tieši šādi: https://xxxxxxxxxxxx.supabase.co — bez pēdiņām un atstarpēm. Atrodama: Supabase → Project Settings → API → Project URL.',
      seen: url.slice(0, 60),
    };
  }

  if (/(^|\.)supabase\.com$/i.test(parsed.hostname) || parsed.pathname.includes('/dashboard')) {
    return {
      title: 'Nokopēta nepareizā adrese',
      what: 'NEXT_PUBLIC_SUPABASE_URL ir Supabase mājaslapas adrese, nevis tava projekta adrese.',
      fix: 'Vajadzīgā adrese ir Supabase → Project Settings → API → “Project URL”. Tā beidzas ar .supabase.co, nevis .supabase.com.',
      seen: `${parsed.origin}${parsed.pathname === '/' ? '' : parsed.pathname}`.slice(0, 60),
    };
  }

  if (/^https?:/i.test(anonKey) || anonKey.includes('supabase.co')) {
    return {
      title: 'Adrese un atslēga samainītas vietām',
      what: 'Laukā NEXT_PUBLIC_SUPABASE_ANON_KEY ir ierakstīta adrese, nevis atslēga.',
      fix: 'URL laukā liec Project URL, atslēgas laukā — “anon public” atslēgu (gara rakstzīmju virkne). Abas atrodamas: Supabase → Project Settings → API.',
    };
  }

  if (anonKey.length < 30) {
    return {
      title: 'Nederīga Supabase atslēga',
      what: `NEXT_PUBLIC_SUPABASE_ANON_KEY ir pārāk īsa (${anonKey.length} rakstzīmes).`,
      fix: 'Nokopē visu “anon public” atslēgu no Supabase → Project Settings → API. Tā ir vairāk nekā 100 rakstzīmes gara.',
    };
  }

  return null;
}

export const CONFIG_PROBLEM: ConfigProblem | null = detectProblem();

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
  return cached;
}

export const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE === 'true';
