import { Copy, MessageSquareQuote } from 'lucide-react';
import { AdCopy } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AdCopyDisplayProps {
  adCopy: AdCopy | null;
}

export function AdCopyDisplay({ adCopy }: AdCopyDisplayProps) {
  const { toast } = useToast();

  if (!adCopy) {
    return (
      <div className="p-4 rounded-lg border border-dashed border-border text-center">
        <MessageSquareQuote className="w-5 h-5 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-xs text-muted-foreground">Ad copy will appear here after generation with a scraped product URL.</p>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <MessageSquareQuote className="w-3.5 h-3.5" />
        Generated Ad Copy
      </Label>
      {[
        { label: 'Hook', value: adCopy.hook, color: 'bg-primary/10 text-primary' },
        { label: 'Body', value: adCopy.body, color: 'bg-accent text-accent-foreground' },
        { label: 'CTA', value: adCopy.cta, color: 'bg-secondary text-secondary-foreground' },
      ].map(({ label, value, color }) => (
        <div key={label} className={`p-3 rounded-lg ${color} relative group`}>
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">{label}</span>
          <p className="text-sm mt-0.5 leading-relaxed">{value}</p>
          <button
            onClick={() => copyToClipboard(value, label)}
            className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-background/30 transition-opacity"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
