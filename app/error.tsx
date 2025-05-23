'use client';

import Button from '@/components/atoms/Button/Button';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            エラーが発生しました
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            申し訳ありません。予期せぬエラーが発生しました。
          </p>
        </div>
        <div className="space-y-4">
          <Button onClick={() => reset()} className="w-full">
            もう一度試す
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              window.location.href = '/';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                window.location.href = '/';
              }
            }}
            className="w-full"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
