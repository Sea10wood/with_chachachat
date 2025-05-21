import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    // プロフィールの作成
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: '新しいユーザー',
        avatar_url: '/user.png',
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('プロフィール作成エラー:', error);
      }
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}
