'use client';

import dynamic from 'next/dynamic';

// Visa aplikācija darbojas pārlūkā (Supabase klients + sesija),
// tāpēc to ielādējam bez servera puses renderēšanas.
const AppRoot = dynamic(() => import('@/components/AppRoot'), {
  ssr: false,
  loading: () => <div className="center-note">Ielādē…</div>,
});

export default function Page() {
  return <AppRoot />;
}
