"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabasetype"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ChatUI from "@/components/chats/chat"

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
              
              // AIの応答は表示しない
              if (is_ai_response) {
                return prevMessages;
              }
              
              // 通常のメッセージはそのまま追加
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

  // 初回のみ実行するために引数に空の配列を渡している
  useEffect(() => {
    (async () => {
      let allMessages = null
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
        // AIの応答をフィルタリング
        const filteredMessages = allMessages.filter(msg => 
          // AIの応答でないメッセージのみを表示
          !msg.is_ai_response
        );
        setMessageText(filteredMessages);
      }
    })()
    fetchRealtimeData()
  }, [])

  const onSubmitNewMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (inputText === "") return
    if (!userID || !channelName) {
      console.error("userID or channelName is undefined.");
      alert("ログイン情報またはチャンネル名が不足しています。");
      return;
    }
    console.log({ userID, channelName, inputText });
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select()
        .eq("id", userID)

      if (error) {
        console.log(error);
        return
      }

      if (profile.length !== 1) {
        alert("投稿前にユーザ名を設定してください。")
        return;
      }

      try {
        const { error } = await supabase.from("Chats").insert({
          message: inputText,
          uid: userID,
          channel: channelName,
          is_ai_response: false,
        });

        if (error) {
          console.error("Error inserting chat:", error.message);
          return;
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    } catch (error) {
      console.error(error)
      return
    }
    setInputText("")
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center p-2">
      <h1 className="text-3xl font-bold pt-5 pb-10">{channelName}</h1>
      <div className="w-full max-w-3xl mb-10 border-t-2 border-x-2">
        {messageText.map((item, index) => (
          <ChatUI chatData={item} index={index} key={item.id || index}></ChatUI>
        ))}
      </div>

      <form className="w-full max-w-md pb-10" onSubmit={onSubmitNewMessage}>
        <div className="mb-5">
          <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900">投稿内容</label>
          <textarea id="message" name="message" rows={4} className="block p-2.5 w-full text-sm text-gray-900
                 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="投稿内容を入力" value={inputText} onChange={(event) => setInputText(() => event.target.value)}>
          </textarea>
        </div>

        <button type="submit" disabled={inputText === ""} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center disabled:opacity-25">
          送信
        </button>
      </form>
    </div>
  )
}