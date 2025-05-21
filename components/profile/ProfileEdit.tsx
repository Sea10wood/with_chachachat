'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ErrorModal from '../modal/errorModal';
import AvatarUpload from './AvatarUpload';
import ProfileForm from './ProfileForm';

type ProfileState = {
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  successMessage: string | null;
};

export default function ProfileEdit() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [state, setState] = useState<ProfileState>({
    isLoading: true,
    isComplete: false,
    error: null,
    successMessage: null,
  });
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    initializeProfile();
  }, []);

  async function initializeProfile() {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: '認証エラー: ログインしてください',
        }));
        router.push('/');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await createNewProfile(user.id);
        } else {
          throw error;
        }
      } else if (profile) {
        setName(profile.name || '');
        setAvatarUrl(profile.avatar_url);
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('プロフィール初期化エラー:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'プロフィールの初期化に失敗しました',
      }));
      setShowErrorModal(true);
    }
  }

  async function createNewProfile(userId: string) {
    const { error: createError } = await supabase.from('profiles').insert({
      id: userId,
      name: '新しいユーザー',
      avatar_url: '/user.webp',
      updated_at: new Date().toISOString(),
    });

    if (createError) throw createError;

    setName('新しいユーザー');
    setAvatarUrl('/user.webp');
  }

  const handleError = (errorMessage: string) => {
    setState((prev) => ({
      ...prev,
      error: errorMessage,
      successMessage: null,
    }));
    setShowErrorModal(true);
  };

  const handleSuccess = (message: string) => {
    setState((prev) => ({
      ...prev,
      successMessage: message,
      error: null,
      isComplete: true,
    }));
    setShowErrorModal(true);

    // 成功メッセージを表示した後、少し遅延してからリダイレクト
    setTimeout(() => {
      router.push('/chats');
    }, 1500);
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-black">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4 text-black">プロフィール編集</h1>
      <div className="bg-chat-bg rounded-lg shadow p-6">
        <AvatarUpload
          currentAvatarUrl={avatarUrl}
          onAvatarUpdate={setAvatarUrl}
          onError={handleError}
          onSuccess={handleSuccess}
        />
        <ProfileForm
          name={name}
          onNameChange={setName}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      </div>
      {showErrorModal && (
        <ErrorModal
          message={state.error || state.successMessage || ''}
          showModal={setShowErrorModal}
          isError={!!state.error}
        />
      )}
    </div>
  );
}
