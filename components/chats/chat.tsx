"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabasetype"
import DateFormatter from "@/components/date"
import { useState, useEffect, useRef } from "react";

type Props = {
  chatData: Database["public"]["Tables"]["Chats"]["Row"],
  index: number,
}

export default function ChatUI({ chatData, index }: Props) {
  const supabase = createClientComponentClient();
  const [userName, setUserName] = useState("")
  const [isMentioned, setIsMentioned] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [aiMessageId, setAiMessageId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasProcessedMessage, setHasProcessedMessage] = useState(false)

  const getData = async () => {
    try {
      // AIの返答の場合は特別なユーザー名を設定
      if (chatData.is_ai_response) {
        setUserName('みーあちゃっと');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select()
        .eq("id", chatData.uid)
        .single();

      if (error) {
        console.error('プロフィール取得エラー:', error);
        setUserName('不明なユーザー');
        return;
      }

      if (!profile) {
        console.error('プロフィールが見つかりません:', chatData.uid);
        setUserName('不明なユーザー');
        return;
      }

      setUserName(profile.name);
    } catch (err) {
      console.error('データ取得エラー:', err);
      setUserName('不明なユーザー');
    }
  }

  const checkMention = () => {
    try {
      const mentionPattern = /@Meerchat\b/i;
      const mentioned = mentionPattern.test(chatData.message ?? '');
      setIsMentioned(mentioned);
      
      // メンションされていない場合は処理済みとしてマーク
      if (!mentioned) {
        setHasProcessedMessage(true);
      }
    } catch (err) {
      console.error('メンションチェックエラー:', err);
      setIsMentioned(false);
      setHasProcessedMessage(true);
    }
  }

  const getAIResponse = async () => {
    // 以下の条件のいずれかに該当する場合はリクエストを送信しない
    if (
      !isMentioned || // メンションされていない
      isLoading || // 既にローディング中
      hasProcessedMessage || // 既に処理済み
      aiResponse || // 既にAIの応答がある
      error || // エラーが発生している
      chatData.parent_message_id // 親メッセージIDが存在する
    ) {
      return;
    }

    try {
      // このメッセージに対する既存のAI応答を確認
      const { data: existingResponses, error: checkError } = await supabase
        .from('Chats')
        .select('id, message')
        .eq('parent_message_id', chatData.id)
        .eq('is_ai_response', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116は結果が0件の場合
        console.error('既存の応答確認エラー:', checkError);
        return;
      }

      // 既にAI応答が存在する場合は、その応答を表示
      if (existingResponses) {
        setAiResponse(existingResponses.message);
        setAiMessageId(existingResponses.id);
        setHasProcessedMessage(true);
        return;
      }

      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('ユーザー認証が必要です');
        setHasProcessedMessage(true);
        return;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: chatData.message?.replace(/@Meerchat\b/i, '').trim() ?? '',
          parentMessageId: chatData.id,
          userId: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AIの返答の取得に失敗しました');
      }

      const data = await response.json();
      if (!data.response) {
        throw new Error('AIの返答が空です');
      }

      // 応答を保存する前に少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 保存された応答を再取得
      const { data: savedResponse, error: fetchError } = await supabase
        .from('Chats')
        .select('id, message')
        .eq('id', data.messageId)
        .single();

      if (fetchError) {
        console.error('保存された応答の取得エラー:', fetchError);
        throw new Error('保存された応答の取得に失敗しました');
      }

      if (savedResponse) {
        setAiResponse(savedResponse.message);
        setAiMessageId(savedResponse.id);
      } else {
        setAiResponse(data.response);
        setAiMessageId(data.messageId);
      }

      setHasProcessedMessage(true);
    } catch (err) {
      console.error('AI返答の取得エラー:', err);
      setError(err instanceof Error ? err.message : 'AIの返答の取得に失敗しました');
      setHasProcessedMessage(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getData();
    checkMention();
  }, []);

  useEffect(() => {
    if (isMentioned && !hasProcessedMessage) {
      getAIResponse();
    }
  }, [isMentioned, hasProcessedMessage]);

  return (
    <div className="p-2 border-b-2">
      <div className="flex">
        <p className="pr-2">{index + 1}</p>
        <h2 className="font-medium text-gray-900 truncate">{userName}</h2>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500"><DateFormatter timestamp={chatData.created_at || ""}></DateFormatter></p>
        <p className="w-32 text-sm text-gray-500 truncate">ID:{chatData.uid}</p>
      </div>
      <p className="mt-2">{chatData.message}</p>
      {isLoading && <p className="mt-2 text-gray-500">AIが応答を生成中...</p>}
      {error && <p className="mt-2 text-red-500">エラー: {error}</p>}
      {aiResponse && (
        <div className="mt-2 pl-4 border-l-2 border-gray-300">
          <p className="font-medium text-gray-700">みーあちゃっと:</p>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  )
}