-- =====================================================
-- SUPABASE STORAGE SETUP - COMPLETE VERSION
-- Includes buckets for category images, product images, main images, and PDFs
-- =====================================================

-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'category-images',
    'category-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for product gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for main product images (for emails and profiles)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'main-images',
    'main-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for product PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-pdfs',
    'product-pdfs',
    true,
    52428800, -- 50MB limit for PDFs
    ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by default in Supabase

-- =====================================================
-- CLEANUP EXISTING POLICIES (SAFE TO RUN MULTIPLE TIMES)
-- =====================================================

-- Drop all existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access to category images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update category images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete category images" ON storage.objects;

DROP POLICY IF EXISTS "Public read access to product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

DROP POLICY IF EXISTS "Public read access to main images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload main images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update main images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete main images" ON storage.objects;

DROP POLICY IF EXISTS "Public read access to product PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product PDFs" ON storage.objects;

-- =====================================================
-- STORAGE POLICIES FOR CATEGORY IMAGES
-- =====================================================

-- Create policy for public read access to category images
CREATE POLICY "Public read access to category images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'category-images'
    );

-- Create policy for authenticated users to upload category images
CREATE POLICY "Authenticated users can upload category images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'category-images' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update category images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'category-images' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete category images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'category-images' AND 
        auth.uid() IS NOT NULL
    );

-- =====================================================
-- STORAGE POLICIES FOR PRODUCT IMAGES
-- =====================================================

-- Create policy for public read access to product images
CREATE POLICY "Public read access to product images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'product-images'
    );

-- Create policy for authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND 
        auth.uid() IS NOT NULL
    );

-- =====================================================
-- STORAGE POLICIES FOR MAIN IMAGES
-- =====================================================

-- Create policy for public read access to main images
CREATE POLICY "Public read access to main images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'main-images'
    );

-- Create policy for authenticated users to upload main images
CREATE POLICY "Authenticated users can upload main images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'main-images' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update main images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'main-images' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete main images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'main-images' AND 
        auth.uid() IS NOT NULL
    );

-- =====================================================
-- STORAGE POLICIES FOR PRODUCT PDFS
-- =====================================================

-- Create policy for public read access to product PDFs
CREATE POLICY "Public read access to product PDFs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'product-pdfs'
    );

-- Create policy for authenticated users to upload product PDFs
CREATE POLICY "Authenticated users can upload product PDFs" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-pdfs' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for authenticated users to update their uploaded PDFs
CREATE POLICY "Authenticated users can update product PDFs" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-pdfs' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for authenticated users to delete their uploaded PDFs
CREATE POLICY "Authenticated users can delete product PDFs" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-pdfs' AND 
        auth.uid() IS NOT NULL
    );

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ 
BEGIN 
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Storage setup completed successfully!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Created buckets:';
    RAISE NOTICE '  - category-images (10MB limit, images only)';
    RAISE NOTICE '  - product-images (10MB limit, images only)';
    RAISE NOTICE '  - main-images (10MB limit, images only)';
    RAISE NOTICE '  - product-pdfs (50MB limit, PDFs only)';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Policies created for:';
    RAISE NOTICE '  - Public read access to all buckets';
    RAISE NOTICE '  - Authenticated upload/update/delete for all buckets';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Allowed file types:';
    RAISE NOTICE '  - Images: JPEG, PNG, WebP, GIF';
    RAISE NOTICE '  - PDFs: application/pdf';
    RAISE NOTICE '=====================================================';
END $$;
