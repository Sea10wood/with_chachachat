'use client';

import PageTransition from '@/components/PageTransition';
import Button from '@/components/atoms/Button/Button';
import Loading from '@/components/loading';
import type { Database } from '@/types/supabasetype';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await supabase.auth.getSession();
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking user:', error);
        setIsLoading(false);
      }
    };

    checkUser();
  }, [supabase.auth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-chat-bg dark:bg-black/40">
        <Loading />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen bg-chat-bg dark:bg-black/40">
        <div className="relative w-64 h-64 mb-8 animate-fade-in">
          <Image
            src="/meerchat.webp"
            alt="MeerChat Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <div
          className="text-center animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <h1 className="text-2xl font-bold mb-4 text-black dark:text-global-bg">
            ようこそ!
          </h1>
          <Button
            variant="primary"
            onClick={() => router.push('/chats')}
            className="px-6 py-2 bg-send-button text-black dark:text-global-bg rounded-lg hover:bg-send-button/80 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            話そう!おだやかに
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
