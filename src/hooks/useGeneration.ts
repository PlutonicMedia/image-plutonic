import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GenerationTask, GeneratedImage, GenerationSettings, StyleCategory, PredefinedJsonPrompt } from '@/types';
import { compilePrompt, getStyleTag } from '@/lib/promptCompiler';
import { useToast } from '@/hooks/use-toast';

export interface GenerateInput {
  prompt: string;
  settings: GenerationSettings;
  style: StyleCategory | null;
  styleSubOptions: Record<string, string>;
  productImages: string[];
  modelImages: string[];
  clientId?: string;
  jsonPrompt?: PredefinedJsonPrompt | null;
  onComplete?: (results: GeneratedImage[]) => void;
}

export function useGeneration() {
  const [task, setTask] = useState<GenerationTask | null>(null);
  const [allResults, setAllResults] = useState<GeneratedImage[]>([]);
  const { toast } = useToast();

  const generate = useCallback(async (input: GenerateInput) => {
    const taskId = `gen-${Date.now()}`;

    const compiledPrompt = compilePrompt({
      style: input.style,
      subOptions: input.styleSubOptions,
      customPrompt: input.prompt,
      hasProductImage: input.productImages.length > 0,
      hasModelImage: input.modelImages.length > 0,
      aspectRatio: input.settings.aspectRatio,
      cameraLens: input.settings.cameraLens,
      jsonPrompt: input.jsonPrompt || null,
    });

    const styleTag = getStyleTag(input.style, input.styleSubOptions);
    const contentParts: any[] = [{ type: 'text', text: compiledPrompt }];
    for (const img of input.productImages) {
      contentParts.push({ type: 'image_url', image_url: { url: img } });
    }
    for (const img of input.modelImages) {
      contentParts.push({ type: 'image_url', image_url: { url: img } });
    }
    const messages = [{ role: 'user', content: contentParts }];

    const newTask: GenerationTask = {
      id: taskId,
      status: 'running',
      prompt: compiledPrompt,
      settings: input.settings,
      style: input.style,
      styleSubOptions: input.styleSubOptions,
      productImages: input.productImages,
      modelImages: input.modelImages,
      clientId: input.clientId,
      results: [],
      progress: 0,
      jsonPrompt: input.jsonPrompt,
    };

    setTask(newTask);

    const results: GeneratedImage[] = [];

    try {
      const promises = Array.from({ length: input.settings.numOutputs }, (_, i) =>
        supabase.functions.invoke('generate-creative', {
          body: { messages, aspectRatio: input.settings.aspectRatio },
        }).then(({ data, error }) => {
          if (error) throw error;
          if (data?.imageUrl) {
            const img: GeneratedImage = {
              id: `gen-${Date.now()}-${taskId}-${i}`,
              url: data.imageUrl,
              prompt: compiledPrompt,
              client_id: input.clientId,
              created_at: new Date().toISOString(),
              aspect_ratio: input.settings.aspectRatio,
              style_tag: styleTag,
            };
            results.push(img);
            setTask((prev) => prev ? { ...prev, progress: (results.length / input.settings.numOutputs) * 100, results: [...results] } : prev);
            setAllResults((prev) => [...prev, img]);
          }
        }).catch((err) => console.error(`Gen error ${i}:`, err))
      );

      await Promise.all(promises);
      setTask((prev) => prev ? { ...prev, status: 'done', progress: 100, results } : prev);

      toast({ title: '✅ Generation complete', description: `${results.length} creative${results.length !== 1 ? 's' : ''} ready.` });

      if (input.onComplete && results.length > 0) {
        input.onComplete(results);
      }

      if (results.length === 0) {
        setTask((prev) => prev ? { ...prev, status: 'error', error: 'No images generated' } : prev);
      }
    } catch (err: any) {
      setTask((prev) => prev ? { ...prev, status: 'error', error: err.message } : prev);
    }
  }, [toast]);

  return { task, allResults, generate, setAllResults };
}
