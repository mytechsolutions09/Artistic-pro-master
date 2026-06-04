-- Supabase Storage Policies for Image Uploads
-- Run this script in your Supabase SQL editor

-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Product Images Bucket Policies
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow public read access to product images
CREATE POLICY "Allow public read access to product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated users to delete product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Category Images Bucket Policies
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload category images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'category-images' AND auth.role() = 'authenticated');

-- Allow public read access to category images
CREATE POLICY "Allow public read access to category images" ON storage.objects
FOR SELECT USING (bucket_id = 'category-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update category images" ON storage.objects
FOR UPDATE USING (bucket_id = 'category-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated users to delete category images" ON storage.objects
FOR DELETE USING (bucket_id = 'category-images' AND auth.role() = 'authenticated');

-- User Avatars Bucket Policies
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

-- Allow public read access to user avatars
CREATE POLICY "Allow public read access to user avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

-- Allow authenticated users to update their own avatar
CREATE POLICY "Allow authenticated users to update avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Allow authenticated users to delete avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

-- Note: If you want to restrict users to only manage their own images,
-- you can add additional policies based on the file path structure.
-- For example, if you store user avatars as 'user-avatars/{user_id}/avatar.jpg',
-- you can add a policy like:
-- CREATE POLICY "Users can only manage their own avatars" ON storage.objects
-- FOR ALL USING (bucket_id = 'user-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
