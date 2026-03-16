import { Sparkles, Camera, Settings2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AdCopyDisplay } from './AdCopyDisplay';
import {
  GenerationSettings, ASPECT_RATIOS,
  StyleCategory, STYLE_CATEGORIES, STYLE_SUB_OPTIONS,
  CAMERA_LENSES, CameraLens, CAMERA_ANGLES, CameraAngle,
  PredefinedJsonPrompt, PREDEFINED_JSON_PROMPTS, AdCopy,
} from '@/types';

interface ControlColumnProps {
  settings: GenerationSettings;
  onSettingsChange: (s: GenerationSettings) => void;
  selectedStyle: StyleCategory | null;
  onStyleChange: (s: StyleCategory | null) => void;
  styleSubOptions: Record<string, string>;
  onStyleSubOptionsChange: (o: Record<string, string>) => void;
  selectedJsonPrompt: PredefinedJsonPrompt | null;
  onJsonPromptChange: (jp: PredefinedJsonPrompt | null) => void;
  promptMode: 'predefined' | 'manual';
  onPromptModeChange: (m: 'predefined' | 'manual') => void;
  prompt: string;
  onPromptChange: (p: string) => void;
  influencePrompt: string;
  onInfluencePromptChange: (p: string) => void;
  isGrid: boolean;
  onGridChange: (g: boolean) => void;
  adCopy: AdCopy | null;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function ControlColumn({
  settings, onSettingsChange,
  selectedStyle, onStyleChange, styleSubOptions, onStyleSubOptionsChange,
  selectedJsonPrompt, onJsonPromptChange,
  promptMode, onPromptModeChange,
  prompt, onPromptChange,
  influencePrompt, onInfluencePromptChange,
  isGrid, onGridChange,
  adCopy, onGenerate, isGenerating,
}: ControlColumnProps) {
  const currentSubs = selectedStyle ? STYLE_SUB_OPTIONS[selectedStyle] : null;
  const canGenerate = promptMode === 'predefined' ? !!selectedJsonPrompt : !!prompt.trim();

  return (
    <div className="w-[340px] shrink-0 border-l border-border bg-card overflow-y-auto scrollbar-thin">
      <div className="p-5 space-y-5">
        <h2 className="text-base font-display font-semibold flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          Control Panel
        </h2>

        {/* Style Preset */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Style Preset</Label>
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
          <div className="flex items-center gap-1.5 pt-1">
            <Badge variant="outline" className="text-[9px] gap-1 px-1.5 py-0 h-5 border-dashed">
              <Lock className="w-2.5 h-2.5" /> Save as Brand Preset — Coming Soon
            </Badge>
          </div>
        </div>

        {/* Camera */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Camera className="w-3.5 h-3.5" /> Camera
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Lens</Label>
              <Select value={settings.cameraLens || 'none'} onValueChange={(v) => onSettingsChange({ ...settings, cameraLens: v === 'none' ? '' : v as CameraLens })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">Auto</SelectItem>
                  {CAMERA_LENSES.map((l) => (
                    <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Angle</Label>
              <Select value={settings.cameraAngle || 'none'} onValueChange={(v) => onSettingsChange({ ...settings, cameraAngle: v === 'none' ? '' : v as CameraAngle })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">Auto</SelectItem>
                  {CAMERA_ANGLES.map((a) => (
                    <SelectItem key={a.value} value={a.value} className="text-xs">{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Prompt Mode */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Prompt</Label>
          <div className="flex gap-1.5">
            <button onClick={() => onPromptModeChange('predefined')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${promptMode === 'predefined' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              Predefined
            </button>
            <button onClick={() => onPromptModeChange('manual')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${promptMode === 'manual' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              Manual
            </button>
          </div>

          {promptMode === 'predefined' ? (
            <div className="space-y-2">
              <Select value={selectedJsonPrompt?.id || ''} onValueChange={(v) => onJsonPromptChange(PREDEFINED_JSON_PROMPTS.find((p) => p.id === v) || null)}>
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
                  <p className="leading-relaxed line-clamp-3">{selectedJsonPrompt.scene.environment}</p>
                  <p className="text-[10px] text-muted-foreground/60 italic">Auto-adapts based on uploaded images</p>
                </div>
              )}
            </div>
          ) : (
            <Textarea value={prompt} onChange={(e) => onPromptChange(e.target.value)} placeholder="Describe your creative vision..." className="min-h-[80px] text-sm resize-none" />
          )}
        </div>

        {/* Influence Prompt (always visible) */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Influence Prompt</Label>
          <Textarea
            value={influencePrompt}
            onChange={(e) => onInfluencePromptChange(e.target.value)}
            placeholder="e.g. Make the background more blue, add warm lighting..."
            className="min-h-[60px] text-sm resize-none"
          />
          <p className="text-[10px] text-muted-foreground/60 italic">This is always merged with the main prompt</p>
        </div>

        {/* Output Settings */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">Output Settings</Label>
          <div>
            <Label className="text-[10px] text-muted-foreground mb-1.5 block">Aspect Ratio</Label>
            <div className="flex gap-1.5">
              {ASPECT_RATIOS.map((ar) => (
                <button key={ar.value} onClick={() => onSettingsChange({ ...settings, aspectRatio: ar.value })}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${settings.aspectRatio === ar.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                  {ar.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Quality</Label>
              <Select value={settings.quality} onValueChange={(v) => onSettingsChange({ ...settings, quality: v as '2k' | '4k' })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="2k">2K</SelectItem><SelectItem value="4k">4K</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Format</Label>
              <Select value={settings.format} onValueChange={(v) => onSettingsChange({ ...settings, format: v as 'png' | 'jpg' | 'webp' })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="png">PNG</SelectItem><SelectItem value="jpg">JPG</SelectItem><SelectItem value="webp">WebP</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-[10px] text-muted-foreground">Outputs</Label>
              <span className="text-xs font-medium">{settings.numOutputs}</span>
            </div>
            <Slider value={[settings.numOutputs]} onValueChange={([v]) => onSettingsChange({ ...settings, numOutputs: v })} min={1} max={10} step={1} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">4×4 Grid Output</Label>
            <Switch checked={isGrid} onCheckedChange={onGridChange} />
          </div>
        </div>

        {/* Ad Copy */}
        <AdCopyDisplay adCopy={adCopy} />

        {/* Generate */}
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
