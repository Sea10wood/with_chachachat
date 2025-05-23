'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SideBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState('');

  const threads = [
    { id: 'thread1', name: 'ひとりごと' },
    { id: 'thread2', name: '連絡' },
    { id: 'thread3', name: 'ゆるぼ' },
    { id: 'thread4', name: 'ごはん' },
    { id: 'thread5', name: '思い出' },
  ];

  useEffect(() => {
    const channelName = searchParams.get('channel_name');
    if (channelName) {
      setSelectedId(channelName);
    }
  }, [searchParams]);

  const handleThreadClick = (threadId: string) => {
    setSelectedId(threadId);
    router.push(`/chats?channel_name=${threadId}`);
  };

  return (
    <div className="w-64 border-r border-border bg-sidebar-bg dark:bg-black/20 h-full overflow-y-auto flex flex-col">
      <div className="p-4 flex-grow">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-global-bg">
          スレッド一覧
        </h2>
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              className={`w-full p-2 rounded cursor-pointer transition-all text-left ${
                selectedId === thread.id
                  ? 'bg-send-button/20 dark:bg-send-button/10 shadow-md transform scale-[1.02] border-l-4 border-send-button'
                  : 'hover:bg-send-button/10 dark:hover:bg-send-button/5'
              }`}
              onClick={() => handleThreadClick(thread.id)}
              aria-label={`スレッド: ${thread.name || '無題'}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedId === thread.id
                      ? 'bg-send-button text-black dark:text-global-bg'
                      : 'bg-send-button/20 text-black dark:text-global-bg/80'
                  }`}
                >
                  {thread.name.charAt(0)}
                </div>
                <span
                  className={`font-medium ${
                    selectedId === thread.id
                      ? 'text-black dark:text-global-bg'
                      : 'text-black/70 dark:text-global-bg/70'
                  }`}
                >
                  {thread.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
