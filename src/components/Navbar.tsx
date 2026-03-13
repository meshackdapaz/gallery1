'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, User, LayoutGrid } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

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

  // Hide navbar on auth pages
  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <>
      {/* Navigation - Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] flex justify-center pointer-events-none">
        <div className="flex gap-2 pointer-events-auto glass-card border border-white/10 rounded-full px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-xl items-center">
          {!user ? (
            <div className="flex gap-2 text-sm font-semibold signin-btn px-2">
              <Link href="/login" className="bg-white hover:bg-white/90 transition-all active:scale-95 rounded-full px-6 py-2.5 text-black cursor-pointer flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-1 p-1">
              <Link 
                href="/dashboard" 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all active:scale-95 text-sm font-medium ${
                  pathname === '/dashboard' 
                  ? 'bg-white text-black' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Galleries
              </Link>
              
              <Link 
                href="/dashboard" 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all active:scale-95 text-sm font-medium ${
                  pathname === '/profile' 
                  ? 'bg-white text-black' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
