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
  style_tag?: string;
}

export interface GenerationSettings {
  aspectRatio: '1:1' | '9:16' | '4:5' | '3:4' | '16:9';
  quality: '2k' | '4k';
  numOutputs: number;
  format: 'png' | 'jpg' | 'webp';
  cameraLens: CameraLens | '';
}

export type CameraLens = '85mm' | '24mm' | '35mm';

export const CAMERA_LENSES: { value: CameraLens; label: string; description: string }[] = [
  { value: '85mm', label: '85mm f/1.8', description: 'Shallow DoF, creamy bokeh, sharp subject — ideal for portraits' },
  { value: '24mm', label: '24mm Wide Angle', description: 'Wide perspective, deep DoF — ideal for outdoor & urban' },
  { value: '35mm', label: '35mm Standard', description: 'Cinematic, natural-eye perspective' },
];

export type StyleCategory =
  | 'studio'
  | 'lifestyle'
  | 'outdoor'
  | 'urban'
  | 'futuristic'
  | 'scandi'
  | 'luxury'
  | 'sexy';

export interface StyleSubOptions {
  [key: string]: string[];
}

export const STYLE_CATEGORIES: { value: StyleCategory; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: 'lifestyle', label: 'Lifestyle (Influencer)' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'urban', label: 'Urban' },
  { value: 'futuristic', label: 'Futuristic' },
  { value: 'scandi', label: 'Scandi (Minimalist)' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'sexy', label: 'Sexy' },
];

export const STYLE_SUB_OPTIONS: Record<StyleCategory, { dropdowns: { label: string; key: string; options: string[] }[] }> = {
  studio: {
    dropdowns: [
      { label: 'Lighting Preset', key: 'lighting', options: ['Rembrandt', 'High Key', 'Rim Lighting', 'Softbox'] },
      { label: 'Material Preset', key: 'material', options: ['Reflective Acrylic', 'Raw Concrete', 'Velvet Backdrop', 'Polished Marble'] },
    ],
  },
  lifestyle: {
    dropdowns: [
      { label: 'Natural Lighting', key: 'lighting', options: ['Golden Hour', 'Overcast', 'Direct Sunlight'] },
      { label: 'Location', key: 'location', options: ['Copenhagen Street', 'Apartment Bathroom', 'Minimalist Living Room', 'Designer Kitchen'] },
    ],
  },
  outdoor: {
    dropdowns: [
      { label: 'Season', key: 'season', options: ['Summer', 'Autumn', 'Winter'] },
      { label: 'Landscape', key: 'landscape', options: ['Forest', 'Beach', 'Mountain', 'Desert'] },
    ],
  },
  urban: {
    dropdowns: [
      { label: 'Weather', key: 'weather', options: ['Rainy with reflections', 'Bright and Sunny'] },
      { label: 'Architectural Style', key: 'architecture', options: ['Industrial', 'Brutalist', 'Modern Glass'] },
    ],
  },
  futuristic: {
    dropdowns: [
      { label: 'Atmosphere', key: 'atmosphere', options: ['Cyberpunk Neon', 'Clean White Minimalism'] },
      { label: 'Technology Level', key: 'tech', options: ['Holographic', 'Organic Tech'] },
    ],
  },
  scandi: {
    dropdowns: [
      { label: 'Wood Tones', key: 'wood', options: ['Light Oak', 'Dark Walnut', 'Pine'] },
      { label: 'Color Palette', key: 'palette', options: ['Monochrome', 'Earth Tones'] },
    ],
  },
  luxury: {
    dropdowns: [
      { label: 'Lens Type', key: 'lens', options: ['Macro', 'Wide Angle'] },
      { label: 'Texture Priority', key: 'texture', options: ['Silk', 'Gold Leaf', 'Premium Leather'] },
    ],
  },
  sexy: {
    dropdowns: [
      { label: 'Mood', key: 'mood', options: ['Low-key lighting', 'Intimate shadows'] },
      { label: 'Texture', key: 'texture', options: ['Satin', 'Lace', 'Water droplets'] },
    ],
  },
};

export const PREDEFINED_PROMPTS: PromptTemplate[] = [
  { id: 'p1', name: 'Product Showcase — Clean', content: 'Create a professional product showcase on a clean, minimal background with soft studio lighting. Emphasize the product details and brand colors.', is_predefined: true },
  { id: 'p2', name: 'Lifestyle — Social Ad', content: 'Create a lifestyle social media advertisement showing the product being used naturally. Include aspirational elements and modern aesthetics.', is_predefined: true },
  { id: 'p3', name: 'Email Banner — Seasonal', content: 'Design an email marketing banner with seasonal themes. Include space for headline text and a clear call-to-action area.', is_predefined: true },
  { id: 'p4', name: 'TikTok — Vertical Creative', content: 'Create a vertical 9:16 creative optimized for TikTok. Use bold colors, dynamic composition, and eye-catching visuals.', is_predefined: true },
  { id: 'p5', name: 'Meta — Carousel Card', content: 'Design a single carousel card for a Meta (Facebook/Instagram) ad. Clean composition with product focus and brand consistency.', is_predefined: true },
  { id: 'p6', name: 'Before & After', content: 'Create a before-and-after comparison visual showing product transformation. Split composition with clear visual distinction.', is_predefined: true },
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

export const GLOBAL_PROMPT_CONSTRAINT = "Strictly no text, letters, characters, or watermarks in the image. The output must be purely visual. Focus on photorealistic textures, cinematic lighting, and high-fidelity rendering of materials.";

export const NEGATIVE_PROMPT = "Negative prompt: No text, no letters, no characters, no watermarks, no distorted anatomy, no extra limbs, no extra fingers, no plastic-looking skin, no oversaturated colors, no blurry details, no low-resolution artifacts, no unrealistic proportions. Enforce high-fidelity photographic finish with natural skin textures, accurate material rendering, and physically correct lighting.";

export interface QueueTask {
  id: string;
  status: 'pending' | 'running' | 'done' | 'error';
  prompt: string;
  settings: GenerationSettings;
  style: StyleCategory | null;
  styleSubOptions: Record<string, string>;
  productImage: string | null;
  modelImage: string | null;
  clientId?: string;
  results: GeneratedImage[];
  error?: string;
  progress: number;
}
