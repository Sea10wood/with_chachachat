import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// OpenAIクライアントの初期化を改善
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Supabaseクライアントの設定を修正
const supabase = createRouteHandlerClient({ cookies });

// AI用のUUIDを生成する関数
function generateAIUserId() {
  return '00000000-0000-4000-8000-000000000000';
}

const SYSTEM_PROMPT = `あなたは「みーあちゃっと」という名前のAIアシスタントです。
以下の特徴を持っています：

1. 性格：
- フレンドリーで親しみやすい
- 明るくのんびりとした口調

2. 応答スタイル：
- のんびりとして、ユーザーに優しく会話する
- 必要に応じて具体例を挙げる
- 質問に対して相手の意思を尊重した返答

3. 制限事項：
- 不適切な内容には応答しない
- 個人情報は扱わない
- 専門的な内容は「難しいね〜」と返答

4. 特徴的な言い回し：
- 「〜みゃ！」「〜みーあ！」など親しみやすい語尾
- 「人生、色々あるみゃ」など共感的な表現
- 「例えばみゃ〜」と具体例を示す

あなたの目標は、ユーザーと楽しく、かつのんびりと会話をすることです。`;

export async function POST(request: Request) {
  try {
    // 認証チェック
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    }

    // リクエストボディの解析を改善
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: '無効なリクエストボディです' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    }

    const { message, parentMessageId, userId } = body;

    // 入力値の検証を強化
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'メッセージが空です' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    }

    if (!parentMessageId || typeof parentMessageId !== 'string') {
      return NextResponse.json(
        { error: '親メッセージIDが必要です' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    }

    // ユーザーIDの検証
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: '不正なユーザーIDです' },
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    }

    // 親メッセージの存在確認
    const { data: parentMessages, error: parentError } = await supabase
      .from('Chats')
      .select('id, channel, uid')
      .eq('id', parentMessageId);

    if (parentError) {
      console.error('親メッセージの検索エラー:', parentError);
      return NextResponse.json(
        { error: '親メッセージの検索に失敗しました' },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    }

    if (!parentMessages || parentMessages.length === 0) {
      console.error('親メッセージが見つかりません:', { parentMessageId });
      return NextResponse.json(
        { error: '親メッセージが見つかりません' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    }

    const parentMessage = parentMessages[0];

    // OpenAI APIの呼び出し
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || "すみません、回答を生成できませんでした。";

      // AIの返答を保存
      const aiUserId = generateAIUserId();
      const { data: aiMessage, error: insertError } = await supabase
        .from('Chats')
        .insert({
          message: response,
          uid: aiUserId,
          is_ai_response: true,
          parent_message_id: parentMessageId,
          channel: parentMessage.channel,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('AI返答の保存エラー:', {
          error: insertError,
          data: {
            message: response,
            uid: aiUserId,
            is_ai_response: true,
            parent_message_id: parentMessageId,
            channel: parentMessage.channel
          }
        });
        return NextResponse.json(
          { error: 'AIの返答の保存に失敗しました: ' + insertError.message },
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
      }

      return NextResponse.json(
        { 
          response, 
          messageId: aiMessage.id,
          timestamp: aiMessage.created_at 
        },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    } catch (openaiError) {
      console.error('OpenAI APIエラー:', openaiError);
      return NextResponse.json(
        { error: 'AIの応答生成に失敗しました: ' + (openaiError instanceof Error ? openaiError.message : '不明なエラー') },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    }
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー') },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
  }
} 