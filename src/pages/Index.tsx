import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { GeneratorPanel } from '@/components/generator/GeneratorPanel';
import { GalleryGrid } from '@/components/generator/GalleryGrid';
import { Lightbox } from '@/components/generator/Lightbox';
import { LoadingOverlay } from '@/components/generator/LoadingOverlay';
import { Client, GeneratedImage, GenerationSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Client state
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Generator state
  const [prompt, setPrompt] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '1:1',
    quality: '2k',
    numOutputs: 4,
    format: 'png',
  });

  // Output state
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate('/auth');
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate('/auth');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load clients
  useEffect(() => {
    if (!user) return;
    loadClients();
  }, [user]);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    if (data) setClients(data as unknown as Client[]);
  };

  const addClient = async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('clients')
      .insert({ name, user_id: user.id })
      .select()
      .single();
    if (data) {
      setClients((prev) => [...prev, data as unknown as Client].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedClient(data as unknown as Client);
    }
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const renameClient = async (id: string, name: string) => {
    await supabase.from('clients').update({ name }).eq('id', id);
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c)).sort((a, b) => a.name.localeCompare(b.name))
    );
    if (selectedClient?.id === id) setSelectedClient((prev) => prev ? { ...prev, name } : prev);
  };

  const deleteClient = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (selectedClient?.id === id) setSelectedClient(null);
  };

  // Generation
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 8 + 2, 90));
    }, 500);

    try {
      const messages: any[] = [];
      const contentParts: any[] = [
        {
          type: 'text',
          text: `Generate a marketing creative image. ${prompt}. Aspect ratio: ${settings.aspectRatio}. Make it professional, high-quality, and brand-consistent.`,
        },
      ];

      if (productImage) {
        contentParts.push({ type: 'image_url', image_url: { url: productImage } });
      }
      if (modelImage) {
        contentParts.push({ type: 'image_url', image_url: { url: modelImage } });
      }

      messages.push({ role: 'user', content: contentParts });

      // Generate images sequentially (API returns one at a time)
      const newImages: GeneratedImage[] = [];

      for (let i = 0; i < settings.numOutputs; i++) {
        try {
          const { data, error } = await supabase.functions.invoke('generate-creative', {
            body: { messages, aspectRatio: settings.aspectRatio },
          });

          if (error) throw error;

          if (data?.imageUrl) {
            newImages.push({
              id: `gen-${Date.now()}-${i}`,
              url: data.imageUrl,
              prompt,
              client_id: selectedClient?.id,
              created_at: new Date().toISOString(),
              aspect_ratio: settings.aspectRatio,
            });
            setGeneratedImages((prev) => [...newImages]);
            setProgress(10 + ((i + 1) / settings.numOutputs) * 80);
          }
        } catch (err) {
          console.error(`Error generating image ${i + 1}:`, err);
        }
      }

      if (newImages.length === 0) {
        toast({ title: 'Generation failed', description: 'No images were generated. Please try again.', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to generate creatives', variant: 'destructive' });
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => setIsGenerating(false), 500);
    }
  }, [prompt, productImage, modelImage, settings, selectedClient, toast]);

  const handleCreateVariants = (image: GeneratedImage) => {
    setLightboxImage(null);
    setProductImage(image.url);
    setPrompt(`Create a variant of this creative. ${image.prompt}`);
  };

  const handleDownload = async (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    const clientName = selectedClient?.name?.replace(/\s+/g, '-') || 'creative';
    link.download = `${clientName}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${settings.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSelected = async (images: GeneratedImage[]) => {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');
    const zip = new JSZip();
    const clientName = selectedClient?.name?.replace(/\s+/g, '-') || 'creatives';

    await Promise.all(
      images.map(async (img, i) => {
        try {
          const response = await fetch(img.url);
          const blob = await response.blob();
          zip.file(`${clientName}-${i + 1}.${settings.format}`, blob);
        } catch (e) {
          console.error('Failed to fetch image for zip:', e);
        }
      })
    );

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${clientName}-${new Date().toISOString().slice(0, 10)}.zip`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar
        clients={clients}
        selectedClient={selectedClient}
        onSelectClient={setSelectedClient}
        onAddClient={addClient}
        onRenameClient={renameClient}
        onDeleteClient={deleteClient}
      />

      <div className="flex flex-1 min-w-0">
        <GeneratorPanel
          selectedClient={selectedClient}
          settings={settings}
          onSettingsChange={setSettings}
          prompt={prompt}
          onPromptChange={setPrompt}
          productImage={productImage}
          onProductImageChange={setProductImage}
          modelImage={modelImage}
          onModelImageChange={setModelImage}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        <GalleryGrid
          images={generatedImages}
          onImageClick={setLightboxImage}
          onDownloadSelected={handleDownloadSelected}
        />
      </div>

      {isGenerating && <LoadingOverlay progress={progress} />}

      {lightboxImage && (
        <Lightbox
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
          onCreateVariants={handleCreateVariants}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
