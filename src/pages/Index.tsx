import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { GeneratorPanel } from '@/components/generator/GeneratorPanel';
import { GalleryGrid } from '@/components/generator/GalleryGrid';
import { Lightbox } from '@/components/generator/Lightbox';
import { LoadingOverlay } from '@/components/generator/LoadingOverlay';
import { AdPlacementPreviewer } from '@/components/generator/AdPlacementPreviewer';
import { ClientArchive } from '@/components/generator/ClientArchive';
import { useGeneration } from '@/hooks/useGeneration';
import { Client, GeneratedImage, GenerationSettings, StyleCategory, PredefinedJsonPrompt, ClientLastSettings, PREDEFINED_JSON_PROMPTS } from '@/types';
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
  const [productImages, setProductImages] = useState<string[]>([]);
  const [modelImages, setModelImages] = useState<string[]>([]);
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '1:1', quality: '2k', numOutputs: 4, format: 'png', cameraLens: '',
  });

  const [selectedStyle, setSelectedStyle] = useState<StyleCategory | null>(null);
  const [styleSubOptions, setStyleSubOptions] = useState<Record<string, string>>({});
  const [selectedJsonPrompt, setSelectedJsonPrompt] = useState<PredefinedJsonPrompt | null>(null);
  const [promptMode, setPromptMode] = useState<'predefined' | 'manual'>('manual');

  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [adPreviewImage, setAdPreviewImage] = useState<GeneratedImage | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  const { task, allResults, generate, setAllResults } = useGeneration();
  const isGenerating = task?.status === 'running';

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

  // Restore settings when client changes
  useEffect(() => {
    if (selectedClient?.last_settings) {
      const s = selectedClient.last_settings;
      setSettings({
        aspectRatio: (s.aspectRatio as GenerationSettings['aspectRatio']) || '1:1',
        quality: (s.quality as GenerationSettings['quality']) || '2k',
        numOutputs: s.numOutputs || 4,
        format: (s.format as GenerationSettings['format']) || 'png',
        cameraLens: (s.cameraLens as GenerationSettings['cameraLens']) || '',
      });
      if (s.selectedStyle !== undefined) setSelectedStyle(s.selectedStyle);
      if (s.styleSubOptions) setStyleSubOptions(s.styleSubOptions);
      if (s.promptMode) setPromptMode(s.promptMode);
      if (s.selectedJsonPromptId) {
        const jp = PREDEFINED_JSON_PROMPTS.find((p) => p.id === s.selectedJsonPromptId) || null;
        setSelectedJsonPrompt(jp);
      }
    }
    setShowArchive(false);
  }, [selectedClient?.id]);

  const loadClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('name');
    if (data) setClients(data.map((d: any) => ({ ...d, last_settings: d.last_settings ?? null })) as Client[]);
  };

  const saveClientSettings = async (clientId: string) => {
    const lastSettings: ClientLastSettings = {
      aspectRatio: settings.aspectRatio, quality: settings.quality, numOutputs: settings.numOutputs,
      format: settings.format, cameraLens: settings.cameraLens, selectedStyle, styleSubOptions,
      promptMode, selectedJsonPromptId: selectedJsonPrompt?.id || null,
    };
    await supabase.from('clients').update({ last_settings: lastSettings as any }).eq('id', clientId);
    setClients((prev) => prev.map((c) => c.id === clientId ? { ...c, last_settings: lastSettings } : c));
    if (selectedClient?.id === clientId) setSelectedClient((prev) => prev ? { ...prev, last_settings: lastSettings } : prev);
  };

  const saveImagesToArchive = async (images: GeneratedImage[]) => {
    if (!user) return;
    for (const img of images) {
      await supabase.from('generated_images').insert({
        user_id: user.id, client_id: img.client_id || null,
        image_url: img.url, prompt: img.prompt, aspect_ratio: img.aspect_ratio,
      });
    }
    if (images[0]?.client_id) {
      const clientId = images[0].client_id;
      const { data: allImgs } = await supabase.from('generated_images').select('id').eq('client_id', clientId).order('created_at', { ascending: false });
      if (allImgs && allImgs.length > 30) {
        const idsToDelete = allImgs.slice(30).map((i) => i.id);
        await supabase.from('generated_images').delete().in('id', idsToDelete);
      }
    }
  };

  const addClient = async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('clients').insert({ name, user_id: user.id }).select().single();
    if (data) {
      const client = { ...data, last_settings: null } as unknown as Client;
      setClients((prev) => [...prev, client].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedClient(client);
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
    const hasContent = promptMode === 'predefined' ? !!selectedJsonPrompt : !!prompt.trim();
    if (!hasContent) return;
    setShowLoadingOverlay(true);
    generate({
      prompt: promptMode === 'manual' ? prompt : '',
      settings, style: selectedStyle, styleSubOptions,
      productImages, modelImages,
      clientId: selectedClient?.id,
      jsonPrompt: promptMode === 'predefined' ? selectedJsonPrompt : null,
      onComplete: async (results: GeneratedImage[]) => {
        if (selectedClient?.id) {
          saveClientSettings(selectedClient.id);
          saveImagesToArchive(results);
        }
      },
    });
  }, [prompt, settings, selectedStyle, styleSubOptions, productImages, modelImages, selectedClient, generate, promptMode, selectedJsonPrompt]);

  const handleRefinedImage = useCallback((newImage: GeneratedImage) => {
    setAllResults((prev) => [...prev, newImage]);
  }, [setAllResults]);

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
      <AppSidebar
        clients={clients} selectedClient={selectedClient}
        onSelectClient={setSelectedClient} onAddClient={addClient}
        onRenameClient={renameClient} onDeleteClient={deleteClient}
        onShowArchive={() => setShowArchive(true)}
      />
      <div className="flex flex-1 min-w-0">
        <GeneratorPanel
          selectedClient={selectedClient} settings={settings} onSettingsChange={setSettings}
          prompt={prompt} onPromptChange={setPrompt}
          productImages={productImages} onProductImagesChange={setProductImages}
          modelImages={modelImages} onModelImagesChange={setModelImages}
          onGenerate={handleGenerate} isGenerating={isGenerating}
          selectedStyle={selectedStyle} onStyleChange={setSelectedStyle}
          styleSubOptions={styleSubOptions} onStyleSubOptionsChange={setStyleSubOptions}
          selectedJsonPrompt={selectedJsonPrompt} onJsonPromptChange={setSelectedJsonPrompt}
          promptMode={promptMode} onPromptModeChange={setPromptMode}
        />
        {showArchive && selectedClient ? (
          <ClientArchive client={selectedClient} onClose={() => setShowArchive(false)} onDownloadSelected={handleDownloadSelected} />
        ) : (
          <GalleryGrid images={allResults} onImageClick={setLightboxImage} onDownloadSelected={handleDownloadSelected} onRefinedImage={handleRefinedImage} />
        )}
      </div>
      {isGenerating && showLoadingOverlay && (
        <LoadingOverlay progress={task?.progress || 0} onDismiss={() => setShowLoadingOverlay(false)} />
      )}
      {lightboxImage && (
        <Lightbox image={lightboxImage} allImages={allResults} onClose={() => setLightboxImage(null)} onNavigate={setLightboxImage} onDownload={handleDownload} onPreviewAd={setAdPreviewImage} />
      )}
      {adPreviewImage && (
        <AdPlacementPreviewer image={adPreviewImage} onClose={() => setAdPreviewImage(null)} />
      )}
    </div>
  );
}
