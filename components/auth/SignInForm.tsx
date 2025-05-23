'use client';

import Button from '@/components/atoms/Button/Button';
import FormField from '@/components/molecules/FormField/FormField';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthError } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const validateForm = () => {
    if (!email) {
      setError('メールアドレスを入力してください');
      return false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('有効なメールアドレスを入力してください');
      return false;
    }

    if (!password) {
      setError('パスワードを入力してください');
      return false;
    }

    return true;
  };

  const getErrorMessage = (error: AuthError) => {
    const errorMessage = error.message;
    if (errorMessage.includes('Invalid login credentials')) {
      return 'メールアドレスまたはパスワードが正しくありません';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'メールアドレスの確認が完了していません';
    }
    if (errorMessage.includes('Too many requests')) {
      return '短時間に多くのリクエストが発生しました。しばらく時間をおいて再度お試しください';
    }
    return 'ログイン中にエラーが発生しました';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push('/profile');
    } catch (error) {
      setError(
        '認証に失敗しました。メールアドレスとパスワードを確認してください。'
      );
      console.error('認証エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof AuthError) {
        setError(getErrorMessage(error));
      } else {
        setError('予期せぬエラーが発生しました');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
      <FormField
        id="email"
        label="メールアドレス"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        error={error}
        className="bg-gray-50 dark:bg-black/40 transition-all duration-200 focus:ring-2 focus:ring-send-button/20 text-gray-900 dark:text-gray-100"
      />
      <FormField
        id="password"
        label="パスワード"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="bg-gray-50 dark:bg-black/40 transition-all duration-200 focus:ring-2 focus:ring-send-button/20 text-gray-900 dark:text-gray-100"
      />
      <div className="flex items-center justify-between">
        <Link
          href="/resetPassword"
          className="text-sm text-send-button hover:text-loading-color transition-colors duration-200"
        >
          パスワードを忘れた場合
        </Link>
      </div>
      <Button
        type="submit"
        variant="primary"
        className="w-full bg-send-button hover:bg-send-button/80 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-gray-900 dark:text-gray-100"
        isLoading={isLoading}
      >
        サインイン
      </Button>
      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400 text-xs">
              または
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOAuthLogin('google')}
            className="bg-white dark:bg-black/40 hover:bg-gray-50 dark:hover:bg-black/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed transition-all duration-200 text-sm py-1.5"
            disabled
          >
            Googleでサインイン
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOAuthLogin('github')}
            className="bg-white dark:bg-black/40 hover:bg-gray-50 dark:hover:bg-black/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed transition-all duration-200 text-sm py-1.5"
            disabled
          >
            GitHubでサインイン
          </Button>
        </div>
      </div>
    </form>
  );
}
