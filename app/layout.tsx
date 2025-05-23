import './globals.css';
import Navigation from '@/components/navigation';
import { ThemeProvider } from '@/components/providers/theme-provider';
import type { Database } from '@/types/supabasetype';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Metadata } from 'next';
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
  openGraph: {
    title: 'MeerChat - みーあちゃっと',
    description: 'おだやかな会話を楽しむチャットアプリ',
    url: 'https://mienaisekkeizu.com/',
    siteName: 'MeerChat',
    images: [
      {
        url: '/ogp.png',
        width: 1200,
        height: 630,
        alt: 'MeerChat',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeerChat - みーあちゃっと',
    description: 'おだやかな会話を楽しむチャットアプリ',
    images: ['/ogp.png'],
  },
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
