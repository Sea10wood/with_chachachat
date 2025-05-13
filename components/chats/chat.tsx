"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabasetype"
import { useEffect, useState } from "react"
import DateFormatter from '@/components/date';

interface Props {
  chatData: Database["public"]["Tables"]["Chats"]["Row"],
  index: number,
}

export default function ChatUI(props: Props) {
  const { chatData, index } = props
  const supabase = createClientComponentClient()
  const [username, setUsername] = useState("")
  const [isMyMessage, setIsMyMessage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user == null) {
          setIsLoading(false)
          return
        }

        // 自分のメッセージかどうかを判定
        setIsMyMessage(user.id === chatData.uid)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select()
          .eq("id", chatData.uid)

        if (error) {
          console.log(error)
          setUsername('不明なユーザー')
          setIsLoading(false)
          return
        }

        if (profile && profile.length > 0) {
          setUsername(profile[0].name)
        } else {
          setUsername('不明なユーザー')
        }
        setIsLoading(false)

      } catch (error) {
        console.error(error)
        setUsername('不明なユーザー')
        setIsLoading(false)
      }
    }

    getData()
  }, [chatData.uid, supabase])

  if (isLoading) {
    return (
      <div className="flex items-start gap-2 p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-8 w-8"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-2 p-4 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      <img
        src={chatData.is_ai_response ? "/ai.png" : "/user.png"}
        className="object-cover h-8 w-8 rounded-full"
        alt=""
      />
      <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
        <div
          className={`py-3 px-4 rounded-2xl ${
            isMyMessage 
              ? "bg-blue-400 rounded-tr-none" 
              : "bg-gray-400 rounded-tl-none"
          } text-white`}
        >
          {chatData.message}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-gray-500 text-xs">{username}</span>
          <span className="text-gray-500 text-xs">
            <DateFormatter timestamp={chatData.created_at || ''} />
          </span>
        </div>
      </div>
    </div>
  )
}