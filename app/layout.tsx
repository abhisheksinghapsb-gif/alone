import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://genesis6.aitpune.edu.in'),
  title: 'GENESIS 6 — 24-Hour Game Jam | Army Institute of Technology, Pune',
  description:
    'Genesis 6 is the premier 24-hour game jam at Army Institute of Technology, Pune, powered by the Game Development and AI Club (GDAI). 6th Edition, 2027.',
  keywords: [
    'Genesis 6',
    'Game Jam',
    'AIT Pune',
    'Army Institute of Technology',
    'GDAI',
    'Game Development',
    'Game Design',
    '2027',
  ],
  authors: [{ name: 'GDAI Club, AIT Pune' }],
  openGraph: {
    title: 'GENESIS 6 — 24-Hour Game Jam | AIT Pune',
    description:
      'Join Genesis 6, the 24-hour game development hackathon at Army Institute of Technology, Pune. 6th Edition, 2027.',
    type: 'website',
    images: [
      {
        url: '/assets/genesis/static/genesis-hero.webp',
        width: 1900,
        height: 1196,
        alt: 'GENESIS 6 Official Wordmark and Star Emblem',
      },
    ],
  },
  icons: {
    icon: '/assets/genesis/static/gdai-badge.webp',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#040414',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lilita+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
