'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Crown, CheckCircle2, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    }
    loadUser();
  }, [supabase.auth]);

  const handleUpgrade = async () => {
    if (!user) {
      alert("You must be logged in to upgrade.");
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Mock Payment - In a real app we would call a Stripe checkout session endpoint
      const { error } = await supabase
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', user.id);

      if (error) throw error;

      alert("Payment Successful! You are now a PRO member.");
      router.push('/');
    } catch (error: any) {
      console.error("Upgrade error:", error);
      alert("Failed to upgrade. " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-white/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-20 pb-32 px-4 bg-black relative overflow-y-auto overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[80px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

      <div className="w-full max-w-5xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="text-white/40 hover:text-white transition-colors flex items-center gap-2 mb-4 text-[10px] tracking-widest uppercase font-bold">
            <ArrowLeft className="w-3 h-3" /> Exit
          </Link>
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-3 border border-white/10 shadow-xl">
             <Crown className="w-6 h-6 text-white/80" />
          </div>
          <h1 className="text-3xl font-serif font-light mb-1">Sanctuary Tiers</h1>
          <p className="text-white/30 text-[10px] uppercase tracking-widest max-w-xs">Premium memories, simple pricing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* STARTER */}
          <div className="glass-card p-6 flex flex-col items-center text-center border border-white/5 bg-white/[0.01]">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-bold">Starter</h3>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-2xl font-serif">Free</span>
            </div>
            <div className="space-y-3 mb-8 text-[11px] text-white/40 w-full text-left">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white/10" /> 1 Event Gallery</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white/10" /> 50 Photo Limit</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white/10" /> Basic Theme</div>
            </div>
            <button className="w-full py-2.5 glass text-white/20 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-default mt-auto">Current Plan</button>
          </div>

          {/* LEGACY */}
          <div className="glass-card p-6 flex flex-col items-center text-center border border-white/20 bg-white/[0.03] relative shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">Recommended</div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2 font-bold">Legacy</h3>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-3xl font-serif font-bold">$2.99</span>
              <span className="text-white/40 text-[10px] mb-1">/ one-time</span>
            </div>
            <div className="space-y-3 mb-8 text-[11px] text-white/70 w-full text-left">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white" /> 5 Event Galleries</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white" /> Guest Tribute Wall</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white" /> Digital Candle Sanctuary</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white" /> No Subscription</div>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-3 bg-white text-black rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl mt-auto"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Get Legacy'}
            </button>
          </div>

          {/* INFINITY */}
          <div className="glass-card p-6 flex flex-col items-center text-center border border-white/5 bg-white/[0.01]">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-bold">Infinity</h3>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-2xl font-serif font-medium">$9.99</span>
              <span className="text-white/40 text-[10px] mb-1">/ lifetime</span>
            </div>
            <div className="space-y-3 mb-8 text-[11px] text-white/40 w-full text-left">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white/10" /> Unlimited Galleries</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white/10" /> AI Story & Memory Loops</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white/10" /> Live TV Slideshow Mode</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white/10" /> Hi-Res Archive Export</div>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-2.5 glass text-white/60 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/10 mt-auto"
            >
              Select Infinity
            </button>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/10 font-light mb-4">
            <Sparkles className="w-3 h-3 inline-block mr-2 opacity-20" /> 
            Secure One-Time Payment • DAPAZCM
          </p>
          <p className="text-[8px] uppercase tracking-[0.2em] text-white/5">
            © 2026 DAPAZCM • ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}
