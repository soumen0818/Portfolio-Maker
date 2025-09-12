-- Create github_data table for caching GitHub API responses
CREATE TABLE IF NOT EXISTS public.github_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  github_username TEXT NOT NULL,
  pinned_repos JSONB, -- Store pinned repository data
  contribution_data JSONB, -- Store contribution graph data
  profile_data JSONB, -- Store GitHub profile information
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.github_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "github_data_select_own" ON public.github_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "github_data_insert_own" ON public.github_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "github_data_update_own" ON public.github_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "github_data_delete_own" ON public.github_data FOR DELETE USING (auth.uid() = user_id);

-- Create unique constraint to ensure one record per user
CREATE UNIQUE INDEX IF NOT EXISTS github_data_user_unique 
ON public.github_data(user_id);
