import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { GeneratorPanel } from '@/components/generator/GeneratorPanel';
import { GalleryGrid } from '@/components/generator/GalleryGrid';
import { Lightbox } from '@/components/generator/Lightbox';
import { LoadingOverlay } from '@/components/generator/LoadingOverlay';
import { QueueManager } from '@/components/generator/QueueManager';
import { AdPlacementPreviewer } from '@/components/generator/AdPlacementPreviewer';
import { useGenerationQueue } from '@/hooks/useGenerationQueue';
import { Client, GeneratedImage, GenerationSettings, StyleCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const navigate = useNavigate();
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [prompt, setPrompt] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '1:1', quality: '2k', numOutputs: 4, format: 'png', cameraLens: '',
  });

  const [selectedStyle, setSelectedStyle] = useState<StyleCategory | null>(null);
  const [styleSubOptions, setStyleSubOptions] = useState<Record<string, string>>({});

  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [adPreviewImage, setAdPreviewImage] = useState<GeneratedImage | null>(null);

  const { queue, allResults, enqueue, setAllResults } = useGenerationQueue();
  const isGenerating = queue.some((t) => t.status === 'running');
  const runningTask = queue.find((t) => t.status === 'running');

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

  useEffect(() => { if (user) loadClients(); }, [user]);

  const loadClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('name');
    if (data) setClients(data as unknown as Client[]);
  };

  const addClient = async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('clients').insert({ name, user_id: user.id }).select().single();
    if (data) {
      setClients((prev) => [...prev, data as unknown as Client].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedClient(data as unknown as Client);
    }
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const renameClient = async (id: string, name: string) => {
    await supabase.from('clients').update({ name }).eq('id', id);
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)).sort((a, b) => a.name.localeCompare(b.name)));
    if (selectedClient?.id === id) setSelectedClient((prev) => prev ? { ...prev, name } : prev);
  };

  const deleteClient = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (selectedClient?.id === id) setSelectedClient(null);
  };

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;
    setShowLoadingOverlay(true);
    enqueue({
      prompt,
      settings,
      style: selectedStyle,
      styleSubOptions,
      productImage,
      modelImage,
      clientId: selectedClient?.id,
    });
    toast({ title: 'Added to queue', description: 'Your generation task has been queued.' });
  }, [prompt, settings, selectedStyle, styleSubOptions, productImage, modelImage, selectedClient, enqueue, toast]);

  const handleRefinedImage = useCallback((newImage: GeneratedImage) => {
    setAllResults((prev) => [...prev, newImage]);
  }, [setAllResults]);

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
    await Promise.all(images.map(async (img, i) => {
      try {
        const response = await fetch(img.url);
        const blob = await response.blob();
        zip.file(`${clientName}-${i + 1}.${settings.format}`, blob);
      } catch (e) { console.error('Failed to fetch image for zip:', e); }
    }));
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
      <AppSidebar clients={clients} selectedClient={selectedClient} onSelectClient={setSelectedClient} onAddClient={addClient} onRenameClient={renameClient} onDeleteClient={deleteClient} />
      <div className="flex flex-1 min-w-0">
        <GeneratorPanel
          selectedClient={selectedClient} settings={settings} onSettingsChange={setSettings}
          prompt={prompt} onPromptChange={setPrompt}
          productImage={productImage} onProductImageChange={setProductImage}
          modelImage={modelImage} onModelImageChange={setModelImage}
          onGenerate={handleGenerate} isGenerating={isGenerating}
          selectedStyle={selectedStyle} onStyleChange={setSelectedStyle}
          styleSubOptions={styleSubOptions} onStyleSubOptionsChange={setStyleSubOptions}
          queueCount={queue.filter((t) => t.status === 'pending' || t.status === 'running').length}
        />
        <GalleryGrid
          images={allResults}
          onImageClick={setLightboxImage}
          onDownloadSelected={handleDownloadSelected}
          onRefinedImage={handleRefinedImage}
        />
      </div>
      {isGenerating && showLoadingOverlay && (
        <LoadingOverlay progress={runningTask?.progress || 0} onDismiss={() => setShowLoadingOverlay(false)} />
      )}
      <QueueManager queue={queue} />
      {lightboxImage && (
        <Lightbox
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
          onCreateVariants={handleCreateVariants}
          onDownload={handleDownload}
          onPreviewAd={setAdPreviewImage}
        />
      )}
      {adPreviewImage && (
        <AdPlacementPreviewer image={adPreviewImage} onClose={() => setAdPreviewImage(null)} />
      )}
    </div>
  );
}
