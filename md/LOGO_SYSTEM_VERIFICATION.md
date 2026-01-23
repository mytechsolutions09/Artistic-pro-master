# Logo System Verification & Testing Guide

This guide helps you verify that the logo system is working correctly and test all functionality.

## Current Status ✅

Based on your database query results, the system is set up correctly:
- ✅ `logo_settings` table exists
- ✅ Default logo settings are present
- ⚠️ Multiple active records detected (needs cleanup)

## Step 1: Clean Up Duplicate Active Records

You have 2 active logo settings. Run this to keep only the most recent:

```sql
-- Run fix_logo_settings_duplicates.sql
-- Or copy this:

UPDATE logo_settings
SET is_active = false
WHERE id NOT IN (
    SELECT id 
    FROM logo_settings 
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 1
);

-- Verify only one active setting
SELECT id, created_at, is_active, logo_text, logo_url
FROM logo_settings 
WHERE is_active = true;
```

Expected result: Only 1 row with `is_active = true`

## Step 2: Verify Storage Bucket

Check if the `logos` bucket exists:

```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets 
WHERE id = 'logos';
```

**Expected result:**
- `id`: logos
- `name`: logos
- `public`: true
- `file_size_limit`: 5242880 (5MB)

**If bucket doesn't exist:**
1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `logos`
4. Enable "Public bucket"
5. Click "Create bucket"

## Step 3: Verify Storage Policies

Check storage policies:

```sql
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%logo%';
```

**Expected policies:**
1. `Public read access to logos` (SELECT)
2. `Authenticated users can upload logos` (INSERT)
3. `Authenticated users can update logos` (UPDATE)
4. `Authenticated users can delete logos` (DELETE)

**If policies are missing**, create them manually in Supabase UI:
- Go to Storage → logos bucket → Policies tab
- Add the 4 policies as described in `LOGO_STORAGE_MANUAL_SETUP.md`

## Step 4: Test Logo Loading in Application

### Test 1: Check Console for Errors

1. Open your application in a browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Refresh the page
5. Look for any errors related to "logo" or "LogoService"

**Expected:** No errors, or only warnings about fallback to default logo

### Test 2: Verify Logo Displays

1. Check if logo appears in the header
2. It should show `/lurevi-logo.svg` (default)
3. No broken image icon

**If logo is broken:**
- Check browser Network tab for failed requests
- Verify `/lurevi-logo.svg` exists in `public/` folder
- Check console for errors

### Test 3: Test Admin Logo Settings

1. Log in as admin
2. Go to Admin Panel → Settings → Logo Settings
3. Page should load without errors
4. You should see:
   - Current logo preview
   - Upload button
   - Text customization options
   - Color pickers
   - Save button

**If page doesn't load:**
- Check browser console for errors
- Verify `LogoSettings` component is imported correctly
- Check if `LogoService` is accessible

## Step 5: Test Logo Upload

### Test Upload Custom Image

1. In Logo Settings, click "Upload Logo"
2. Select an image file (PNG, JPG, SVG, WebP)
3. File should appear in preview
4. Click "Save Settings"
5. Wait for success message
6. Refresh the page
7. New logo should appear in header

**Expected behavior:**
- File uploads to Supabase storage
- New record created in `logo_settings` with `is_active = true`
- Old record set to `is_active = false`
- Logo updates across entire site

**Verify in database:**
```sql
-- Check latest logo setting
SELECT id, created_at, logo_url, is_active
FROM logo_settings 
ORDER BY created_at DESC
LIMIT 1;

-- Check uploaded files
SELECT name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'logos'
ORDER BY created_at DESC;
```

### Test Text-Based Logo

1. In Logo Settings, change "Logo Text" to something else (e.g., "MyBrand")
2. Change colors, font, size as desired
3. Enable/disable underline
4. Click "Save Settings"
5. Refresh the page
6. Generated SVG logo should appear

**Expected behavior:**
- SVG generated from text settings
- Uploaded to storage as `generated-logo-[timestamp].svg`
- New settings saved to database
- Logo updates immediately

## Step 6: Test Logo Across Different Pages

Visit these pages and verify logo appears correctly:
- [ ] Home page
- [ ] Product pages
- [ ] Checkout page
- [ ] User dashboard
- [ ] Admin panel
- [ ] Any other pages with header

