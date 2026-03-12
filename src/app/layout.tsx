import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import SplashScreen from '@/components/SplashScreen';
import { createClient } from '@/utils/supabase/server';
import { User, LogIn } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Memorial Gallery',
  description: 'Shared, real-time sanctuary for precious moments.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="antialiased">
        <SplashScreen />
        <nav className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
          <Link href="/" className="font-bold tracking-widest text-lg pointer-events-auto">M G</Link>
          <div className="flex gap-4 pointer-events-auto">
            {!user ? (
              <div className="flex gap-2 text-sm font-semibold">
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
        {children}
      </body>
    </html>
  );
}
