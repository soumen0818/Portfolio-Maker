-- Create all missing tables for the portfolio generator

-- Create tech_stacks table
CREATE TABLE IF NOT EXISTS public.tech_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- frontend, backend, database, tools, etc.
  proficiency_level INTEGER DEFAULT 3 CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  github_url TEXT,
  live_url TEXT,
  image_url TEXT,
  tech_stack TEXT[], -- Array of technology names
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_details table
CREATE TABLE IF NOT EXISTS public.contact_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  custom_domain TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.tech_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tech_stacks
CREATE POLICY "tech_stacks_select_own" ON public.tech_stacks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tech_stacks_insert_own" ON public.tech_stacks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tech_stacks_update_own" ON public.tech_stacks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tech_stacks_delete_own" ON public.tech_stacks FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for contact_details
CREATE POLICY "contact_details_select_own" ON public.contact_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contact_details_insert_own" ON public.contact_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contact_details_update_own" ON public.contact_details FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contact_details_delete_own" ON public.contact_details FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for portfolios
CREATE POLICY "portfolios_select_own" ON public.portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "portfolios_insert_own" ON public.portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portfolios_update_own" ON public.portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "portfolios_delete_own" ON public.portfolios FOR DELETE USING (auth.uid() = user_id);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS contact_details_user_unique ON public.contact_details(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS portfolios_slug_unique ON public.portfolios(slug);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tech_stacks_user_id_idx ON public.tech_stacks(user_id);
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON public.projects(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS portfolios_user_id_idx ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS portfolios_published_idx ON public.portfolios(is_published) WHERE is_published = true;
