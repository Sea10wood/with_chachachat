"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from 'next/image'
import { Database } from "@/types/supabasetype"
import { useEffect, useState, Dispatch, SetStateAction } from "react"
import { useRouter } from 'next/navigation'

interface Props {
  profiles: Database["public"]["Tables"]["profiles"]["Row"][]
  setProfiles: Dispatch<SetStateAction<Database["public"]["Tables"]["profiles"]["Row"][]>>,
  handleClick: Function
}

export default function SideBar(
  props: Props
) {
  const { profiles, setProfiles, handleClick } = props
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [selectedId, setSelectedId] = useState("");

  const threads = [
    { id: "thread1", name: "スレッド1" },
    { id: "thread2", name: "スレッド2" },
    { id: "thread3", name: "スレッド3" },
    { id: "thread4", name: "スレッド4" },
    { id: "thread5", name: "スレッド5" },
  ]

  const handleThreadClick = (threadId: string) => {
    setSelectedId(threadId)
    router.push(`/chats?channel_name=${threadId}`)
  }

  return (
    <div className="flex flex-col w-2/5 border-r-2 overflow-y-auto">
      <div className="p-4 border-b-2">
        <h2 className="text-xl font-bold mb-4">スレッド一覧</h2>
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
              selectedId === thread.id ? 'bg-gray-100' : ''
            }`}
            onClick={() => handleThreadClick(thread.id)}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
              {thread.name.charAt(thread.name.length - 1)}
            </div>
            <div>
              <div className="font-medium">{thread.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 