# 🖼️ Image Upload Setup for Categories

This guide will help you set up real image uploads for category images using Supabase Storage.

## 📋 **Prerequisites**

- Supabase project set up and running
- Categories table already created (run `supabase_categories_setup_fixed.sql` first)
- Admin access to your Supabase dashboard

## 🚀 **Step 1: Set Up Storage Bucket**

1. **Copy the storage setup script:**
   ```sql
   -- Copy the content from supabase_storage_setup.sql
   ```

2. **Run in Supabase SQL Editor:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Paste and run the storage setup script
   - This creates the `category-images` bucket with proper policies

## 🔧 **Step 2: Configure Storage Policies**

The script automatically creates these policies:

- **Public Read Access**: Anyone can view category images
- **Authenticated Upload**: Only logged-in users can upload images
- **Authenticated Update/Delete**: Users can manage their uploaded images

## 📁 **Step 3: File Structure**

```
src/
├── services/
│   └── imageUploadService.ts    # Image upload logic
├── components/admin/
│   ├── ImageUpload.tsx          # Reusable upload component
│   └── CategoryForm.tsx         # Category form with image upload
└── pages/admin/
    └── Categories.tsx           # Updated categories page
```

## 🎯 **Step 4: Features**

### **Image Upload Component**
- ✅ **Drag & Drop**: Drag images directly onto the upload area
- ✅ **File Validation**: Checks file size (5MB max) and type (JPEG, PNG, WebP, GIF)
- ✅ **Preview**: Shows image preview before upload
- ✅ **Thumbnail Generation**: Creates smaller thumbnails automatically
- ✅ **Progress Bar**: Visual upload progress indicator
- ✅ **Error Handling**: Clear error messages for failed uploads

### **Category Form**
- ✅ **Image Upload Integration**: Seamless image upload in category creation/editing
- ✅ **Form Validation**: Ensures all required fields are filled
- ✅ **Auto-slug Generation**: Creates URL-friendly slugs from category names
- ✅ **Tag Management**: Easy tag input with comma separation

## 🔒 **Step 5: Security Features**

- **File Type Validation**: Only allows image files
- **Size Limits**: 10MB maximum file size
- **Row Level Security**: Proper Supabase RLS policies
- **Authenticated Access**: Only logged-in users can upload
- **Public Read Access**: Images are publicly viewable

## 📱 **Step 6: Usage**

### **For Admins:**
1. Go to `/admin/categories`
2. Click "Add Category" or edit existing category
3. Use the image upload area to:
   - Drag & drop images
   - Click to select files
   - Preview uploaded images
   - Remove/replace images

### **For Developers:**
```tsx
import { ImageUpload } from './ImageUpload';

<ImageUpload
  currentImageUrl={category.image}
  onImageUpload={(result) => console.log(result)}
  onImageRemove={() => setImage('')}
  maxWidth={400}
  maxHeight={300}
  showPreview={true}
  showThumbnail={true}
/>
```

## 🧪 **Step 7: Testing**

1. **Test Upload:**
   - Try uploading different image types
   - Test file size limits
   - Verify drag & drop functionality

2. **Test Validation:**
   - Try uploading non-image files
   - Test with oversized files
   - Verify error messages

3. **Test Integration:**
   - Create a new category with image
   - Edit existing category image
   - Verify images display correctly

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **"Bucket not found" error:**
   - Ensure storage setup script ran successfully
   - Check bucket name in Supabase dashboard

2. **"Permission denied" error:**
   - Verify RLS policies are active
   - Check user authentication status

3. **Images not displaying:**
   - Check image URLs in database
   - Verify bucket is public
   - Check browser console for errors

### **Debug Steps:**
1. Check Supabase logs for errors
2. Verify storage bucket exists and is public
3. Check RLS policies are correctly applied
4. Test with browser developer tools

## 📊 **Performance Considerations**

- **Image Optimization**: Consider implementing server-side image compression
- **CDN**: Supabase provides global CDN for fast image delivery
- **Caching**: Images are cached with 1-hour cache control
- **Thumbnails**: Generated client-side for better performance

## 🔮 **Future Enhancements**

- **Image Cropping**: Add image editing capabilities
- **Bulk Upload**: Support for multiple image uploads
- **Image Optimization**: Server-side image compression
- **Gallery View**: Multiple image support per category
- **Image Search**: AI-powered image tagging and search

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all setup steps were completed
3. Check Supabase dashboard for errors
4. Review browser console for client-side errors

---

**🎉 Congratulations!** You now have a fully functional image upload system for your categories with drag & drop, preview, and automatic thumbnail generation.
