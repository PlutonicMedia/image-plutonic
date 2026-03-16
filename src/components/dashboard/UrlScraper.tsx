import { useState } from 'react';
import { Globe, Loader2, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ScrapedProduct } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UrlScraperProps {
  scrapedProduct: ScrapedProduct | null;
  onScraped: (data: ScrapedProduct | null) => void;
}

export function UrlScraper({ scrapedProduct, onScraped }: UrlScraperProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-product', {
        body: { url: url.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onScraped(data as ScrapedProduct);
      toast({ title: 'Product extracted', description: data.product_name });
    } catch (err: any) {
      toast({ title: 'Scrape failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5" />
        Product URL (optional)
      </Label>
      <div className="flex gap-1.5">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/product"
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
        />
        <button
          onClick={handleScrape}
          disabled={!url.trim() || loading}
          className="shrink-0 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40 transition-opacity flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Extract
        </button>
      </div>

      {scrapedProduct && (
        <div className="p-3 rounded-lg bg-accent/50 border border-border space-y-1.5 relative">
          <button onClick={() => onScraped(null)} className="absolute top-2 right-2 p-0.5 rounded hover:bg-background/50">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
          <p className="text-xs font-semibold text-foreground">{scrapedProduct.product_name}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{scrapedProduct.description}</p>
          <div className="flex flex-wrap gap-1 pt-1">
            {scrapedProduct.usps.map((usp, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {usp}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
