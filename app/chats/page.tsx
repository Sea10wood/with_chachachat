"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabasetype"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ChatUI from "@/components/chats/chat"
import SideBar from "@/components/sidebar"

export default function Chats() {
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  let channelName = searchParams.get("channel_name");
  if (!channelName) {
    console.error("channel_name is missing in the query parameters.");
    return <div>チャンネル名が指定されていません。</div>;
  }
  const [inputText, setInputText] = useState("")
  const [userID, setUserID] = useState("")
  const [messageText, setMessageText] = useState<Database["public"]["Tables"]["Chats"]["Row"][]>([])
  const [processedMessageIds] = useState(new Set<string>())
  const [profiles, setProfiles] = useState<Database["public"]["Tables"]["profiles"]["Row"][]>([])

  const fetchRealtimeData = () => {
    if (!channelName) {
      console.error("channelName is undefined. Skipping real-time subscription.");
      return;
    }
  
    supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Chats",
          filter: `channel=eq.${channelName}`
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { created_at, id, message, uid, channel, is_ai_response, parent_message_id } = payload.new;
            
            // 既に処理済みのメッセージIDはスキップ
            if (processedMessageIds.has(id)) {
              return;
            }
            
            // メッセージIDを処理済みとしてマーク
            processedMessageIds.add(id);
            
            setMessageText((prevMessages) => {
              // 同じIDのメッセージが既に存在する場合は追加しない
              if (prevMessages.some(msg => msg.id === id)) {
                return prevMessages;
              }
              
              return [...prevMessages, { 
                id, 
                created_at, 
                message, 
                uid, 
                channel,
                is_ai_response,
                parent_message_id
              }];
            });
          }
        }
      )
      .subscribe();
  };

  // チャンネルが変更されたときにメッセージを再取得
  useEffect(() => {
    const fetchMessages = async () => {
      let allMessages = null;
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user != null) {
          setUserID(user.id)
        }
  
        const { data } = await supabase
          .from("Chats")
          .select("*")
          .eq('channel', channelName)
          .order("created_at");
  
        allMessages = data;
        
        // 初期メッセージのIDを処理済みとしてマーク
        if (allMessages) {
          allMessages.forEach(msg => {
            if (msg.id) {
              processedMessageIds.add(msg.id);
            }
          });
        }
      } catch (error) {
        console.error(error)
      }
      if (allMessages != null) {
        // メッセージを時系列順に並び替え
        const sortedMessages = allMessages.sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        setMessageText(sortedMessages);
      }
    };

    fetchMessages();
    fetchRealtimeData();
  }, [channelName]); // channelNameが変更されたときに再実行

  const onSubmitNewMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (inputText === "") return
    if (!userID || !channelName) {
      console.error("userID or channelName is undefined.");
      alert("ログイン情報またはチャンネル名が不足しています。");
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select()
        .eq("id", userID)

      if (error) {
        console.error("プロフィール取得エラー:", error);
        return;
      }

      if (profile.length !== 1) {
        alert("投稿前にユーザ名を設定してください。")
        return;
      }

      // メッセージを保存し、AI応答も処理
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
        const errorData = await response.json();
        console.error('メッセージ送信エラー:', errorData.error || response.statusText);
        return;
      }

      setInputText("");
    } catch (error) {
      console.error("予期せぬエラー:", error);
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = e.currentTarget.id;
    // ここでチャンネル名を更新するなどの処理を追加できます
  };

  return (
    <div className="flex h-screen">
      <SideBar profiles={profiles} setProfiles={setProfiles} handleClick={handleClick} />
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">{channelName}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messageText.map((item, index) => (
            <ChatUI chatData={item} index={index} key={item.id || index} />
          ))}
        </div>
        <form className="p-2 border-t" onSubmit={onSubmitNewMessage}>
          <div className="flex gap-2">
            <textarea
              className="flex-1 p-2 border rounded-lg resize-none"
              rows={2}
              placeholder="メッセージを入力..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              disabled={inputText === ""}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg disabled:opacity-50 text-sm"
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}