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

  return (
    <div className={`flex gap-2 mb-4 ${chatData.is_ai_response ? 'justify-start' : 'justify-end'}`}>
      {chatData.is_ai_response && (
        <div className="w-8 h-8 relative">
          <Image
            src="/ai.png"
            alt="AI"
            fill
            className="rounded-full object-cover"
            sizes="32px"
            priority={index < 5}
          />
        </div>
      )}
      <div className={`max-w-[70%] ${chatData.is_ai_response ? 'bg-gray-100' : 'bg-blue-500 text-white'} rounded-lg p-3`}>
        <p className="text-sm">{chatData.message}</p>
      </div>
      {!chatData.is_ai_response && profile && (
        <div className="w-8 h-8 relative">
          <Image
            src={profile.avatar_url || '/user.png'}
            alt={profile.name || 'User'}
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