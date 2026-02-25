import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedImage } from '@/types';
import { useState } from 'react';

interface AdPlacementPreviewerProps {
  image: GeneratedImage;
  onClose: () => void;
}

type MockupType = 'meta' | 'tiktok' | 'email';

const MOCKUPS: { value: MockupType; label: string; aspect: string }[] = [
  { value: 'meta', label: 'Meta Feed', aspect: '1:1' },
  { value: 'tiktok', label: 'TikTok Story', aspect: '9:16' },
  { value: 'email', label: 'iPhone Mail', aspect: '16:9' },
];

export function AdPlacementPreviewer({ image, onClose }: AdPlacementPreviewerProps) {
  const [active, setActive] = useState<MockupType>('meta');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative max-w-4xl w-full mx-6 bg-card rounded-xl shadow-elevated overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-display font-semibold">Ad Placement Preview</h3>
            <div className="flex items-center gap-2">
              {MOCKUPS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setActive(m.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    active === m.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {m.label}
                </button>
              ))}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mockup area */}
          <div className="p-8 flex justify-center bg-surface-sunken min-h-[500px]">
            {active === 'meta' && <MetaFeedMockup imageUrl={image.url} />}
            {active === 'tiktok' && <TikTokStoryMockup imageUrl={image.url} />}
            {active === 'email' && <EmailMockup imageUrl={image.url} />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetaFeedMockup({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="w-[380px] bg-white rounded-xl shadow-lg overflow-hidden text-black">
      {/* Header */}
      <div className="p-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-300" />
        <div>
          <div className="text-xs font-semibold">Brand Name</div>
          <div className="text-[10px] text-gray-500">Sponsored · 🌐</div>
        </div>
      </div>
      {/* Image */}
      <div className="relative aspect-square">
        <img src={imageUrl} alt="Ad preview" className="w-full h-full object-cover" />
        {/* Safe zone overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-10 bg-black/10 flex items-center justify-center">
            <span className="text-[9px] text-white/60 font-medium">Header safe zone</span>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="px-3 py-2 flex items-center gap-4 text-gray-600">
        <span className="text-xs">👍 Like</span>
        <span className="text-xs">💬 Comment</span>
        <span className="text-xs">↗ Share</span>
      </div>
    </div>
  );
}

function TikTokStoryMockup({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="w-[260px] bg-black rounded-2xl shadow-lg overflow-hidden relative" style={{ aspectRatio: '9/16' }}>
      <img src={imageUrl} alt="TikTok preview" className="w-full h-full object-cover" />
      {/* Safe zone overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-black/20 flex items-end px-3 pb-1">
          <span className="text-[9px] text-white/50">Top safe zone (status bar)</span>
        </div>
        {/* Bottom engagement zone */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/50 to-transparent flex items-end px-3 pb-3">
          <span className="text-[9px] text-white/50">Bottom safe zone (caption + buttons)</span>
        </div>
        {/* Right sidebar icons */}
        <div className="absolute right-2 bottom-32 flex flex-col items-center gap-3">
          {['❤️', '💬', '↗', '🔖'].map((icon, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">{icon}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmailMockup({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="w-[380px] bg-white rounded-xl shadow-lg overflow-hidden text-black">
      {/* Mail header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="text-[10px] text-gray-500">From: brand@company.com</div>
        <div className="text-xs font-semibold mt-0.5">Your Exclusive Offer Inside</div>
        <div className="text-[10px] text-gray-400 mt-0.5">To: customer@email.com</div>
      </div>
      {/* Email body */}
      <div className="p-4">
        <div className="relative rounded-lg overflow-hidden">
          <img src={imageUrl} alt="Email banner" className="w-full aspect-video object-cover" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/10 flex items-center justify-center">
              <span className="text-[9px] text-white/60">CTA safe zone</span>
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-2 bg-gray-200 rounded-full w-full" />
          <div className="h-2 bg-gray-200 rounded-full w-3/4" />
          <div className="h-2 bg-gray-200 rounded-full w-1/2" />
        </div>
      </div>
    </div>
  );
}
