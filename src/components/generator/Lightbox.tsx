import { X, Download, Sparkles, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneratedImage } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface LightboxProps {
  image: GeneratedImage;
  onClose: () => void;
  onCreateVariants: (image: GeneratedImage) => void;
  onDownload: (image: GeneratedImage) => void;
  onPreviewAd?: (image: GeneratedImage) => void;
}

export function Lightbox({ image, onClose, onCreateVariants, onDownload, onPreviewAd }: LightboxProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-5xl max-h-[90vh] w-full mx-6 bg-card rounded-xl shadow-elevated overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">{image.prompt}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {image.aspect_ratio} · {new Date(image.created_at).toLocaleString()}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-surface-sunken">
            <img src={image.url} alt={image.prompt} className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-card" />
          </div>

          <div className="flex items-center gap-2 p-4 border-t border-border">
            <Button onClick={() => onDownload(image)} variant="outline" size="sm" className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
            <Button onClick={() => onCreateVariants(image)} size="sm" className="text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Create More Variants
            </Button>
            {onPreviewAd && (
              <Button onClick={() => onPreviewAd(image)} variant="outline" size="sm" className="text-xs">
                <Monitor className="w-3.5 h-3.5 mr-1.5" />
                Preview Ad
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
