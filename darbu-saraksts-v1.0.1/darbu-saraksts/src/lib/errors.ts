export function errorText(err: unknown): string {
  const msg =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: string }).message)
      : String(err);

  if (/row-level security/i.test(msg)) {
    return (
      'Datubāze neatļāva šo darbību. Visbiežāk tas nozīmē, ka Supabase nav palaista ' +
      'jaunākā supabase/schema.sql versija. Supabase → SQL Editor → ielīmē to failu un ' +
      'nospied Run (dati netiek zaudēti), tad pārlādē šo lapu.'
    );
  }
  if (/relation .* does not exist|could not find the table|schema cache/i.test(msg)) {
    return (
      'Datubāzē trūkst kādas tabulas. Supabase → SQL Editor → ielīmē failu ' +
      'supabase/schema.sql un nospied Run, tad pārlādē šo lapu.'
    );
  }
  if (/function .* does not exist/i.test(msg)) {
    return (
      'Datubāzē trūkst kādas funkcijas. Supabase → SQL Editor → ielīmē failu ' +
      'supabase/schema.sql un nospied Run, tad pārlādē šo lapu.'
    );
  }
  if (/duplicate key|already exists/i.test(msg)) {
    return 'Tāds ieraksts jau pastāv.';
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return 'Neizdevās sazināties ar datubāzi. Pārbaudi interneta savienojumu un mēģini vēlreiz.';
  }
  if (/jwt expired|invalid claim/i.test(msg)) {
    return 'Pieteikšanās ir novecojusi. Pārlādē lapu un piesakies vēlreiz.';
  }

  return msg;
}
