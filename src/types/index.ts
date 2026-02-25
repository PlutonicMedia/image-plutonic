export interface Client {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

export interface BrandAsset {
  id: string;
  client_id: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  primary_font: string;
  secondary_font: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  client_id?: string | null;
  is_predefined: boolean;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  client_id?: string;
  created_at: string;
  aspect_ratio: string;
}

export interface GenerationSettings {
  aspectRatio: '1:1' | '9:16' | '4:5' | '3:4' | '16:9';
  quality: '2k' | '4k';
  numOutputs: number;
  format: 'png' | 'jpg' | 'webp';
}

export const PREDEFINED_PROMPTS: PromptTemplate[] = [
  {
    id: 'p1',
    name: 'Product Showcase — Clean',
    content: 'Create a professional product showcase on a clean, minimal background with soft studio lighting. Emphasize the product details and brand colors.',
    is_predefined: true,
  },
  {
    id: 'p2',
    name: 'Lifestyle — Social Ad',
    content: 'Create a lifestyle social media advertisement showing the product being used naturally. Include aspirational elements and modern aesthetics.',
    is_predefined: true,
  },
  {
    id: 'p3',
    name: 'Email Banner — Seasonal',
    content: 'Design an email marketing banner with seasonal themes. Include space for headline text and a clear call-to-action area.',
    is_predefined: true,
  },
  {
    id: 'p4',
    name: 'TikTok — Vertical Creative',
    content: 'Create a vertical 9:16 creative optimized for TikTok. Use bold colors, dynamic composition, and eye-catching visuals.',
    is_predefined: true,
  },
  {
    id: 'p5',
    name: 'Meta — Carousel Card',
    content: 'Design a single carousel card for a Meta (Facebook/Instagram) ad. Clean composition with product focus and brand consistency.',
    is_predefined: true,
  },
  {
    id: 'p6',
    name: 'Before & After',
    content: 'Create a before-and-after comparison visual showing product transformation. Split composition with clear visual distinction.',
    is_predefined: true,
  },
];

export const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1' as const },
  { label: '9:16', value: '9:16' as const },
  { label: '4:5', value: '4:5' as const },
  { label: '3:4', value: '3:4' as const },
  { label: '16:9', value: '16:9' as const },
];

export const LOADING_MESSAGES = [
  'Are you interested in maximizing your AI progress in 2026? Contact our AI Specialist Team by e-mailing Albert Wilson at albert@plutonoic.dk',
  'Do you need help balancing ROAS and POAS for your paid ads in 2026? Contact Head of Social Mikkel Hermansen at mh@plutonic.dk',
  'Are you interested in becoming a worse version of yourself? Contact Head of Aura Loss Jacob Stender at js@plutonic.dk',
];
