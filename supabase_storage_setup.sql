-- Supabase Storage Setup for Category Images
-- This script sets up storage buckets and policies for image uploads

-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'category-images',
    'category-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to category images
CREATE POLICY "Public read access to category images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'category-images' AND 
        (storage.foldername(name))[1] = 'public'
    );

-- Create policy for authenticated users to upload category images
CREATE POLICY "Authenticated users can upload category images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'category-images' AND 
        auth.uid() IS NOT NULL AND
        (storage.foldername(name))[1] = 'public'
    );

-- Create policy for authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update category images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'category-images' AND 
        auth.uid() IS NOT NULL AND
        (storage.foldername(name))[1] = 'public'
    );

-- Create policy for authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete category images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'category-images' AND 
        auth.uid() IS NOT NULL AND
        (storage.foldername(name))[1] = 'public'
    );

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Display success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Storage setup completed successfully!';
    RAISE NOTICE 'Created bucket: category-images';
    RAISE NOTICE 'File size limit: 5MB';
    RAISE NOTICE 'Allowed types: JPEG, PNG, WebP, GIF';
END $$;
