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
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6 bg-black relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[80px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

      <div className="w-full max-w-5xl relative z-10">
        <div className="flex flex-col items-center text-center mb-10">
          <Link href="/" className="text-white/40 hover:text-white transition-colors flex items-center gap-2 mb-6 text-sm tracking-widest uppercase">
            <ArrowLeft className="w-4 h-4" /> Exit
          </Link>
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-xl">
             <Crown className="w-8 h-8 text-white/80" />
          </div>
          <h1 className="text-4xl font-serif font-light mb-2">Choose Your Sanctuary</h1>
          <p className="text-white/40 text-sm max-w-sm">Premium features at an affordable price, created to immortalize your memories forever.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* STARTER */}
          <div className="glass-card p-8 flex flex-col items-center text-center border border-white/5 bg-white/[0.01]">
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Starter</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-3xl font-serif">Free</span>
            </div>
            <div className="space-y-4 mb-10 text-sm text-white/60 w-full text-left">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/20" /> 1 Event Gallery</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/20" /> 50 Photo Limit</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/20" /> Basic Theme</div>
            </div>
            <button className="w-full py-3 glass text-white/40 rounded-xl text-sm font-bold cursor-default mt-auto">Current Plan</button>
          </div>

          {/* LEGACY */}
          <div className="glass-card p-8 flex flex-col items-center text-center border border-white/20 bg-white/[0.03] relative scale-105 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">Recommended</div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/60 mb-2">Legacy</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-serif font-bold">$4.99</span>
              <span className="text-white/40 text-sm mb-1">/ one-time</span>
            </div>
            <div className="space-y-4 mb-10 text-sm text-white/80 w-full text-left">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white" /> 5 Event Galleries</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white" /> Guest Tribute Wall</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white" /> Digital Candle Sanctuary</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white" /> No Subscription</div>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl mt-auto"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Get Legacy'}
            </button>
          </div>

          {/* INFINITY */}
          <div className="glass-card p-8 flex flex-col items-center text-center border border-white/5 bg-white/[0.01]">
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Infinity</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-3xl font-serif font-medium">$12.99</span>
              <span className="text-white/40 text-sm mb-1">/ lifetime</span>
            </div>
            <div className="space-y-4 mb-10 text-sm text-white/60 w-full text-left">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/40" /> Unlimited Galleries</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/40" /> AI Story & Memory Loops</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/40" /> Live TV Slideshow Mode</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-white/40" /> Hi-Res Archive Export</div>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-3 glass text-white rounded-xl text-sm font-bold transition-all hover:bg-white/10 mt-auto"
            >
              Select Infinity
            </button>
          </div>
        </div>
        
        <p className="text-center text-white/20 text-[10px] mt-12 uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3" /> Secure One-Time Payment Powered by Memorial Systems
        </p>
      </div>
    </div>
  );
}
