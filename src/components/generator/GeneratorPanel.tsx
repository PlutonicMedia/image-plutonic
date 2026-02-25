import { useState, useRef } from 'react';
import { Upload, X, Image, Sparkles, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Client, GenerationSettings, PREDEFINED_PROMPTS, ASPECT_RATIOS } from '@/types';

interface GeneratorPanelProps {
  selectedClient: Client | null;
  settings: GenerationSettings;
  onSettingsChange: (settings: GenerationSettings) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  productImage: string | null;
  onProductImageChange: (img: string | null) => void;
  modelImage: string | null;
  onModelImageChange: (img: string | null) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

function ImageUploadZone({
  label,
  image,
  onChange,
}: {
  label: string;
  image: string | null;
  onChange: (img: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  };

  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</Label>
      {image ? (
        <div className="upload-zone has-file relative">
          <img src={image} alt={label} className="w-full h-24 object-cover rounded-md" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-card shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          className="upload-zone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <Upload className="w-5 h-5 text-muted-foreground mb-1.5" />
          <span className="text-xs text-muted-foreground">Drop or click</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}
    </div>
  );
}

export function GeneratorPanel({
  selectedClient,
  settings,
  onSettingsChange,
  prompt,
  onPromptChange,
  productImage,
  onProductImageChange,
  modelImage,
  onModelImageChange,
  onGenerate,
  isGenerating,
}: GeneratorPanelProps) {
  const handlePromptSelect = (templateId: string) => {
    const template = PREDEFINED_PROMPTS.find((p) => p.id === templateId);
    if (template) onPromptChange(template.content);
  };

  return (
    <div className="generator-panel">
      <div className="p-5 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-base font-display font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Creative
          </h2>
          {selectedClient && (
            <p className="text-xs text-muted-foreground mt-1">
              Creating for <span className="font-medium text-foreground">{selectedClient.name}</span>
            </p>
          )}
        </div>

        {/* Image Uploads */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Image className="w-3.5 h-3.5" />
            Reference Images
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ImageUploadZone label="Product Image" image={productImage} onChange={onProductImageChange} />
            <ImageUploadZone label="Model Image" image={modelImage} onChange={onModelImageChange} />
          </div>
        </div>

        {/* Prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Predefined Prompts</Label>
          <Select onValueChange={handlePromptSelect}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Choose a template..." />
            </SelectTrigger>
            <SelectContent>
              {PREDEFINED_PROMPTS.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-sm">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe your creative vision..."
            className="min-h-[100px] text-sm resize-none"
          />
        </div>

        {/* Output Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Settings2 className="w-3.5 h-3.5" />
            Output Settings
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Aspect Ratio</Label>
              <div className="flex gap-1.5">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.value}
                    onClick={() => onSettingsChange({ ...settings, aspectRatio: ar.value })}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                      settings.aspectRatio === ar.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Quality</Label>
                <Select
                  value={settings.quality}
                  onValueChange={(v) => onSettingsChange({ ...settings, quality: v as '2k' | '4k' })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2k">2K</SelectItem>
                    <SelectItem value="4k">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Format</Label>
                <Select
                  value={settings.format}
                  onValueChange={(v) => onSettingsChange({ ...settings, format: v as 'png' | 'jpg' | 'webp' })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Number of Outputs</Label>
                <span className="text-xs font-medium text-foreground">{settings.numOutputs}</span>
              </div>
              <Slider
                value={[settings.numOutputs]}
                onValueChange={([v]) => onSettingsChange({ ...settings, numOutputs: v })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full h-11 font-display font-semibold text-sm shadow-soft"
          size="lg"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate {settings.numOutputs} Creative{settings.numOutputs > 1 ? 's' : ''}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
