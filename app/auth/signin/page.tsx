'use client';

import PageTransition from '@/components/PageTransition';
import SignInForm from '@/components/auth/SignInForm';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-chat-bg dark:bg-black/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-black p-8 rounded-xl shadow-2xl dark:shadow-black/40 border-2 border-gray-300 dark:border-gray-700 transform transition-all duration-300 hover:shadow-3xl">
          <div className="animate-fade-in">
            <h2 className="mt-2 text-center text-3xl font-bold text-gray-900 dark:text-global-bg">
              アカウントにサインイン
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              または{' '}
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
