'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Droša iziešana no konta.
 * Ja Supabase atbilde neizdodas (piem., sesija jau beigusies), sesiju tomēr
 * notīra lokāli un lapu pārlādē, lai lietotājs noteikti nonāk pieteikšanās ekrānā.
 */
export async function signOut(supabase: SupabaseClient): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      /* nav ko darīt — turpinām ar lokālo tīrīšanu */
    }
  }

  try {
    // Notīra Supabase sesijas atslēgas (izskata iestatījumus saglabā)
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('sb-') || k === 'ds.board')) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* localStorage var nebūt pieejams */
  }

  window.location.replace(window.location.pathname);
}
