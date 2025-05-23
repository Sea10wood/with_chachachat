'use client';

import DateFormatter from '@/components/date';
import type { Database } from '@/types/supabasetype';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DOMPurify from 'dompurify';
import { gsap } from 'gsap';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  chatData: Database['public']['Tables']['Chats']['Row'];
  index: number;
  isInitialLoad?: boolean;
}

export default function ChatUI(props: Props) {
  const { chatData, index, isInitialLoad = false } = props;
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<
    Database['public']['Tables']['profiles']['Row'] | null
  >(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, [supabase]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select()
        .eq('id', chatData.uid)
        .single();
      setProfile(data);
    };
    fetchProfile();
  }, [chatData.uid, supabase]);

  const animateMessage = useCallback(() => {
    if (!messageRef.current || !isInitialLoad || hasAnimated.current) return;

    // 既存のアニメーションをクリーンアップ
    if (animationRef.current) {
      animationRef.current.kill();
    }

    hasAnimated.current = true;
    animationRef.current = gsap.fromTo(
      messageRef.current,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: index * 0.1,
        ease: 'power2.out',
        onComplete: () => {
          animationRef.current = null;
        },
      }
    );
  }, [index, isInitialLoad]);

  useEffect(() => {
    if (messageRef.current && !isInitialLoad) {
      // 初期ロード以外の場合は即時表示
      gsap.set(messageRef.current, {
        opacity: 1,
        y: 0,
      });
    } else {
      animateMessage();
    }
    // クリーンアップ関数
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [isInitialLoad, animateMessage]);

  const isCurrentUser = currentUserId === chatData.uid;
  const isAIResponse = chatData.is_ai_response;

  // メッセージ内の@meerchatをハイライト表示する関数
  const highlightMentions = (text: string) => {
    // 入力テキストのサニタイズ
    const sanitizedText = DOMPurify.sanitize(text);
    const parts = sanitizedText.split(/(@meerchat)/g);
    return parts.map((part, i) =>
      part === '@meerchat' ? (
        <span
          key={`mention-${i}-${part}`}
          className="bg-ai-message/80 dark:bg-ai-message/40 px-1 rounded font-medium"
        >
          {part}
        </span>
      ) : (
        <span key={`text-${i}-${part}`}>{part}</span>
      )
    );
  };

  return (
    <div
      ref={messageRef}
      className={`flex gap-2 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isInitialLoad ? 'opacity-0' : ''}`}
    >
      {!isCurrentUser && (
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 relative mb-1">
            <Image
              src={
                isAIResponse ? '/ai.webp' : profile?.avatar_url || '/user.webp'
              }
              alt={isAIResponse ? 'AI' : profile?.name || 'User'}
              fill
              className="rounded-full object-cover"
              sizes="32px"
              priority={index < 5}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/user.webp';
              }}
            />
          </div>
          {!isAIResponse && (
            <p className="text-[8px] text-gray-600 dark:text-gray-400">
              {profile?.name || 'ユーザー'}
            </p>
          )}
        </div>
      )}
      <div
        className={`max-w-[70%] ${
          isAIResponse
            ? 'bg-ai-message dark:bg-ai-message/40 text-gray-800 dark:text-global-bg'
            : isCurrentUser
              ? 'bg-my-message dark:bg-my-message/40 text-gray-800 dark:text-global-bg'
              : 'bg-other-message dark:bg-other-message/40 text-gray-800 dark:text-global-bg'
        } rounded-lg p-3`}
      >
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
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/user.webp';
            }}
          />
        </div>
      )}
    </div>
  );
}