**Expected:** Same logo on all pages, no flickering or loading issues

## Step 7: Test Production Deployment

### Before Deployment

1. Ensure all changes are committed:
   ```bash
   git status
   git add .
   git commit -m "Add logo storage system with Supabase integration"
   ```

2. Verify `.env` has Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### After Deployment

1. Visit production URL
2. Check if logo appears
3. Log in as admin
4. Test logo upload in production
5. Verify logo updates

**If logo doesn't appear in production:**
- Check if storage bucket exists in production Supabase
- Verify RLS policies are active
- Check browser console for CORS errors
- Verify environment variables are set correctly

## Troubleshooting Common Issues

### Issue: Logo Not Loading

**Symptoms:** Broken image icon or default logo always shows

**Solutions:**
1. Check browser console for errors
2. Verify `logo_url` in database:
   ```sql
   SELECT logo_url FROM logo_settings WHERE is_active = true;
   ```
3. Test URL directly in browser
4. Check storage bucket is public
5. Verify RLS policies allow public read

### Issue: Upload Fails

**Symptoms:** Error message when saving logo settings

**Solutions:**
1. Check file size (must be < 5MB)
2. Check file type (JPEG, PNG, WebP, SVG, GIF only)
3. Verify user is authenticated
4. Check storage policies allow authenticated insert
5. Check browser console for detailed error

### Issue: Multiple Active Logos

**Symptoms:** Logo keeps changing or wrong logo shows

**Solutions:**
1. Run `fix_logo_settings_duplicates.sql`
2. Verify only one active setting:
   ```sql
   SELECT COUNT(*) FROM logo_settings WHERE is_active = true;
   ```
   Should return 1

### Issue: Logo Doesn't Update After Save

**Symptoms:** Old logo still shows after uploading new one

**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check if `logoUpdated` event is firing:
   ```javascript
   window.addEventListener('logoUpdated', (e) => {
     console.log('Logo updated:', e.detail);
   });
   ```
4. Verify new settings saved:
   ```sql
   SELECT * FROM logo_settings 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

### Issue: Permission Denied Errors

**Symptoms:** 403 Forbidden or permission denied errors

**Solutions:**
1. Check RLS policies are active
2. Verify user is authenticated
3. Check storage bucket policies
4. Try with service role key (for testing only)

## Performance Checks

### Check Logo Load Time

1. Open DevTools → Network tab
2. Filter by "Img"
3. Refresh page
4. Check logo file load time

**Expected:** < 500ms for logo load

### Check Database Query Performance

```sql
EXPLAIN ANALYZE
SELECT * FROM logo_settings 
WHERE is_active = true
ORDER BY updated_at DESC
LIMIT 1;
```

**Expected:** Query time < 10ms

## Security Verification

### Check RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'logo_settings';
```

**Expected:** `rowsecurity = true`

### Check Public Access is Limited

```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'logo_settings';
```

**Expected:** 
- Public can only SELECT where `is_active = true`
- Only authenticated users can INSERT/UPDATE/DELETE

## Success Criteria Checklist

- [ ] Storage bucket `logos` exists and is public
- [ ] 4 storage policies created and active
- [ ] `logo_settings` table exists with RLS enabled
- [ ] Only 1 active logo setting in database
- [ ] Logo displays correctly on all pages
- [ ] Can upload custom logo via admin panel
- [ ] Can generate text-based logo via admin panel
- [ ] Logo updates immediately after save
- [ ] No console errors related to logo
- [ ] Logo works in both local and production
- [ ] Logo loads in < 500ms
- [ ] Database queries are fast (< 10ms)
- [ ] RLS policies protect data correctly

## Next Steps After Verification

Once all checks pass:

1. **Document your logo URL** for reference
2. **Create a backup** of your logo files
3. **Set up monitoring** for logo load failures
4. **Train team members** on how to update logo
5. **Consider CDN** for even faster logo delivery (Supabase storage already uses CDN)

## Support

If you encounter issues not covered here:
1. Check `LOGO_STORAGE_MANUAL_SETUP.md` for detailed setup
2. Review `LOGO_STORAGE_SETUP.md` for architecture details
3. Check Supabase dashboard for error logs
4. Verify all files are properly deployed
