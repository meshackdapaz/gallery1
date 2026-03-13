'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SlideshowClient({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEventAndPhotos() {
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('invite_code', code)
          .single();

        if (eventError || !eventData) {
          return;
        }

        setEvent(eventData);

        const { data: photoData, error: photoError } = await supabase
          .from('photos')
          .select('*')
          .eq('event_id', eventData.id)
          .order('created_at', { ascending: false });

        if (photoError) throw photoError;
        setPhotos(photoData || []);

        // Realtime Setup
        const channel = supabase.channel(`slideshow_${eventData.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload: any) => {
             setPhotos((prev) => {
               if (prev.find(p => p.id === payload.new.id)) return prev;
               return [payload.new, ...prev]; // Newest first
             });
             // Reset to show the newest photo immediately
             setCurrentIndex(0);
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
  }, [code]);

  // Handle Slideshow Interval
  useEffect(() => {
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 6000); // 6 seconds per slide

    return () => clearInterval(interval);
  }, [photos.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-white/50 animate-spin" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">{event?.name}</h1>
        <p className="text-fg-secondary text-xl">Waiting for guests to upload photos...</p>
        <div className="mt-8 text-2xl font-mono bg-white/10 px-6 py-3 rounded-lg uppercase tracking-widest">{code}</div>
        
        <Link 
          href={`/gallery/${code}`}
          className="absolute top-6 left-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Exit Slideshow
        </Link>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Background blur for ambient glow */}
      <div 
        className="absolute inset-0 opacity-30 blur-[100px] scale-110 transition-all duration-[6000ms] ease-in-out"
        style={{
          backgroundImage: `url(${currentPhoto?.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Main Image with Crossfade */}
      <div className="w-full h-full p-8 flex items-center justify-center relative z-10">
        {photos.map((photo, index) => (
          <img
            key={photo.id}
            src={photo.url}
            alt="Slideshow"
            className={`absolute max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Caption overlay */}
      {currentPhoto?.ai_caption && (
        <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md px-8 py-4 rounded-full max-w-2xl border border-white/5 transition-opacity duration-500">
            <p className="text-white/90 text-2xl font-medium tracking-wide">
              {currentPhoto.ai_caption}
            </p>
          </div>
        </div>
      )}

      {/* Hidden UI - Shown on hover */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start opacity-0 hover:opacity-100 transition-opacity duration-300 z-50">
        <Link 
          href={`/gallery/${code}`}
          className="flex items-center gap-2 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-full hover:bg-white/20 transition-colors border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </Link>

        <div className="text-right">
          <h2 className="text-white text-xl font-bold drop-shadow-md">{event?.name}</h2>
          <p className="text-white/80 font-mono tracking-widest text-sm drop-shadow-md">CODE: {code}</p>
        </div>
      </div>
    </div>
  );
}
