import type { Database } from '@/types/supabasetype';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// レート制限の監視用の統計情報
interface RateLimitStats {
  totalRequests: number;
  limitedRequests: number;
  lastReset: number;
}

const rateLimitStats: RateLimitStats = {
  totalRequests: 0,
  limitedRequests: 0,
  lastReset: Date.now(),
};

// ユーザーごとのリクエスト履歴を保存
interface UserRequest {
  timestamp: number;
}

const userRequestsMap = new Map<string, { timestamp: number }[]>();

// 統計情報のリセット間隔（1時間）
const STATS_RESET_INTERVAL = 60 * 60 * 1000;

// レート制限の設定
const RATE_LIMIT_WINDOW = 60; // 60秒
const MAX_REQUESTS_PER_WINDOW = 10; // 1分間に10リクエストまで
const MAX_MESSAGE_LENGTH = 1000;

// 統計情報のリセット
function resetStats() {
  const now = Date.now();
  const timeSinceLastReset = now - rateLimitStats.lastReset;

  // 統計情報をログに記録
  console.log('Rate Limit Statistics:', {
    period: `${timeSinceLastReset / 1000} seconds`,
    totalRequests: rateLimitStats.totalRequests,
    limitedRequests: rateLimitStats.limitedRequests,
    limitPercentage:
      rateLimitStats.totalRequests > 0
        ? `${((rateLimitStats.limitedRequests / rateLimitStats.totalRequests) * 100).toFixed(2)}%`
        : '0%',
  });

  // 統計情報をリセット
  rateLimitStats.totalRequests = 0;
  rateLimitStats.limitedRequests = 0;
  rateLimitStats.lastReset = now;

  // 古いリクエスト履歴をクリーンアップ
  const nowSeconds = Math.floor(now / 1000);
  userRequestsMap.forEach((requests, userId) => {
    const validRequests = requests.filter(
      (req: UserRequest) => req.timestamp > nowSeconds - RATE_LIMIT_WINDOW
    );
    if (validRequests.length === 0) {
      userRequestsMap.delete(userId);
    } else {
      userRequestsMap.set(userId, validRequests);
    }
  });
}

// 定期的な統計情報のリセット
if (typeof setInterval !== 'undefined') {
  setInterval(resetStats, STATS_RESET_INTERVAL);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

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
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // CSRFトークンの検証
    const csrfToken = request.headers.get('X-CSRF-Token');
    if (!csrfToken || csrfToken !== session.access_token) {
      return NextResponse.json(
        { error: '無効なリクエストです' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { message, channel } = body;

    // 入力バリデーション
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'メッセージは必須です' },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: 'メッセージが長すぎます' },
        { status: 400 }
      );
    }

    if (!channel || typeof channel !== 'string') {
      return NextResponse.json(
        { error: 'チャンネル名は必須です' },
        { status: 400 }
      );
    }

    // 特殊文字のエスケープ
    const sanitizedMessage = message.replace(/[<>]/g, '');

    // レート制限のチェック
    const now = Math.floor(Date.now() / 1000);
    const userRequests = userRequestsMap.get(session.user.id) || [];
    const recentRequests = userRequests.filter(
      (req) => req.timestamp > now - RATE_LIMIT_WINDOW
    );

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        {
          error:
            'レート制限を超えました。しばらく待ってから再試行してください。',
        },
        { status: 429 }
      );
    }
    // リクエストを記録
    userRequests.push({ timestamp: now });
    userRequestsMap.set(session.user.id, userRequests);

    // メッセージを保存
    const { data: userMessage, error: insertError } = await supabase
      .from('Chats')
      .insert({
        message: sanitizedMessage,
        channel,
        uid: session.user.id,
        is_ai_response: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('メッセージ保存エラー:', insertError);
      return NextResponse.json(
        { error: 'メッセージの保存に失敗しました' },
        { status: 500 }
      );
    }

    // メッセージに@meerchatが含まれている場合のみAIが応答
    if (sanitizedMessage.includes('@meerchat')) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: sanitizedMessage,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        const aiResponse =
          completion.choices[0]?.message?.content ||
          'すみません、回答を生成できませんでした。';

        // AIの応答を保存
        const { data: aiMessage, error: aiError } = await supabase
          .from('Chats')
          .insert({
            message: aiResponse,
            uid: '00000000-0000-4000-8000-000000000000', // AI用の固定UUID
            channel: channel,
            is_ai_response: true,
            parent_message_id: userMessage.id,
          })
          .select()
          .single();

        if (aiError) {
          console.error('AI response save error:', aiError);
          return NextResponse.json(
            { error: 'AIの応答の保存に失敗しました' },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            response: aiResponse,
            messageId: aiMessage.id,
            timestamp: aiMessage.created_at,
          },
          { status: 200 }
        );
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        return NextResponse.json(
          { error: 'AIの応答生成に失敗しました' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: 'メッセージは保存されましたが、AIは応答しません' },
      { status: 200 }
    );
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
