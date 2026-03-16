import { StyleCategory, GLOBAL_PROMPT_CONSTRAINT, NEGATIVE_PROMPT, CameraLens, CameraAngle, PredefinedJsonPrompt } from '@/types';

interface CompilerInput {
  style: StyleCategory | null;
  subOptions: Record<string, string>;
  customPrompt: string;
  hasProductImage: boolean;
  hasModelImage: boolean;
  aspectRatio: string;
  cameraLens?: CameraLens | '';
  cameraAngle?: CameraAngle | '';
  jsonPrompt?: PredefinedJsonPrompt | null;
  influencePrompt?: string;
  scrapedUsps?: string[];
}

function getCameraInstruction(lens: CameraLens): string {
  switch (lens) {
    case '85mm':
      return 'Shot on 85mm f/1.8 lens: shallow depth of field, creamy bokeh background, razor-sharp subject focus, compressed perspective ideal for portrait and product isolation.';
    case '24mm':
      return 'Shot on 24mm wide-angle lens: expansive field of view, deep depth of field keeping foreground and background sharp, slight barrel perspective ideal for environmental and architectural scenes.';
    case '35mm':
      return 'Shot on 35mm standard lens: cinematic natural-eye perspective, balanced depth of field, no visible distortion, organic and immersive framing.';
  }
}

function getCameraAngleInstruction(angle: CameraAngle): string {
  switch (angle) {
    case 'eye-level':
      return 'Camera positioned at eye-level: straight-on perspective creating a natural, relatable viewpoint. Subject fills the frame at its natural height with minimal perspective distortion.';
    case 'top-down':
      return 'Camera positioned directly overhead for a flat-lay / bird\'s-eye composition. Subject is viewed from 90° above, ideal for product layouts, food photography, and organized arrangements.';
    case 'hero-angle':
      return 'Camera positioned at a low hero angle (approximately 15-25° from ground level), looking upward at the subject. Creates a sense of power, dominance, and aspiration. The subject appears larger-than-life and commanding.';
    case 'macro':
      return 'Extreme macro close-up perspective: camera positioned within centimeters of the subject to reveal intricate textures, material details, and surface qualities invisible to the naked eye. Razor-thin depth of field with exquisite detail rendering.';
  }
}

function getContextInjection(hasProduct: boolean, hasModel: boolean): string {
  if (hasProduct && hasModel) {
    return 'Create a natural interaction where the uploaded model is holding or interacting with the uploaded product in a realistic manner. Maintain facial features and product branding exactly.';
  }
  if (hasProduct) {
    return 'Incorporate the specific uploaded product image into the scene. Maintain the exact label details, shape, and branding of the product without alteration.';
  }
  if (hasModel) {
    return 'Feature the specific uploaded model person as the central subject. Maintain their facial features, hair, and physique exactly as shown in the reference.';
  }
  return '';
}

function getShadowReflectionMapping(hasProduct: boolean, material: string): string {
  if (!hasProduct) return '';
  const surfaceMap: Record<string, string> = {
    'Reflective Acrylic': 'Calculate precise mirror-like reflections on the acrylic surface beneath the product. Render caustic light patterns and glossy specular highlights.',
    'Raw Concrete': 'Render subtle diffuse shadows on the matte concrete surface. Show micro-texture interaction where the product meets the rough surface.',
    'Velvet Backdrop': 'Cast soft, diffused shadows with feathered edges on the velvet material. Show fabric compression where the product rests.',
    'Polished Marble': 'Generate accurate mirror reflections on the polished marble surface with veining visible through the reflection. Add subtle caustic light scatter.',
    'Light Oak': 'Render warm-toned shadows on the oak grain. Show subtle wood texture reflection under the product base.',
    'Dark Walnut': 'Cast deep, warm shadows on the walnut surface with semi-reflective grain highlights.',
    'Pine': 'Create natural soft shadows on the pine surface with visible grain interaction.',
    'Matte Plastic': 'Render clean, even diffuse shadows on the matte plastic surface. Minimal reflections with subtle ambient occlusion at the contact point.',
    'Brushed Aluminum': 'Render anisotropic reflections on the brushed aluminum surface. Directional specular highlights following the grain pattern of the metal.',
    'Light Grey Sandstone': 'Cast warm, textured shadows on the sandstone surface. Show micro-grain interaction and subtle surface irregularities at the contact point.',
    'Frosted Glass': 'Render diffused, frosted reflections on the glass surface beneath the product. Soft caustic light scatter with translucent depth effect.',
    'Neutral White': 'Matte, non-reflective neutral white surface providing a clean and clinical commercial aesthetic. Render subtle contact shadows with soft ambient occlusion. No reflections — purely diffuse light interaction.',
  };
  const instruction = surfaceMap[material];
  if (instruction) return instruction;
  return 'Render physically accurate shadows and reflections based on the surface material. Ensure the product is integrated into the 3D environment with contact shadows and ambient occlusion — never a flat overlay.';
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
    default:
      return '';
  }
}

