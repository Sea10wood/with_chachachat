import type { Profile, ProfileUpdateData } from '@/types/profile';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function getCurrentUser() {
  const supabase = createClientComponentClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getProfile(userId: string) {
  const supabase = createClientComponentClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return profile as Profile;
}

export async function createProfile(userId: string) {
  const supabase = createClientComponentClient();
  const { error } = await supabase.from('profiles').insert({
    id: userId,
    name: '新しいユーザー',
    avatar_url: '/user.webp',
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function updateProfile(userId: string, data: ProfileUpdateData) {
  const supabase = createClientComponentClient();
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);

  if (error) throw error;
}

export async function uploadAvatar(file: File) {
  const supabase = createClientComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('ユーザーが見つかりません');

  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}-${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(filePath);

  await updateProfile(user.id, {
    avatar_url: publicUrl,
    updated_at: new Date().toISOString(),
  });

  return publicUrl;
}

export async function deleteAvatar(avatarUrl: string) {
  const supabase = createClientComponentClient();
  const oldPath = avatarUrl.split('/').pop();
  if (oldPath) {
    await supabase.storage.from('avatars').remove([oldPath]);
  }
}
