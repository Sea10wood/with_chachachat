import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // セッション（Cookie）を利用したAuthの管理が可能になる。
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 認証が必要なルート
  const protectedRoutes = ['/profile', '/settings'];
  // 認証済みユーザーがアクセスできないルート
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/reset-password'];

  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // 認証が必要なルートに未認証でアクセス
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/signin', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 認証済みユーザーが認証ページにアクセス
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // /auth/loginへのアクセスを/auth/signinにリダイレクト

  return res;
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/settings/:path*',
    '/auth/:path*',
    '/auth/signin',
  ],
};
