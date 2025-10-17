-- =====================================================
-- HOMEPAGE IMAGE BUCKETS SETUP
-- Creates dedicated storage buckets for homepage sections
-- =====================================================

-- Create storage bucket for homepage hero section images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homepage-hero-images',
    'homepage-hero-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for homepage image slider
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homepage-slider-images',
    'homepage-slider-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for homepage featured grid images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homepage-featured-grid',
    'homepage-featured-grid',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for homepage categories images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homepage-categories-images',
    'homepage-categories-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for homepage trending collections images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'homepage-trending-images',
    'homepage-trending-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- CLEANUP EXISTING POLICIES (SAFE TO RUN MULTIPLE TIMES)
-- =====================================================

-- Drop existing homepage storage policies to avoid conflicts
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
-- ROW LEVEL SECURITY POLICIES FOR HOMEPAGE HERO IMAGES
-- =====================================================

-- Allow public read access to homepage hero images
CREATE POLICY "Public read access to homepage hero images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-hero-images');

-- Allow authenticated users to upload homepage hero images
CREATE POLICY "Authenticated users can upload homepage hero images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'homepage-hero-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update homepage hero images
CREATE POLICY "Authenticated users can update homepage hero images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'homepage-hero-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete homepage hero images
CREATE POLICY "Authenticated users can delete homepage hero images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'homepage-hero-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES FOR HOMEPAGE SLIDER IMAGES
-- =====================================================

-- Allow public read access to homepage slider images
CREATE POLICY "Public read access to homepage slider images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-slider-images');

-- Allow authenticated users to upload homepage slider images
CREATE POLICY "Authenticated users can upload homepage slider images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'homepage-slider-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update homepage slider images
CREATE POLICY "Authenticated users can update homepage slider images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'homepage-slider-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete homepage slider images
CREATE POLICY "Authenticated users can delete homepage slider images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'homepage-slider-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES FOR HOMEPAGE FEATURED GRID IMAGES
-- =====================================================

-- Allow public read access to homepage featured grid images
CREATE POLICY "Public read access to homepage featured grid images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-featured-grid');

-- Allow authenticated users to upload homepage featured grid images
CREATE POLICY "Authenticated users can upload homepage featured grid images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'homepage-featured-grid' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update homepage featured grid images
CREATE POLICY "Authenticated users can update homepage featured grid images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'homepage-featured-grid' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete homepage featured grid images
CREATE POLICY "Authenticated users can delete homepage featured grid images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'homepage-featured-grid' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES FOR HOMEPAGE CATEGORIES IMAGES
-- =====================================================

-- Allow public read access to homepage categories images
CREATE POLICY "Public read access to homepage categories images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-categories-images');

-- Allow authenticated users to upload homepage categories images
CREATE POLICY "Authenticated users can upload homepage categories images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'homepage-categories-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update homepage categories images
CREATE POLICY "Authenticated users can update homepage categories images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'homepage-categories-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete homepage categories images
CREATE POLICY "Authenticated users can delete homepage categories images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'homepage-categories-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES FOR HOMEPAGE TRENDING IMAGES
-- =====================================================

-- Allow public read access to homepage trending images
CREATE POLICY "Public read access to homepage trending images" ON storage.objects
FOR SELECT USING (bucket_id = 'homepage-trending-images');

-- Allow authenticated users to upload homepage trending images
CREATE POLICY "Authenticated users can upload homepage trending images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'homepage-trending-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update homepage trending images
CREATE POLICY "Authenticated users can update homepage trending images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'homepage-trending-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete homepage trending images
CREATE POLICY "Authenticated users can delete homepage trending images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'homepage-trending-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify buckets were created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN (
    'homepage-hero-images',
    'homepage-slider-images', 
    'homepage-featured-grid',
    'homepage-categories-images',
    'homepage-trending-images'
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%homepage%'
ORDER BY policyname;
