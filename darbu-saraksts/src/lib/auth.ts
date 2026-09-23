'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

export async function signOut(supabase: SupabaseClient): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {}
  }

  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('sb-') || k === 'ds.board')) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {}

  window.location.replace(window.location.pathname);
}
