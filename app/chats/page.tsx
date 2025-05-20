"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabasetype"
import { useEffect, useState, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ChatUI from "@/components/chats/chat"
import SideBar from "@/components/sidebar"
import Loading from "@/components/loading"
import MessagePopup from '@/components/molecules/MessagePopup'
import { debounce } from 'lodash'
import Link from "next/link"

const MESSAGE_LIMIT = 20;
const SCROLL_THRESHOLD = 50;
const BOTTOM_THRESHOLD = 50;

export default function Chats() {
  const supabase = createClientComponentClient<Database>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const channelName = searchParams.get("channel_name");

  const [inputText, setInputText] = useState("")
  const [userID, setUserID] = useState("")
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Database["public"]["Tables"]["Chats"]["Row"][]>([])
  const [profiles, setProfiles] = useState<Database["public"]["Tables"]["profiles"]["Row"][]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrev, setIsLoadingPrev] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [oldestMessageDate, setOldestMessageDate] = useState<string | null>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const scrollHeightRef = useRef<number>(0)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const processedMessageIdsRef = useRef<Set<string>>(new Set())

  const [popupState, setPopupState] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'info' | 'warning' | 'error'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  // メッセージの重複チェックと追加
  const addMessageIfNotExists = useCallback((message: Database["public"]["Tables"]["Chats"]["Row"]) => {
    if (!message.id) return false;
    
    // チャンネルごとに重複チェックを行う
    const key = `${channelName}-${message.id}`;
    if (processedMessageIdsRef.current.has(key)) {
      return false;
    }
    processedMessageIdsRef.current.add(key);
    return true;
  }, [channelName]);

  // チャンネル名が指定されていない場合、デフォルトチャンネルにリダイレクト
  useEffect(() => {
    if (!channelName) {
      router.push('/chats?channel_name=thread1');
    }
  }, [channelName, router]);

  // スクロール位置の管理
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (!element) return;

    const isNearTop = element.scrollTop < SCROLL_THRESHOLD;
    const isBottom = element.scrollHeight - element.scrollTop - element.clientHeight < BOTTOM_THRESHOLD;

    setIsNearBottom(isBottom);

    // スクロール位置が上部に近づいたら過去メッセージを取得
    if (isNearTop && !isLoadingPrev && hasMore && oldestMessageDate) {
      scrollHeightRef.current = element.scrollHeight;
      fetchMoreMessages();
    }
  }, [hasMore, isLoadingPrev, oldestMessageDate]);

  // 過去のメッセージを取得
  const fetchMoreMessages = async () => {
    if (!oldestMessageDate || isLoadingPrev || !channelName) {
      return;
    }

    setIsLoadingPrev(true);
    try {
      const { data, error } = await supabase
        .from("Chats")
        .select("*")
        .eq('channel', channelName)
        .lt('created_at', oldestMessageDate)
        .order("created_at", { ascending: false })
        .limit(MESSAGE_LIMIT);

      if (error) {
        console.error("過去メッセージ取得エラー:", error);
        return;
      }

      if (data && data.length > 0) {
        // 重複チェックとIDの記録
        const uniqueMessages = data.filter(msg => addMessageIfNotExists(msg));

        // 時系列順にソート（古い順）
        const sortedMessages = uniqueMessages.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // 既存のメッセージと新しいメッセージを結合
        setMessages(prev => {
          const newMessages = [...sortedMessages, ...prev];
          // 重複を除去
          return Array.from(new Map(newMessages.map(msg => [msg.id, msg])).values());
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
      console.error("予期せぬエラー:", error);
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
        const { data: { user } } = await supabase.auth.getUser();
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
            setProfiles(prev => {
              const exists = prev.some(p => p.id === profile.id);
              if (!exists) {
                return [...prev, profile];
              }
              return prev;
            });
          }
        }

        const { data, error } = await supabase
          .from("Chats")
          .select("*")
          .eq('channel', channelName)
          .order("created_at", { ascending: false })
          .limit(MESSAGE_LIMIT);

        if (error) {
          console.error("メッセージ取得エラー:", error);
          throw error;
        }

        if (data) {
          const uniqueMessages = data.filter(msg => addMessageIfNotExists(msg));
          const sortedMessages = uniqueMessages.sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          setMessages(sortedMessages);
          setHasMore(data.length === MESSAGE_LIMIT);
          setOldestMessageDate(sortedMessages[0]?.created_at || null);
        }
      } catch (error) {
        console.error("メッセージ取得エラー:", error);
        setError("メッセージの取得に失敗しました");
      } finally {
        setIsLoading(false);
        // 初期ロード完了後、少し遅延させてアニメーションを無効化
        setTimeout(() => {
          setIsInitialLoad(false);
        }, 1000);
      }
    };

    resetAndFetchMessages();
  }, [channelName]);

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
  }, []);

  // 初期描画後の自動スクロール
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'instant'
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
            behavior: 'smooth'
          });
        }
      });
    }
  }, [messages.length, isLoading, isNearBottom]);

  // リアルタイム更新の設定
  useEffect(() => {
    if (!channelName) return;

    let mounted = true;
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Chats',
          filter: `channel=eq.${channelName}`
        },
        (payload: { new: Database["public"]["Tables"]["Chats"]["Row"] }) => {
          if (!mounted) return;

          const newMessage = payload.new as Database["public"]["Tables"]["Chats"]["Row"];
          if (!addMessageIfNotExists(newMessage)) return;

          setMessages(prev => {
            const newMessages = [...prev, newMessage];
            // 重複を除去
            return Array.from(new Map(newMessages.map(msg => [msg.id, msg])).values());
          });

          if (isNearBottom && messagesContainerRef.current) {
            requestAnimationFrame(() => {
              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTo({
                  top: messagesContainerRef.current.scrollHeight,
                  behavior: 'smooth'
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
  }, [channelName, addMessageIfNotExists, isNearBottom]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setUserID(session.user.id)
          setUser(session.user)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking user:', error)
        setIsLoading(false)
      }
    }

    checkUser()
  }, [supabase.auth])

  const showPopup = (title: string, message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    setPopupState({
      isOpen: true,
      title,
      message,
      type
    })
  }

  const closePopup = () => {
    setPopupState(prev => ({ ...prev, isOpen: false }))
  }

  if (!channelName) {
    return (
      <div className="flex items-center justify-center h-full bg-chat-bg dark:bg-black/40">
        <Loading />
      </div>
    );
  }

  const onSubmitNewMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (inputText === "" || !userID) return;

    try {
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
        )
        return;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          channel: channelName
        }),
      });

      if (!response.ok) {
        throw new Error('メッセージ送信に失敗しました');
      }

      setInputText("");
    } catch (error) {
      console.error("エラー:", error);
      showPopup(
        'エラーが発生しました',
        'メッセージの送信に失敗しました。',
        'error'
      )
    }
  }

  return (
    <div className="flex h-[calc(100vh-40px)] bg-chat-bg dark:bg-black/40">
      <SideBar profiles={profiles} setProfiles={setProfiles} handleClick={() => {}} user={user} />
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
                      <span className="text-sm text-gray-700 dark:text-global-bg">過去のメッセージを読み込み中...</span>
                    </div>
                  </div>
                </div>
              )}
              {showNewMessageAlert && (
                <div 
                  className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-chat-bg dark:bg-black/40 text-gray-700 dark:text-global-bg px-4 py-2 rounded-full cursor-pointer shadow-lg hover:bg-chat-bg/80 dark:hover:bg-black/60 transition-colors"
                  onClick={() => {
                    setShowNewMessageAlert(false);
                    requestAnimationFrame(() => {
                      if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTo({
                          top: messagesContainerRef.current.scrollHeight,
                          behavior: 'smooth'
                        });
                      }
                    });
                  }}
                >
                  新しいメッセージがあります
                </div>
              )}
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={isInitialLoad ? "animate-fade-in" : ""}
                    style={isInitialLoad ? {
                      animationDelay: `${index * 50}ms`,
                      opacity: 0,
                      animation: 'fadeIn 0.5s ease-out forwards'
                    } : undefined}
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
          <form className="p-2 border-t bg-chat-bg dark:bg-black/40" onSubmit={onSubmitNewMessage}>
            <div className="flex gap-2">
              <div className="flex-1">
                <textarea
                  className="w-full p-2 border rounded-lg resize-none bg-input-bg dark:bg-black/40 text-gray-900 dark:text-global-bg placeholder-gray-500 dark:placeholder-gray-400"
                  rows={2}
                  placeholder="メッセージを入力..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={inputText === ""}
                className="px-3 py-1.5 bg-send-button text-gray-700 dark:text-global-bg rounded-lg disabled:opacity-50 text-sm hover:bg-send-button/80 transition-colors"
              >
                送信
              </button>
            </div>
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
  )
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