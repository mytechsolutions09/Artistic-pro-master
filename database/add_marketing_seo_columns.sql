-- Create/upgrade marketing_settings for SEO support.
-- Safe to run multiple times.

-- 1) Ensure table exists (minimal schema required by app)
CREATE TABLE IF NOT EXISTS public.marketing_settings (
  id UUID PRIMARY KEY DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  meta_pixel_id TEXT,
  meta_pixel_enabled BOOLEAN DEFAULT true,
  google_analytics_id TEXT,
  google_analytics_enabled BOOLEAN DEFAULT false,
  google_tag_manager_id TEXT,
  google_tag_manager_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row_only CHECK (id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid)
);

-- 2) Add SEO columns (idempotent)
ALTER TABLE public.marketing_settings
  ADD COLUMN IF NOT EXISTS page_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT;

-- 3) Ensure fixed single row exists
INSERT INTO public.marketing_settings (id)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid)
ON CONFLICT (id) DO NOTHING;

-- 4) Seed defaults only when null
UPDATE public.marketing_settings
SET
  page_title = COALESCE(page_title, 'Lurevi | Premium Digital Art & Prints'),
  meta_description = COALESCE(meta_description, 'Discover curated digital artworks, premium prints, and exclusive collections at Lurevi.'),
  meta_keywords = COALESCE(meta_keywords, 'digital art, wall art, prints, online gallery, modern art'),
  og_image = COALESCE(og_image, '/logo.png'),
  updated_at = NOW()
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;

-- 5) Verify
SELECT id, page_title, meta_description, meta_keywords, og_image
FROM public.marketing_settings
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
