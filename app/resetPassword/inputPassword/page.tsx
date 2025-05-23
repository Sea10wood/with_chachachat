'use client';
import Button from '@/components/atoms/Button/Button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { AuthError } from '@supabase/supabase-js';
import { useState } from 'react';

/**
 * パスワードリセット用画面
 */
const InputPasswordForReset = () => {
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConf] = useState('');
  const [isSend, setIsSend] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase.auth.updateUser({ password: password });
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
        <p className="text-black">パスワードを更新しました</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl md:w-1/2 lg:w-1/4 px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-center lg:pt-32">
      <p className="text-black mb-4">新しいパスワードを入力してください</p>
      <form className="pt-10 text-left" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-black"
          >
            パスワード
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            className="bg-input-bg border border-send-button text-black text-sm rounded-lg focus:ring-send-button focus:border-send-button block w-full p-2.5"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="pt-5">
          <label
            htmlFor="passwordConf"
            className="block mb-2 text-sm font-medium text-black"
          >
            パスワード（確認）
          </label>
          <input
            type="password"
            name="passwordConf"
            id="passwordConf"
            placeholder="••••••••"
            className="bg-input-bg border border-send-button text-black text-sm rounded-lg focus:ring-send-button focus:border-send-button block w-full p-2.5"
            required
            value={passwordConf}
            onChange={(e) => setPasswordConf(e.target.value)}
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

export default InputPasswordForReset;
