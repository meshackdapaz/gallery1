'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Sparkles, ArrowRight, ArrowUpRight, Crown, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

export default function LandingPage() {
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', user.id)
          .single();
        setIsPro(profile?.is_pro || false);
      }
      setAuthLoading(false);
    }
    loadUser();
  }, [supabase.auth]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      router.push(`/gallery/${joinCode.toUpperCase()}`);
    }
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-black text-white app-container">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[120vw] h-[120vw] md:w-[60rem] md:h-[60rem] bg-white/[0.02] rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-[-10%] w-[100vw] h-[100vw] md:w-[40rem] md:h-[40rem] bg-white/[0.015] rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
      </div>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-[1280px] flex flex-col items-center z-10 py-12 md:py-24 pb-32 md:pb-40"
      >
        {/* Branding Section */}
        <motion.section variants={itemVariants} className="flex flex-col items-center mb-16 md:mb-24 text-center w-full focus:outline-none">
          <div className="w-20 md:w-28 aspect-square glass flex items-center justify-center mb-6 md:mb-10 rounded-2xl md:rounded-[2rem] border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
            <span className="text-3xl md:text-5xl font-serif italic text-white/90">V</span>
          </div>
          
          <h1 className="title font-serif font-light tracking-tighter leading-[1.1] mb-6 outline-none">
            MEMORIAL<br /><span className="text-white/40 italic">GALLERY</span>
          </h1>
          
          <p className="text-white/60 text-base md:text-xl max-w-[90%] md:max-w-[48rem] mx-auto font-light leading-relaxed px-4 text-balance">
            Curate life's most precious perspectives in a shared, real-time sanctuary.
          </p>
        </motion.section>

        {/* Dynamic Grid: Adaptive based on manifesto widths */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-[800px] mx-auto">
          {/* Host Action */}
          <button 
            onClick={() => {
              if (!user) {
                router.push('/login');
              } else {
                router.push('/host');
              }
            }}
            className="group w-full text-left"
          >
            <div className="card glass-card flex flex-col border border-white/5 hover:border-white/20 transition-all duration-500 h-full hover:bg-white/[0.03]">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10">
                <Users className="w-5 h-5 text-white/80" />
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-light mb-2">Host an Event</h2>
              <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8 flex-grow">
                Create a private sanctuary and invite guests to contribute their unique viewpoint.
              </p>
              <div className="flex items-center gap-2 text-sm md:text-base font-medium group-hover:translate-x-2 transition-transform">
                Start Session <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Join Action */}
          <div className="card glass-card flex flex-col border border-white/5 h-full">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/10">
              <Sparkles className="w-5 h-5 text-white/80" />
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-light mb-2">Join Gallery</h2>
            
            {!isJoining ? (
              <>
                <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8 flex-grow">
                  Enter an invite code to view and share moments in an existing sanctuary.
                </p>
                <button 
                  onClick={() => setIsJoining(true)}
                  className="mt-auto flex items-center gap-2 text-sm md:text-base font-medium hover:text-white/70 transition-colors"
                >
                  Enter Code <ArrowUpRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <form onSubmit={handleJoin} className="w-full mt-auto space-y-4">
                <input 
                  autoFocus
                  type="text"
                  placeholder="EX: CODE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-lg md:text-xl font-mono tracking-widest focus:outline-none focus:border-white/30 transition-all"
                />
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsJoining(false)}
                    className="flex-1 py-3 text-sm font-medium border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="flex-1 py-3 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    Join
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.section>

        {/* Pro Banner - Fluid & Responsive */}
        {!authLoading && user && !isPro && (
          <motion.section variants={itemVariants} className="w-full max-w-[800px] mt-8 px-4">
            <div className="glass-card p-6 md:p-10 border border-white/10 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:text-left text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
              
              <div className="flex-1 relative z-10 w-full">
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                  <Crown className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="font-serif text-xl md:text-2xl">Upgrade to PRO</span>
                </div>
                <p className="text-white/50 text-sm md:text-base mb-6">
                  Enhance your ceremonies with TV Slideshows, Audio Memos, and one-click exports.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm text-white/70 text-left">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> TV Slideshow Mode</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Guest Audio Memos</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Disposable Mode</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Hi-Res Zip Archive</span>
                </div>
              </div>

              <div className="relative z-10 w-full md:w-auto">
                <Link 
                  href="/upgrade"
                  className="w-full flex justify-center py-4 px-8 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                >
                  Go PRO
                </Link>
              </div>
            </div>
          </motion.section>
        )}

        {/* Adaptive Footer */}
        <motion.footer 
          variants={itemVariants} 
          className="mt-24 md:mt-32 w-full px-6 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-white/30"
        >
          <span className="flex items-center gap-2 transition-colors hover:text-white/60 cursor-default">
            <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" /> Real-time Sync
          </span>
          <span className="flex items-center gap-2 transition-colors hover:text-white/60 cursor-default">
            <div className="w-1 h-1 bg-white/40 rounded-full" /> Lossless Quality
          </span>
          <span className="flex items-center gap-2 transition-colors hover:text-white/60 cursor-default">
            <div className="w-1 h-1 bg-white/40 rounded-full" /> Privacy Secured
          </span>
        </motion.footer>
      </motion.main>
    </div>
  );
}
