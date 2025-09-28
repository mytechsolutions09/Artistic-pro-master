# Homepage Image Buckets Setup Guide

This guide explains how to set up the required Supabase storage buckets for homepage image uploads.

## Overview

The homepage admin panel requires dedicated storage buckets for different types of images used in various homepage sections. Each bucket is optimized for its specific use case with appropriate file size limits and security policies.

## Required Buckets

### 1. Homepage Hero Images (`homepage-hero-images`)
- **Purpose**: Store images for hero section cards (main, featured, categories)
- **File Size Limit**: 10MB
- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Folder Structure**: `hero/{imageType}_{timestamp}.{ext}`

### 2. Homepage Slider Images (`homepage-slider-images`)
- **Purpose**: Store images for the image slider section
- **File Size Limit**: 10MB
- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Folder Structure**: `slider/slide_{slideId}_{timestamp}.{ext}`

### 3. Homepage Featured Grid (`homepage-featured-grid`)
- **Purpose**: Store images for featured grid items
- **File Size Limit**: 10MB
- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Folder Structure**: `featured/item_{itemId}_{timestamp}.{ext}`

### 4. Homepage Categories Images (`homepage-categories-images`)
- **Purpose**: Store images for category cards
- **File Size Limit**: 10MB
- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Folder Structure**: `categories/category_{categoryId}_{timestamp}.{ext}`

### 5. Homepage Trending Images (`homepage-trending-images`)
- **Purpose**: Store images for trending collections
- **File Size Limit**: 10MB
- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Folder Structure**: `trending/collection_{collectionId}_{timestamp}.{ext}`

## Setup Instructions

### Step 1: Run the SQL Script

Execute the provided SQL script in your Supabase SQL editor:

```sql
-- Run this script in Supabase SQL Editor
\i setup_homepage_image_buckets.sql
```

### Step 2: Verify Bucket Creation

After running the script, verify that all buckets were created successfully:

```sql
-- Check if buckets exist
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN (
    'homepage-hero-images',
    'homepage-slider-images', 
    'homepage-featured-grid',
    'homepage-categories-images',
    'homepage-trending-images'
);
```

### Step 3: Verify Security Policies

Check that all security policies were created:

```sql
-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%homepage%'
ORDER BY policyname;
```

## Security Policies

Each bucket has the following security policies:

### Public Read Access
- **Who**: Everyone (public)
- **What**: Can view all images in the bucket
- **Purpose**: Images are publicly accessible for display on the homepage

### Authenticated Upload
- **Who**: Authenticated users only
- **What**: Can upload images to the bucket
- **Validation**: File size, type, and user permissions checked

### Authenticated Update
- **Who**: Authenticated users
- **What**: Can update images in the bucket
- **Restriction**: Only authenticated users can modify images

### Authenticated Delete
- **Who**: Authenticated users
- **What**: Can delete images from the bucket
- **Restriction**: Only authenticated users can delete images

## Usage in Code

### Uploading Images

The `ImageUploadService` provides dedicated methods for each bucket:

```typescript
// Upload hero section image
const result = await ImageUploadService.uploadHomepageHeroImage(
  file, 
  'featured' // or 'main' or 'categories'
);

// Upload slider image
const result = await ImageUploadService.uploadHomepageSliderImage(
  file, 
  'slide-1'
);

// Upload featured grid image
const result = await ImageUploadService.uploadHomepageFeaturedGridImage(
  file, 
  'item-1'
);

// Upload categories image
const result = await ImageUploadService.uploadHomepageCategoriesImage(
  file, 
  'category-1'
);

// Upload trending collections image
const result = await ImageUploadService.uploadHomepageTrendingImage(
  file, 
  'collection-1'
);
```

### Getting Public URLs

```typescript
// Get public URL for any uploaded image
const publicUrl = supabase.storage
  .from('homepage-hero-images')
  .getPublicUrl('hero/featured_1234567890.jpg')
  .data.publicUrl;
```

## File Organization

Images are organized in folders within each bucket:

```
homepage-hero-images/
├── hero/
│   ├── main_1234567890.jpg
│   ├── featured_1234567891.png
│   └── categories_1234567892.webp

homepage-slider-images/
├── slider/
│   ├── slide_1_1234567890.jpg
│   ├── slide_2_1234567891.png
│   └── slide_3_1234567892.webp

homepage-featured-grid/
├── featured/
│   ├── item_1_1234567890.jpg
│   └── item_2_1234567891.png

homepage-categories-images/
├── categories/
│   ├── category_1_1234567890.jpg
│   └── category_2_1234567891.png

homepage-trending-images/
├── trending/
│   ├── collection_1_1234567890.jpg
│   └── collection_2_1234567891.png
```

## Troubleshooting

### Common Issues

1. **Bucket not found**: Ensure the SQL script ran successfully
2. **Upload permission denied**: Check that the user is authenticated
3. **File too large**: Ensure file is under 10MB limit
4. **Invalid file type**: Only JPEG, PNG, WebP, and GIF are allowed

### Verification Commands

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'homepage-hero-images';

-- Check policies exist
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%homepage%';

-- Test upload (run in browser console)
const { data, error } = await supabase.storage
  .from('homepage-hero-images')
  .upload('test/test.jpg', new File(['test'], 'test.jpg'));
```

## Integration with Homepage Admin

The homepage admin panel automatically uses these buckets when users upload images. The upload functionality is integrated into:

- Hero section image uploads
- Image slider uploads
- Featured grid image uploads
- Categories image uploads
- Trending collections image uploads

All uploads are handled automatically by the `ImageUploadService` with proper error handling and user feedback.
