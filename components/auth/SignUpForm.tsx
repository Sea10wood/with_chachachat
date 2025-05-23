'use client';

import Button from '@/components/atoms/Button/Button';
import FormField from '@/components/molecules/FormField/FormField';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthError } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (password.length < 12) {
      setError('パスワードは12文字以上で入力してください');
      return false;
    }

    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/
      )
    ) {
      setError(
        'パスワードは大文字、小文字、数字、特殊文字を含める必要があります'
      );
      return false;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return false;
    }

    return true;
  };

  const getErrorMessage = (error: AuthError) => {
    const errorMessage = error.message;
    if (errorMessage.includes('User already registered')) {
      return 'このメールアドレスは既に登録されています';
    }
    return '登録中にエラーが発生しました';
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      router.push('/auth/verify-email');
    } catch (error) {
      if (error instanceof AuthError) {
        setError(getErrorMessage(error));
      } else {
        setError('予期せぬエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
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
      <FormField
        id="confirm-password"
        label="パスワード（確認）"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className="bg-gray-50 dark:bg-black/40 transition-all duration-200 focus:ring-2 focus:ring-send-button/20 text-gray-900 dark:text-gray-100"
      />
      <Button
        type="submit"
        variant="primary"
        className="w-full bg-send-button hover:bg-send-button/80 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-gray-900 dark:text-gray-100"
        isLoading={isLoading}
      >
        アカウントを作成
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
            onClick={() => handleOAuthSignUp('google')}
            className="bg-white dark:bg-black/40 hover:bg-gray-50 dark:hover:bg-black/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed transition-all duration-200 text-sm py-1.5"
            disabled
          >
            Googleでサインアップ
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOAuthSignUp('github')}
            className="bg-white dark:bg-black/40 hover:bg-gray-50 dark:hover:bg-black/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed transition-all duration-200 text-sm py-1.5"
            disabled
          >
            GitHubでサインアップ
          </Button>
        </div>
      </div>
    </form>
  );
}
