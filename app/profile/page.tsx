'use client';
import ProfileEdit from '@/components/profile-edit';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8 bg-chat-bg dark:bg-black/40 min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-center text-black dark:text-global-bg">
        プロフィール設定
      </h1>
      <ProfileEdit />
    </div>
  );
}
