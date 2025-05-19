import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { email, password } = await request.json();

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: error?.message || 'ユーザーが見つかりません' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.user_metadata.name || user.email,
      },
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    return NextResponse.json(
      { success: false, message: 'ログインに失敗しました' },
      { status: 500 }
    );
  }
} 