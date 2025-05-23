'use client';
import Button from '@/components/atoms/Button/Button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { AuthError } from '@supabase/supabase-js';
import { useState } from 'react';

/**
 * パスワードリセット前のメール送信用画面
 */
const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isSend, setIsSend] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/resetPassword/inputPassword`,
      });
      if (error) {
        setError(error);
        throw error;
      }
      setIsSend(true);
    } catch (error) {
      console.log(error);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-center lg:pt-32">
        <p className="text-loading-color">エラーが発生しました</p>
      </div>
    );
  }

  if (isSend) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-center lg:pt-32">
        <p className="text-black">パスワードリセット用のメールを送信しました</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl md:w-1/2 lg:w-1/4 px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-center lg:pt-32">
      <p className="text-black mb-4">
        パスワードリセット用のメールアドレスを入力してください
      </p>
      <form className="pt-10 text-left" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-black"
          >
            メールアドレス
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="example@example.com"
            className="bg-input-bg border border-send-button text-black text-sm rounded-lg focus:ring-send-button focus:border-send-button block w-full p-2.5"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="text-center mt-5">
          <Button
            type="submit"
            variant="primary"
            className="text-black bg-send-button hover:bg-loading-color focus:ring-4 focus:outline-none focus:ring-send-button/50 font-medium rounded-lg text-sm px-10 py-2.5 text-center transition-colors duration-200"
          >
            送信
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
