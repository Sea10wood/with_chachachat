import type { UploadState } from '@/types/profile';
import { deleteAvatar, uploadAvatar } from '@/utils/supabase/profile';
import { validateAvatarFile } from '@/utils/validation/profile';
import Image from 'next/image';
import { useState } from 'react';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onAvatarUpdate: (newUrl: string) => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export default function AvatarUpload({
  currentAvatarUrl,
  onAvatarUpdate,
  onError,
  onSuccess,
}: AvatarUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isLoading: false,
    isComplete: false,
    progress: 0,
  });

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadState({
        isLoading: true,
        isComplete: false,
        progress: 0,
      });

      const file = event.target.files?.[0];
      if (!file) {
        throw new Error('ファイルが選択されていません');
      }

      const validation = validateAvatarFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'ファイルの検証に失敗しました');
      }

      setUploadState((prev) => ({ ...prev, progress: 20 }));

      if (currentAvatarUrl) {
        await deleteAvatar(currentAvatarUrl);
      }

      setUploadState((prev) => ({ ...prev, progress: 40 }));
      const publicUrl = await uploadAvatar(file);

      setUploadState({
        isLoading: false,
        isComplete: true,
        progress: 100,
      });

      onAvatarUpdate(publicUrl);
      onSuccess('アバターを更新しました');
    } catch (error) {
      console.error('アバターアップロードエラー:', error);
      setUploadState({
        isLoading: false,
        isComplete: false,
        progress: 0,
      });
      onError(
        error instanceof Error ? error.message : 'アバターの更新に失敗しました'
      );
    }
  }

  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative w-48 h-48 mb-4">
        <Image
          src={currentAvatarUrl || '/user.webp'}
          alt="プロフィール画像"
          fill
          className="rounded-full object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <label
          className={`cursor-pointer bg-send-button text-black px-4 py-2 rounded-lg hover:bg-loading-color transition-colors ${uploadState.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>画像を選択</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploadState.isLoading}
            className="hidden"
          />
        </label>
        {uploadState.isLoading && (
          <div className="w-full max-w-xs">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-send-button h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
            <p className="text-sm text-black/70 mt-1">
              アップロード中... {uploadState.progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
