import { useState, useEffect } from 'react';
import { Archive, Download, Check, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { GeneratedImage, Client } from '@/types';
import { Lightbox } from './Lightbox';
import { RefinementBar } from './RefinementBar';
import { cn } from '@/lib/utils';

interface ClientArchiveProps {
  client: Client;
  onClose: () => void;
  onDownloadSelected: (images: GeneratedImage[]) => void;
}

export function ClientArchive({ client, onClose, onDownloadSelected }: ClientArchiveProps) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    loadArchive();
  }, [client.id]);

  const loadArchive = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('generated_images')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (data) {
      setImages(
        data.map((d) => ({
          id: d.id,
          url: d.image_url,
          prompt: d.prompt,
          client_id: d.client_id ?? undefined,
          created_at: d.created_at,
          aspect_ratio: d.aspect_ratio,
        }))
      );
    }
    setLoading(false);
  };

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
    if (selectedIds.size === images.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(images.map((i) => i.id)));
  };

  const selectedImages = images.filter((i) => selectedIds.has(i.id));

  const handleDownload = async (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${client.name.replace(/\s+/g, '-')}-archive-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefinedImage = (newImage: GeneratedImage) => {
    setImages((prev) => [newImage, ...prev].slice(0, 30));
  };

  if (loading) {
    return (
      <div className="gallery-area flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="gallery-area">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-display font-semibold flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archive — {client.name}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Showing last 30 generations for this client.
            {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-8">
            Back to Gallery
          </Button>
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

      {images.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-display font-semibold mb-1.5">No archived images</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generate some creatives for this client to see them archived here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image, idx) => (
            <div key={image.id} className="animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
              <div
                className="image-card group cursor-pointer"
                onClick={() => setLightboxImage(image)}
              >
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
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-card/80 backdrop-blur-sm text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.aspect_ratio}
                </div>
              </div>
              <RefinementBar image={image} onRefined={handleRefinedImage} />
            </div>
          ))}
        </div>
      )}

      {lightboxImage && (
        <Lightbox
          image={lightboxImage}
          allImages={images}
          onClose={() => setLightboxImage(null)}
          onNavigate={setLightboxImage}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
