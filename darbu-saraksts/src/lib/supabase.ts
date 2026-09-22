'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Vai vides mainīgie ir aizpildīti? */
export const isConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

/**
 * Pārlūka Supabase klients. Sesija tiek glabāta lokāli un atjaunota automātiski.
 * detectSessionInUrl ļauj apstrādāt e-pasta apstiprinājuma un Google atgriešanās saites.
 */
export function getSupabase(): SupabaseClient {
  if (!isConfigured) {
    throw new Error(
      'Trūkst NEXT_PUBLIC_SUPABASE_URL vai NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Skaties README.md sadaļu "Supabase".'
    );
  }
  if (!cached) {
    cached = createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  }
  return cached;
}

export const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE === 'true';
