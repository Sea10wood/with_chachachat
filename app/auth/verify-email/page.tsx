'use client';

import { verifyEmail } from '@/utils/supabase/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const { token } = searchParams;

  if (!token) {
    redirect('/auth/signin');
  }

  try {
    await verifyEmail(token);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              メールアドレスの確認が完了しました
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              <Link
                href="/auth/signin"
                className="font-medium text-send-button hover:text-loading-color"
              >
                サインインページ
              </Link>
              からログインしてください
            </p>
          </div>
        </div>
      </div>
    );
  } catch (_error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              メールアドレスの確認に失敗しました
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              <Link
                href="/auth/signin"
                className="font-medium text-send-button hover:text-loading-color"
              >
                サインインページ
              </Link>
              から再度お試しください
            </p>
          </div>
        </div>
      </div>
    );
  }
}
