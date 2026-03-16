import { Image, Lock } from 'lucide-react';
import { Customer, Project, ScrapedProduct } from '@/types';
import { CustomerProjectSelector } from './CustomerProjectSelector';
import { UrlScraper } from './UrlScraper';
import { MultiImageUpload } from '@/components/generator/MultiImageUpload';
import { Badge } from '@/components/ui/badge';

interface InputColumnProps {
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
}

export function InputColumn({
  customers, selectedCustomer, onSelectCustomer, onAddCustomer,
  projects, selectedProject, onSelectProject, onAddProject,
  scrapedProduct, onScraped,
  productImages, onProductImagesChange,
  modelImages, onModelImagesChange,
}: InputColumnProps) {
  return (
    <div className="w-[320px] shrink-0 border-r border-border bg-card overflow-y-auto scrollbar-thin">
      <div className="p-5 space-y-5">
        {/* Brand Header */}
        <div>
          <h1 className="text-lg font-display font-bold tracking-tight">Plutonic Media</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Creative Dashboard</p>
        </div>

        {/* Customer & Project */}
        <CustomerProjectSelector
          customers={customers} selectedCustomer={selectedCustomer}
          onSelectCustomer={onSelectCustomer} onAddCustomer={onAddCustomer}
          projects={projects} selectedProject={selectedProject}
          onSelectProject={onSelectProject} onAddProject={onAddProject}
        />

        {/* URL Scraper */}
        <UrlScraper scrapedProduct={scrapedProduct} onScraped={onScraped} />

        {/* Product Hub */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Image className="w-3.5 h-3.5" />
            Product Hub
          </div>
          <MultiImageUpload label="Product Images" images={productImages} onChange={onProductImagesChange} max={5} />
          <p className="text-[10px] text-muted-foreground/60 italic">AI uses all images as structural reference for 3D understanding</p>
        </div>

        {/* Model Hub */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Image className="w-3.5 h-3.5" />
            Model Hub
          </div>
          <MultiImageUpload label="Model Images" images={modelImages} onChange={onModelImagesChange} max={5} />
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[9px] gap-1 px-1.5 py-0 h-5 border-dashed">
              <Lock className="w-2.5 h-2.5" /> Save Model to Library — Coming Soon
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
