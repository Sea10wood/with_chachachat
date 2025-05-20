"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "../../utils/supabase/auth";
import FormField from "@/components/molecules/FormField/FormField";
import Button from "@/components/atoms/Button/Button";
import Link from "next/link";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);
      if (error) throw error;

      router.push("/auth/verify-email");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
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
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
      >
        新規登録
      </Button>
      <div className="text-sm text-center text-gray-600">
        アカウントをお持ちの場合は
        <Link
          href="/auth/signin"
          className="text-send-button hover:text-loading-color ml-1"
        >
          ログイン
        </Link>
      </div>
    </form>
  );
} 