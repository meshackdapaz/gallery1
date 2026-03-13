'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <>
      {/* Branding - Top Center */}
      <div className="fixed top-0 left-0 right-0 flex justify-center py-6 z-50 pointer-events-none">
        <Link href="/" className="font-serif italic text-2xl pointer-events-auto bg-black/20 backdrop-blur-sm rounded-full px-4 border border-white/5">V</Link>
      </div>

      {/* Navigation - Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] flex justify-center pointer-events-none">
        <div className="flex gap-4 pointer-events-auto glass-card border border-white/10 rounded-full px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-xl">
          {!user ? (
            <div className="flex gap-2 text-sm font-semibold signin-btn">
              <Link href="/login" className="bg-white hover:bg-white/90 transition-all active:scale-95 rounded-full px-6 py-2.5 text-black cursor-pointer flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="bg-white/10 hover:bg-white/20 transition-all active:scale-95 rounded-full px-6 py-2.5 backdrop-blur-md border border-white/10 text-white text-sm font-semibold flex items-center justify-center">
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
