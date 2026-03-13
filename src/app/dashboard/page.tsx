'use client';

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Plus, ArrowRight, Image as ImageIcon, Sparkles, User, Mail, Shield, LogOut, Camera } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('memorial-photos')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('memorial-photos')
        .getPublicUrl(filePath);

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('Failed to update avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
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
                  onChange={handleAvatarUpload}
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
                <Link href={`/gallery/${event.invite_code}`} className="block h-full group">
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
                      <div className="w-12 h-12 bg-black/40 rounded-xl mb-6 flex items-center justify-center border border-white/10 backdrop-blur-md">
                         <ImageIcon className="w-5 h-5 text-white/70" />
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
    </div>
  );
}
