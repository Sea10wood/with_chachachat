"use client";

import { useState } from "react";
import { resetPassword } from "../../utils/supabase/auth";
import FormField from "@/components/molecules/FormField/FormField";
import Button from "@/components/atoms/Button/Button";
import Link from "next/link";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;

      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
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
          href="/auth/login"
          className="text-send-button hover:text-loading-color"
        >
          ログインページに戻る
        </Link>
      </div>
    );
  }

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
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
      >
        リセットメールを送信
      </Button>
      <div className="text-sm text-center text-gray-600">
        <Link
          href="/auth/login"
          className="text-send-button hover:text-loading-color"
        >
          ログインページに戻る
        </Link>
      </div>
    </form>
  );
} 