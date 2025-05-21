import { createClient } from '@/utils/supabase/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Provider } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';

export async function signIn(email: string, password: string) {
  const supabase = createClientComponentClient();
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUp(email: string, password: string) {
  const supabase = createClientComponentClient();
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signOut() {
  const supabase = createClientComponentClient();
  return await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const supabase = createClientComponentClient();
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/resetPassword/inputPassword`,
  });
}

export async function updatePassword(password: string) {
  const supabase = createClientComponentClient();
  return await supabase.auth.updateUser({
    password,
  });
}

export async function signInWithProvider(provider: Provider) {
  const supabase = createClientComponentClient();
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function getSession() {
  const supabase = createClientComponentClient();
  return await supabase.auth.getSession();
}

export async function getUser() {
  const supabase = createClientComponentClient();
  return await supabase.auth.getUser();
}

export async function verifyEmail(token: string) {
  const supabase = createClientComponentClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'email',
  });

  if (error) {
    throw error;
  }
}
