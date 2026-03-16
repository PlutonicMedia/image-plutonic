
-- Customers table (replaces clients for new agency hierarchy)
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers" ON public.customers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers WHERE customers.id = projects.customer_id AND customers.user_id = auth.uid()));
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers WHERE customers.id = projects.customer_id AND customers.user_id = auth.uid()));
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers WHERE customers.id = projects.customer_id AND customers.user_id = auth.uid()));
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers WHERE customers.id = projects.customer_id AND customers.user_id = auth.uid()));

-- Generations table
CREATE TABLE public.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  params jsonb,
  output_url text,
  ad_copy jsonb,
  is_grid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations" ON public.generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own generations" ON public.generations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generations" ON public.generations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own generations" ON public.generations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Coming Soon: saved_models
CREATE TABLE public.saved_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved_models" ON public.saved_models FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own saved_models" ON public.saved_models FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved_models" ON public.saved_models FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Coming Soon: brand_presets
CREATE TABLE public.brand_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  preset_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand_presets" ON public.brand_presets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers WHERE customers.id = brand_presets.customer_id AND customers.user_id = auth.uid()));
CREATE POLICY "Users can create own brand_presets" ON public.brand_presets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers WHERE customers.id = brand_presets.customer_id AND customers.user_id = auth.uid()));
CREATE POLICY "Users can delete own brand_presets" ON public.brand_presets FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers WHERE customers.id = brand_presets.customer_id AND customers.user_id = auth.uid()));
