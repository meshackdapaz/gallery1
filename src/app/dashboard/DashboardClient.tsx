'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Plus, ArrowRight, Image as ImageIcon, Sparkles, User, Mail, Shield, LogOut, Camera, X, Check, Settings, Music } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/image-crop';

export default function DashboardClient() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadUserAndEvents() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, photos(count)')
          .eq('host_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserAndEvents();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (rest: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleAvatarUpload = async () => {
    if (!imageToCrop || !croppedAreaPixels || !user) return;
    
    setUploadingAvatar(true);
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('memorial-photos')
        .upload(filePath, croppedImage, {
          contentType: 'image/jpeg',
          upsert: true
        });
        
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('memorial-photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (updateError) throw updateError;
      
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      setImageToCrop(null);
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      alert(`Failed to update avatar: ${err.message || 'Unknown error'}. Check your internet connection.`);
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          background_audio_url: editingEvent.background_audio_url
        })
        .eq('id', editingEvent.id);
      
      if (error) throw error;
      
      setEvents(events.map(ev => ev.id === editingEvent.id ? { ...ev, background_audio_url: editingEvent.background_audio_url } : ev));
      setEditingEvent(null);
    } catch (err: any) {
      alert("Failed to update settings: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (!user) return null;

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-12 px-6 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-card w-full p-8 border border-white/10 rounded-3xl bg-white/[0.02] shadow-2xl backdrop-blur-md mb-16"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div 
                className="relative group cursor-pointer"
                onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={avatarInputRef}
                  onChange={handleFileSelect}
                />
                <div className={`relative ${uploadingAvatar ? 'opacity-50' : 'group-hover:opacity-80'} transition-opacity`}>
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/10 shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center shadow-xl">
                      <User className="w-10 h-10 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-lg z-10">
                  <Shield className="w-4 h-4 text-white/80" />
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-serif font-light mb-2">{user.user_metadata?.full_name || user.user_metadata?.name || 'Anonymous Host'}</h2>
                <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-sm">
                   <Mail className="w-4 h-4 text-white/50" />
                   <span className="text-white/80">{user.email || 'No email provided'}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-6 py-3 rounded-full font-medium transition-colors border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* Galleries Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6"
        >
          <div>
            <h1 className="text-5xl font-light tracking-tight font-serif mb-3">Your Galleries</h1>
            <p className="text-fg-secondary tracking-wide uppercase text-sm">Managing {events.length} event{events.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/host">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-white/90 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <Plus className="w-5 h-5" /> Host New Event
            </motion.button>
          </Link>
        </motion.div>

        {events.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card text-center py-24 border border-white/5 bg-white/[0.02]"
          >
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-xl">
              <Sparkles className="w-10 h-10 text-white/40" />
            </div>
            <h2 className="text-3xl font-serif font-light mb-3">A blank canvas</h2>
            <p className="text-fg-secondary mb-8 max-w-sm mx-auto">Create your first memorial gallery to start immortalizing precious moments.</p>
            <Link href="/host" className="btn-secondary text-white inline-flex items-center gap-2 hover:bg-white/10 transition-colors">
              Begin Hosting
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.map((event) => (
              <motion.div key={event.id} variants={item}>
                <Link href={`/gallery?code=${event.invite_code}`} className="block h-full group">
                  <div className="glass h-full rounded-3xl p-8 border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500 overflow-hidden relative shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:-translate-y-1">
                    
                    {event.cover_photo_url ? (
                      <>
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-80" style={{ backgroundImage: `url(${event.cover_photo_url})` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                    
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                           <ImageIcon className="w-5 h-5 text-white/70" />
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingEvent(event);
                          }}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors"
                        >
                          <Settings className="w-5 h-5 text-white/40" />
                        </button>
                      </div>
                      
                      <h3 className="text-2xl font-serif font-light mb-2 line-clamp-1 group-hover:text-white transition-colors text-white/90">{event.name}</h3>
                      
                      <div className="flex flex-col gap-3 mt-6">
                        <div className="flex items-center justify-between text-sm border-b border-white/10 pb-3">
                          <span className="text-fg-secondary uppercase tracking-wider text-xs">Invite Code</span>
                          <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">{event.invite_code}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm pb-1">
                          <span className="text-fg-secondary uppercase tracking-wider text-xs">Total Photos</span>
                          <span className="text-white font-medium">{event.photos[0]?.count || 0}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-8 flex items-center justify-end text-white/50 group-hover:text-white font-medium text-sm transition-colors">
                        Enter Gallery 
                        <motion.div
                           className="ml-2"
                           initial={{ x: -5, opacity: 0 }}
                           whileInView={{ x: 0, opacity: 1 }}
                           transition={{ type: "spring" }}
                        >
                           <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Cropping Modal */}
      <AnimatePresence>
        {imageToCrop && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-lg aspect-square relative overflow-hidden rounded-3xl border border-white/20 shadow-[0_0_100px_rgba(255,255,255,0.1)]"
            >
              <div className="absolute inset-0">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={false}
                />
              </div>

              {/* Modal Controls */}
              <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                <button 
                  onClick={() => setImageToCrop(null)}
                  className="bg-black/50 backdrop-blur-md p-3 rounded-full border border-white/10 text-white/70 hover:text-white transition-all active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-white font-medium tracking-wide">Adjust Profile Picture</h3>
                <button 
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="bg-white text-black p-3 rounded-full border border-white/10 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                >
                  {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                </button>
              </div>

              <div className="absolute bottom-10 left-8 right-8 z-10">
                <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Zoom</span>
                    <span className="text-[10px] text-white/40 font-mono">{zoom.toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {editingEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/[0.02]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-serif font-light">Gallery Settings</h3>
                <button onClick={() => setEditingEvent(null)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateSettings} className="space-y-8">
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/40 mb-3 block font-bold">Atmosphere Music (URL)</label>
                  <div className="relative">
                    <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input 
                      type="url"
                      value={editingEvent.background_audio_url || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, background_audio_url: e.target.value })}
                      placeholder="https://example.com/audio.mp3"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-white/20 transition-all text-white/80"
                    />
                  </div>
                  <p className="text-[10px] text-white/20 mt-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Tip: Use a direct MP3 link for a peaceful vibe.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Candle Sanctuary</span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/40 uppercase tracking-widest font-bold">Enabled</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Tribute Guestbook</span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/40 uppercase tracking-widest font-bold">Enabled</span>
                   </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-4 bg-white text-black font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
