import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: (key) => {
        try {
          const itemStr = localStorage.getItem(key);
          if (!itemStr) return null;
          const item = JSON.parse(itemStr);
          const now = new Date();
          if (now.getTime() > item.expiresAt) {
            localStorage.removeItem(key);
            return null;
          }
          return item.value;
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          const expiresAt = new Date();
          expiresAt.setSeconds(
            expiresAt.getSeconds() +
              Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || 3600)
          );
          const item = {
            value,
            expiresAt: expiresAt.getTime(),
          };
          localStorage.setItem(key, JSON.stringify(item));
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      },
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.0.0',
    },
  },
});
