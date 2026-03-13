import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!url || !anonKey) {
    // During build or if secrets are missing, return a dummy client 
    // to prevent the process from crashing.
    console.warn('Supabase URL or Anon Key is missing. Using dummy client for pre-rendering.');
    return createBrowserClient(
      'https://dummy.supabase.co',
      'dummy-key'
    );
  }

  return createBrowserClient(url, anonKey);
}
