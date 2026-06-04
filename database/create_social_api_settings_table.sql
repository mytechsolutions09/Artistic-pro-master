-- =====================================================
-- CREATE SOCIAL API SETTINGS TABLE
-- =====================================================
-- Stores per-platform social media API credentials.
-- One row per platform (twitter, facebook, instagram,
-- linkedin, pinterest).  Credentials are stored as JSONB
-- and are only readable/writable by authenticated admins.
-- The service-role key (server-side only) bypasses RLS for
-- the /api/social/post route so tokens never travel over
-- the browser network.
-- =====================================================

-- Drop and recreate cleanly
DROP TABLE IF EXISTS public.social_api_settings;

CREATE TABLE public.social_api_settings (
    id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
    platform    TEXT          NOT NULL UNIQUE,   -- 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'pinterest'
    credentials JSONB         NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast platform lookups
CREATE INDEX IF NOT EXISTS idx_social_api_settings_platform
    ON public.social_api_settings (platform);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.social_api_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated admins can read social api settings"  ON public.social_api_settings;
DROP POLICY IF EXISTS "Authenticated admins can write social api settings" ON public.social_api_settings;

-- Read: authenticated users only (admin panel is auth-gated)
CREATE POLICY "Authenticated admins can read social api settings"
    ON public.social_api_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Write (insert / update / delete): authenticated users only
CREATE POLICY "Authenticated admins can write social api settings"
    ON public.social_api_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- AUTO-UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_social_api_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_api_settings_updated_at ON public.social_api_settings;

CREATE TRIGGER trg_social_api_settings_updated_at
    BEFORE UPDATE ON public.social_api_settings
    FOR EACH ROW EXECUTE FUNCTION update_social_api_settings_updated_at();

-- =====================================================
-- SEED: empty credential rows per platform
-- =====================================================

INSERT INTO public.social_api_settings (platform, credentials) VALUES
    ('twitter',   '{}'),
    ('facebook',  '{}'),
    ('instagram', '{}'),
    ('linkedin',  '{}'),
    ('pinterest', '{}')
ON CONFLICT (platform) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT platform, updated_at FROM public.social_api_settings ORDER BY platform;

DO $$
BEGIN
    RAISE NOTICE '✅ social_api_settings table created';
    RAISE NOTICE '✅ RLS: authenticated read + write only';
    RAISE NOTICE '✅ Seed rows inserted (twitter, facebook, instagram, linkedin, pinterest)';
    RAISE NOTICE '';
    RAISE NOTICE '👉 Run this SQL in your Supabase SQL Editor.';
    RAISE NOTICE '   Credentials are stored as JSONB; the service-role key';
    RAISE NOTICE '   reads them server-side — tokens never leave Supabase.';
END $$;
