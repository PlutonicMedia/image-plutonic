import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Lightbox } from '@/components/generator/Lightbox';
import { LoadingOverlay } from '@/components/generator/LoadingOverlay';
import { AdPlacementPreviewer } from '@/components/generator/AdPlacementPreviewer';
import { useGeneration } from '@/hooks/useGeneration';
import { Customer, Project, GeneratedImage, GenerationSettings, StyleCategory, PredefinedJsonPrompt, ScrapedProduct, AdCopy } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const navigate = useNavigate();
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Customer & Project state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Scraping & Ad Copy
  const [scrapedProduct, setScrapedProduct] = useState<ScrapedProduct | null>(null);
  const [adCopy, setAdCopy] = useState<AdCopy | null>(null);

  // Generation inputs
  const [influencePrompt, setInfluencePrompt] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [modelImages, setModelImages] = useState<string[]>([]);
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '1:1', quality: '2k', numOutputs: 4, format: 'png', cameraLens: '', cameraAngle: '', draftMode: false,
  });
  const [isGrid, setIsGrid] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState<StyleCategory | null>(null);
  const [styleSubOptions, setStyleSubOptions] = useState<Record<string, string>>({});
  const [selectedJsonPrompt, setSelectedJsonPrompt] = useState<PredefinedJsonPrompt | null>(null);

  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [adPreviewImage, setAdPreviewImage] = useState<GeneratedImage | null>(null);

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

  // Load customers
  useEffect(() => { if (user) loadCustomers(); }, [user]);

  // Load projects when customer changes
  useEffect(() => {
    if (selectedCustomer) loadProjects(selectedCustomer.id);
    else setProjects([]);
  }, [selectedCustomer?.id]);

  const loadCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('name');
    if (data) setCustomers(data as Customer[]);
  };

  const loadProjects = async (customerId: string) => {
    const { data } = await supabase.from('projects').select('*').eq('customer_id', customerId).order('name');
    if (data) setProjects(data as Project[]);
  };

  const addCustomer = async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('customers').insert({ name, user_id: user.id }).select().single();
    if (data) {
      const customer = data as Customer;
      setCustomers((prev) => [...prev, customer].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCustomer(customer);
    }
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const addProject = async (name: string) => {
    if (!selectedCustomer) return;
    const { data, error } = await supabase.from('projects').insert({ name, customer_id: selectedCustomer.id }).select().single();
    if (data) {
      const project = data as Project;
      setProjects((prev) => [...prev, project].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedProject(project);
    }
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
  };

  const saveGeneration = async (images: GeneratedImage[]) => {
    if (!user) return;
    for (const img of images) {
      await supabase.from('generations').insert({
        user_id: user.id,
        project_id: selectedProject?.id || null,
        status: 'completed',
        params: { prompt: img.prompt, aspect_ratio: img.aspect_ratio, style_tag: img.style_tag },
        output_url: img.url,
        ad_copy: img.ad_copy as any || null,
        is_grid: isGrid,
      });
    }
  };

  const handleGenerate = useCallback(() => {
    // With unified prompting, we always have enough context — at minimum a scene template, style, or influence prompt
    const hasContext = !!selectedJsonPrompt || !!selectedStyle || !!influencePrompt.trim() || productImages.length > 0;
    if (!hasContext) {
      toast({ title: 'Missing input', description: 'Select a scene template, style, or type an influence prompt.', variant: 'destructive' });
      return;
    }
    setShowLoadingOverlay(true);
    generate({
      prompt: '', // No separate "manual prompt" — influence prompt handles it
      settings, style: selectedStyle, styleSubOptions,
      productImages, modelImages,
      clientId: selectedCustomer?.id,
      jsonPrompt: selectedJsonPrompt,
      influencePrompt,
      scrapedProduct,
      isGrid,
      onComplete: async (results: GeneratedImage[]) => {
        const firstAdCopy = results.find((r) => r.ad_copy)?.ad_copy || null;
        if (firstAdCopy) setAdCopy(firstAdCopy);
        saveGeneration(results);
      },
    });
  }, [settings, selectedStyle, styleSubOptions, productImages, modelImages, selectedCustomer, generate, selectedJsonPrompt, influencePrompt, scrapedProduct, selectedProject, isGrid]);

  const handleRefinedImage = useCallback((newImage: GeneratedImage) => {
    setAllResults((prev) => [...prev, newImage]);
  }, [setAllResults]);

  const handleDownload = async (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    const name = selectedCustomer?.name?.replace(/\s+/g, '-') || 'creative';
    link.download = `${name}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${settings.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSelected = async (images: GeneratedImage[]) => {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');
    const zip = new JSZip();
    const name = selectedCustomer?.name?.replace(/\s+/g, '-') || 'creatives';
    await Promise.all(images.map(async (img, i) => {
      try {
        const response = await fetch(img.url);
        const blob = await response.blob();
        zip.file(`${name}-${i + 1}.${settings.format}`, blob);
      } catch (e) { console.error('Failed to fetch image for zip:', e); }
    }));
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${name}-${new Date().toISOString().slice(0, 10)}.zip`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DashboardLayout
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        onAddCustomer={addCustomer}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onAddProject={addProject}
        scrapedProduct={scrapedProduct}
        onScraped={setScrapedProduct}
        productImages={productImages}
        onProductImagesChange={setProductImages}
        modelImages={modelImages}
        onModelImagesChange={setModelImages}
        images={allResults}
        onImageClick={setLightboxImage}
        onDownloadSelected={handleDownloadSelected}
        onRefinedImage={handleRefinedImage}
        isGrid={isGrid}
        settings={settings}
        onSettingsChange={setSettings}
        selectedStyle={selectedStyle}
        onStyleChange={setSelectedStyle}
        styleSubOptions={styleSubOptions}
        onStyleSubOptionsChange={setStyleSubOptions}
        selectedJsonPrompt={selectedJsonPrompt}
        onJsonPromptChange={setSelectedJsonPrompt}
        influencePrompt={influencePrompt}
        onInfluencePromptChange={setInfluencePrompt}
        onGridChange={setIsGrid}
        adCopy={adCopy}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
      {isGenerating && showLoadingOverlay && (
        <LoadingOverlay progress={task?.progress || 0} onDismiss={() => setShowLoadingOverlay(false)} />
      )}
      {lightboxImage && (
        <Lightbox image={lightboxImage} allImages={allResults} onClose={() => setLightboxImage(null)} onNavigate={setLightboxImage} onDownload={handleDownload} onPreviewAd={setAdPreviewImage} />
      )}
      {adPreviewImage && (
        <AdPlacementPreviewer image={adPreviewImage} onClose={() => setAdPreviewImage(null)} />
      )}
    </>
  );
}
