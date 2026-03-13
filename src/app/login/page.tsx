'use client';

import React, { useState, Suspense } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function LoginContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setLocalError(signInError.message);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLocalError(err.message || 'Network error: Load failed. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10 px-6">
      <div className="text-center mb-10">
        <div className="w-16 h-16 glass flex items-center justify-center mb-6 mx-auto rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <Lock className="w-8 h-8 text-white/80" />
        </div>
        <h1 className="text-3xl font-light tracking-tight font-serif mb-2">Login</h1>
        <p className="text-white/40 text-sm">Welcome back to your sanctuary.</p>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-md">
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          
          {(errorParam || localError) && (
            <div className="bg-rose-500/10 text-rose-500 text-sm p-3 rounded-lg border border-rose-500/20 text-center">
              {errorParam || localError}
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-mono" htmlFor="email">Email</label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all text-white placeholder:text-white/20"
              />
              <Mail className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-mono" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all text-white placeholder:text-white/20"
              />
              <Lock className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {!loading ? (
            <button type="submit" className="w-full bg-white text-black py-3 rounded-xl tracking-wide font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-[0.98]">
              Log In
            </button>
          ) : (
            <div className="w-full flex justify-center py-3">
              <Loader2 className="w-6 h-6 animate-spin text-white/40" />
            </div>
          )}

          <div className="text-center mt-2">
            <Link href="/signup" className="text-sm text-white/40 hover:text-white transition-colors">
              Don't have an account? <span className="text-white font-medium underline decoration-white/20">Sign Up</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors">
        ← Back to Home
      </Link>

      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-white/20" />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
