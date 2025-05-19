import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      const response = NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
      return response;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('プロファイル取得エラー:', profileError);
      const response = NextResponse.json(
        { error: 'プロファイルの取得に失敗しました' },
        { status: 500 }
      );
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
      return response;
    }

    if (!profile) {
      const response = NextResponse.json(
        { error: 'プロファイルが見つかりません' },
        { status: 404 }
      );
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
      return response;
    }

    const response = NextResponse.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar_url,
    });

    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Cache-Control', 'max-age=300'); // 5分のキャッシュ

    return response;
  } catch (error) {
    console.error('プロファイル取得エラー:', error);
    const response = NextResponse.json(
      { error: 'プロファイルの取得に失敗しました' },
      { status: 500 }
    );
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    return response;
  }
} 