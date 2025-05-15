"use client"
import { useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";


/**
 * パスワードリセット前のメール送信用画面
 */
const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isSend, setIsSend] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
	 
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const supabase = createClientComponentClient()
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
    )
  }
  
  if (isSend) {
    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-center lg:pt-32">
             <p className="text-black">メールを送信しました</p>
        </div>
    )
  }
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-center lg:pt-32">
     <p className="text-black mb-4">アカウントに結びついているメールアドレスを入力してください</p>
     <form className="pt-10" onSubmit={onSubmit}>
        <input 
          className="bg-input-bg border border-send-button text-black text-sm rounded-lg focus:ring-send-button focus:border-send-button md:w-2/3 lg:w-1/2 p-2.5" 
          value={email} 
          type="email" 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="メールアドレス" 
        />
        <button 
          className="text-black bg-send-button hover:bg-loading-color focus:ring-4 focus:outline-none focus:ring-send-button/50 font-medium rounded-lg text-sm px-5 py-2.5 ml-2 text-center transition-colors duration-200" 
          type="submit"
        >
          送信
        </button>
      </form>
    </div>
  );
}

export default ResetPassword