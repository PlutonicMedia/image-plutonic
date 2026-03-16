import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GenerationTask, GeneratedImage, GenerationSettings, StyleCategory, PredefinedJsonPrompt, AdCopy, ScrapedProduct } from '@/types';
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
  influencePrompt?: string;
  scrapedProduct?: ScrapedProduct | null;
  isGrid?: boolean;
  onComplete?: (results: GeneratedImage[]) => void;
}

export function useGeneration() {
  const [task, setTask] = useState<GenerationTask | null>(null);
  const [allResults, setAllResults] = useState<GeneratedImage[]>([]);
  const { toast } = useToast();

  const generate = useCallback(async (input: GenerateInput) => {
    const taskId = `gen-${Date.now()}`;

    let compiledPrompt = compilePrompt({
      style: input.style,
      subOptions: input.styleSubOptions,
      customPrompt: input.prompt,
      hasProductImage: input.productImages.length > 0,
      hasModelImage: input.modelImages.length > 0,
      aspectRatio: input.settings.aspectRatio,
      cameraLens: input.settings.cameraLens,
      cameraAngle: input.settings.cameraAngle,
      jsonPrompt: input.jsonPrompt || null,
      influencePrompt: input.influencePrompt,
      scrapedUsps: input.scrapedProduct?.usps,
    });

    // If grid mode, wrap prompt to request a 2x2 grid
    if (input.isGrid) {
      compiledPrompt = `Generate a single high-quality image containing a 2x2 grid (4 different variations) of the following scene. Each quadrant should show a distinct variation in angle or styling while maintaining product consistency. Scene: ${compiledPrompt}`;
    }

    const styleTag = getStyleTag(input.style, input.styleSubOptions);
    const contentParts: any[] = [{ type: 'text', text: compiledPrompt }];
    for (const img of input.productImages) {
      contentParts.push({ type: 'image_url', image_url: { url: img } });
    }
    for (const img of input.modelImages) {
      contentParts.push({ type: 'image_url', image_url: { url: img } });
    }
    const messages = [{ role: 'user', content: contentParts }];

    // Build ad copy context if scraped data exists
    const adCopyContext = input.scrapedProduct ? {
      product_name: input.scrapedProduct.product_name,
      description: input.scrapedProduct.description,
      usps: input.scrapedProduct.usps,
    } : undefined;

    const numRequests = input.isGrid ? 1 : input.settings.numOutputs;

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
      // Sequential requests with a small delay to avoid rate limits
      for (let i = 0; i < numRequests; i++) {
        if (i > 0) {
          // 1.5s delay between requests to avoid 429s
          await new Promise((r) => setTimeout(r, 1500));
        }

        try {
          const { data, error } = await supabase.functions.invoke('generate-creative', {
            body: { messages, aspectRatio: input.settings.aspectRatio, adCopyContext, draftMode: input.settings.draftMode },
          });

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
              ad_copy: data.adCopy || null,
            };
            results.push(img);
            setTask((prev) => prev ? { ...prev, progress: (results.length / numRequests) * 100, results: [...results] } : prev);
            setAllResults((prev) => [...prev, img]);
          }
        } catch (err) {
          console.error(`Gen error ${i}:`, err);
        }
      }

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
