import { useState } from 'react';
import { Upload, X, Image, Sparkles, Settings2, Camera, FileJson, PenLine, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MultiImageUpload } from './MultiImageUpload';
import {
  Client, GenerationSettings, ASPECT_RATIOS,
  StyleCategory, STYLE_CATEGORIES, STYLE_SUB_OPTIONS, CAMERA_LENSES, CameraLens,
  PredefinedJsonPrompt, PREDEFINED_JSON_PROMPTS,
} from '@/types';

interface GeneratorPanelProps {
  selectedClient: Client | null;
  settings: GenerationSettings;
  onSettingsChange: (settings: GenerationSettings) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  productImages: string[];
  onProductImagesChange: (imgs: string[]) => void;
  modelImages: string[];
  onModelImagesChange: (imgs: string[]) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  selectedStyle: StyleCategory | null;
  onStyleChange: (style: StyleCategory | null) => void;
  styleSubOptions: Record<string, string>;
  onStyleSubOptionsChange: (opts: Record<string, string>) => void;
  selectedJsonPrompt: PredefinedJsonPrompt | null;
  onJsonPromptChange: (jp: PredefinedJsonPrompt | null) => void;
  promptMode: 'predefined' | 'manual';
  onPromptModeChange: (mode: 'predefined' | 'manual') => void;
}

export function GeneratorPanel({
  selectedClient, settings, onSettingsChange,
  prompt, onPromptChange,
  productImages, onProductImagesChange,
  modelImages, onModelImagesChange,
  onGenerate, isGenerating,
  selectedStyle, onStyleChange,
  styleSubOptions, onStyleSubOptionsChange,
  selectedJsonPrompt, onJsonPromptChange,
  promptMode, onPromptModeChange,
}: GeneratorPanelProps) {
  const currentSubs = selectedStyle ? STYLE_SUB_OPTIONS[selectedStyle] : null;
  const canGenerate = promptMode === 'predefined' ? !!selectedJsonPrompt : !!prompt.trim();

  return (
    <div className="generator-panel scrollbar-thin">
      <div className="p-5 space-y-5">
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

        {/* Image Uploads — Multi */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Image className="w-3.5 h-3.5" />
            Reference Images
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MultiImageUpload label="Product Images" images={productImages} onChange={onProductImagesChange} max={5} />
            <MultiImageUpload label="Model Images" images={modelImages} onChange={onModelImagesChange} max={5} />
          </div>
          {(productImages.length > 0 || modelImages.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {productImages.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{productImages.length} product{productImages.length !== 1 ? 's' : ''}</span>}
              {modelImages.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{modelImages.length} model{modelImages.length !== 1 ? 's' : ''}</span>}
            </div>
          )}
        </div>

        {/* Style Category */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Style Category</Label>
          <Select value={selectedStyle || ''} onValueChange={(v) => { onStyleChange(v as StyleCategory); onStyleSubOptionsChange({}); }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choose a style..." /></SelectTrigger>
            <SelectContent>
              {STYLE_CATEGORIES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-sm">{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentSubs && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {currentSubs.dropdowns.map((dd) => (
                <div key={dd.key}>
                  <Label className="text-[10px] text-muted-foreground mb-1 block">{dd.label}</Label>
                  <Select value={styleSubOptions[dd.key] || ''} onValueChange={(v) => onStyleSubOptionsChange({ ...styleSubOptions, [dd.key]: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {dd.options.map((o) => (
                        <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Virtual Lens Library */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Camera className="w-3.5 h-3.5" />
            Camera Settings
          </div>
          <Select value={settings.cameraLens} onValueChange={(v) => onSettingsChange({ ...settings, cameraLens: v as CameraLens | '' })}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="No lens preference" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-sm">No lens preference</SelectItem>
              {CAMERA_LENSES.map((l) => (
                <SelectItem key={l.value} value={l.value} className="text-sm">{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prompt Mode Toggle */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Prompt Mode</Label>
          <div className="flex gap-1.5">
            <button
              onClick={() => onPromptModeChange('predefined')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                promptMode === 'predefined' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" /> Predefined
            </button>
            <button
              onClick={() => onPromptModeChange('manual')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                promptMode === 'manual' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" /> Manual
            </button>
          </div>

          {promptMode === 'predefined' ? (
            <div className="space-y-2">
              <Select value={selectedJsonPrompt?.id || ''} onValueChange={(v) => { const jp = PREDEFINED_JSON_PROMPTS.find((p) => p.id === v) || null; onJsonPromptChange(jp); }}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choose a predefined prompt..." /></SelectTrigger>
                <SelectContent>
                  {PREDEFINED_JSON_PROMPTS.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-sm">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedJsonPrompt && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground space-y-1.5">
                  <p className="font-medium text-foreground text-[11px]">{selectedJsonPrompt.name}</p>
                  <p className="leading-relaxed line-clamp-4">{selectedJsonPrompt.scene.environment}</p>
                  <p className="text-[10px] text-muted-foreground/60 italic">Auto-adapts based on uploaded images</p>
                </div>
              )}
            </div>
          ) : (
            <Textarea value={prompt} onChange={(e) => onPromptChange(e.target.value)} placeholder="Describe your creative vision..." className="min-h-[90px] text-sm resize-none" />
          )}
        </div>

        {/* Output Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Settings2 className="w-3.5 h-3.5" /> Output Settings
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Aspect Ratio</Label>
            <div className="flex gap-1.5">
              {ASPECT_RATIOS.map((ar) => (
                <button key={ar.value} onClick={() => onSettingsChange({ ...settings, aspectRatio: ar.value })}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${settings.aspectRatio === ar.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                >{ar.label}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Quality</Label>
              <Select value={settings.quality} onValueChange={(v) => onSettingsChange({ ...settings, quality: v as '2k' | '4k' })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="2k">2K</SelectItem><SelectItem value="4k">4K</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Format</Label>
              <Select value={settings.format} onValueChange={(v) => onSettingsChange({ ...settings, format: v as 'png' | 'jpg' | 'webp' })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="png">PNG</SelectItem><SelectItem value="jpg">JPG</SelectItem><SelectItem value="webp">WebP</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <Label className="text-xs text-muted-foreground">Number of Outputs</Label>
              <span className="text-xs font-medium text-foreground">{settings.numOutputs}</span>
            </div>
            <Slider value={[settings.numOutputs]} onValueChange={([v]) => onSettingsChange({ ...settings, numOutputs: v })} min={1} max={10} step={1} className="w-full" />
          </div>
        </div>

        {/* Generate Button */}
        <Button onClick={onGenerate} disabled={!canGenerate || isGenerating} className="w-full h-11 font-display font-semibold text-sm shadow-soft" size="lg">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating…' : `Generate ${settings.numOutputs} Creative${settings.numOutputs > 1 ? 's' : ''}`}
          </span>
        </Button>
      </div>
    </div>
  );
}
