"use client";

import SignInForm from "@/components/auth/SignInForm";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";

export default function SignInPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-chat-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl">
          <div className="animate-fade-in">
            <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
              アカウントにサインイン
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              または{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-send-button hover:text-loading-color transition-colors duration-200"
              >
                新規アカウントを作成
              </Link>
            </p>
          </div>
          <SignInForm />
        </div>
      </div>
    </PageTransition>
  );
} 