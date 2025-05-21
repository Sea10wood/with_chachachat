'use client';

import Button from '@/components/atoms/Button/Button';
import FormField from '@/components/molecules/FormField/FormField';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return false;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return false;
    }

    return true;
  };

  const getErrorMessage = (error: any) => {
    const errorMessage = error.message;
    if (errorMessage.includes('User already registered')) {
      return 'このメールアドレスは既に登録されています';
    }
    if (errorMessage.includes('Invalid email')) {
      return '有効なメールアドレスを入力してください';
    }
    if (errorMessage.includes('Password should be at least 6 characters')) {
      return 'パスワードは6文字以上で入力してください';
    }
    if (errorMessage.includes('Too many requests')) {
      return '短時間に多くのリクエストが発生しました。しばらく時間をおいて再度お試しください';
    }
    return 'エラーが発生しました。しばらく時間をおいて再度お試しください';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        setError(getErrorMessage(signUpError));
        return;
      }

      if (data?.user) {
        console.log('Sign up successful:', data.user);
        router.push('/auth/verify-email');
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignUp = async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }
      console.log('OAuth data:', data);
    } catch (error: any) {
      console.error('OAuth unexpected error:', error);
      setError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
      <FormField
        label="メールアドレス"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        error={error}
        className="bg-gray-50 dark:bg-black/40 transition-all duration-200 focus:ring-2 focus:ring-send-button/20 text-gray-900 dark:text-gray-100"
      />
      <div className="relative">
        <FormField
          label="パスワード"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-gray-50 dark:bg-black/40 transition-all duration-200 focus:ring-2 focus:ring-send-button/20 text-gray-900 dark:text-gray-100 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
        >
          {showPassword ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
        </button>
      </div>
      <div className="relative">
        <FormField
          label="パスワード（確認）"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="bg-gray-50 dark:bg-black/40 transition-all duration-200 focus:ring-2 focus:ring-send-button/20 text-gray-900 dark:text-gray-100 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-[38px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          aria-label={showConfirmPassword ? 'パスワードを隠す' : 'パスワードを表示'}
        >
          {showConfirmPassword ? (
            <EyeIcon className="h-5 w-5" />
          ) : (
            <EyeSlashIcon className="h-5 w-5" />
          )}
        </button>
      </div>
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
            onClick={() => handleProviderSignUp('google')}
            className="bg-white dark:bg-black/40 hover:bg-gray-50 dark:hover:bg-black/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 opacity-50 cursor-not-allowed transition-all duration-200 text-sm py-1.5"
            disabled
          >
            Googleでサインアップ
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleProviderSignUp('github')}
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
