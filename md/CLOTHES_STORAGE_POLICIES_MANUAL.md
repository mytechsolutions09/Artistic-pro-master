# Manual Setup: Storage Policies for clothes-images Bucket

If you get permission errors when running the SQL script, follow these steps to create the storage policies manually through the Supabase Dashboard.

## Steps to Create Policies Manually

### 1. Navigate to Storage Policies
1. Open your Supabase Dashboard
2. Go to **Storage** (left sidebar)
3. Click on the **clothes-images** bucket
4. Click on the **Policies** tab

### 2. Create Policy #1: Upload Images (INSERT)
Click **"New Policy"** and configure:

```
Policy Name: Allow authenticated users to upload clothes images
Allowed operation: INSERT
Target roles: authenticated

Policy definition (USING):
(Leave empty for INSERT)

Policy check (WITH CHECK):
bucket_id = 'clothes-images'
```

**Or use this SQL in the "Create a custom policy" option:**
```sql
CREATE POLICY "Allow authenticated users to upload clothes images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'clothes-images');
```

---

### 3. Create Policy #2: View Images (SELECT)
Click **"New Policy"** and configure:

```
Policy Name: Allow public read access to clothes images
Allowed operation: SELECT
Target roles: public

Policy definition (USING):
bucket_id = 'clothes-images'

Policy check (WITH CHECK):
(Leave empty for SELECT)
```

**Or use this SQL:**
```sql
CREATE POLICY "Allow public read access to clothes images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'clothes-images');
```

---

### 4. Create Policy #3: Update Images (UPDATE)
Click **"New Policy"** and configure:

```
Policy Name: Allow authenticated users to update clothes images
Allowed operation: UPDATE
Target roles: authenticated

Policy definition (USING):
bucket_id = 'clothes-images'

Policy check (WITH CHECK):
bucket_id = 'clothes-images'
```

**Or use this SQL:**
```sql
CREATE POLICY "Allow authenticated users to update clothes images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'clothes-images')
WITH CHECK (bucket_id = 'clothes-images');
```

---

### 5. Create Policy #4: Delete Images (DELETE)
Click **"New Policy"** and configure:

```
Policy Name: Allow authenticated users to delete clothes images
Allowed operation: DELETE
Target roles: authenticated

Policy definition (USING):
bucket_id = 'clothes-images'

Policy check (WITH CHECK):
(Leave empty for DELETE)
```

**Or use this SQL:**
```sql
CREATE POLICY "Allow authenticated users to delete clothes images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'clothes-images');
```

---

## Verify Policies

After creating all policies, verify they exist:

1. Go to **SQL Editor**
2. Run this query:

```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%clothes%';
```

You should see all 4 policies listed.

---

## Quick Test

Test if uploads work:

1. Log in to your app as an authenticated user
2. Go to Admin → Clothes → Create Product
3. Try uploading an image
4. If successful, you're all set! ✅

---

## Alternative: Run SQL in Supabase Dashboard

If the UI method doesn't work, try running these commands **one at a time** in the SQL Editor:

```sql
-- Policy 1
CREATE POLICY "Allow authenticated users to upload clothes images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'clothes-images');

-- Policy 2
CREATE POLICY "Allow public read access to clothes images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'clothes-images');

-- Policy 3
CREATE POLICY "Allow authenticated users to update clothes images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'clothes-images')
WITH CHECK (bucket_id = 'clothes-images');

-- Policy 4
CREATE POLICY "Allow authenticated users to delete clothes images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'clothes-images');
```

---

## Troubleshooting

### Error: "policy already exists"
- The policy is already created, skip it

### Error: "must be owner of table objects"
- Use the Supabase Dashboard UI method (steps 1-5 above)
- Contact Supabase support if still having issues

### Images not loading
- Check that the bucket is set to **public**
- Verify the SELECT policy exists and is active
- Check browser console for CORS errors

---

## Summary

You need **4 policies** for full functionality:
- ✅ **INSERT** - Upload new images (authenticated users)
- ✅ **SELECT** - View images (public access)
- ✅ **UPDATE** - Modify images (authenticated users)
- ✅ **DELETE** - Remove images (authenticated users)

Once all 4 are created, your clothes image upload system will work perfectly! 🎉

