'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Users, Sparkles, ArrowRight, ArrowUpRight, Crown, CheckCircle2, Loader2 } from 'lucide-react';
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
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.03] rounded-full blur-[150px] pointer-events-none translate-x-1/3 -translate-y-1/3" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3" 
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-4xl flex flex-col items-center pt-20"
      >
        {/* Header / Logo */}
        <motion.div variants={itemVariants} className="mb-16 relative w-full flex flex-col items-center">
          <div className="w-24 h-24 glass flex items-center justify-center mb-8 mx-auto rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            <Camera className="w-10 h-10 text-white/80" />
          </div>
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter mb-6 font-serif leading-tight">
            MEMORIAL<br /><span className="text-white/50 italic">GALLERY</span>
          </h1>
          <p className="text-fg-secondary text-xl max-w-xl mx-auto font-light tracking-wide leading-relaxed">
            Capture and curate life's most precious moments in a shared, real-time sanctuary.
          </p>
        </motion.div>

        {/* Action Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
          {/* Host Card */}
          <Link href="/host" className="block group">
            <div className="glass-card h-full flex flex-col items-start text-left p-8 border hover:border-white/20 transition-all duration-500 hover:bg-white/[0.05] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-4 bg-white/5 rounded-2xl mb-8 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 border border-white/10">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-serif font-light mb-3">Host an Event</h2>
              <p className="text-fg-secondary mb-8 text-sm leading-relaxed">
                Create a unique space and invite others to contribute their perspective.
              </p>
              <div className="mt-auto flex items-center gap-2 text-white font-medium group-hover:translate-x-2 transition-transform duration-300">
                Create Session <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Join Card */}
          <div className="glass-card h-full flex flex-col items-start text-left p-8 border transition-all duration-500 relative overflow-hidden">
            <div className="p-4 bg-white/5 rounded-2xl mb-8 border border-white/10">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-light mb-3">Join Gallery</h2>
            
            {!isJoining ? (
              <>
                <p className="text-fg-secondary mb-8 text-sm leading-relaxed">
                  Enter an invite code to view and share photos in an existing event.
                </p>
                <button 
                  onClick={() => setIsJoining(true)}
                  className="mt-auto flex items-center gap-2 text-white font-medium hover:text-white/70 transition-colors"
                >
                  Enter Code <ArrowUpRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <form onSubmit={handleJoin} className="w-full mt-auto space-y-4">
                <input 
                  autoFocus
                  type="text"
                  placeholder="EX: AB12"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-white/40 transition-all text-white placeholder:text-white/20"
                />
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsJoining(false)}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-medium bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-colors"
                  >
                    Join
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* Go Pro Banner or Loading State */}
        {authLoading ? (
          <div className="w-full max-w-2xl mx-auto mt-6 flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
          </div>
        ) : (
          user && !isPro && (
            <motion.div variants={itemVariants} className="w-full max-w-2xl mx-auto mt-6">
              <div className="glass-card relative overflow-hidden border border-white/20 p-8 text-left group">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-50" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="w-6 h-6 text-white" />
                      <h2 className="text-2xl font-serif font-medium text-white">Upgrade to Pro</h2>
                    </div>
                    <p className="text-fg-secondary text-sm mb-6 leading-relaxed">
                      Make your events unforgettable with premium features designed to amaze your guests.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-8">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-white" /> Live TV Slideshow
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-white" /> Audio Memos
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-white" /> Disposable Camera Mode
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-white" /> One-Click Zip Export
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0">
                    <Link 
                      href="/upgrade"
                      className="flex justify-center items-center gap-2 bg-white hover:bg-gray-200 text-black font-semibold px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] whitespace-nowrap"
                    >
                      Go Pro Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        )}

        {/* Footer Info */}
        <motion.div variants={itemVariants} className="mt-20 text-fg-secondary/50 text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-6">
          <span>Real-time Sync</span>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <span>Lossless Quality</span>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <span>Privacy First</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
