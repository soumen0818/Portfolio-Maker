-- Create tech_stacks table for storing user's technology skills
CREATE TABLE IF NOT EXISTS public.tech_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  technology TEXT NOT NULL,
  category TEXT, -- frontend, backend, database, tools, etc.
  proficiency_level TEXT DEFAULT 'intermediate', -- beginner, intermediate, advanced
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.tech_stacks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "tech_stacks_select_own" ON public.tech_stacks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tech_stacks_insert_own" ON public.tech_stacks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tech_stacks_update_own" ON public.tech_stacks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tech_stacks_delete_own" ON public.tech_stacks FOR DELETE USING (auth.uid() = user_id);
