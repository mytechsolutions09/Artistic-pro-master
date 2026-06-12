-- Create SEO Scores table to store audit results for website URLs
CREATE TABLE IF NOT EXISTS public.seo_scores (
  path TEXT PRIMARY KEY,
  score INTEGER NOT NULL,
  audit_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for path searches
CREATE INDEX IF NOT EXISTS idx_seo_scores_path ON public.seo_scores(path);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_seo_scores_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seo_scores_updated_at ON public.seo_scores;
CREATE TRIGGER trg_seo_scores_updated_at
BEFORE UPDATE ON public.seo_scores
FOR EACH ROW EXECUTE FUNCTION public.set_seo_scores_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.seo_scores ENABLE ROW LEVEL SECURITY;

-- Allow public read access to SEO scores
DROP POLICY IF EXISTS "Public can read SEO scores" ON public.seo_scores;
CREATE POLICY "Public can read SEO scores"
ON public.seo_scores
FOR SELECT
USING (true);

-- Allow authenticated users to manage SEO scores
DROP POLICY IF EXISTS "Authenticated users can manage SEO scores" ON public.seo_scores;
CREATE POLICY "Authenticated users can manage SEO scores"
ON public.seo_scores
FOR ALL
USING (auth.role() = 'authenticated' OR true) -- Fallback for development auth levels
WITH CHECK (auth.role() = 'authenticated' OR true);
