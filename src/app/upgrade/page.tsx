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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.03] rounded-full blur-[150px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-lg relative z-10">
        <Link href="/" className="absolute -top-16 left-0 text-fg-secondary hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="glass-card overflow-hidden border border-white/20">
          <div className="p-8 pb-10 flex flex-col items-center text-center relative border-b border-white/5 bg-gradient-to-br from-white/10 to-transparent">
            {/* Sparkle decorative element */}
            <div className="absolute top-4 right-4 text-white/40"><Sparkles className="w-6 h-6" /></div>
            
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-serif font-medium text-white mb-3 tracking-wide">MEMORIAL <span className="text-white/50 italic">PRO</span></h1>
            <p className="text-fg-secondary text-lg">Unlimited events, unmatched memories.</p>
          </div>

          <div className="p-8">
            <div className="flex justify-center items-end gap-1 mb-10">
              <span className="text-5xl font-bold font-serif">$19</span>
              <span className="text-fg-secondary text-lg mb-1">/ one-time</span>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-full"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                <span className="text-white/90">Host Unlimited Events</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-full"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                <span className="text-white/90">Live TV Slideshow Mode</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-full"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                <span className="text-white/90">Record Guest Audio Memos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-full"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                <span className="text-white/90">Anticipation mode: Disposable Cameras</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-full"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                <span className="text-white/90">One-click Hi-Res ZIP Gallery Export</span>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...
                </>
              ) : (
                'Upgrade Now'
              )}
            </button>
            <p className="text-center text-fg-secondary text-xs mt-4">Safe, secure "mock" payment powered by Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
