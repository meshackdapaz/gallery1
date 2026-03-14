'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Camera, Upload, Loader2, ArrowLeft, Maximize2, QrCode, Heart, Download, Copy, Archive, Mic, Play, Pause, X, MonitorPlay, Trash2, Flame, MessageSquare, Send, Clock, Lock, Music, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Import theme utility functions or define them here for now
const getThemeStyles = (type: string) => {
  switch (type) {
    case 'wedding':
      return {
        bgGlow1: 'bg-rose-500/10',
        bgGlow2: 'bg-amber-500/10',
        accentText: 'text-rose-200',
        cardBorder: 'border-rose-500/20'
      };
    case 'birthday':
      return {
        bgGlow1: 'bg-fuchsia-500/10',
        bgGlow2: 'bg-cyan-500/10',
        accentText: 'text-fuchsia-200',
        cardBorder: 'border-fuchsia-500/20'
      };
    case 'party':
      return {
        bgGlow1: 'bg-emerald-500/10',
        bgGlow2: 'bg-purple-500/10',
        accentText: 'text-emerald-200',
        cardBorder: 'border-emerald-500/20'
      };
    case 'memorial':
    default:
      return {
        bgGlow1: 'bg-white/5',
        bgGlow2: 'bg-white/5',
        accentText: 'text-white',
        cardBorder: 'border-white/10'
      };
  }
};

