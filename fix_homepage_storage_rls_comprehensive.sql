-- =====================================================
-- COMPREHENSIVE FIX FOR HOMEPAGE STORAGE RLS POLICIES
-- This script fixes all RLS policy violations for homepage image uploads
-- =====================================================

-- First, ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP ALL EXISTING HOMEPAGE POLICIES TO AVOID CONFLICTS
-- =====================================================

-- Drop all existing homepage-related policies
DROP POLICY IF EXISTS "Public read access to homepage hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload homepage hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update homepage hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete homepage hero images" ON storage.objects;

DROP POLICY IF EXISTS "Public read access to homepage slider images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload homepage slider images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update homepage slider images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete homepage slider images" ON storage.objects;

DROP POLICY IF EXISTS "Public read access to homepage featured grid images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload homepage featured grid images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update homepage featured grid images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete homepage featured grid images" ON storage.objects;

DROP POLICY IF EXISTS "Public read access to homepage categories images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload homepage categories images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update homepage categories images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete homepage categories images" ON storage.objects;

DROP POLICY IF EXISTS "Public read access to homepage trending images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload homepage trending images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update homepage trending images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete homepage trending images" ON storage.objects;

-- =====================================================
-- CREATE/UPDATE STORAGE BUCKETS
-- =====================================================

-- Create or update homepage-hero-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homepage-hero-images',
    'homepage-hero-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create or update homepage-slider-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homepage-slider-images',
    'homepage-slider-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create or update homepage-featured-grid bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homepage-featured-grid',
    'homepage-featured-grid',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create or update homepage-categories-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homepage-categories-images',
    'homepage-categories-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Create or update homepage-trending-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homepage-trending-images',
    'homepage-trending-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- =====================================================
-- CREATE COMPREHENSIVE RLS POLICIES FOR HOMEPAGE HERO IMAGES
-- =====================================================

-- Public read access to homepage hero images
CREATE POLICY "Public read access to homepage hero images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-hero-images');

-- Authenticated users can upload homepage hero images
CREATE POLICY "Authenticated users can upload homepage hero images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'homepage-hero-images' 
    AND auth.role() = 'authenticated'
);

-- Authenticated users can update homepage hero images
CREATE POLICY "Authenticated users can update homepage hero images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'homepage-hero-images' 
    AND auth.role() = 'authenticated'
);

-- Authenticated users can delete homepage hero images
CREATE POLICY "Authenticated users can delete homepage hero images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'homepage-hero-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- CREATE COMPREHENSIVE RLS POLICIES FOR HOMEPAGE SLIDER IMAGES
-- =====================================================

-- Public read access to homepage slider images
CREATE POLICY "Public read access to homepage slider images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-slider-images');

-- Authenticated users can upload homepage slider images
CREATE POLICY "Authenticated users can upload homepage slider images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'homepage-slider-images' 
    AND auth.role() = 'authenticated'
);

-- Authenticated users can update homepage slider images
CREATE POLICY "Authenticated users can update homepage slider images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'homepage-slider-images' 
    AND auth.role() = 'authenticated'
);

-- Authenticated users can delete homepage slider images
CREATE POLICY "Authenticated users can delete homepage slider images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'homepage-slider-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- CREATE COMPREHENSIVE RLS POLICIES FOR HOMEPAGE FEATURED GRID IMAGES
-- =====================================================

-- Public read access to homepage featured grid images
CREATE POLICY "Public read access to homepage featured grid images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-featured-grid');

-- Authenticated users can upload homepage featured grid images
CREATE POLICY "Authenticated users can upload homepage featured grid images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'homepage-featured-grid' 
    AND auth.role() = 'authenticated'
);

-- Authenticated users can update homepage featured grid images
CREATE POLICY "Authenticated users can update homepage featured grid images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'homepage-featured-grid' 
    AND auth.role() = 'authenticated'
);

-- Authenticated users can delete homepage featured grid images
CREATE POLICY "Authenticated users can delete homepage featured grid images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'homepage-featured-grid' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- CREATE COMPREHENSIVE RLS POLICIES FOR HOMEPAGE CATEGORIES IMAGES
-- =====================================================

-- Public read access to homepage categories images
CREATE POLICY "Public read access to homepage categories images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-categories-images');

-- Authenticated users can upload homepage categories images
CREATE POLICY "Authenticated users can upload homepage categories images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'homepage-categories-images' 
    AND auth.role() = 'authenticated'
);

-- Authenticated users can update homepage categories images
CREATE POLICY "Authenticated users can update homepage categories images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'homepage-categories-images' 
    AND auth.role() = 'authenticated'
);

-- Authenticated users can delete homepage categories images
CREATE POLICY "Authenticated users can delete homepage categories images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'homepage-categories-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- CREATE COMPREHENSIVE RLS POLICIES FOR HOMEPAGE TRENDING IMAGES
-- =====================================================

-- Public read access to homepage trending images
CREATE POLICY "Public read access to homepage trending images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-trending-images');

-- Authenticated users can upload homepage trending images
CREATE POLICY "Authenticated users can upload homepage trending images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'homepage-trending-images' 
    AND auth.role() = 'authenticated'
);

-- Authenticated users can update homepage trending images
CREATE POLICY "Authenticated users can update homepage trending images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'homepage-trending-images' 
    AND auth.role() = 'authenticated'
);

-- Authenticated users can delete homepage trending images
CREATE POLICY "Authenticated users can delete homepage trending images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'homepage-trending-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- ADDITIONAL SAFETY: SERVICE ROLE POLICIES
-- =====================================================

-- Service role can manage all homepage hero images (for admin operations)
CREATE POLICY "Service role can manage all homepage hero images" ON storage.objects
FOR ALL TO service_role
USING (bucket_id = 'homepage-hero-images');

-- Service role can manage all homepage slider images
CREATE POLICY "Service role can manage all homepage slider images" ON storage.objects
FOR ALL TO service_role
USING (bucket_id = 'homepage-slider-images');

-- Service role can manage all homepage featured grid images
CREATE POLICY "Service role can manage all homepage featured grid images" ON storage.objects
FOR ALL TO service_role
USING (bucket_id = 'homepage-featured-grid');

-- Service role can manage all homepage categories images
CREATE POLICY "Service role can manage all homepage categories images" ON storage.objects
FOR ALL TO service_role
USING (bucket_id = 'homepage-categories-images');

-- Service role can manage all homepage trending images
CREATE POLICY "Service role can manage all homepage trending images" ON storage.objects
FOR ALL TO service_role
USING (bucket_id = 'homepage-trending-images');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify buckets were created/updated
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN (
    'homepage-hero-images',
    'homepage-slider-images', 
    'homepage-featured-grid',
    'homepage-categories-images',
    'homepage-trending-images'
)
ORDER BY id;

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%homepage%'
ORDER BY policyname;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';
