import './globals.css'
import { Inter } from 'next/font/google'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Metadata } from "next"
import Navigation from '@/components/navigation'
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Database } from "@/types/supabasetype"
import { redirect } from "next/navigation"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MeerChat',
  description: 'おだやかな会話を楽しむチャットアプリ',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-global-bg dark:bg-black`} suppressHydrationWarning>
        <ThemeProvider>
          <div className="h-screen flex flex-col">
            <Navigation session={session} />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
