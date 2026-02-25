export interface ClientLastSettings {
  aspectRatio?: string;
  quality?: string;
  numOutputs?: number;
  format?: string;
  cameraLens?: string;
  selectedStyle?: StyleCategory | null;
  styleSubOptions?: Record<string, string>;
  promptMode?: 'predefined' | 'manual';
  selectedJsonPromptId?: string | null;
}

export interface Client {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  last_settings?: ClientLastSettings | null;
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
  | 'luxury';

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
];

export const STYLE_SUB_OPTIONS: Record<StyleCategory, { dropdowns: { label: string; key: string; options: string[] }[] }> = {
  studio: {
    dropdowns: [
      { label: 'Lighting Preset', key: 'lighting', options: ['Rembrandt', 'High Key', 'Rim Lighting', 'Softbox', 'Neutral White', 'High-Key Commercial', 'Soft Umbrella', 'Overcast Studio'] },
      { label: 'Material Preset', key: 'material', options: ['Reflective Acrylic', 'Raw Concrete', 'Velvet Backdrop', 'Polished Marble', 'Matte Plastic', 'Brushed Aluminum', 'Light Grey Sandstone', 'Frosted Glass', 'Neutral White'] },
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
};

// ── Predefined JSON Prompts ──────────────────────────────────────────────

export interface PredefinedJsonPrompt {
  id: string;
  name: string;
  scene: {
    environment: string;
    lighting: string;
    camera: string;
    composition: string;
    subjectWithProduct: string;
    subjectWithModel: string;
    subjectWithBoth: string;
    subjectDefault: string;
    postProcessing: string;
  };
}

export const PREDEFINED_JSON_PROMPTS: PredefinedJsonPrompt[] = [
  {
    id: 'jp1',
    name: 'Product Showcase — Clean Studio',
    scene: {
      environment: 'A pristine, infinity-cove studio with seamless white background. No visible edges or seams. The floor transitions into the wall with a smooth curve creating an infinite void effect.',
      lighting: 'Three-point lighting setup: key light at 45° camera-left with large softbox for even illumination, fill light at 30° camera-right at half intensity, rim light behind subject at 60° for edge separation. Color temperature: 5500K daylight balanced.',
      camera: 'Shot on 85mm f/2.8 prime lens. Medium focal distance. Shallow depth of field with product tack-sharp and background transitioning to soft bokeh at f/2.8. ISO 100, 1/200s shutter speed.',
      composition: 'Center-weighted composition with rule-of-thirds alignment. Product occupies 60% of frame. Generous negative space above and right for ad copy placement.',
      subjectWithProduct: 'The uploaded product is the sole hero subject, displayed at a 30-degree angle to reveal branding and form factor. Maintain exact label details, colors, shape, and branding without any alteration.',
      subjectWithModel: 'The uploaded model is the central figure, posed naturally with hands relaxed. Maintain their exact facial features, hair color, skin tone, and physique as shown in the reference image.',
      subjectWithBoth: 'The uploaded model holds or naturally interacts with the uploaded product. The product label faces the camera. Maintain both the model\'s exact appearance and the product\'s exact branding.',
      subjectDefault: 'A premium product or subject positioned as the hero element of the composition.',
      postProcessing: 'High-end retouching: skin frequency separation if applicable, color grading with lifted blacks and compressed highlights for a commercial matte look. 8K resolution output, 300 DPI print-ready.',
    },
  },
  {
    id: 'jp2',
    name: 'Lifestyle — Social Ad (Influencer)',
    scene: {
      environment: 'A curated, aspirational interior space — modern Scandinavian apartment with natural wood accents, linen textures, and indoor plants. Large windows with sheer curtains allowing diffused natural light.',
      lighting: 'Natural window light as primary source, supplemented by a single bounce reflector camera-right. Golden hour warmth at approximately 4500K. Soft, directional shadows creating depth without harshness.',
      camera: 'Shot on 35mm f/1.8 lens for natural perspective. Slightly wider than portrait focal length to include environment context. Shallow depth of field with subject sharp and background softly blurred. Handheld feel with micro-movement authenticity.',
      composition: 'Off-center subject placement following the rule of thirds. Lifestyle elements (coffee cup, book, plant) in soft foreground bokeh. Vertical framing optimized for Instagram Stories and TikTok.',
      subjectWithProduct: 'The uploaded product appears naturally within the lifestyle scene — placed on a surface, held casually, or in-use. Maintain exact product branding, label, and proportions.',
      subjectWithModel: 'The uploaded model is captured in a candid, unposed moment — laughing, mid-gesture, or looking away from camera. Maintain exact facial features, hair, and physique.',
      subjectWithBoth: 'The uploaded model uses the uploaded product naturally — applying it, holding it while in conversation, or showcasing it in a candid "day in my life" moment. Both maintain exact reference fidelity.',
      subjectDefault: 'An aspirational lifestyle moment featuring a relatable subject in an authentic setting.',
      postProcessing: 'Organic color grading mimicking VSCO or Lightroom mobile presets. Subtle grain at 15% opacity. Warm shadows, slightly desaturated greens. Output optimized for social media compression.',
    },
  },
  {
    id: 'jp3',
    name: 'E-Commerce — White Background',
    scene: {
      environment: 'Pure white (#FFFFFF) e-commerce background. No shadows on the background plane. Product floats on seamless white with only a subtle contact shadow directly beneath it.',
      lighting: 'Even, diffused top lighting from a large overhead softbox. No directional shadows. Fill lights on both sides eliminate all shadow detail. Pure, clean, commercial illumination at 6000K.',
      camera: 'Shot on 100mm macro lens at f/8 for maximum depth of field edge-to-edge sharpness. Tripod-mounted, perfectly level. Focus stacking for complete sharpness from front to back of subject.',
      composition: 'Dead-center composition. Product occupies 80% of frame height. Minimal margins. Multiple angles: front, 3/4 turn, side profile, and detail close-up.',
      subjectWithProduct: 'The uploaded product is photographed with clinical precision. Every label character, texture variation, and surface detail is rendered with absolute fidelity. No alterations to branding.',
      subjectWithModel: 'The uploaded model wears or displays the item on a white background. Clean, commercial pose. Exact facial features, body proportions, and skin tone preserved.',
      subjectWithBoth: 'The uploaded model holds or wears the uploaded product against pure white. Both rendered with exact reference fidelity for e-commerce catalog use.',
      subjectDefault: 'A product displayed with e-commerce catalog precision against pure white.',
      postProcessing: 'Zero color cast. Pure white background clipping at 255,255,255. Product colors accurately calibrated. No artistic grading — pure commercial accuracy. High-resolution 4K output.',
    },
  },
  {
    id: 'jp4',
    name: 'High-Fashion Swimwear Editorial',
    scene: {
      environment: 'A sun-drenched Mediterranean coastline with azure waters and weathered limestone cliffs. Golden sand beach with gentle turquoise waves. Professional location shoot atmosphere with curated set design elements.',
      lighting: 'Natural tropical sunlight diffused through a professional scrim. Rim lighting from sun creating luminous edge highlights on the subject. Bounce reflector filling shadows. Athletic, clean illumination emphasizing fabric texture and fit.',
      camera: 'Shot on 70-200mm f/2.8 telephoto zoom at 135mm. Professional fashion photography compression. Shallow depth of field isolating subject from beach environment. High-speed sync flash at 1/8000s for ambient light control.',
      composition: 'Full-body and three-quarter editorial framing. Dynamic athletic poses emphasizing garment construction and fit. Fashion-forward asymmetric composition with strong leading lines from shoreline.',
      subjectWithProduct: 'The uploaded swimwear product is displayed on a mannequin form or flat-lay arrangement with professional commercial beachwear catalog photography styling. Maintain exact fabric pattern, colors, and construction details.',
      subjectWithModel: 'The uploaded model is featured in a high-fashion swimwear editorial pose — athletic, confident, and commercially appropriate. Professional catalog photography emphasizing garment fit and athletic aesthetics. Maintain exact facial features, physique, and proportions.',
      subjectWithBoth: 'The uploaded model wears the uploaded swimwear product in a professional beachwear catalog editorial setting. Athletic swimwear lighting emphasizes both the model\'s features and the garment\'s construction. Commercial fashion photography standards.',
      subjectDefault: 'A high-fashion commercial beachwear editorial showcasing athletic swimwear photography with professional catalog-quality execution.',
      postProcessing: 'High-fashion editorial retouching: clean skin with natural texture preserved, vibrant but accurate color rendition of swimwear fabrics. Athletic lighting enhancement. Commercial catalog color accuracy. No suggestive posing — focus on fashion-editorial and athletic aesthetics.',
    },
  },
  {
    id: 'jp5',
    name: 'Meta Ad — Carousel Card',
    scene: {
      environment: 'A carefully art-directed set with a subtle gradient background transitioning from warm neutral to cool neutral. Minimal props that complement but never distract from the hero subject.',
      lighting: 'Commercial beauty lighting: large octabox overhead as key, V-flats on both sides for fill, subtle colored gel accent light from below for dimension. 5600K primary with warm 3200K accent.',
      camera: 'Shot on 50mm f/1.4 at f/4 for balanced depth of field. Square 1:1 framing optimized for Meta feed placement. Critical focus on product label or model eyes.',
      composition: 'Square 1:1 aspect ratio. Subject centered with breathing room on all sides. Bottom third reserved for potential text overlay zone. Clean, scannable composition optimized for mobile thumb-scroll speed.',
      subjectWithProduct: 'The uploaded product is the hero, styled with complementary props. Maintain exact branding, label text, colors, and proportions. Designed for instant visual recognition at thumbnail size.',
      subjectWithModel: 'The uploaded model is featured in an approachable, relatable pose that invites engagement. Maintain exact facial features and appearance. Optimized for social media thumb-stopping impact.',
      subjectWithBoth: 'The uploaded model holds or interacts with the uploaded product in a way that creates instant brand association. Both maintain exact reference fidelity. Composed for carousel swipe engagement.',
      subjectDefault: 'A thumb-stopping visual optimized for Meta feed carousel placement with immediate brand impact.',
      postProcessing: 'Punchy, social-optimized color grading: slightly boosted saturation, high clarity, crushed blacks for contrast. Optimized for mobile screen rendering. sRGB color space for consistent cross-device display.',
    },
  },
  {
    id: 'jp6',
    name: 'TikTok — Vertical Creative',
    scene: {
      environment: 'A dynamic, trend-forward setting that could be a neon-lit urban corner, a minimalist studio with colored gels, or an energetic lifestyle environment. Vertical 9:16 full-bleed composition.',
      lighting: 'Dramatic, editorial lighting with strong color temperature contrast. Practical lights visible in frame for authenticity. Mixed color temperatures creating visual energy: cool key + warm accent.',
      camera: 'Shot on 24mm wide-angle for immersive vertical perspective. Slight upward angle for dynamic energy. Motion blur on secondary elements while subject remains sharp. Fast shutter for freeze-frame moments.',
      composition: 'Full 9:16 vertical frame. Subject positioned in center-bottom third for platform UI clearance (top for username, bottom for description). Bold, attention-grabbing framing within first 0.5 seconds of visual scan.',
      subjectWithProduct: 'The uploaded product is featured with high-energy, Gen-Z-optimized visual treatment. Maintain exact product branding and details. Styled for shareability and trend-alignment.',
      subjectWithModel: 'The uploaded model is captured in a dynamic, mid-action pose with authentic energy. Maintain exact facial features and appearance. TikTok-native aesthetic with raw, real-feeling quality.',
      subjectWithBoth: 'The uploaded model uses the uploaded product in a TikTok-native moment — unboxing energy, try-on reaction, or "get ready with me" authenticity. Both maintain exact reference fidelity.',
      subjectDefault: 'A high-energy, trend-forward vertical creative optimized for TikTok full-screen immersion and thumb-stopping scroll interruption.',
      postProcessing: 'Bold, contrasty grade with lifted shadows and crushed highlights for phone-screen pop. Slight warmth in midtones. Grain at 10% for authentic feel. 9:16 vertical output at maximum resolution.',
    },
  },
];

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

export interface GenerationTask {
  id: string;
  status: 'running' | 'done' | 'error';
  prompt: string;
  settings: GenerationSettings;
  style: StyleCategory | null;
  styleSubOptions: Record<string, string>;
  productImages: string[];
  modelImages: string[];
  clientId?: string;
  results: GeneratedImage[];
  error?: string;
  progress: number;
  jsonPrompt?: PredefinedJsonPrompt | null;
  onComplete?: (results: GeneratedImage[]) => void;
}
