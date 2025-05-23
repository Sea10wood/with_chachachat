'use client';

import Button from '@/components/atoms/Button/Button';
import FormField from '@/components/molecules/FormField/FormField';
import { AuthError } from '@supabase/supabase-js';
import Link from 'next/link';
import { useState } from 'react';
import { resetPassword } from '../../utils/supabase/auth';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error.message);
      } else {
        setError('予期せぬエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-700">
          パスワードリセット用のメールを送信しました。
          <br />
          メールに記載されたリンクからパスワードを再設定してください。
        </p>
        <Link
          href="/auth/signin"
          className="text-send-button hover:text-loading-color"
        >
          サインインページに戻る
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
      <Button
        type="submit"
        variant="primary"
        className="w-full bg-send-button hover:bg-send-button/80"
        isLoading={isLoading}
      >
        リセットメールを送信
      </Button>
      <div className="text-sm text-center text-gray-600">
        <Link
          href="/auth/signin"
          className="text-send-button hover:text-loading-color"
        >
          サインインページに戻る
        </Link>
      </div>
    </form>
  );
}
