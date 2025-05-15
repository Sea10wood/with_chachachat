"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabasetype"
import { useEffect, useState } from "react"
import DateFormatter from '@/components/date';
import Image from 'next/image'

interface Props {
  chatData: Database["public"]["Tables"]["Chats"]["Row"],
  index: number,
}

export default function ChatUI(props: Props) {
  const { chatData, index } = props
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<Database["public"]["Tables"]["profiles"]["Row"] | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select()
        .eq('id', chatData.uid)
        .single()
      setProfile(data)
    }
    fetchProfile()
  }, [chatData.uid])

  const isCurrentUser = currentUserId === chatData.uid
  const isAIResponse = chatData.is_ai_response

  return (
    <div className={`flex gap-2 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <div className="w-8 h-8 relative">
          <Image
            src={isAIResponse ? "/ai.png" : (profile?.avatar_url || '/user.png')}
            alt={isAIResponse ? "AI" : (profile?.name || 'User')}
            fill
            className="rounded-full object-cover"
            sizes="32px"
            priority={index < 5}
          />
        </div>
      )}
      <div className={`max-w-[70%] ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
        <p className="text-sm">{chatData.message}</p>
      </div>
      {isCurrentUser && (
        <div className="w-8 h-8 relative">
          <Image
            src={profile?.avatar_url || '/user.png'}
            alt={profile?.name || 'User'}
            fill
            className="rounded-full object-cover"
            sizes="32px"
            priority={index < 5}
          />
        </div>
      )}
    </div>
  )
}