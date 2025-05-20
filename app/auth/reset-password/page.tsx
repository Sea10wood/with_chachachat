import { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "パスワードリセット",
  description: "パスワードをリセットします"
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            パスワードリセット
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            または{" "}
            <Link
              href="/auth/login"
              className="font-medium text-send-button hover:text-loading-color"
            >
              ログインページに戻る
            </Link>
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
} 