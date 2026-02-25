import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2 } from 'lucide-react';
import { LOADING_MESSAGES } from '@/types';

interface LoadingOverlayProps {
  progress?: number;
  onDismiss?: () => void;
}

export function LoadingOverlay({ progress = 0, onDismiss }: LoadingOverlayProps) {
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
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground text-sm font-medium transition-colors"
      >
        <Minimize2 className="w-4 h-4" />
        Work in background
      </button>

      <div className="flex flex-col items-center max-w-lg px-8">
        <div className="w-40 h-40 mb-6 rounded-2xl overflow-hidden shadow-lg">
          <img src="/loading.gif" alt="Loading" className="w-full h-full object-cover" />
        </div>

        <h3 className="text-lg font-display font-semibold text-primary-foreground mb-2">
          Generating Creatives
        </h3>

        <div className="w-64 h-1.5 bg-primary-foreground/10 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-primary-foreground/60 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-xs text-primary-foreground/50 mb-6">
          You can dismiss this and keep working — generation continues in the background.
        </p>

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
