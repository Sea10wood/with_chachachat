"use client"
import { Database } from "@/types/supabasetype"
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface SideBarProps {
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
  handleClick: (id: string) => void;
}

export default function SideBar({ profiles, setProfiles, handleClick }: SideBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedId, setSelectedId] = useState("")

  const threads = [
    { id: 'thread1', name: 'ひとりごと' },
    { id: 'thread2', name: '連絡' },
    { id: 'thread3', name: 'ゆるぼ' },
    { id: 'thread4', name: 'ごはん' },
    { id: 'thread5', name: '思い出' },
  ]

  useEffect(() => {
    const channelName = searchParams.get('channel_name')
    if (channelName) {
      setSelectedId(channelName)
    }
  }, [searchParams])

  const handleThreadClick = (threadId: string) => {
    setSelectedId(threadId)
    router.push(`/chats?channel_name=${threadId}`)
  }

  return (
    <div className="w-64 border-r bg-sidebar-bg h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">スレッド一覧</h2>
        <div className="space-y-2">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`p-2 rounded cursor-pointer transition-all ${
                selectedId === thread.id 
                  ? 'bg-sidebar-bg/90 shadow-md transform scale-[1.02] border-l-4 border-gray-700' 
                  : 'hover:bg-sidebar-bg/80'
              }`}
              onClick={() => handleThreadClick(thread.id)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedId === thread.id 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-sidebar-bg/80'
                }`}>
                  {thread.name.charAt(0)}
                </div>
                <span className={`font-medium ${
                  selectedId === thread.id ? 'text-gray-800' : 'text-gray-600'
                }`}>
                  {thread.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 