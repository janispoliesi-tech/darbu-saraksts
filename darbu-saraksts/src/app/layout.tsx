import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/roboto';
import '@fontsource-variable/nunito';
import '@fontsource-variable/montserrat';
import '@fontsource-variable/source-serif-4';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Darbu saraksts',
  description: 'Darāmo darbu saraksts ar sadaļām — mājas, būvniecība, teritorija.',
  applicationName: 'Darbu saraksts',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6f8' },
    { media: '(prefers-color-scheme: dark)', color: '#12171d' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body>{children}</body>
    </html>
  );
}
