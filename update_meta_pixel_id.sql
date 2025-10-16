-- =====================================================
-- UPDATE META PIXEL ID
-- =====================================================
-- Updates the Meta Pixel ID to your new pixel
-- Run this in Supabase SQL Editor
-- =====================================================

-- Update the Meta Pixel ID
UPDATE public.marketing_settings
SET 
    meta_pixel_id = '1905415970060955',
    updated_at = NOW()
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;

-- Verify the update
SELECT 
    meta_pixel_id,
    meta_pixel_enabled,
    updated_at
FROM public.marketing_settings;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Meta Pixel ID updated to: 1905415970060955';
    RAISE NOTICE '✅ Pixel is enabled and ready to track';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Next steps:';
    RAISE NOTICE '1. Refresh your website';
    RAISE NOTICE '2. Check Meta Events Manager';
    RAISE NOTICE '3. Verify events are tracking';
END $$;

