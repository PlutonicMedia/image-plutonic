import { Customer, Project, GeneratedImage, GenerationSettings, StyleCategory, PredefinedJsonPrompt, ScrapedProduct, AdCopy } from '@/types';
import { InputColumn } from './InputColumn';
import { CanvasColumn } from './CanvasColumn';
import { ControlColumn } from './ControlColumn';

interface DashboardLayoutProps {
  // Input Column
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (c: Customer | null) => void;
  onAddCustomer: (name: string) => void;
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (p: Project | null) => void;
  onAddProject: (name: string) => void;
  scrapedProduct: ScrapedProduct | null;
  onScraped: (data: ScrapedProduct | null) => void;
  productImages: string[];
  onProductImagesChange: (imgs: string[]) => void;
  modelImages: string[];
  onModelImagesChange: (imgs: string[]) => void;

  // Canvas Column
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
  onDownloadSelected: (images: GeneratedImage[]) => void;
  onRefinedImage: (newImage: GeneratedImage) => void;
  isGrid: boolean;

  // Control Column
  settings: GenerationSettings;
  onSettingsChange: (s: GenerationSettings) => void;
  selectedStyle: StyleCategory | null;
  onStyleChange: (s: StyleCategory | null) => void;
  styleSubOptions: Record<string, string>;
  onStyleSubOptionsChange: (o: Record<string, string>) => void;
  selectedJsonPrompt: PredefinedJsonPrompt | null;
  onJsonPromptChange: (jp: PredefinedJsonPrompt | null) => void;
  influencePrompt: string;
  onInfluencePromptChange: (p: string) => void;
  onGridChange: (g: boolean) => void;
  adCopy: AdCopy | null;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <InputColumn
        customers={props.customers}
        selectedCustomer={props.selectedCustomer}
        onSelectCustomer={props.onSelectCustomer}
        onAddCustomer={props.onAddCustomer}
        projects={props.projects}
        selectedProject={props.selectedProject}
        onSelectProject={props.onSelectProject}
        onAddProject={props.onAddProject}
        scrapedProduct={props.scrapedProduct}
        onScraped={props.onScraped}
        productImages={props.productImages}
        onProductImagesChange={props.onProductImagesChange}
        modelImages={props.modelImages}
        onModelImagesChange={props.onModelImagesChange}
      />
      <CanvasColumn
        images={props.images}
        onImageClick={props.onImageClick}
        onDownloadSelected={props.onDownloadSelected}
        onRefinedImage={props.onRefinedImage}
        isGrid={props.isGrid}
      />
      <ControlColumn
        settings={props.settings}
        onSettingsChange={props.onSettingsChange}
        selectedStyle={props.selectedStyle}
        onStyleChange={props.onStyleChange}
        styleSubOptions={props.styleSubOptions}
        onStyleSubOptionsChange={props.onStyleSubOptionsChange}
        selectedJsonPrompt={props.selectedJsonPrompt}
        onJsonPromptChange={props.onJsonPromptChange}
        influencePrompt={props.influencePrompt}
        onInfluencePromptChange={props.onInfluencePromptChange}
        isGrid={props.isGrid}
        onGridChange={props.onGridChange}
        adCopy={props.adCopy}
        onGenerate={props.onGenerate}
        isGenerating={props.isGenerating}
      />
    </div>
  );
}
