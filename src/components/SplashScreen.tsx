'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const WORDS = [
  "PRECIOUS",
  "MOMENTS",
  "LASTING",
  "MEMORIES",
  "SANCTUARY"
];

export default function SplashScreen() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (index < WORDS.length - 1) {
      const timer = setTimeout(() => {
        setIndex(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      const finalTimer = setTimeout(() => {
        setShow(false);
      }, 1200);
      return () => clearTimeout(finalTimer);
    }
  }, [index]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.1, 
            filter: 'blur(20px)',
            transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } 
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white overflow-hidden"
        >
          {/* Ambient animated glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Minimalist Logo Mark */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-12 flex flex-col items-center"
            >
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center mb-4">
                <span className="font-serif italic text-xl">V</span>
              </div>
            </motion.div>

            {/* Word Animation */}
            <div className="h-12 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[index]}
                  initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -40, opacity: 0, filter: 'blur(10px)' }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  className="text-3xl md:text-4xl font-light tracking-[0.4em] font-serif uppercase text-center block"
                >
                  {WORDS[index]}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Progress line */}
            <div className="mt-16 w-32 h-[1px] bg-white/10 relative overflow-hidden">
               <motion.div 
                 initial={{ x: '-100%' }}
                 animate={{ x: '100%' }}
                 transition={{ duration: 3, ease: "linear" }}
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
               />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
