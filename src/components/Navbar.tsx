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
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none header app-container">
      <Link href="/" className="font-serif italic text-xl pointer-events-auto">V</Link>
      <div className="flex gap-4 pointer-events-auto">
        {!user ? (
          <div className="flex gap-2 text-sm font-semibold signin-btn">
            <Link href="/login" className="bg-white hover:bg-white/90 transition-colors rounded-full px-4 py-2 text-black cursor-pointer flex items-center gap-2">
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="bg-white/10 hover:bg-white/20 transition-colors rounded-full px-4 py-2 backdrop-blur-md border border-white/10 text-white text-sm font-semibold flex items-center justify-center">
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
