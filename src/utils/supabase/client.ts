import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!url || !anonKey) {
    // Fallback for build time
    console.warn('Supabase URL or Anon Key is missing. Using dummy client.');
    return createSupabaseClient(
      'https://dummy.supabase.co',
      'dummy-key'
    );
  }

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'memorial-gallery-auth'
    }
  });
}
