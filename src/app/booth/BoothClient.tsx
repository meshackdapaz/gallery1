'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Camera, Upload, Loader2, ArrowLeft, Heart, MessageSquare, Send, X, Flame, Sparkles, Mic, Play, Pause, Lock, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function BoothClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Posting State
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  
  // Commenting State
  const [activePhotoComments, setActivePhotoComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Interactive Features State
  const [candles, setCandles] = useState<any[]>([]);
  const [guestbook, setGuestbook] = useState<any[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<any>(null);
  const [lightingCandle, setLightingCandle] = useState(false);
  const [showGuestbook, setShowGuestbook] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [unlockAt, setUnlockAt] = useState<string>('');
  const [postingMessage, setPostingMessage] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadBoothData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('invite_code', code)
          .single();

        if (eventError || !eventData) {
          router.push('/');
          return;
        }
        setEvent(eventData);

        const { data: photoData } = await supabase
          .from('photos')
          .select('*')
          .eq('event_id', eventData.id)
          .order('created_at', { ascending: false });
        
        setPhotos(photoData || []);

        const photoIds = (photoData || []).map(p => p.id);
        if (photoIds.length > 0) {
          const { data: reactionData } = await supabase
            .from('photo_reactions')
            .select('*')
            .in('photo_id', photoIds);
          setReactions(reactionData || []);

          const { data: commentData } = await supabase
            .from('photo_comments')
            .select('*')
            .in('photo_id', photoIds)
            .order('created_at', { ascending: true });
          setComments(commentData || []);
        }

        // Fetch Candles
        const { data: candleData } = await supabase
          .from('gallery_candles')
          .select('*')
          .eq('event_id', eventData.id);
        setCandles(candleData || []);

        // Fetch Guestbook
        const { data: guestbookData } = await supabase
          .from('gallery_guestbook')
          .select('*')
          .eq('event_id', eventData.id)
          .order('created_at', { ascending: false });
        setGuestbook(guestbookData || []);

        // Fetch Daily Prompt
        const today = new Date().toISOString().split('T')[0];
        const { data: promptData } = await supabase
          .from('gallery_prompts')
          .select('*')
          .eq('active_date', today)
          .maybeSingle();
        setCurrentPrompt(promptData);

        // Realtime
        const channel = supabase.channel(`booth_${eventData.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload) => {
            setPhotos(prev => [payload.new, ...prev]);
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photo_reactions' }, (payload) => {
            setReactions(prev => [...prev, payload.new]);
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photo_comments' }, (payload) => {
            setComments(prev => [...prev, payload.new]);
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery_candles' }, (payload: any) => {
             setCandles((prev) => [...prev, payload.new]);
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery_guestbook' }, (payload: any) => {
             setGuestbook((prev) => [payload.new, ...prev]);
          })
          .subscribe();

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBoothData();
  }, [code]);

  const handleUpload = async () => {
    if (!pendingFile || !event || !user) return;
    setUploading(true);
    try {
      const fileExt = pendingFile.name.split('.').pop();
      const fileName = `booth_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `events/${event.id}/booth/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('memorial-photos')
        .upload(filePath, pendingFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('memorial-photos')
        .getPublicUrl(filePath);

      await supabase.from('photos').insert([{
        event_id: event.id,
        user_id: user.id,
        url: publicUrl,
        ai_caption: caption || 'A contribution from the Booth.'
      }]);

      setPendingFile(null);
      setPendingPreview(null);
      setCaption('');
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (photoId: string) => {
    if (!user) return;
    try {
      await supabase.from('photo_reactions').insert([{ photo_id: photoId, user_id: user.id }]);
    } catch (e) { /* already liked */ }
  };

  const handleComment = async (photoId: string) => {
    if (!newComment.trim() || !user) return;
    setPostingComment(true);
    try {
      await supabase.from('photo_comments').insert([{
        photo_id: photoId,
        user_id: user.id,
        author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
        content: newComment.trim()
      }]);
      setNewComment('');
    } finally {
      setPostingComment(false);
    }
  };

  const handleLightCandle = async () => {
    if (!user) return;
    setLightingCandle(true);
    try {
      await supabase.from('gallery_candles').insert([{ event_id: event.id, user_id: user.id }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLightingCandle(false);
    }
  };

  const handlePostTribute = async () => {
    if (!user || !newMessage.trim()) return;
    setPostingMessage(true);
    try {
      const { error } = await supabase.from('gallery_guestbook').insert([{
        event_id: event.id,
        user_id: user.id,
        author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        message: newMessage.trim(),
        unlock_at: unlockAt || null
      }]);
      if (error) throw error;
      setNewMessage('');
      setUnlockAt('');
      setShowGuestbook(false);
    } catch (e) {
      alert('Failed to post tribute.');
    } finally {
      setPostingMessage(false);
    }
  };

  const isLocked = (unlockAt: string | null) => {
    if (!unlockAt) return false;
    return new Date(unlockAt) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black gap-4 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
        <p className="text-white/40 font-serif italic uppercase tracking-[0.3em] text-[10px]">Synchronizing Booth...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-x-hidden">
      <div className="max-w-2xl mx-auto pt-24 pb-32">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <Link href={`/gallery?code=${code}`} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 mb-2 text-sm uppercase tracking-widest font-bold">
              <ArrowLeft className="w-4 h-4" /> Back to Gallery
            </Link>
            <h1 className="text-4xl font-serif font-light">Memory Booth</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full border bg-white/5 transition-all ${lightingCandle ? 'border-amber-500/50 text-amber-500' : 'border-white/10 text-white/40'}`}>
              <Flame className={`w-6 h-6 ${lightingCandle ? 'animate-bounce' : ''}`} />
            </div>
            <div className="text-right">
              <span className="block text-2xl font-serif leading-none">{candles.length}</span>
              <span className="text-[10px] uppercase tracking-tighter text-white/20">Fires Lit</span>
            </div>
          </div>
        </header>

        {/* Sanctuary: Quick Candle Action */}
        <div className="mb-12 flex items-center justify-between gap-6 p-6 glass-card border border-white/10 bg-gradient-to-r from-amber-500/[0.05] to-transparent">
          <div>
            <h3 className="text-lg font-serif mb-1">Light a Candle</h3>
            <p className="text-white/40 text-xs">A small light to show you care.</p>
          </div>
          <button 
            onClick={handleLightCandle}
            disabled={lightingCandle}
            className={`p-4 rounded-2xl border transition-all ${lightingCandle ? 'bg-amber-500/20 border-amber-500/40' : 'bg-white/5 border-white/10 hover:border-amber-500/20'}`}
          >
            <Flame className={`w-6 h-6 ${lightingCandle ? 'text-amber-500' : 'text-white/20'}`} />
          </button>
        </div>

        {/* Post Creator */}
        <div className="glass-card p-6 mb-12 border border-white/10 bg-white/[0.02]">
           {!pendingFile ? (
             <label className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all">
                <Camera className="w-10 h-10 text-white/20 mb-4" />
                <span className="text-white/40 text-sm font-bold uppercase tracking-widest">Post a new memory</span>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPendingFile(file);
                    setPendingPreview(URL.createObjectURL(file));
                  }
                }} className="hidden" />
             </label>
           ) : (
             <div className="space-y-6">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/20">
                   <img src={pendingPreview!} className="w-full h-full object-cover" />
                   <button onClick={() => setPendingFile(null)} className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tell the story behind this memory..."
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/20 resize-none h-24"
                />
                <button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  <span>Post to Booth</span>
                </button>
             </div>
           )}
        </div>

        {/* Prompts & Tributes */}
        <section className="mb-12 space-y-6">
           {currentPrompt && !showGuestbook && (
             <div className="glass-card p-6 border border-amber-500/10 bg-amber-500/[0.02] flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-white/80 font-serif italic text-sm">"{currentPrompt.prompt_text}"</p>
                </div>
                <button 
                  onClick={() => { setShowGuestbook(true); setNewMessage(`Replying to: ${currentPrompt.prompt_text}\n\n`); }}
                  className="text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Share
                </button>
             </div>
           )}

           <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-serif">Tribute Wall</h2>
              <button onClick={() => setShowGuestbook(!showGuestbook)} className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                {showGuestbook ? 'Close' : 'Write Tribute'}
              </button>
           </div>

           <AnimatePresence>
             {showGuestbook && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="glass-card p-6 border border-white/20 bg-white/5"
               >
                 <textarea 
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                   placeholder="Your message of love..."
                   className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/20 resize-none h-32 mb-6"
                 />
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/20">
                       <Clock className="w-4 h-4" /> Wait for specific date?
                       <input type="date" value={unlockAt} onChange={(e) => setUnlockAt(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-[10px]" />
                    </div>
                    <button 
                      onClick={handlePostTribute}
                      disabled={postingMessage || !newMessage.trim()}
                      className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      {postingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{unlockAt ? 'Set Time Capsule' : 'Post Tribute'}</span>
                    </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="grid grid-cols-1 gap-4">
              {guestbook.map(tribute => {
                const locked = isLocked(tribute.unlock_at);
                return (
                  <div key={tribute.id} className={`glass-card p-6 border ${locked ? 'border-amber-500/10 bg-amber-500/[0.01] opacity-60' : 'border-white/5 bg-white/[0.01]'}`}>
                    {locked ? (
                      <div className="flex items-center gap-4 text-white/20">
                        <Lock className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest">Locked until {new Date(tribute.unlock_at).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-white/70 italic mb-4 leading-relaxed">"{tribute.message}"</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">— {tribute.author_name}</span>
                          <span className="text-[10px] text-white/20 font-mono">{new Date(tribute.created_at).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
           </div>
        </section>

        {/* Social Feed */}
        <div className="space-y-12">
          {photos.map(photo => (
            <div key={photo.id} className="group">
              {/* Photo Card */}
              <div className="glass-card overflow-hidden border border-white/10 bg-white/[0.01]">
                <div className="p-4 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                       {photo.user_id ? <Sparkles className="w-4 h-4 text-white/40" /> : <Camera className="w-4 h-4 text-white/40" />}
                    </div>
                    <span className="text-sm font-bold text-white/60 tracking-wide uppercase">Member {photo.user_id?.substring(0,4)}</span>
                  </div>
                  <span className="text-[10px] text-white/20 font-mono uppercase">{new Date(photo.created_at).toLocaleDateString()}</span>
                </div>
                
                <img src={photo.url} className="w-full h-auto border-y border-white/5" />
                
                <div className="p-6">
                  <p className="text-white/80 font-serif italic mb-6 leading-relaxed">"{photo.ai_caption}"</p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleLike(photo.id)}
                      className="flex items-center gap-2 text-white/40 hover:text-rose-500 transition-colors"
                    >
                      <Heart className={`w-6 h-6 ${reactions.some(r => r.photo_id === photo.id && r.user_id === user?.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span className="text-xs font-bold">{reactions.filter(r => r.photo_id === photo.id).length}</span>
                    </button>
                    <button 
                      onClick={() => setActivePhotoComments(activePhotoComments === photo.id ? null : photo.id)}
                      className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span className="text-xs font-bold">{comments.filter(c => c.photo_id === photo.id).length}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {activePhotoComments === photo.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-8 pt-8 border-t border-white/5 overflow-hidden"
                      >
                        <div className="space-y-6 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          {comments.filter(c => c.photo_id === photo.id).map(c => (
                            <div key={c.id} className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{c.author_name}</span>
                                <span className="text-[10px] font-mono text-white/20">{new Date(c.created_at).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-sm text-white/70">{c.content}</p>
                            </div>
                          ))}
                          {comments.filter(c => c.photo_id === photo.id).length === 0 && <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-4">No stories shared yet.</p>}
                        </div>

                        <div className="relative">
                          <input 
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a thought..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-12 text-sm outline-none focus:border-white/20"
                            onKeyDown={(e) => e.key === 'Enter' && handleComment(photo.id)}
                          />
                          <button 
                            onClick={() => handleComment(photo.id)}
                            disabled={postingComment || !newComment.trim()}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                          >
                            {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Copyright Footer */}
        <footer className="mt-20 py-8 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-light">
            © 2026 DAPAZCM • ALL RIGHTS RESERVED
          </p>
        </footer>
      </div>
    </div>
  );
}
