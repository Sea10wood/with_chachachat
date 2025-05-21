import Button from '@/components/atoms/Button/Button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-global-bg p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-black">
            ページが見つかりません
          </h2>
          <p className="mt-2 text-sm text-black/60">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link href="/" className="block w-full">
            <Button className="w-full bg-send-button text-black hover:bg-send-button/90">
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
