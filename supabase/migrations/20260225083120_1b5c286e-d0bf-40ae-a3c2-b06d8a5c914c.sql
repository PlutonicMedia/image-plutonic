
-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- Brand assets table
CREATE TABLE public.brand_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#000000',
  secondary_color TEXT NOT NULL DEFAULT '#FFFFFF',
  primary_font TEXT NOT NULL DEFAULT 'Inter',
  secondary_font TEXT NOT NULL DEFAULT 'Inter',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view brand assets of their clients"
  ON public.brand_assets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = brand_assets.client_id AND clients.user_id = auth.uid()));

CREATE POLICY "Users can create brand assets for their clients"
  ON public.brand_assets FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = brand_assets.client_id AND clients.user_id = auth.uid()));

CREATE POLICY "Users can update brand assets of their clients"
  ON public.brand_assets FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = brand_assets.client_id AND clients.user_id = auth.uid()));

CREATE POLICY "Users can delete brand assets of their clients"
  ON public.brand_assets FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = brand_assets.client_id AND clients.user_id = auth.uid()));

-- Prompt templates table
CREATE TABLE public.prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_predefined BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view predefined and their own prompts"
  ON public.prompt_templates FOR SELECT
  USING (is_predefined = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own prompts"
  ON public.prompt_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON public.prompt_templates FOR UPDATE
  USING (auth.uid() = user_id AND is_predefined = false);

CREATE POLICY "Users can delete their own prompts"
  ON public.prompt_templates FOR DELETE
  USING (auth.uid() = user_id AND is_predefined = false);

-- Generated images table
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL DEFAULT '1:1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated images"
  ON public.generated_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generated images"
  ON public.generated_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated images"
  ON public.generated_images FOR DELETE
  USING (auth.uid() = user_id);
