"use client";
import { Dispatch, SetStateAction, useState } from "react";
import Link from 'next/link';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ErrorModal from "./errorModal";
import { useRouter } from "next/navigation";

export default function SignInForm(props: {
  showModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { showModal } = props;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const supabase = createClientComponentClient();

  const validateForm = () => {
    if (!email) {
      setError("メールアドレスを入力してください");
      setShowErrorModal(true);
      return false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("有効なメールアドレスを入力してください");
      setShowErrorModal(true);
      return false;
    }

    if (!password) {
      setError("パスワードを入力してください");
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const getErrorMessage = (error: any) => {
    const errorMessage = error.message;
    if (errorMessage.includes("Invalid login credentials")) {
      return "メールアドレスまたはパスワードが正しくありません";
    }
    if (errorMessage.includes("Email not confirmed")) {
      return "メールアドレスの確認が完了していません";
    }
    if (errorMessage.includes("Too many requests")) {
      return "短時間に多くのリクエストが発生しました。しばらく時間をおいて再度お試しください";
    }
    return "エラーが発生しました。しばらく時間をおいて再度お試しください";
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(getErrorMessage(signInError));
        setShowErrorModal(true);
        return;
      }

      showModal(false);
      router.push('/profile');
    } catch (error) {
      setError("エラーが発生しました。しばらく時間をおいて再度お試しください");
      setShowErrorModal(true);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
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
            className="bg-input-bg border border-send-button text-black text-sm rounded-lg focus:ring-send-button focus:border-send-button block w-full p-2.5"
            placeholder="name@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
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
        <div className="text-right">
          <Link className="font-medium text-send-button hover:text-loading-color hover:underline" href={`${location.origin}/resetPassword`} onClick={() => showModal(false)}>パスワードを忘れた場合</Link>
        </div>
        <div>
          <button className="w-full text-black bg-send-button hover:bg-loading-color focus:ring-4 focus:outline-none focus:ring-send-button/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200">
            サインイン
          </button>
        </div>
      </form>
      {showErrorModal && error && (
        <ErrorModal message={error} showModal={setShowErrorModal} />
      )}
    </>
  );
}
