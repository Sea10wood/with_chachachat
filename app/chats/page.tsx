"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabasetype"
import { useEffect, useState, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ChatUI from "@/components/chats/chat"
import SideBar from "@/components/sidebar"
import Loading from "@/components/loading"

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
  const [messages, setMessages] = useState<Database["public"]["Tables"]["Chats"]["Row"][]>([])
  const [profiles, setProfiles] = useState<Database["public"]["Tables"]["profiles"]["Row"][]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrev, setIsLoadingPrev] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [oldestMessageDate, setOldestMessageDate] = useState<string | null>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const scrollHeightRef = useRef<number>(0)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const processedMessageIdsRef = useRef<Set<string>>(new Set())

  // メッセージの重複チェックと追加
  const addMessageIfNotExists = useCallback((message: Database["public"]["Tables"]["Chats"]["Row"]) => {
    if (processedMessageIdsRef.current.has(message.id)) {
      return false;
    }
    processedMessageIdsRef.current.add(message.id);
    return true;
  }, []);

  // チャンネル名が指定されていない場合、デフォルトチャンネルにリダイレクト
  useEffect(() => {
    if (!channelName) {
      router.push('/chats?channel_name=thread1');
    }
  }, [channelName, router]);

  // スクロール位置の管理
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearTop = element.scrollTop < SCROLL_THRESHOLD;
    const isBottom = element.scrollHeight - element.scrollTop - element.clientHeight < BOTTOM_THRESHOLD;

    setIsNearBottom(isBottom);

    // スクロール中フラグの管理
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);

    // スクロール位置が上部に近づいたら過去メッセージを取得
    if (isNearTop && !isLoadingPrev && hasMore && oldestMessageDate) {
      console.log('Fetching more messages...', { oldestMessageDate });
      scrollHeightRef.current = element.scrollHeight;
      fetchMoreMessages();
    }
  }, [hasMore, isLoadingPrev, oldestMessageDate]);

  // 過去のメッセージを取得
  const fetchMoreMessages = async () => {
    if (!oldestMessageDate || isLoadingPrev || !channelName) {
      console.log('Skipping fetchMoreMessages:', {
        oldestMessageDate,
        isLoadingPrev,
        channelName
      });
      return;
    }

    setIsLoadingPrev(true);
    try {
      console.log('Fetching messages before:', oldestMessageDate);
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
        console.log('Fetched messages:', data.length);
        // 重複チェックとIDの記録
        const uniqueMessages = data.filter(msg => addMessageIfNotExists(msg));

        // 時系列順にソート（古い順）
        const sortedMessages = uniqueMessages.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // 既存のメッセージと新しいメッセージを結合
        setMessages(prev => [...sortedMessages, ...prev]);

        // 最も古いメッセージの日時を更新
        if (sortedMessages.length > 0) {
          const newOldestDate = sortedMessages[0].created_at;
          console.log('Updating oldestMessageDate:', newOldestDate);
          setOldestMessageDate(newOldestDate);
        }

        setHasMore(data.length === MESSAGE_LIMIT);

        // スクロール位置を復元
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          const scrollDiff = newScrollHeight - scrollHeightRef.current;

          requestAnimationFrame(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = scrollDiff;
            }
          });
        }
      } else {
        console.log('No more messages to fetch');
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

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserID(user.id);

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
      }
    };

    resetAndFetchMessages();
  }, [channelName]);

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

    // 前回のチャンネルのサブスクリプションを解除
    const cleanup = () => {
      const channel = supabase.channel(channelName);
      channel.unsubscribe();
    };

    // 新しいチャンネルのサブスクリプションを設定
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
          const newMessage = payload.new as Database["public"]["Tables"]["Chats"]["Row"];

          // 重複チェックと追加
          if (!addMessageIfNotExists(newMessage)) return;

          setMessages(prev => [...prev, newMessage]);

          // 最下部にいる場合のみスクロール、そうでなければアラートを表示
          if (isNearBottom) {
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
            // 3秒後にアラートを非表示
            setTimeout(() => {
              setShowNewMessageAlert(false);
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      cleanup();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [channelName, addMessageIfNotExists, isNearBottom]);

  if (!channelName) {
    return <Loading />;
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
        alert("投稿前にユーザ名を設定してください。")
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
      alert("メッセージの送信に失敗しました");
    }
  }

  return (
    <div className="flex h-[calc(100vh-40px)] bg-chat-bg">
      <SideBar profiles={profiles} setProfiles={setProfiles} handleClick={() => {}} />
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-chat-bg">
          <h1 className="text-2xl font-bold">{channelName}</h1>
        </div>
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 flex flex-col bg-chat-bg"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex-1 relative">
              <Loading />
            </div>
          ) : (
            <>
              {isLoadingPrev && (
                <div className="sticky top-0 bg-chat-bg/80 backdrop-blur-sm py-2 z-10">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-chat-bg"></div>
                      <span className="text-sm text-gray-700">過去のメッセージを読み込み中...</span>
                    </div>
                  </div>
                </div>
              )}
              {showNewMessageAlert && (
                <div 
                  className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-chat-bg text-gray-700 px-4 py-2 rounded-full cursor-pointer shadow-lg hover:bg-chat-bg/80 transition-colors"
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
                  <ChatUI chatData={message} index={index} key={message.id || index} />
                ))}
              </div>
            </>
          )}
        </div>
        <form className="p-2 border-t bg-chat-bg" onSubmit={onSubmitNewMessage}>
          <div className="flex gap-2">
            <div className="flex-1">
              <textarea
                className="w-full p-2 border rounded-lg resize-none bg-input-bg"
                rows={2}
                placeholder="メッセージを入力..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={inputText === ""}
              className="px-3 py-1.5 bg-send-button text-gray-700 rounded-lg disabled:opacity-50 text-sm hover:bg-send-button/80 transition-colors"
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}