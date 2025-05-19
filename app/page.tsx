"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { ComponentWrapper } from "@/components/ComponentWrapper"
import { useIframeHeight } from './hooks/useIframeHeight'
import { sendMessage } from './types/message'

export default function Home() {
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // iframeの高さを管理
  useIframeHeight()

  // 認証状態の確認
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  // カウンター値の更新を通知
  useEffect(() => {
    sendMessage({
      type: 'COUNTER_UPDATE',
      value: count
    })
  }, [count])

  const handleChatNavigation = () => {
    sendMessage({
      type: 'CHAT_NAVIGATION',
      message: 'チャットページに移動します'
    })
    router.push('/chats')
  }

  if (loading) {
    return (
      <ComponentWrapper componentName="HomePage" zIndex={1}>
        <div className="flex items-center justify-center min-h-screen bg-chat-bg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
        </div>
      </ComponentWrapper>
    )
  }

  return (
    <ComponentWrapper componentName="HomePage" zIndex={1}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-chat-bg">
        <div className="relative w-64 h-64 mb-8">
          <Image
            src="/meerchat.webp"
            alt="MeerChat Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ようこそ!</h1>
          <button
            onClick={handleChatNavigation}
            className="px-6 py-2 bg-send-button text-gray-700 rounded-lg hover:bg-send-button/80 transition-colors"
          >
            話そう!おだやかに
          </button>
        </div>
      </div>
    </ComponentWrapper>
  )
}