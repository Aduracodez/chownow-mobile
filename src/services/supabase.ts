import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL !== 'https://placeholder.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const SupabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  async signIn(email: string, password: string) {
    if (!supabase) {
      // Local session handler when unconfigured
      return {
        data: {
          user: {
            id: 'usr_8921a4f0',
            email,
            user_metadata: { full_name: email.split('@')[0] },
          },
          session: { access_token: 'auth_token_local' },
        },
        error: null,
      };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string, fullName: string) {
    if (!supabase) {
      // Local session handler when unconfigured
      return {
        data: {
          user: {
            id: 'usr_' + Date.now().toString(36),
            email,
            user_metadata: { full_name: fullName },
          },
          session: { access_token: 'auth_token_local' },
        },
        error: null,
      };
    }
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
  },

  async signOut() {
    if (!supabase) {
      return { error: null };
    }
    return await supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    if (!supabase) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email);
  },
};
