import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const url = 'https://wyhqxaicpxhdltezfmay.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aHF4YWljcHhoZGx0ZXpmbWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjgyOTQsImV4cCI6MjA4ODkwNDI5NH0.kIrgICJQdhfNDc1vdFga1Gw6nCf2a8sojM9ZWmLFRds';

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'memorial-gallery-auth'
    }
  });
}
