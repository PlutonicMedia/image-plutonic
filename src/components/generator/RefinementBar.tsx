import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { GeneratedImage } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface RefinementBarProps {
  image: GeneratedImage;
  onRefined: (newImage: GeneratedImage) => void;
}

export function RefinementBar({ image, onRefined }: RefinementBarProps) {
  const [instruction, setInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const { toast } = useToast();

  const handleRefine = async () => {
    if (!instruction.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-image', {
        body: { imageUrl: image.url, instruction: instruction.trim() },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        const refined: GeneratedImage = {
          id: `ref-${Date.now()}`,
          url: data.imageUrl,
          prompt: `Refined: ${instruction.trim()}`,
          client_id: image.client_id,
          created_at: new Date().toISOString(),
          aspect_ratio: image.aspect_ratio,
          style_tag: image.style_tag ? `${image.style_tag} (refined)` : 'Refined',
        };
        onRefined(refined);
        setInstruction('');
        toast({ title: 'Refinement complete' });
      }
    } catch (err: any) {
      toast({ title: 'Refinement failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex gap-1.5 mt-2">
      <Input
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
        placeholder="e.g. Make light warmer..."
        className="h-7 text-[11px]"
        disabled={isRefining}
      />
      <button
        onClick={handleRefine}
        disabled={!instruction.trim() || isRefining}
        className="shrink-0 w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
      >
        {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
      </button>
    </div>
  );
}
