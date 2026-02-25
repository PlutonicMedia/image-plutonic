import { useState } from 'react';
import { Download, Check, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneratedImage } from '@/types';
import { cn } from '@/lib/utils';

interface GalleryGridProps {
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
  onDownloadSelected: (images: GeneratedImage[]) => void;
}

export function GalleryGrid({ images, onImageClick, onDownloadSelected }: GalleryGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map((i) => i.id)));
    }
  };

  const selectedImages = images.filter((i) => selectedIds.has(i.id));

  if (images.length === 0) {
    return (
      <div className="gallery-area flex items-center justify-center">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-display font-semibold mb-1.5">No creatives yet</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select a client, write a prompt, and hit Generate to create your first creative.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-area">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-display font-semibold">
            Generated Creatives
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {images.length} image{images.length !== 1 ? 's' : ''}
            {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll} className="text-xs h-8">
            {selectedIds.size === images.length ? 'Deselect All' : 'Select All'}
          </Button>
          {selectedIds.size > 0 && (
            <Button size="sm" onClick={() => onDownloadSelected(selectedImages)} className="text-xs h-8">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image, idx) => (
          <div
            key={image.id}
            className="image-card group cursor-pointer animate-fade-in"
            style={{ animationDelay: `${idx * 60}ms` }}
            onClick={() => onImageClick(image)}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Selection checkbox */}
            <button
              onClick={(e) => toggleSelect(e, image.id)}
              className={cn(
                'absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
                selectedIds.has(image.id)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-card/80 bg-card/50 backdrop-blur-sm opacity-0 group-hover:opacity-100'
              )}
            >
              {selectedIds.has(image.id) && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Aspect ratio badge */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-card/80 backdrop-blur-sm text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {image.aspect_ratio}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
