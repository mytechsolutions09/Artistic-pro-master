# Commissioned Art - Image Upload Feature

## ✅ Implementation Complete

### Storage Configuration

Commissioned Art now uses the **same bucket as art products** (`product-images`), with organized subfolders:

```
product-images/
  ├── commissioned-art/
  │   ├── reference/    (Customer reference images)
  │   ├── wip/          (Work-in-progress images)
  │   └── final/        (Final artwork images)
  └── [other product images]
```

### Features Implemented

#### 1. **Reference Images**
- Customers provide reference images for what they want
- Multiple images can be uploaded
- Stored in `product-images/commissioned-art/reference/`

#### 2. **Work-in-Progress (WIP) Images**  
- Artists upload progress photos
- Share updates with customers
- Stored in `product-images/commissioned-art/wip/`

#### 3. **Final Artwork Images**
- Completed commissioned artwork
- High-quality final images
- Stored in `product-images/commissioned-art/final/`

### UI Features

- **Image Upload**: Click to upload multiple images at once
- **Image Preview**: See uploaded images in a grid
- **Remove Images**: Delete images before saving with X button
- **Accept**: JPG, PNG, WebP, GIF formats
- **Max Size**: 10MB per image (same as product images)

### Usage

#### Creating a New Commission

1. Navigate to **Admin → Commissioned Art**
2. Click **"New Commission"** button
3. Fill in customer and commission details
4. Upload images:
   - **Reference Images**: What the customer wants
   - **WIP Images**: Progress updates (optional)
   - **Final Images**: Completed artwork (optional)
5. Click **"Create Commission"**

#### Updating a Commission

1. Click the **Edit** icon on any commission
2. Add more images to any category
3. Remove unwanted images
4. Click **"Update Commission"**

### Database Fields

The following array fields store image URLs:

- `reference_images` - TEXT[] array
- `work_in_progress_images` - TEXT[] array  
- `final_artwork_images` - TEXT[] array

### Benefits of Using Same Bucket

1. **Consistency**: Same storage location as all art products
2. **Simplified Management**: One bucket to manage
3. **Cost Effective**: No additional bucket setup
4. **Organized**: Subfolders keep commissioned art separate
5. **Performance**: Existing CDN and caching work automatically

### Image Upload Flow

```
User selects images
    ↓
Client creates preview
    ↓
On submit → Upload to Supabase Storage
    ↓
Store URLs in database
    ↓
Display images in admin panel
```

### Code Location

- **Admin Page**: `src/pages/admin/CommissionedArt.tsx`
- **Service**: `src/services/commissionedArtService.ts`
- **Upload Service**: `src/services/imageUploadService.ts`
- **Database Schema**: `database/commissioned_art_setup.sql`

### Security

- All uploads use Supabase authentication
- Row Level Security (RLS) policies protect data
- Only admin users can upload commissioned art images
- Customers can view their own commission images

### Next Steps (Optional Enhancements)

- [ ] Image compression before upload
- [ ] Drag and drop upload interface
- [ ] Image cropping/editing tools
- [ ] Gallery view for all images
- [ ] Customer-facing image upload portal
- [ ] Email notifications with images
- [ ] Watermarking for WIP images
- [ ] Download all images as ZIP

## 🎉 Ready to Use!

The commissioned art feature now has full image upload capability using the same storage bucket as art products, with organized folder structure for different image types.

