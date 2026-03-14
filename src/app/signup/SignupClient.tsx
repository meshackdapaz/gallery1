'use client';

import React, { useState } from 'react';
import { User, Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SignupClient() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
      } else if (data.user && data.session === null) {
        setError('Verification email sent. Please check your inbox.');
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Signup exception:', err);
      const msg = err.message || 'Unknown error';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('load failed')) {
        setError('Network error: Could not connect to the sanctuary. Please check your internet.');
      } else {
        setError(`System error: ${msg}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      <Link href="/login" className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors">
        ← Back to Login
      </Link>

      <div className="w-full max-w-md relative z-10 px-6">
        <div className="text-center mb-10">
          <div className="w-16 h-16 glass flex items-center justify-center mb-6 mx-auto rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Sparkles className="w-8 h-8 text-white/80" />
          </div>
          <h1 className="text-3xl font-light tracking-tight font-serif mb-2">Create Account</h1>
          <p className="text-white/40 text-sm">Join the sanctuary to begin hosting.</p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSignup} className="flex flex-col gap-6">
            
            {error && (
              <div className="bg-rose-500/10 text-rose-500 text-sm p-3 rounded-lg border border-rose-500/20 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-mono" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Meshack Dapaz"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all text-white placeholder:text-white/20"
                />
                <User className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

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
                  minLength={6}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all text-white placeholder:text-white/20"
                />
                <Lock className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {!loading ? (
              <button type="submit" className="w-full bg-white text-black py-3 rounded-xl tracking-wide font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-[0.98]">
                Create Account
              </button>
            ) : (
              <div className="w-full flex justify-center py-3">
                <Loader2 className="w-6 h-6 animate-spin text-white/40" />
              </div>
            )}

            <div className="text-center mt-2">
              <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">
                Already have an account? <span className="text-white font-medium underline decoration-white/20">Log In</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