/** 1:1 product consistency instruction block */
const CONSISTENCY_BLOCK = "CRITICAL — 1:1 PRODUCT CONSISTENCY: The uploaded product images are the absolute structural reference. Replicate the exact pixel-level shape, color, branding, label text, and proportions of the product. Product fidelity takes priority over all stylistic instructions. Do not alter, simplify, or reimagine the product design in any way.";

/** Compile a predefined JSON prompt into a full prompt string */
function compileJsonPrompt(jp: PredefinedJsonPrompt, hasProduct: boolean, hasModel: boolean): string {
  const parts: string[] = [];
  parts.push(jp.scene.environment);
  parts.push(jp.scene.lighting);
  parts.push(jp.scene.camera);
  parts.push(jp.scene.composition);

  if (hasProduct && hasModel) {
    parts.push(jp.scene.subjectWithBoth);
  } else if (hasProduct) {
    parts.push(jp.scene.subjectWithProduct);
  } else if (hasModel) {
    parts.push(jp.scene.subjectWithModel);
  } else {
    parts.push(jp.scene.subjectDefault);
  }

  parts.push(jp.scene.postProcessing);
  return parts.join(' ');
}

export function compilePrompt(input: CompilerInput): string {
  const parts: string[] = [];

  // ── 1. Preset Context ──
  if (input.jsonPrompt) {
    parts.push(compileJsonPrompt(input.jsonPrompt, input.hasProductImage, input.hasModelImage));
  } else {
    if (input.style) {
      parts.push(getStylePrompt(input.style, input.subOptions));
    }

    if (input.cameraLens) {
      parts.push(getCameraInstruction(input.cameraLens));
    }

    if (input.customPrompt.trim()) {
      parts.push(input.customPrompt.trim());
    }

    const contextInjection = getContextInjection(input.hasProductImage, input.hasModelImage);
    if (contextInjection) {
      parts.push(contextInjection);
    }

    if (input.hasProductImage) {
      const material = input.subOptions.material || input.subOptions.wood || '';
      parts.push(getShadowReflectionMapping(true, material));
    }
  }

  // ── 2. Camera Angle ──
  if (input.cameraAngle) {
    parts.push(getCameraAngleInstruction(input.cameraAngle));
  }

  // ── 3. Influence Prompt (always-on free text) ──
  if (input.influencePrompt?.trim()) {
    parts.push(`Additional creative direction: ${input.influencePrompt.trim()}`);
  }

  // ── 4. Scraped USPs ──
  if (input.scrapedUsps && input.scrapedUsps.length > 0) {
    parts.push(`Key product selling points to visually emphasize: ${input.scrapedUsps.join('; ')}.`);
  }

  // ── 5. 1:1 Consistency ──
  if (input.hasProductImage) {
    parts.push(CONSISTENCY_BLOCK);
  }

  // Aspect ratio hint
  parts.push(`Aspect ratio: ${input.aspectRatio}.`);

  // Global constraint + negative prompt always appended
  parts.push(GLOBAL_PROMPT_CONSTRAINT);
  parts.push(NEGATIVE_PROMPT);

  return parts.join(' ');
}

export function getStyleTag(style: StyleCategory | null, subs: Record<string, string>): string {
  if (!style) return '';
  const label = style.charAt(0).toUpperCase() + style.slice(1);
  const details = Object.values(subs).filter(Boolean);
  return details.length > 0 ? `${label} — ${details[0]}` : label;
}
