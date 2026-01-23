# Manual Storage RLS Fix Guide

Since you're getting permission errors when running SQL scripts, here's how to fix the storage RLS policies manually through the Supabase Dashboard:

## Step 1: Create Storage Buckets

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** for each bucket below:

### Bucket 1: homepage-hero-images
- **Name**: `homepage-hero-images`
- **Public bucket**: ✅ **Enable** (check this box)
- **File size limit**: `10485760` (10MB)
- **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`

### Bucket 2: homepage-slider-images
- **Name**: `homepage-slider-images`
- **Public bucket**: ✅ **Enable** (check this box)
- **File size limit**: `10485760` (10MB)
- **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`

### Bucket 3: homepage-featured-grid
- **Name**: `homepage-featured-grid`
- **Public bucket**: ✅ **Enable** (check this box)
- **File size limit**: `10485760` (10MB)
- **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`

### Bucket 4: homepage-categories-images
- **Name**: `homepage-categories-images`
- **Public bucket**: ✅ **Enable** (check this box)
- **File size limit**: `10485760` (10MB)
- **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`

### Bucket 5: homepage-trending-images
- **Name**: `homepage-trending-images`
- **Public bucket**: ✅ **Enable** (check this box)
- **File size limit**: `10485760` (10MB)
- **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`

## Step 2: Fix Storage Policies

1. Go to **Storage** > **Policies**
2. You should see a list of existing policies
3. **Delete all existing policies** that might be causing conflicts:
   - Look for any policies related to homepage buckets
   - Click the trash icon to delete them

4. **Create new permissive policies**:

### Policy 1: Public Read Access
- Click **"New Policy"**
- **Policy name**: `Public read access to all storage`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**: `true`

### Policy 2: Authenticated Upload Access
- Click **"New Policy"**
- **Policy name**: `Authenticated users can upload`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **WITH CHECK expression**: `true`

### Policy 3: Authenticated Update Access
- Click **"New Policy"**
- **Policy name**: `Authenticated users can update`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `true`

### Policy 4: Authenticated Delete Access
- Click **"New Policy"**
- **Policy name**: `Authenticated users can delete`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `true`

## Step 3: Alternative Quick Fix

If the above doesn't work, try this simpler approach:

1. Go to **Storage** > **Policies**
2. **Delete ALL existing policies**
3. **Disable RLS temporarily**:
   - Go to **Table Editor**
   - Find `storage.objects` table
   - Go to **RLS** tab
   - Toggle **"Enable RLS"** to **OFF**
   - Click **Save**

4. **Test your uploads** - they should work now
5. **Re-enable RLS** and create the simple policies above

## Step 4: Verify the Fix

1. Go back to your application
2. Try uploading an image in the Homepage Management section
3. The upload should now work without RLS policy violations

## Troubleshooting

If you're still getting errors:

1. **Check your authentication**: Make sure you're logged in as an authenticated user
2. **Clear browser cache**: Sometimes cached policies cause issues
3. **Check bucket names**: Ensure the bucket names match exactly what's in your code
4. **Verify file types**: Make sure you're uploading allowed file types

## Quick Test

After making these changes, you can test by:
1. Going to your admin panel
2. Navigating to Homepage Management
3. Trying to upload an image
4. The upload should succeed without any RLS errors

---

**Note**: The permissive policies above allow any authenticated user to upload to any bucket. This is fine for development but you may want to restrict this in production.
