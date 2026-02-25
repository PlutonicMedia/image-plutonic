import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QueueTask, GeneratedImage, GenerationSettings, StyleCategory } from '@/types';
import { compilePrompt, getStyleTag } from '@/lib/promptCompiler';
import { useToast } from '@/hooks/use-toast';

const MAX_QUEUE = 5;

interface QueueInput {
  prompt: string;
  settings: GenerationSettings;
  style: StyleCategory | null;
  styleSubOptions: Record<string, string>;
  productImage: string | null;
  modelImage: string | null;
  clientId?: string;
}

export function useGenerationQueue() {
  const [queue, setQueue] = useState<QueueTask[]>([]);
  const [allResults, setAllResults] = useState<GeneratedImage[]>([]);
  const processingRef = useRef(false);
  const { toast } = useToast();

  const updateTask = useCallback((id: string, updates: Partial<QueueTask>) => {
    setQueue((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const processQueue = useCallback(async (tasks: QueueTask[]) => {
    if (processingRef.current) return;
    processingRef.current = true;

    for (const task of tasks) {
      if (task.status !== 'pending') continue;

      updateTask(task.id, { status: 'running', progress: 0 });

      const compiledPrompt = compilePrompt({
        style: task.style,
        subOptions: task.styleSubOptions,
        customPrompt: task.prompt,
        hasProductImage: !!task.productImage,
        hasModelImage: !!task.modelImage,
        aspectRatio: task.settings.aspectRatio,
        cameraLens: task.settings.cameraLens,
      });

      const styleTag = getStyleTag(task.style, task.styleSubOptions);
      const contentParts: any[] = [{ type: 'text', text: compiledPrompt }];
      if (task.productImage) contentParts.push({ type: 'image_url', image_url: { url: task.productImage } });
      if (task.modelImage) contentParts.push({ type: 'image_url', image_url: { url: task.modelImage } });
      const messages = [{ role: 'user', content: contentParts }];

      const results: GeneratedImage[] = [];

      try {
        const promises = Array.from({ length: task.settings.numOutputs }, (_, i) =>
          supabase.functions.invoke('generate-creative', {
            body: { messages, aspectRatio: task.settings.aspectRatio },
          }).then(({ data, error }) => {
            if (error) throw error;
            if (data?.imageUrl) {
              const img: GeneratedImage = {
                id: `gen-${Date.now()}-${task.id}-${i}`,
                url: data.imageUrl,
                prompt: compiledPrompt,
                client_id: task.clientId,
                created_at: new Date().toISOString(),
                aspect_ratio: task.settings.aspectRatio,
                style_tag: styleTag,
              };
              results.push(img);
              updateTask(task.id, { progress: (results.length / task.settings.numOutputs) * 100, results: [...results] });
              setAllResults((prev) => [...prev, img]);
            }
          }).catch((err) => console.error(`Queue gen error ${i}:`, err))
        );

        await Promise.all(promises);
        updateTask(task.id, { status: 'done', progress: 100, results });

        if (results.length === 0) {
          updateTask(task.id, { status: 'error', error: 'No images generated' });
        }
      } catch (err: any) {
        updateTask(task.id, { status: 'error', error: err.message });
      }
    }

    processingRef.current = false;
  }, [updateTask]);

  const enqueue = useCallback((input: QueueInput) => {
    setQueue((prev) => {
      const activeCount = prev.filter((t) => t.status === 'pending' || t.status === 'running').length;
      if (activeCount >= MAX_QUEUE) {
        toast({ title: 'Queue full', description: `Maximum ${MAX_QUEUE} concurrent tasks allowed.`, variant: 'destructive' });
        return prev;
      }

      const task: QueueTask = {
        id: `q-${Date.now()}`,
        status: 'pending',
        prompt: input.prompt,
        settings: input.settings,
        style: input.style,
        styleSubOptions: input.styleSubOptions,
        productImage: input.productImage,
        modelImage: input.modelImage,
        clientId: input.clientId,
        results: [],
        progress: 0,
      };

      const newQueue = [...prev, task];

      // Start processing if not already running
      setTimeout(() => processQueue(newQueue), 0);

      return newQueue;
    });
  }, [processQueue, toast]);

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((t) => t.status === 'pending' || t.status === 'running'));
  }, []);

  return { queue, allResults, enqueue, clearCompleted, setAllResults };
}
