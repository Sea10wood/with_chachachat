'use client';
import Button from '@/components/atoms/Button/Button';
import ChatUI from '@/components/chats/chat';
import Loading from '@/components/loading';
import MessagePopup from '@/components/molecules/MessagePopup';
import SideBar from '@/components/sidebar';
import type { Database } from '@/types/supabasetype';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import { debounce } from 'lodash';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const MESSAGE_LIMIT = 20;
const SCROLL_THRESHOLD = 50;
const BOTTOM_THRESHOLD = 50;
const MAX_MESSAGE_LENGTH = 1000;
const CHAR_COUNT_THRESHOLD = 995;
const SESSION_TIMEOUT = 30 * 60 * 1000;

export default function Chats() {
  const supabase = createClientComponentClient<Database>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelName = searchParams.get('channel_name');

  const [inputText, setInputText] = useState('');
  const [userID, setUserID] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<
    Database['public']['Tables']['Chats']['Row'][]
  >([]);
  const [_profiles, setProfiles] = useState<
    Database['public']['Tables']['profiles']['Row'][]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [oldestMessageDate, setOldestMessageDate] = useState<string | null>(
    null
  );
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollHeightRef = useRef<number>(0);
  const _isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  const [popupState, setPopupState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // メッセージの重複チェックと追加
  const addMessageIfNotExists = useCallback(
    (message: Database['public']['Tables']['Chats']['Row']) => {
      if (!message.id) return false;

      // チャンネルごとに重複チェックを行う
      const key = `${channelName}-${message.id}`;
      if (processedMessageIdsRef.current.has(key)) {
        return false;
      }
      processedMessageIdsRef.current.add(key);
      return true;
    },
    [channelName]
  );

  // チャンネル名が指定されていない場合、デフォルトチャンネルにリダイレクト
  useEffect(() => {
    if (!channelName) {
      router.push('/chats?channel_name=thread1');
    }
  }, [channelName, router]);

  // スクロール位置の管理
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      if (!element) return;

      const isNearTop = element.scrollTop < SCROLL_THRESHOLD;
      const isBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight <
        BOTTOM_THRESHOLD;

      setIsNearBottom(isBottom);

      // スクロール位置が上部に近づいたら過去メッセージを取得
      if (isNearTop && !isLoadingPrev && hasMore && oldestMessageDate) {
        scrollHeightRef.current = element.scrollHeight;
        fetchMoreMessages();
      }
    },
    [hasMore, isLoadingPrev, oldestMessageDate]
  );
  // 過去のメッセージを取得
  const fetchMoreMessages = async () => {
    if (!oldestMessageDate || isLoadingPrev || !channelName) {
      return;
    }

    setIsLoadingPrev(true);
    try {
      const { data, error } = await supabase
        .from('Chats')
        .select('*')
        .eq('channel', channelName)
        .lt('created_at', oldestMessageDate)
        .order('created_at', { ascending: false })
        .limit(MESSAGE_LIMIT);

      if (error) {
        console.error('過去メッセージ取得エラー:', error);
        return;
      }

      if (data && data.length > 0) {
        // 重複チェックとIDの記録
        const uniqueMessages = data.filter((msg) => addMessageIfNotExists(msg));

        // 時系列順にソート（古い順）
        const sortedMessages = uniqueMessages.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // 既存のメッセージと新しいメッセージを結合
        setMessages((prev) => {
          const newMessages = [...sortedMessages, ...prev];
          // 重複を除去
          return Array.from(
            new Map(newMessages.map((msg) => [msg.id, msg])).values()
          );
        });

        // 最も古いメッセージの日時を更新
        if (sortedMessages.length > 0) {
          setOldestMessageDate(sortedMessages[0].created_at);
        }

        setHasMore(data.length === MESSAGE_LIMIT);

        // スクロール位置を復元
        if (messagesContainerRef.current) {
          requestAnimationFrame(() => {
            if (messagesContainerRef.current) {
              const newScrollHeight = messagesContainerRef.current.scrollHeight;
              const scrollDiff = newScrollHeight - scrollHeightRef.current;
              messagesContainerRef.current.scrollTop = scrollDiff;
            }
          });
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('予期せぬエラー:', error);
    } finally {
      setIsLoadingPrev(false);
    }
  };

  // 初期化とチャンネル変更時の処理
  useEffect(() => {
    if (!channelName) return;

    const resetAndFetchMessages = async () => {
      processedMessageIdsRef.current.clear();
      setMessages([]);
      setHasMore(true);
      setOldestMessageDate(null);
      setShowNewMessageAlert(false);
      setError(null);
      setIsLoading(true);
      setIsInitialLoad(true);

      try {
        // 認証状態を確認（必須ではない）
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserID(user.id);
          setUser(user);

          // プロフィール情報を取得
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('プロフィール取得エラー:', profileError);
          } else if (profile) {
            setProfiles((prev) => {
              const exists = prev.some((p) => p.id === profile.id);
              if (!exists) {
                return [...prev, profile];
              }
              return prev;
            });
          }
        }

        // メッセージを取得（認証状態に関係なく）
        const { data: messages, error: messagesError } = await supabase
          .from('Chats')
          .select('*')
          .eq('channel', channelName)
          .order('created_at', { ascending: false })
          .limit(MESSAGE_LIMIT);

        if (messagesError) {
          console.error('メッセージ取得エラー:', messagesError);
          setError('メッセージの取得に失敗しました');
        } else if (messages) {
          // 重複チェックとIDの記録
          const uniqueMessages = messages.filter((msg) =>
            addMessageIfNotExists(msg)
          );

          // 時系列順にソート（古い順）
          const sortedMessages = uniqueMessages.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );

          setMessages(sortedMessages);

          // 最も古いメッセージの日時を記録
          if (sortedMessages.length > 0) {
            setOldestMessageDate(sortedMessages[0].created_at);
          }

          setHasMore(messages.length === MESSAGE_LIMIT);
        }
      } catch (error) {
        console.error('予期せぬエラー:', error);
        setError('予期せぬエラーが発生しました');
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    resetAndFetchMessages();
  }, [channelName, supabase, addMessageIfNotExists]);

  // プロフィール情報の取得
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('name');

        if (error) {
          console.error('プロフィール取得エラー:', error);
          return;
        }

        if (profiles) {
          setProfiles(profiles);
        }
      } catch (error) {
        console.error('プロフィール取得エラー:', error);
      }
    };

    fetchProfiles();
  }, [supabase]);

  // 初期描画後の自動スクロール
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'instant',
          });
        }
      });
    }
  }, [isLoading, messages.length]);

  // メッセージが追加された時に最下部にスクロール
  useEffect(() => {
    if (messages.length > 0 && !isLoading && isNearBottom) {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      });
    }
  }, [messages.length, isLoading, isNearBottom]);

  // リアルタイム更新の設定
  useEffect(() => {
    if (!channelName) return;

    let mounted = true;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Chats',
          filter: `channel=eq.${channelName}`,
        },
        (payload: { new: Database['public']['Tables']['Chats']['Row'] }) => {
          if (!mounted) return;

          const newMessage =
            payload.new as Database['public']['Tables']['Chats']['Row'];
          if (!addMessageIfNotExists(newMessage)) return;

          setMessages((prev) => {
            const newMessages = [...prev, newMessage];
            return Array.from(
              new Map(newMessages.map((msg) => [msg.id, msg])).values()
            );
          });

          if (isNearBottom && messagesContainerRef.current) {
            requestAnimationFrame(() => {
              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTo({
                  top: messagesContainerRef.current.scrollHeight,
                  behavior: 'smooth',
                });
              }
            });
          } else {
            setShowNewMessageAlert(true);
            setTimeout(() => {
              if (mounted) {
                setShowNewMessageAlert(false);
              }
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [channelName, addMessageIfNotExists, isNearBottom, supabase]);

  // セッションタイムアウトの管理
  useEffect(() => {
    const sessionTimeout = setTimeout(() => {
      router.push('/auth/signin');
    }, SESSION_TIMEOUT);

    return () => clearTimeout(sessionTimeout);
  }, [router]);

  const showPopup = (
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info'
  ) => {
    const sanitizedMessage =
      type === 'error'
        ? 'エラーが発生しました。しばらく時間をおいて再度お試しください。'
        : message;

    setPopupState({
      isOpen: true,
      title,
      message: sanitizedMessage,
      type,
    });
  };

  const closePopup = () => {
    setPopupState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    // 特殊文字のエスケープ
    const sanitizedText = text.replace(/[<>]/g, '');
    if (sanitizedText.length <= MAX_MESSAGE_LENGTH) {
      setInputText(sanitizedText);
    }
  };

  if (!channelName) {
    return (
      <div className="flex items-center justify-center h-full bg-chat-bg dark:bg-black/40">
        <Loading />
      </div>
    );
  }

  const onSubmitNewMessage = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (inputText === '' || !userID) return;

    try {
      // CSRFトークンの取得
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showPopup(
          'セッションエラー',
          'セッションが切れました。再度ログインしてください。',
          'error'
        );
        router.push('/auth/signin');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userID)
        .maybeSingle();

      if (profileError) {
        console.error('プロフィール取得エラー:', profileError);
        throw new Error('プロフィールの取得に失敗しました');
      }

      if (!profile) {
        showPopup(
          'プロフィール設定が必要です',
          '投稿前にユーザ名を設定してください。',
          'warning'
        );
        return;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': session.access_token,
        },
        body: JSON.stringify({
          message: inputText,
          channel: channelName,
        }),
      });

      if (!response.ok) {
        throw new Error('メッセージ送信に失敗しました');
      }

      setInputText('');
    } catch (error) {
      console.error('エラー:', error);
      showPopup(
        'エラーが発生しました',
        'メッセージの送信に失敗しました。',
        'error'
      );
    }
  };

  return (
    <div className="flex h-[calc(100vh-40px)] bg-chat-bg dark:bg-black/40">
      <SideBar />
      <div className="flex-1 flex flex-col">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 flex flex-col bg-chat-bg dark:bg-black/40"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex-1 relative flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <>
              {isLoadingPrev && (
                <div className="sticky top-0 bg-chat-bg/80 dark:bg-black/40 backdrop-blur-sm py-2 z-10">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                      <Loading />
                      <span className="text-sm text-gray-700 dark:text-global-bg">
                        過去のメッセージを読み込み中...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {showNewMessageAlert && (
                <Button
                  type="button"
                  className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-chat-bg dark:bg-black/40 text-gray-700 dark:text-global-bg px-4 py-2 rounded-full cursor-pointer shadow-lg hover:bg-chat-bg/80 dark:hover:bg-black/60 transition-colors"
                  onClick={() => {
                    setShowNewMessageAlert(false);
                    requestAnimationFrame(() => {
                      if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTo({
                          top: messagesContainerRef.current.scrollHeight,
                          behavior: 'smooth',
                        });
                      }
                    });
                  }}
                >
                  新しいメッセージがあります
                </Button>
              )}
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={isInitialLoad ? 'animate-fade-in' : ''}
                    style={
                      isInitialLoad
                        ? {
                            animationDelay: `${index * 50}ms`,
                            opacity: 0,
                            animation: 'fadeIn 0.5s ease-out forwards',
                          }
                        : undefined
                    }
                  >
                    <ChatUI
                      chatData={message}
                      index={index}
                      isInitialLoad={isInitialLoad}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {user ? (
          <form
            className="p-2 border-t bg-chat-bg dark:bg-black/40"
            onSubmit={onSubmitNewMessage}
          >
            <div className="flex items-center gap-2">
              <textarea
                value={inputText}
                onChange={handleInputChange}
                placeholder="メッセージを入力..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-send-button/20 transition-all duration-200"
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !inputText.trim()}
                className={`px-4 py-2 rounded-lg bg-send-button text-white font-medium transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  (isLoading || !inputText.trim()) &&
                  'opacity-50 cursor-not-allowed'
                }`}
              >
                送信
              </Button>
            </div>
            {inputText.length >= CHAR_COUNT_THRESHOLD && (
              <div className="text-right text-sm text-gray-500 mt-1">
                {inputText.length}/{MAX_MESSAGE_LENGTH}
              </div>
            )}
          </form>
        ) : (
          <div className="p-2 border-t bg-chat-bg dark:bg-black/40">
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-black/40 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                メッセージを送信するにはログインが必要です
              </p>
              <Link
                href="/auth/signin"
                className="text-sm bg-send-button hover:bg-send-button/80 text-gray-900 dark:text-global-bg px-4 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                ログイン
              </Link>
            </div>
          </div>
        )}
      </div>
      <MessagePopup
        isOpen={popupState.isOpen}
        onClose={closePopup}
        title={popupState.title}
        message={popupState.message}
        type={popupState.type}
      />
    </div>
  );
}

// スタイルの追加
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;

// スタイルを適用
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
