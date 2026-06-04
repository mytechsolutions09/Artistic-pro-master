# Supabase Storage Setup for Image Uploads

## Prerequisites
- Supabase project created
- Supabase client configured in your app

## Required Storage Buckets

### 1. Product Images Bucket
- **Name**: `product-images` (or set `VITE_PRODUCT_IMAGES_BUCKET` env var)
- **Purpose**: Store product images
- **Settings**:
  - Public bucket: `true`
  - File size limit: `10MB`
  - Allowed MIME types: `image/png`, `image/jpeg`, `image/jpg`, `image/gif`, `image/webp`

### 2. Category Images Bucket
- **Name**: `category-images` (or set `VITE_CATEGORY_IMAGES_BUCKET` env var)
- **Purpose**: Store category/collection images
- **Settings**: Same as product images

### 3. User Avatars Bucket
- **Name**: `user-avatars` (or set `VITE_USER_AVATARS_BUCKET` env var)
- **Purpose**: Store user profile pictures
- **Settings**: Same as product images

## Setup Steps

### 1. Create Buckets in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Storage → Buckets
3. Click "Create a new bucket"
4. Enter bucket name (e.g., `product-images`)
5. Set "Public bucket" to `true`
6. Click "Create bucket"

### 2. Configure Bucket Policies
For each bucket, you need to set up Row Level Security (RLS) policies:

#### Product Images Policy
```sql
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
```

### 3. Environment Variables
Add these to your `.env` file:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PRODUCT_IMAGES_BUCKET=product-images
VITE_CATEGORY_IMAGES_BUCKET=category-images
VITE_USER_AVATARS_BUCKET=user-avatars
```

## Troubleshooting

### Common Issues

1. **"Bucket not found" error**
   - Ensure the bucket name matches exactly
   - Check if the bucket exists in your Supabase dashboard
   - Verify bucket permissions

2. **"Permission denied" error**
   - Check RLS policies are correctly configured
   - Ensure user is authenticated
   - Verify bucket is set to public

3. **"File too large" error**
   - Check file size limit in bucket settings
   - Default limit is 10MB

4. **"Invalid file type" error**
   - Check allowed MIME types in bucket settings
   - Supported formats: PNG, JPEG, JPG, GIF, WebP

### Testing Upload
1. Create a product with images
2. Check browser console for any errors
3. Verify images appear in Supabase storage
4. Check if public URLs are accessible

## Security Considerations

- **Public buckets**: Images are publicly accessible
- **File validation**: Server-side validation is implemented
- **Size limits**: 10MB per file to prevent abuse
- **Type restrictions**: Only image files allowed
- **User authentication**: Uploads require user authentication
