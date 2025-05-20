"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabasetype"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import PageTransition from "@/components/PageTransition"

export default function Home() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking user:', error)
        setIsLoading(false)
      }
    }

    checkUser()
  }, [supabase.auth])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-chat-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen bg-chat-bg">
        <div className="relative w-64 h-64 mb-8 animate-fade-in">
          <Image
            src="/meerchat.webp"
            alt="MeerChat Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-2xl font-bold mb-4">ようこそ!</h1>
          <button
            onClick={() => router.push('/chats')}
            className="px-6 py-2 bg-send-button text-gray-700 rounded-lg hover:bg-send-button/80 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            話そう!おだやかに
          </button>
        </div>
      </div>
    </PageTransition>
  )
}