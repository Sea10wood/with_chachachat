"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import FormField from "@/components/molecules/FormField/FormField";
import Button from "@/components/atoms/Button/Button";
import Link from "next/link";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const validateForm = () => {
    if (!email) {
      setError("メールアドレスを入力してください");
      return false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("有効なメールアドレスを入力してください");
      return false;
    }

    if (!password) {
      setError("パスワードを入力してください");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(getErrorMessage(signInError));
        return;
      }

      router.push('/profile');
      router.refresh();
    } catch (error: any) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: "google" | "github") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="メールアドレス"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        error={error}
      />
      <FormField
        label="パスワード"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <div className="flex items-center justify-between">
        <Link
          href="/auth/reset-password"
          className="text-sm text-send-button hover:text-loading-color"
        >
          パスワードを忘れた場合
        </Link>
      </div>
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
      >
        サインイン
      </Button>
      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">または</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleProviderSignIn("google")}
          >
            Googleでサインイン
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleProviderSignIn("github")}
          >
            GitHubでサインイン
          </Button>
        </div>
      </div>
    </form>
  );
} 