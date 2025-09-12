-- Create contact_details table for storing user's social media and contact information
CREATE TABLE IF NOT EXISTS public.contact_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  linkedin_url TEXT,
  github_url TEXT,
  email TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.contact_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "contact_details_select_own" ON public.contact_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contact_details_insert_own" ON public.contact_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contact_details_update_own" ON public.contact_details FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contact_details_delete_own" ON public.contact_details FOR DELETE USING (auth.uid() = user_id);
