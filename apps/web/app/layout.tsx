import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata:  Metadata = {
  title: {
    default: 'AssetBox - Premium Digital Assets',
    template:  '%s | AssetBox',
  },
  description: 
    'Discover and sell premium digital assets. Photos, videos, audio, templates, and more from verified creators.',
  keywords: [
    'digital assets',
    'stock photos',
    'stock videos',
    'audio files',
    'templates',
    'creative assets',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}