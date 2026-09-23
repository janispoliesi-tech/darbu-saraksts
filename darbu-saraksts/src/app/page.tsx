'use client';

import dynamic from 'next/dynamic';

const AppRoot = dynamic(() => import('@/components/AppRoot'), {
  ssr: false,
  loading: () => <div className="center-note">Ielādē…</div>,
});

export default function Page() {
  return <AppRoot />;
}
