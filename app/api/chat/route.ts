import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { message, channel } = await request.json();

    if (!message || !channel) {
      return NextResponse.json(
        { error: 'メッセージとチャンネルは必須です' },
        { status: 400 }
      );
    }

    // ユーザーのメッセージを保存
    const { data: userMessage, error: insertError } = await supabase
      .from('Chats')
      .insert({
        message,
        uid: session.user.id,
        is_ai_response: false,
        channel,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('メッセージの保存エラー:', insertError);
      return NextResponse.json(
        { error: 'メッセージの保存に失敗しました' },
        { status: 500 }
      );
    }

    // メッセージに@meerchatが含まれている場合のみAIが応答
    if (message.includes('@meerchat')) {
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
              content: message,
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
            created_at: new Date().toISOString(),
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
