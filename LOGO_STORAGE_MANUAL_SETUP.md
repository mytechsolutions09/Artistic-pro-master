# Logo Storage Manual Setup Guide

This guide provides step-by-step instructions to set up the logo storage system manually through the Supabase UI.

## Why Manual Setup?

The error `must be owner of table objects` occurs because the `storage.objects` table requires special permissions. The easiest solution is to create the storage bucket through the Supabase UI, which handles permissions automatically.

## Step-by-Step Instructions

### Step 1: Create Storage Bucket (Supabase UI)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"** button
4. Configure the bucket:
   - **Name**: `logos`
   - **Public bucket**: ✅ **Enable** (logos need to be publicly accessible)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: Leave empty or add:
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - `image/svg+xml`
     - `image/gif`
5. Click **"Create bucket"**

### Step 2: Configure Storage Policies (Supabase UI)

1. In the Storage section, click on the **"logos"** bucket
2. Go to the **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Public Read Access
- **Policy name**: `Public read access to logos`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  bucket_id = 'logos'
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 2: Authenticated Upload
- **Policy name**: `Authenticated users can upload logos`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  bucket_id = 'logos' AND auth.uid() IS NOT NULL
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 3: Authenticated Update
- **Policy name**: `Authenticated users can update logos`
- **Allowed operation**: `UPDATE`
- **Policy definition**:
  ```sql
  bucket_id = 'logos' AND auth.uid() IS NOT NULL
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 4: Authenticated Delete
- **Policy name**: `Authenticated users can delete logos`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  bucket_id = 'logos' AND auth.uid() IS NOT NULL
  ```
- Click **"Review"** then **"Save policy"**

### Step 3: Create Database Table (SQL Editor)

1. Go to **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy and paste the contents of `setup_logo_storage_simple.sql`
4. Click **"Run"** or press `Ctrl+Enter`
5. You should see: `Logo settings table created successfully!`

### Step 4: Verify Setup

#### Check Storage Bucket
```sql
SELECT * FROM storage.buckets WHERE id = 'logos';
```

Expected result:
- `id`: logos
- `name`: logos
- `public`: true

#### Check Logo Settings Table
```sql
SELECT * FROM logo_settings;
```

Expected result: One row with default Lurevi logo settings

#### Check Policies
```sql
SELECT * FROM storage.objects WHERE bucket_id = 'logos';
```

Should return empty (no files yet) without errors.

### Step 5: Test Upload (Optional)

1. Go to **Storage** → **logos** bucket
2. Click **"Upload file"**
3. Upload a test image
4. Verify it appears in the bucket
5. Copy the public URL and test it in your browser

### Step 6: Test in Admin Panel

1. Log in to your application as admin
2. Go to **Admin Panel** → **Settings** → **Logo Settings**
3. Try uploading a logo or configuring text-based logo
4. Click **"Save Settings"**
5. Refresh the page and verify the logo appears in the header

## Alternative: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Create bucket
supabase storage create logos --public

# Run SQL migrations
supabase db push
```

## Troubleshooting

### Bucket Creation Fails
- **Issue**: Cannot create bucket
- **Solution**: Check project permissions, ensure you're the project owner

### Upload Fails with 403
- **Issue**: Permission denied when uploading
- **Solution**: Verify authenticated upload policy is active

### Logo Not Visible
- **Issue**: Logo doesn't show on website
- **Solution**: 
  1. Check bucket is public
  2. Verify public read policy exists
  3. Check browser console for errors
  4. Verify logo_url in database is correct

### RLS Policy Errors
- **Issue**: Row Level Security blocking access
- **Solution**: 
  ```sql
  -- Check existing policies
  SELECT * FROM pg_policies WHERE tablename = 'logo_settings';
  
  -- If needed, create permissive policy
  CREATE POLICY "Allow all for testing" ON logo_settings
      FOR ALL USING (true);
  ```

### Table Already Exists Error
- **Issue**: `relation "logo_settings" already exists`
- **Solution**: Table is already created, skip Step 3 or drop and recreate:
  ```sql
  DROP TABLE IF EXISTS logo_settings CASCADE;
  -- Then run setup_logo_storage_simple.sql again
  ```

## Quick Verification Checklist

- [ ] Storage bucket `logos` exists
- [ ] Bucket is set to public
- [ ] 4 storage policies created (read, insert, update, delete)
- [ ] `logo_settings` table exists
- [ ] Default logo settings record exists
- [ ] Can upload file to bucket via UI
- [ ] Can access uploaded file via public URL
- [ ] Admin logo settings page loads without errors

## Next Steps

Once setup is complete:
1. Upload your logo via Admin Panel → Settings → Logo Settings
2. Save the settings
3. Refresh your website to see the new logo
4. Deploy to production and verify logo appears correctly

## Files Reference

- `setup_logo_storage_simple.sql` - Database table and policies (use this)
- `setup_logo_storage_bucket_fixed.sql` - Includes bucket creation (may fail)
- `setup_logo_storage_bucket.sql` - Original (requires owner permissions)
- `LOGO_STORAGE_SETUP.md` - Full documentation
- `src/services/logoService.ts` - Logo service implementation
- `src/hooks/useLogo.ts` - Logo React hook
- `src/components/admin/settings/LogoSettings.tsx` - Admin interface
