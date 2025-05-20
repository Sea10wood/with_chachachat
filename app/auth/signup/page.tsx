import { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "新規登録",
  description: "新しいアカウントを作成します"
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            新規アカウント作成
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            または{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-send-button hover:text-loading-color"
            >
              既存のアカウントにログイン
            </Link>
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
} 