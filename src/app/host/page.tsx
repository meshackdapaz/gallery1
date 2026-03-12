'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Plus, Loader2, Copy, Download, CheckCircle2, Upload, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function HostPage() {
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('memorial');
  const [isDisposable, setIsDisposable] = useState(false);
  const [revealTime, setRevealTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [createdEventCode, setCreatedEventCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const qrRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setAuthLoading(false);
    }
    loadUser();
  }, [supabase.auth]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setLoading(true);
    try {
      let coverPhotoUrl = null;

      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('memorial-photos')
          .upload(filePath, coverFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('memorial-photos')
          .getPublicUrl(filePath);
          
        coverPhotoUrl = publicUrl;
      }

      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const eventDataToInsert: any = {
          name, 
          invite_code: inviteCode, 
          host_id: user.id,
          cover_photo_url: coverPhotoUrl,
          event_type: eventType,
          is_disposable_mode: isDisposable
      };

      if (isDisposable && revealTime) {
          eventDataToInsert.reveal_time = new Date(revealTime).toISOString();
      }

      const { data, error } = await supabase
        .from('events')
        .insert([eventDataToInsert])
        .select()
        .single();

      if (error) throw error;
      
      setCreatedEventCode(inviteCode);
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(`Failed to create event. Error: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!createdEventCode) return;
    await navigator.clipboard.writeText(createdEventCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrRef.current || !createdEventCode) return;
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
      downloadLink.download = `Gallery_QR_${createdEventCode}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <p className="mb-4">You must be logged in to host an event.</p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
     );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <Link href="/" className="absolute -top-16 left-0 text-fg-secondary hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="glass-card mb-8">
          {createdEventCode ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Gallery Created!</h1>
              <p className="text-fg-secondary mb-8">Share this code or QR with your guests.</p>

              <div className="bg-white p-4 rounded-xl mb-6 shadow-xl">
                <QRCodeSVG 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/${createdEventCode}`} 
                  size={200}
                  ref={qrRef}
                />
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={handleDownloadQR}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download QR Code
                </button>
                
                <div className="flex gap-2 w-full">
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 flex items-center justify-center font-mono text-xl tracking-widest text-white">
                    {createdEventCode}
                  </div>
                  <button 
                    onClick={handleCopyCode}
                    className="bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded-xl px-6 flex items-center justify-center text-white"
                  >
                    {copied ? 'Copied!' : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <Link href={`/gallery/${createdEventCode}`} className="btn-primary w-full mt-4 flex justify-center !py-4">
                  Enter Gallery
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Host an Event</h1>
              <p className="text-fg-secondary mb-8">Give your memorial gallery a name to get started.</p>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-sm font-medium text-fg-secondary ml-1">Event Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grandma's 80th Birthday"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="text-left space-y-2 mt-4">
                  <label className="text-sm font-medium text-fg-secondary ml-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    <option value="memorial">Memorial / Funeral</option>
                    <option value="wedding">Wedding / Engagement</option>
                    <option value="birthday">Birthday Celebration</option>
                    <option value="party">General Party / Other</option>
                  </select>
                </div>

                <div className="text-left space-y-2 mt-4">
                  <label className="text-sm font-medium text-fg-secondary ml-1">Cover Photo (Optional)</label>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCoverFile(file);
                        setCoverPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  
                  {coverPreview ? (
                    <div className="relative group w-full h-40 rounded-xl overflow-hidden border border-white/10">
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button 
                          type="button"
                          onClick={() => {
                            setCoverFile(null);
                            setCoverPreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="bg-rose-500/80 text-white p-3 rounded-full hover:bg-rose-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all outline-none focus:ring-2 focus:ring-white/20"
                      disabled={loading}
                    >
                      <ImageIcon className="w-8 h-8 mb-3" />
                      <span className="text-sm font-medium">Click to upload cover photo</span>
                    </button>
                  )}
                </div>

                <div className="text-left space-y-4 mt-6 p-4 rounded-xl border border-white/10 bg-white/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDisposable}
                      onChange={(e) => setIsDisposable(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-black/50 text-white focus:ring-white/20 focus:ring-offset-0 transition-all cursor-pointer"
                      disabled={loading}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Disposable Camera Mode</span>
                      <span className="text-xs text-fg-secondary">Guests can upload photos, but cannot see the gallery until reveal time.</span>
                    </div>
                  </label>

                  {isDisposable && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <label className="text-sm font-medium text-fg-secondary ml-1">Reveal Date & Time</label>
                      <input
                        type="datetime-local"
                        value={revealTime}
                        onChange={(e) => setRevealTime(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
                        disabled={loading}
                        required={isDisposable}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Create Event
                </button>
              </form>
            </>
          )}
        </div>

        {!createdEventCode && (
          <p className="text-fg-secondary text-sm">
            A unique invite code will be generated for your guests.
          </p>
        )}
      </div>
    </div>
  );
}
