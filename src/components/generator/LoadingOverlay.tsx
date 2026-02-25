import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOADING_MESSAGES } from '@/types';

interface LoadingOverlayProps {
  progress?: number;
}

export function LoadingOverlay({ progress = 0 }: LoadingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-primary/95 backdrop-blur-md"
    >
      <div className="flex flex-col items-center max-w-lg px-8">
        {/* Spinner */}
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary-foreground/10" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary-foreground animate-spin" />
          <div className="absolute inset-3 rounded-full border-[2px] border-transparent border-b-primary-foreground/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>

        {/* Status */}
        <h3 className="text-lg font-display font-semibold text-primary-foreground mb-2">
          Generating Creatives
        </h3>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-primary-foreground/10 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-primary-foreground/60 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Rotating messages */}
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="loading-message"
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