export default function GalleryClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activePhoto, setActivePhoto] = useState<any>(null);
  const [reactions, setReactions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const router = useRouter();
  const supabase = createClient();
  const qrRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    async function fetchEventAndPhotos() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData.user);

        // Fetch event
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('invite_code', code)
          .single();

        if (eventError || !eventData) {
          alert('Event not found');
          router.push('/');
          return;
        }

        setEvent(eventData);

        // Fetch photos
        const { data: photoData, error: photoError } = await supabase
          .from('photos')
          .select('*')
          .eq('event_id', eventData.id)
          .order('created_at', { ascending: false });

        if (photoError) throw photoError;
        setPhotos(photoData || []);

        // Fetch initial reactions for these photos
        const photoIds = (photoData || []).map(p => p.id);
        if (photoIds.length > 0) {
          const { data: reactionData } = await supabase
            .from('photo_reactions')
            .select('*')
            .in('photo_id', photoIds);
          setReactions(reactionData || []);
        }


        // Realtime Setup for Standard Supabase
        const channel = supabase.channel(`gallery_updates_${eventData.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload: any) => {
             setPhotos((prev) => {
               if (prev.find(p => p.id === payload.new.id)) return prev;
               return [payload.new, ...prev];
             });
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photo_reactions' }, (payload: any) => {
             setReactions((prev) => [...prev, payload.new]);
          })
          .subscribe();

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEventAndPhotos();

    return () => {
      supabase.removeAllChannels();
    };
  }, [code, router, event?.id]);

  useEffect(() => {
    let interval: any;
    if (isPlayingStory && photos.length > 0) {
      interval = setInterval(() => {
        setStoryIndex((prev) => (prev + 1) % photos.length);
      }, 5000); // 5 seconds per memory
    }
    return () => clearInterval(interval);
  }, [isPlayingStory, photos.length]);


  const toggleAudio = (e: React.MouseEvent, photoId: string, audioUrl: string) => {
    e.stopPropagation();
    if (playingAudioId === photoId && currentAudioRef.current) {
      currentAudioRef.current.pause();
      setPlayingAudioId(null);
      return;
    }
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    
    const audio = new Audio(audioUrl);
    audio.onended = () => setPlayingAudioId(null);
    audio.play();
    currentAudioRef.current = audio;
    setPlayingAudioId(photoId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
        <p className="text-white/40 font-serif italic uppercase tracking-[0.3em] text-[10px]">Synchronizing Sanctuary...</p>
      </div>
    );
  }

  const handleReaction = async (photoId: string) => {
    if (!user) {
      alert('Please sign in to react to photos.');
      return;
    }
    try {
      await supabase.from('photo_reactions').insert([{ photo_id: photoId, user_id: user.id }]);
    } catch (e) {
      // Ignored for duplicates
    }
  };



  const getPhotoReactionsCount = (photoId: string) => {
    return reactions.filter(r => r.photo_id === photoId).length;
  };

  const galleryUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
         ctx.fillStyle = "white";
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.drawImage(img, 20, 20);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Gallery_QR_${code}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleDownloadZip = async () => {
    if (photos.length === 0) return;
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`Gallery_${event.name}`);

      // Fetch all photos and add to zip
      const fetchPromises = photos.map(async (photo, index) => {
        try {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          // Extract extension from URL, default to jpg
          const ext = photo.url.split('.').pop()?.split('?')[0] || 'jpg';
          folder?.file(`photo_${index + 1}.${ext}`, blob);
        } catch (e) {
          console.error('Failed to fetch photo for zip:', photo.url);
        }
      });

      await Promise.all(fetchPromises);
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Gallery_${event.name.replace(/\s+/g, '_')}.zip`);
    } catch (error) {
      console.error('Error creating zip:', error);
      alert('Failed to create zip file.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to completely delete this event? This action cannot be undone and all photos will be permanently lost.")) return;
    
    setDeletingEvent(true);
    try {
      // Delete photos first to handle foreign key constraints if cascade isn't on
      await supabase.from('photos').delete().eq('event_id', event.id);
      
      const { error } = await supabase.from('events').delete().eq('id', event.id);
      if (error) throw error;
      
      router.push('/');
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event.");
      setDeletingEvent(false);
    }
  };

  const theme = event ? getThemeStyles(event.event_type) : getThemeStyles('memorial');
  
  const isHost = user?.id === event?.host_id;
  const isDeveloping = event?.is_disposable_mode && event?.reveal_time && new Date() < new Date(event.reveal_time) && !isHost;

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-x-hidden">
      {/* Background Audio */}
      {event?.background_audio_url && (
        <audio 
          ref={bgAudioRef} 
          src={event.background_audio_url} 
          loop 
          muted={isMuted} 
          autoPlay 
        />
      )}

      {/* Dynamic Background Glows based on Event Type */}
      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${theme.bgGlow1} rounded-full blur-[120px] pointer-events-none transition-colors duration-1000`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] ${theme.bgGlow2} rounded-full blur-[150px] pointer-events-none transition-colors duration-1000`} />

      <header className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <Link href="/" className="text-fg-secondary hover:text-white transition-colors flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Exit Gallery
          </Link>
          <div className="flex items-center gap-4">
            <h1 className={`text-4xl font-bold tracking-tighter ${theme.accentText}`}>{event?.name}</h1>
            <button onClick={() => setShowQR(true)} className="p-2 bg-white/5 hover:bg-white/20 rounded-full transition-colors">
              <QrCode className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-fg-secondary mt-1">
            <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider">{code}</span>
            <span className="text-xs uppercase tracking-widest">• INVITE CODE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setIsPlayingStory(true);
              setIsMuted(false);
              setStoryIndex(0);
            }}
            disabled={photos.length === 0}
            className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
          >
            <Play className="w-5 h-5" />
            <span className="hidden sm:inline">Play Story</span>
          </button>

          {event?.background_audio_url && (
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/10"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-white/40" /> : <Volume2 className="w-5 h-5 text-white animate-pulse" />}
            </button>
          )}

          {isHost && photos.length > 0 && (
            <>
              <Link
                href={`/gallery/slideshow?code=${code}`}
                target="_blank"
                className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10 hidden md:flex"
              >
                <MonitorPlay className="w-5 h-5" />
                <span>Live TV</span>
              </Link>
              <button 
                onClick={handleDownloadZip}
                disabled={downloadingZip || deletingEvent}
                className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10 hidden md:flex"
              >
                {downloadingZip ? <Loader2 className="w-5 h-5 animate-spin" /> : <Archive className="w-5 h-5" />}
                <span>{downloadingZip ? 'Zipping...' : 'Export ZIP'}</span>
              </button>
              <button 
                onClick={handleDeleteEvent}
                disabled={deletingEvent || downloadingZip}
                title="Delete Event"
                className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20 hidden md:flex"
              >
                {deletingEvent ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              </button>
            </>
          )}

          <Link 
            href={`/booth?code=${code}`}
            className="btn-primary flex items-center gap-2 px-8 py-2.5 rounded-full font-bold shadow-xl shadow-white/5 border border-white/20 hover:scale-105 transition-all text-white"
          >
            <Camera className="w-5 h-5" />
            <span>Memory Booth</span>
          </Link>
        </div>
      </header>
      
      
      <main className="relative z-10 max-w-6xl mx-auto">
        {isDeveloping ? (
           <div className="glass h-[400px] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-0" />
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 z-10 relative">
               <Camera className="w-8 h-8 text-white/50 animate-pulse" />
             </div>
             <h3 className="text-2xl font-bold mb-3 z-10 relative">Photos are Developing...</h3>
             <p className="text-fg-secondary max-w-md z-10 relative">
               The host has enabled Disposable Camera Mode! You can keep snapping and uploading photos, but the gallery won't be revealed until:<br/>
               <span className="text-white font-bold block mt-2">{new Date(event.reveal_time).toLocaleString()}</span>
             </p>
           </div>
        ) : photos.length === 0 ? (
          <div className="glass h-[400px] flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Camera className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-bold mb-2">No photos yet</h3>
            <p className="text-fg-secondary max-w-xs">
              Be the first to share a memory! Use the upload button above to contribute.
            </p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 pb-32">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="relative group break-inside-avoid cursor-pointer rounded-2xl overflow-hidden mb-4 bg-white/5"
                onClick={() => setActivePhoto(photo)}
              >
                <img 
                  src={photo.url} 
                  alt="Memory" 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                
                {/* Pinterest-style subtle darkening on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Overlay for Reactions and Captions */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end">
                  <p className="text-sm font-medium text-white/90 drop-shadow-lg pr-4 line-clamp-2">
                    {photo.ai_caption || 'A beautiful memory.'}
                  </p>
                  <div className="flex items-center gap-2">
                    {photo.audio_url && (
                      <button 
                        onClick={(e) => toggleAudio(e, photo.id, photo.audio_url)}
                        className="flex items-center justify-center bg-white/90 backdrop-blur-md w-8 h-8 rounded-full hover:bg-white transition-all shadow-lg"
                      >
                        {playingAudioId === photo.id ? <Pause className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 text-black ml-0.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setShowQR(false)}>
          <div className="glass-card p-8 flex flex-col items-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-center">Join Gallery</h3>
            <div className="bg-white p-4 rounded-xl mb-6 shadow-xl">
              <QRCodeSVG value={galleryUrl} size={200} ref={qrRef} />
            </div>
            
            <div className="w-full space-y-3 mb-6">
              <button 
                onClick={handleDownloadQR}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download QR
              </button>
              
              <div className="flex gap-2 w-full">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 flex items-center justify-center font-mono text-xl tracking-widest text-white">
                  {code}
                </div>
                <button 
                  onClick={handleCopyCode}
                  className="bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded-xl px-4 flex items-center justify-center text-white"
                >
                  {copied ? 'Copied' : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <p className="text-fg-secondary text-sm text-center mb-6">Ask guests to scan this code or use the invite code above to view and upload photos.</p>
            <button className="btn-secondary w-full" onClick={() => setShowQR(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Fullscreen Slideshow */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg" onClick={() => setActivePhoto(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors" onClick={() => setActivePhoto(null)}>
            ✕ Close
          </button>
          
          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center p-6 relative" onClick={e => e.stopPropagation()}>
            <img 
              src={activePhoto.url} 
              alt="Memory Fullscreen" 
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl mb-8"
            />
            
            <div className="glass-card flex items-center justify-between w-full max-w-2xl px-6 py-4 absolute bottom-6">
              <p className="text-lg font-medium text-white/90">
                {activePhoto.ai_caption || 'A beautiful memory.'}
              </p>
              <div className="flex items-center gap-4">
                {activePhoto.audio_url && (
                  <button 
                    onClick={(e) => toggleAudio(e, activePhoto.id, activePhoto.audio_url)}
                    className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full hover:bg-white/20 transition-colors shrink-0 border border-white/20"
                  >
                    {playingAudioId === activePhoto.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span className="font-medium">{playingAudioId === activePhoto.id ? 'Playing...' : 'Voice Note'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* AI Memory Story Slideshow Modal */}
      <AnimatePresence>
        {isPlayingStory && photos.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 md:p-12"
          >
            <button 
              onClick={() => setIsPlayingStory(false)}
              className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors z-[110]"
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div 
              key={photos[storyIndex].id}
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center"
            >
              <img 
                src={photos[storyIndex].url} 
                alt="Memory Story"
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(255,255,255,0.1)]"
              />
              
              <div className="absolute bottom-0 text-center max-w-2xl px-6">
                 <p className="text-2xl md:text-3xl font-serif font-light text-white italic drop-shadow-2xl">
                    "{photos[storyIndex].ai_caption || 'A beautiful memory shared.'}"
                 </p>
                 <div className="mt-8 flex items-center justify-center gap-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-white/30">Memory {storyIndex + 1} of {photos.length}</span>
                 </div>
              </div>
            </motion.div>

            {/* Progress indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1 items-center">
               {photos.map((_, idx) => (
                 <div 
                   key={idx} 
                   className={`h-1 transition-all duration-1000 ${idx === storyIndex ? 'w-8 bg-white' : 'w-2 bg-white/10'}`} 
                 />
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Blur */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      
      {/* Copyright Footer */}
      <footer className="relative z-10 mt-20 py-8 border-t border-white/5 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-light">
          © 2026 DAPAZCM • ALL RIGHTS RESERVED
        </p>
      </footer>
    </div>
  );
}
