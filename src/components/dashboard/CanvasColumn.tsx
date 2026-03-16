import { useState } from 'react';
import { Download, Check, ImageIcon, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneratedImage } from '@/types';
import { RefinementBar } from '@/components/generator/RefinementBar';
import { cn } from '@/lib/utils';

interface CanvasColumnProps {
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
  onDownloadSelected: (images: GeneratedImage[]) => void;
  onRefinedImage?: (newImage: GeneratedImage) => void;
  isGrid?: boolean;
}

export function CanvasColumn({ images, onImageClick, onDownloadSelected, onRefinedImage, isGrid }: CanvasColumnProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === images.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(images.map((i) => i.id)));
  };

  const selectedImages = images.filter((i) => selectedIds.has(i.id));

  if (images.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-sunken">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-display font-semibold mb-1.5">The Canvas</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Configure your inputs, select presets, and hit Generate to see your creatives here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-surface-sunken scrollbar-thin">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-display font-semibold flex items-center gap-2">
            {isGrid && <Grid3X3 className="w-4 h-4" />}
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
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {images.map((image, idx) => (
          <div key={image.id} className="animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="image-card group cursor-pointer" onClick={() => onImageClick(image)}>
              <div className="aspect-square overflow-hidden">
                <img src={image.url} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
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
              {image.style_tag && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-primary/80 text-primary-foreground text-[10px] font-medium backdrop-blur-sm">
                  {image.style_tag}
                </div>
              )}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-card/80 backdrop-blur-sm text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {image.aspect_ratio}
              </div>
            </div>
            {onRefinedImage && <RefinementBar image={image} onRefined={onRefinedImage} />}
          </div>
        ))}
      </div>
    </div>
  );
}
