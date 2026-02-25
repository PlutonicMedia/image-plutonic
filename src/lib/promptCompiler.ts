import { StyleCategory, GLOBAL_PROMPT_CONSTRAINT } from '@/types';

interface CompilerInput {
  style: StyleCategory | null;
  subOptions: Record<string, string>;
  customPrompt: string;
  hasProductImage: boolean;
  hasModelImage: boolean;
  aspectRatio: string;
}

function getContextInjection(hasProduct: boolean, hasModel: boolean): string {
  if (hasProduct && hasModel) {
    return 'Create a natural interaction where the uploaded model is holding or interacting with the uploaded product in a realistic manner.';
  }
  if (hasProduct) {
    return 'Incorporate the specific uploaded product image into the scene. Maintain the exact label details, shape, and branding of the product without alteration.';
  }
  if (hasModel) {
    return 'Feature the specific uploaded model person as the central subject. Maintain their facial features, hair, and physique exactly as shown in the reference.';
  }
  return '';
}

function getStylePrompt(style: StyleCategory, subs: Record<string, string>): string {
  const lighting = subs.lighting || '';
  const material = subs.material || '';
  const location = subs.location || '';
  const season = subs.season || '';
  const landscape = subs.landscape || '';
  const weather = subs.weather || '';
  const architecture = subs.architecture || '';
  const atmosphere = subs.atmosphere || '';
  const tech = subs.tech || '';
  const wood = subs.wood || '';
  const palette = subs.palette || '';
  const lens = subs.lens || '';
  const texture = subs.texture || '';
  const mood = subs.mood || '';

  switch (style) {
    case 'studio':
      return `A high-end commercial studio setup with ${lighting || 'professional'} lighting. The ${material || 'premium'} surface creates sophisticated reflections. Render with extreme detail, 8k resolution, and deep color grading suitable for premium Meta ads.`;
    case 'lifestyle':
      return `A candid influencer-style shot in ${location || 'a stylish interior'}. The lighting is ${lighting || 'natural and soft'}, creating an authentic and relatable atmosphere. The composition mimics a high-quality TikTok organic post, focusing on motion blur and realistic skin textures.`;
    case 'outdoor':
      return `An expansive outdoor scene set in ${season || 'a temperate'} ${landscape || 'natural landscape'}. Natural ambient lighting with depth-of-field separation between subject and background. Ultra-realistic environmental details with volumetric atmosphere.`;
    case 'urban':
      return `A dynamic urban environment with ${weather || 'atmospheric'} conditions in ${architecture || 'modern'} surroundings. Street-level perspective with cinematic color grading. Reflections and textures of the cityscape add gritty authenticity.`;
    case 'futuristic':
      return `A ${atmosphere || 'futuristic'} setting with ${tech || 'advanced'} technology elements. Volumetric lighting cuts through atmospheric haze. Hyper-detailed sci-fi surfaces and materials with iridescent highlights.`;
    case 'scandi':
      return `A Scandinavian minimalist composition with ${wood || 'natural wood'} tones and a ${palette || 'muted'} color palette. Clean lines, generous negative space, and soft diffused Nordic light. Every element serves a purpose in the frame.`;
    case 'luxury':
      return `An opulent luxury setting shot with a ${lens || 'professional'} lens. ${texture || 'Premium'} textures dominate the frame with shallow depth-of-field. Rich tonal range with deep shadows and luminous highlights evoking exclusivity.`;
    case 'sexy':
      return `An alluring composition with ${mood || 'dramatic'} atmosphere. ${texture || 'Luxurious'} textures catch the light creating sensual interplay of highlight and shadow. Warm color grading with selective focus for an intimate feel.`;
    default:
      return '';
  }
}

export function compilePrompt(input: CompilerInput): string {
  const parts: string[] = [];

  // Style-specific rich description
  if (input.style) {
    parts.push(getStylePrompt(input.style, input.subOptions));
  }

  // Custom prompt / user override
  if (input.customPrompt.trim()) {
    parts.push(input.customPrompt.trim());
  }

  // Context-aware image injection
  const contextInjection = getContextInjection(input.hasProductImage, input.hasModelImage);
  if (contextInjection) {
    parts.push(contextInjection);
  }

  // Aspect ratio hint
  parts.push(`Aspect ratio: ${input.aspectRatio}.`);

  // Global constraint always appended
  parts.push(GLOBAL_PROMPT_CONSTRAINT);

  return parts.join(' ');
}

export function getStyleTag(style: StyleCategory | null, subs: Record<string, string>): string {
  if (!style) return '';
  const label = style.charAt(0).toUpperCase() + style.slice(1);
  const details = Object.values(subs).filter(Boolean);
  return details.length > 0 ? `${label} — ${details[0]}` : label;
}
