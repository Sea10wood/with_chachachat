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

  // メッセージ内の@meerchatをハイライト表示する関数
  const highlightMentions = (text: string) => {
    const parts = text.split(/(@meerchat)/g);
    return parts.map((part, i) => 
      part === '@meerchat' ? (
        <span key={i} className="bg-ai-message/80 px-1 rounded font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`flex gap-2 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 relative mb-1">
            <Image
              src={isAIResponse ? "/ai.webp" : (profile?.avatar_url || '/user.webp')}
              alt={isAIResponse ? "AI" : (profile?.name || 'User')}
              fill
              className="rounded-full object-cover"
              sizes="32px"
              priority={index < 5}
            />
          </div>
          {!isAIResponse && (
            <p className="text-[8px] text-gray-600">{profile?.name || 'ユーザー'}</p>
          )}
        </div>
      )}
      <div className={`max-w-[70%] ${
        isAIResponse 
          ? 'bg-ai-message text-gray-800'
          : isCurrentUser 
            ? 'bg-my-message text-gray-800' 
            : 'bg-other-message text-gray-800'
      } rounded-lg p-3`}>
        <p className="text-sm">{highlightMentions(chatData.message)}</p>
      </div>
      {isCurrentUser && (
        <div className="w-8 h-8 relative">
          <Image
            src={profile?.avatar_url || '/user.webp'}
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