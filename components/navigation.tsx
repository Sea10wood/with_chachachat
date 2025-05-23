'use client';
import { Database } from '@/types/supabasetype';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Session } from '@supabase/supabase-js';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from './atoms/Button/Button';

interface NavigationProps {
  session: Session | null;
}

export default function Navigation({
  session: initialSession,
}: NavigationProps) {
  const supabase = createClientComponentClient();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 初期セッションを設定
    setSession(initialSession);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profile?.avatar_url) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
          setAvatarUrl(publicUrl);
        } else {
          setAvatarUrl('/user.webp');
        }
      } else {
        setAvatarUrl(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, initialSession]);

  const handleSignOut = async () => {
    try {
      setIsLogoutModalOpen(false);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      router.push('/auth/signin');
      router.refresh();
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウトに失敗しました');
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    if (path.includes('/chats')) {
      return pathname.startsWith('/chats');
    }
    return pathname === path;
  };

  return (
    <>
      <nav className="bg-chat-bg shadow-sm dark:bg-black border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-10">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-xl font-bold text-gray-800 dark:text-global-bg"
              >
                MeerChat
              </Link>
              {mounted && (
                <Button
                  variant="secondary"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-1.5 rounded-lg hover:bg-global-bg dark:hover:bg-black/20 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-global-bg" />
                  ) : (
                    <Moon className="h-4 w-4 text-black" />
                  )}
                </Button>
              )}
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                  isActive('/')
                    ? 'border-send-button text-gray-900 dark:text-global-bg font-semibold'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                ホーム
              </Link>
              <Link
                href="/chats?channel_name=thread1"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                  isActive('/chats')
                    ? 'border-send-button text-gray-900 dark:text-global-bg font-semibold'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                チャット
              </Link>
              {!session && (
                <div className="flex space-x-4">
                  <Link
                    href="/auth/signin"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                      isActive('/auth/signin')
                        ? 'border-send-button text-gray-900 dark:text-global-bg font-semibold'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    サインイン
                  </Link>
                  <Link
                    href="/auth/signup"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                      isActive('/auth/signup')
                        ? 'border-send-button text-gray-900 dark:text-global-bg font-semibold'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    新規登録
                  </Link>
                </div>
              )}
            </div>

            {session && (
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Link
                  href="/profile"
                  className={`p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-send-button transition-all duration-200 ${
                    isActive('/profile') ? 'ring-2 ring-send-button' : ''
                  }`}
                >
                  <img
                    src={avatarUrl || '/user.webp'}
                    alt="プロフィール画像"
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/user.webp';
                    }}
                  />
                </Link>
                <Button
                  variant="secondary"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="ml-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium hover:text-send-button transition-colors duration-200"
                >
                  サインアウト
                </Button>
              </div>
            )}

            <div className="flex items-center sm:hidden">
              <Button
                variant="secondary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">メニューを開く</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <title>メニューを開く</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <title>メニューを閉じる</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-send-button/10 border-send-button text-gray-900 dark:text-global-bg font-semibold'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-black/20 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              ホーム
            </Link>
            <Link
              href="/chats?channel_name=thread1"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200 ${
                isActive('/chats')
                  ? 'bg-send-button/10 border-send-button text-gray-900 dark:text-global-bg font-semibold'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-black/20 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              チャット
            </Link>
            {session ? (
              <>
                <Link
                  href="/profile"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200 ${
                    isActive('/profile')
                      ? 'bg-send-button/10 border-send-button text-gray-900 dark:text-global-bg font-semibold'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-black/20 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  プロフィール
                </Link>
                <Button
                  variant="secondary"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-black/20 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  サインアウト
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200 ${
                    isActive('/auth/signin')
                      ? 'bg-send-button/10 border-send-button text-gray-900 dark:text-global-bg font-semibold'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-black/20 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  サインイン
                </Link>
                <Link
                  href="/auth/signup"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200 ${
                    isActive('/auth/signup')
                      ? 'bg-send-button/10 border-send-button text-gray-900 dark:text-global-bg font-semibold'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-black/20 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ログアウト確認モーダル */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-global-bg mb-4">
              ログアウトの確認
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              ログアウトしてもよろしいですか？
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-black/20 hover:bg-gray-200 dark:hover:bg-black/40 rounded-md"
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-send-button hover:bg-send-button/80 rounded-md"
              >
                サインアウト
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
