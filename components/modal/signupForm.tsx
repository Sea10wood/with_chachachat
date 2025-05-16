"use client";
import { supabase } from "@/utils/supabase/supabase";
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import ErrorModal from "./errorModal";

export default function SignUpForm(props: {
  showModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { showModal } = props;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConf, setPasswordConf] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

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

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      setShowErrorModal(true);
      return false;
    }

    if (password !== passwordConf) {
      setError("パスワードが一致しません");
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  const getErrorMessage = (error: any) => {
    const errorMessage = error.message;
    if (errorMessage.includes("User already registered")) {
      return "このメールアドレスは既に登録されています";
    }
    if (errorMessage.includes("Password should be at least 6 characters")) {
      return "パスワードは6文字以上で入力してください";
    }
    if (errorMessage.includes("Invalid email")) {
      return "有効なメールアドレスを入力してください";
    }
    if (errorMessage.includes("Too many requests")) {
      return "短時間に多くのリクエストが発生しました。しばらく時間をおいて再度お試しください";
    }
    return "エラーが発生しました。しばらく時間をおいて再度お試しください";
  };

  const onSubmit = async (event: any) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(getErrorMessage(signUpError));
        setShowErrorModal(true);
        return;
      }
      showModal(false);
      alert("登録完了メールを確認してください");
    } catch (error) {
      setError("エラーが発生しました。しばらく時間をおいて再度お試しください");
      setShowErrorModal(true);
    }
  };

  return (
    <>
      <form className="space-y-4" onSubmit={onSubmit}>
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
          <p className="mt-1 text-sm text-black/70">6文字以上で入力してください</p>
        </div>
        <div>
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
        <div>
          <button
            type="submit"
            className="w-full text-black bg-send-button hover:bg-loading-color focus:ring-4 focus:outline-none focus:ring-send-button/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200"
          >
            サインアップ
          </button>
        </div>
      </form>
      {showErrorModal && error && (
        <ErrorModal message={error} showModal={setShowErrorModal} />
      )}
    </>
  );
}
