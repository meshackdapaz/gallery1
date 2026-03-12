'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden"
        >
          {/* Subtle animated background glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.5, scale: 1.2 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] pointer-events-none"
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-16 h-16 border border-white/20 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
               <motion.div 
                 initial={{ height: 0 }}
                 animate={{ height: '100%' }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
                 className="absolute bottom-0 w-full bg-white/20"
               />
               <span className="font-serif italic text-2xl font-light">M</span>
            </div>
            
            <motion.h1 
              className="text-3xl font-light tracking-[0.3em] font-serif uppercase"
              initial={{ filter: 'blur(10px)', opacity: 0 }}
              animate={{ filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Memorial
            </motion.h1>
            <motion.p 
              className="mt-4 text-fg-secondary text-sm tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              A Sanctuary of Memories
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
