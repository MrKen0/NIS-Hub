import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: 'NIS Hub',
  description: 'Naijas in Stevenage community hub',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/apple-touch-icon.svg',
  },
  openGraph: {
    title: 'NIS Hub',
    description: 'Community hub for Naijas in Stevenage',
    url: 'https://example.com',
    siteName: 'NIS Hub',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
