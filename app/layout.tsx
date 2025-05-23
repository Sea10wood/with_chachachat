import './globals.css';
import Navigation from '@/components/navigation';
import { ThemeProvider } from '@/components/providers/theme-provider';
import type { Database } from '@/types/supabasetype';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: false,
});

export const metadata: Metadata = {
  title: 'MeerChat - みーあちゃっと',
  description: 'おだやかな会話を楽しむチャットアプリ',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    title: 'MeerChat - みーあちゃっと',
    description: 'おだやかな会話を楽しむチャットアプリ',
    url: 'https://mienaisekkeizu.com/',
    siteName: 'MeerChat',
    images: [
      {
        url: '/ogp-optimized.png',
        width: 1200,
        height: 630,
        alt: 'MeerChat - 快適なチャット体験を提供するコミュニケーションプラットフォーム',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeerChat - みーあちゃっと',
    description: 'おだやかな会話を楽しむチャットアプリ',
    images: ['/ogp-optimized.png'],
    creator: '@mienaisekkeizu',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content={`${viewport.width}; initial-scale=${viewport.initialScale}; maximum-scale=${viewport.maximumScale}; user-scalable=${viewport.userScalable}`}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-global-bg dark:bg-black text-gray-900 dark:text-gray-100`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <div className="h-screen flex flex-col">
            <Navigation session={session} />
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
