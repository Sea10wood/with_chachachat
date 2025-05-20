"use client";

import SignInForm from "@/components/auth/SignInForm";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウントにサインイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            または{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-send-button hover:text-loading-color"
            >
              新規アカウントを作成
            </Link>
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
} 