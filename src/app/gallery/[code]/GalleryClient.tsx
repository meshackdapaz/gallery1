'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Camera, Upload, Loader2, ArrowLeft, Maximize2, QrCode, Heart, Download, Copy, Archive, Mic, Play, Pause, X, MonitorPlay, Trash2, Flame, MessageSquare, Send } from 'lucide-react';
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

export default function GalleryClient({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
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
  
  // Interactive Features State
  const [candles, setCandles] = useState<any[]>([]);
  const [guestbook, setGuestbook] = useState<any[]>([]);
  const [lightingCandle, setLightingCandle] = useState(false);
  const [showGuestbook, setShowGuestbook] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [postingMessage, setPostingMessage] = useState(false);
  
  // Audio Memo & Upload Modal State
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
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
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery_candles' }, (payload: any) => {
             setCandles((prev) => [...prev, payload.new]);
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery_guestbook' }, (payload: any) => {
             setGuestbook((prev) => [payload.new, ...prev]);
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

  const handleUploadClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setAudioBlob(null);
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlobData = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlobData);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const confirmUpload = async () => {
    if (!pendingFile || !event) return;

    setUploading(true);
    try {
      const fileExt = pendingFile.name.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `events/${event.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memorial-photos')
        .upload(filePath, pendingFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('memorial-photos')
        .getPublicUrl(uploadData.path);
        
      let publicAudioUrl = null;
      
      // Upload Audio Blob if present
      if (audioBlob) {
        const audioFileName = `audio_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webm`;
        const audioFilePath = `events/${event.id}/audio/${audioFileName}`;
        
        const { error: audioUploadError } = await supabase.storage
          .from('memorial-photos')
          .upload(audioFilePath, audioBlob);
          
        if (!audioUploadError) {
           const { data: audioUrlData } = supabase.storage.from('memorial-photos').getPublicUrl(audioFilePath);
           publicAudioUrl = audioUrlData.publicUrl;
        }
      }

      // Generate AI Caption (TEMPORARILY DISABLED)
      let aiCaption = 'A beautiful memory uploaded to standard Supabase.';

      const { error: dbError } = await supabase
        .from('photos')
        .insert([{
          url: publicUrlData.publicUrl,
          event_id: event.id,
          aspect_ratio: 1,
          ai_caption: aiCaption,
          audio_url: publicAudioUrl
        }]);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo.');
    } finally {
      setUploading(false);
      setPendingFile(null);
      setPendingPreview(null);
      setAudioBlob(null);
    }
  };

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

  const handleLightCandle = async () => {
    if (!user) {
      alert('Please sign in to light a candle.');
      return;
    }
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
        message: newMessage.trim()
      }]);
      if (error) throw error;
      setNewMessage('');
    } catch (e) {
      alert('Failed to post tribute.');
    } finally {
      setPostingMessage(false);
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
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
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
          {isHost && photos.length > 0 && (
            <>
              <Link
                href={`/gallery/${code}/slideshow`}
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

          <label className="btn-secondary flex items-center gap-2 cursor-pointer whitespace-nowrap px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
            <Camera className="w-5 h-5" />
            <span className="hidden sm:inline">Quick Camera</span>
            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleUploadClick} disabled={uploading} />
          </label>
          <label className="btn-primary flex items-center gap-2 cursor-pointer whitespace-nowrap px-6 py-2.5 rounded-full font-medium">
            <Upload className="w-5 h-5" />
            <span>Upload Photo</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleUploadClick} disabled={uploading} />
          </label>
        </div>
      </header>
      
      {/* Sanctuary Section: Digital Candles */}
      <section className="relative z-10 max-w-6xl mx-auto mb-12">
        <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-serif font-medium mb-2 flex items-center justify-center md:justify-start gap-3">
              <Flame className="w-6 h-6 text-amber-400" /> Digital Candle Sanctuary
            </h2>
            <p className="text-white/40 max-w-md">Lighting a virtual candle is a small but powerful way to show your presence and support. Each flame represents a shared memory.</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-serif font-bold text-white">{candles.length}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/30">Candles Lit</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <button 
                onClick={handleLightCandle}
                disabled={lightingCandle}
                className={`group relative flex items-center justify-center p-6 rounded-full transition-all border ${
                  lightingCandle ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' : 'bg-white/5 border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10'
                }`}
              >
                <Flame className={`w-8 h-8 transition-all ${lightingCandle ? 'animate-bounce' : 'group-hover:scale-125'}`} />
                {lightingCandle && <Loader2 className="absolute inset-0 w-full h-full animate-spin opacity-20" />}
              </button>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Press to light a flame</span>
          </div>
        </div>
      </section>
      
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
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleReaction(photo.id); }}
                      className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-white/20 transition-all border border-white/5"
                    >
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500/50 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold font-mono">{getPhotoReactionsCount(photo.id)}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guestbook / Tribute Wall */}
        <section className="mt-24 pb-32">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-serif font-medium flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-white/60" /> Tribute Guestbook
              </h2>
              <p className="text-white/40 text-sm mt-1">Leave a message of love, a favorite quote, or a simple prayer.</p>
            </div>
            <button 
              onClick={() => setShowGuestbook(!showGuestbook)}
              className="text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
            >
              {showGuestbook ? 'Close' : 'Write a Tribute'}
            </button>
          </div>

          {showGuestbook && (
            <div className="glass-card p-6 mb-12 border border-white/20 bg-white/5">
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write your heart here..."
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/20 resize-none h-32 mb-4"
              />
              <div className="flex justify-end">
                <button 
                  onClick={handlePostTribute}
                  disabled={postingMessage || !newMessage.trim()}
                  className="btn-primary flex items-center gap-2 px-8 py-3 rounded-full"
                >
                  {postingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Post Tribute</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guestbook.map((tribute) => (
              <div key={tribute.id} className="glass-card p-6 border border-white/5 bg-white/[0.02]">
                <p className="text-white/80 italic mb-6 leading-relaxed">"{tribute.message}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40">— {tribute.author_name}</span>
                  <span className="text-[10px] text-white/20 font-mono">{new Date(tribute.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
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
                <button 
                  onClick={() => handleReaction(activePhoto.id)}
                  className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors shrink-0"
                >
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500/50" />
                  <span className="font-bold font-mono text-lg">{getPhotoReactionsCount(activePhoto.id)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Preview & Audio Memo Modal */}
      {pendingPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="glass-card p-6 flex flex-col items-center max-w-sm w-full relative">
            <button 
              onClick={() => { setPendingFile(null); setPendingPreview(null); setAudioBlob(null); }}
              className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Confirm Upload</h3>
            <img src={pendingPreview} alt="Preview" className="w-full h-64 object-cover rounded-xl mb-6 shadow-xl border border-white/10" />
            
            <div className="w-full mb-6">
              <label className="text-sm text-fg-secondary mb-2 block font-medium">Attach an Audio Memo (Optional)</label>
              <div className="flex items-center gap-3">
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                    isRecording 
                      ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-[0.98]' 
                      : audioBlob ? 'bg-white/20 text-white border border-white/30' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
                  {isRecording ? 'Recording...' : audioBlob ? 'Recorded!' : 'Hold to Record'}
                </button>
                {audioBlob && (
                  <button 
                    onClick={() => setAudioBlob(null)}
                    className="p-3 bg-white/10 rounded-xl hover:bg-white/20 text-white/50 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <button 
              onClick={confirmUpload}
              disabled={uploading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {uploading ? 'Uploading...' : 'Post to Gallery'}
            </button>
          </div>
        </div>
      )}

      {/* Decorative Blur */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}
