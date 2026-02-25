import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface MultiImageUploadProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export function MultiImageUpload({ label, images, onChange, max = 5 }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = max - images.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadend = () => onChange([...images, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
        {label} ({images.length}/{max})
      </Label>
      {images.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-2">
          {images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
              <img src={img} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-card shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {images.length < max && (
        <div
          className="upload-zone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <Upload className="w-5 h-5 text-muted-foreground mb-1.5" />
          <span className="text-xs text-muted-foreground">Drop or click (multi)</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}
