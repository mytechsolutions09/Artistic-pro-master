# Manual Supabase Storage Setup Guide

If you're getting permission errors when running the SQL scripts, you'll need to set up the storage bucket and policies manually through the Supabase dashboard.

## Step 1: Create the Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `review-images`
   - **Public bucket**: ✅ **Enable** (check this box)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: 
     ```
     image/jpeg,image/png,image/gif,image/webp,image/svg+xml
     ```
5. Click **"Create bucket"**

## Step 2: Enable Row Level Security (RLS)

1. In the Supabase dashboard, go to **Table Editor**
2. Find the `storage.objects` table
3. Click on the table name
4. Go to the **"RLS"** tab
5. Toggle **"Enable RLS"** to ON
6. Click **"Save"**

## Step 3: Create Storage Policies

1. Go to **Storage** > **Policies**
2. Click **"New Policy"** for each policy below

### Policy 1: Upload Policy
- **Policy name**: `Users can upload review images`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: (leave empty)
- **WITH CHECK expression**:
  ```sql
  bucket_id = 'review-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
  ```

### Policy 2: Update Policy
- **Policy name**: `Users can update their own review images`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**:
  ```sql
  bucket_id = 'review-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
  ```
- **WITH CHECK expression**: (leave empty)

### Policy 3: Delete Policy
- **Policy name**: `Users can delete their own review images`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
  ```sql
  bucket_id = 'review-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
  ```
- **WITH CHECK expression**: (leave empty)

### Policy 4: View Policy
- **Policy name**: `Anyone can view review images`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**:
  ```sql
  bucket_id = 'review-images'
  ```
- **WITH CHECK expression**: (leave empty)

### Policy 5: Service Role Policy
- **Policy name**: `Service role can manage all review images`
- **Allowed operation**: `ALL`
- **Target roles**: `service_role`
- **USING expression**:
  ```sql
  bucket_id = 'review-images'
  ```
- **WITH CHECK expression**: (leave empty)

## Step 4: Run the Database Functions

After setting up the bucket and policies, you can run the database functions part of the script:

```sql
-- Run this in the SQL Editor
\i setup_review_images_bucket_fixed.sql
```

Or run just the functions part:

```sql
-- Create a function to generate unique file names for review images
CREATE OR REPLACE FUNCTION generate_review_image_filename()
RETURNS TEXT AS $$
BEGIN
  RETURN 'review_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Create a function to validate review image uploads
CREATE OR REPLACE FUNCTION validate_review_image_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to upload review images';
  END IF;
  
  -- Check file size (5MB limit)
  IF NEW.metadata->>'size' IS NOT NULL AND (NEW.metadata->>'size')::bigint > 5242880 THEN
    RAISE EXCEPTION 'File size exceeds 5MB limit';
  END IF;
  
  -- Check file type
  IF NEW.metadata->>'mimetype' NOT IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml') THEN
    RAISE EXCEPTION 'Invalid file type. Only images are allowed';
  END IF;
  
  -- Ensure the file path includes the user ID
  IF (storage.foldername(NEW.name))[1] != auth.uid()::text THEN
    RAISE EXCEPTION 'File must be uploaded to user-specific folder';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate review image uploads
DROP TRIGGER IF EXISTS validate_review_image_upload_trigger ON storage.objects;
CREATE TRIGGER validate_review_image_upload_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'review-images')
  EXECUTE FUNCTION validate_review_image_upload();

-- Create a function to clean up orphaned review images
CREATE OR REPLACE FUNCTION cleanup_orphaned_review_images()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  image_record RECORD;
BEGIN
  -- Find review images that are not referenced in any review
  FOR image_record IN
    SELECT o.name, o.id
    FROM storage.objects o
    WHERE o.bucket_id = 'review-images'
    AND NOT EXISTS (
      SELECT 1 
      FROM reviews r 
      WHERE r.images @> ARRAY[o.name]
    )
  LOOP
    -- Delete the orphaned image
    DELETE FROM storage.objects 
    WHERE id = image_record.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create an index for better performance on review images queries
CREATE INDEX IF NOT EXISTS idx_storage_objects_review_images 
ON storage.objects (bucket_id, name) 
WHERE bucket_id = 'review-images';
```

## Step 5: Verify Setup

1. **Check Bucket Creation**:
   - Go to Storage and verify `review-images` bucket exists
   - Check that it's marked as public
   - Verify file size limit is 5MB

2. **Check Policies**:
   - Go to Storage > Policies
   - Verify all 5 policies are created and active
   - Check that RLS is enabled on storage.objects

3. **Test Upload**:
   - Try uploading an image through your application
   - Check that it appears in the correct user folder
   - Verify the image is accessible via public URL

## Troubleshooting

### Common Issues

1. **"must be owner of table objects" error**:
   - This is normal for non-superuser accounts
   - Use the manual setup process above

2. **Policies not working**:
   - Ensure RLS is enabled on storage.objects
   - Check that policy expressions are correct
   - Verify user authentication is working

3. **Upload fails**:
   - Check file size (must be < 5MB)
   - Verify file type is allowed
   - Ensure user is authenticated
   - Check browser console for errors

4. **Images not displaying**:
   - Verify bucket is public
   - Check image URL format
   - Ensure policies allow public read access

### Verification Queries

Run these in the SQL Editor to verify setup:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'review-images';

-- Check policies exist
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%review%';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%review%';
```

## Alternative: Use Supabase CLI

If you have the Supabase CLI installed, you can also set up the storage bucket using the CLI:

```bash
# Initialize Supabase in your project
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push

# Generate types
supabase gen types typescript --local > src/types/supabase.ts
```

## Next Steps

After completing the manual setup:

1. Test the review image upload functionality
2. Verify images display correctly in the UI
3. Test admin review management features
4. Set up monitoring for storage usage
5. Consider implementing image optimization

The review images feature should now be fully functional with proper security and storage management!
