'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          undefined
        );
        setIsReady(true);
      } catch (err) {
        console.error('Failed to start scanner:', err);
        setError('Camera permission denied or not found');
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-6"
    >
      <div className="relative w-full max-w-md aspect-[3/4] glass-card border-white/10 overflow-hidden flex flex-col p-0">
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Scan Gallery QR</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Position code in frame</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative bg-black flex items-center justify-center">
          <div id="qr-reader" className="w-full h-full" />
          
          {/* Scanner Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[250px] h-[250px] relative">
              {/* Corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-xl shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-xl shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-xl shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-xl shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              
              {/* Scan Line Animation */}
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10"
              />
            </div>
          </div>

          {!isReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
              <RefreshCw className="w-8 h-8 animate-spin text-white mb-4" />
              <p className="text-white/60 text-xs font-mono uppercase tracking-[0.2em]">Initializing Camera...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-8 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                <X className="w-6 h-6 text-white/40" />
              </div>
              <h4 className="text-white font-serif text-lg mb-2">Access Required</h4>
              <p className="text-white/40 text-sm leading-relaxed mb-8">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-black border-t border-white/5 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-mono">
            Powered by Secure Vision Technology
          </p>
        </div>
      </div>
    </motion.div>
  );
}
