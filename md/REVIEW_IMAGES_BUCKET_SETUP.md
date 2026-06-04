# Review Images Bucket Setup Guide

This guide explains how to set up and use the Supabase storage bucket for review images.

## Overview

The review images feature allows users to upload images along with their product reviews. Images are stored in a dedicated Supabase storage bucket with proper security policies and validation.

## Database Setup

### 1. Run the Database Migration

First, run the database migration to add the images field to the reviews table:

```sql
-- Run this first
\i add_review_images.sql
```

### 2. Set Up the Storage Bucket

Then, set up the storage bucket and policies:

```sql
-- Run this second
\i setup_review_images_bucket.sql
```

## Storage Bucket Configuration

### Bucket Details
- **Bucket Name**: `review-images`
- **Public Access**: Yes (images can be accessed directly via URL)
- **File Size Limit**: 5MB per image
- **Allowed MIME Types**: 
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `image/webp`
  - `image/svg+xml`

### File Organization
Images are organized by user ID in the following structure:
```
review-images/
├── {user_id}/
│   ├── review_1234567890_abc12345.jpg
│   ├── review_1234567891_def67890.png
│   └── ...
```

## Security Policies

### 1. Upload Policy
- **Who**: Authenticated users only
- **What**: Can upload images to their own folder
- **Validation**: File size, type, and user permissions checked

### 2. Update Policy
- **Who**: Authenticated users
- **What**: Can update their own images
- **Restriction**: Only images in their own folder

### 3. Delete Policy
- **Who**: Authenticated users
- **What**: Can delete their own images
- **Restriction**: Only images in their own folder

### 4. View Policy
- **Who**: Everyone (public)
- **What**: Can view all review images
- **Purpose**: Images are publicly accessible for display

### 5. Admin Policy
- **Who**: Service role
- **What**: Full access to all review images
- **Purpose**: Admin operations and cleanup

## File Upload Process

### 1. Client-Side Upload
```typescript
// Example upload function
const uploadReviewImage = async (file: File, userId: string) => {
  const fileName = `review_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  const filePath = `${userId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('review-images')
    .upload(filePath, file);
    
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('review-images')
    .getPublicUrl(filePath);
    
  return publicUrl;
};
```

### 2. File Validation
The system automatically validates:
- **File Type**: Only image files allowed
- **File Size**: Maximum 5MB per image
- **User Permissions**: Users can only upload to their own folder
- **Authentication**: Must be logged in to upload

## Image URL Structure

Public URLs follow this pattern:
```
https://{project_id}.supabase.co/storage/v1/object/public/review-images/{user_id}/{filename}
```

## Cleanup and Maintenance

### Orphaned Image Cleanup
The system includes a function to clean up images that are no longer referenced in reviews:

```sql
-- Run this periodically to clean up orphaned images
SELECT cleanup_orphaned_review_images();
```

### Manual Cleanup
To manually remove specific images:

```sql
-- Delete a specific image
DELETE FROM storage.objects 
WHERE bucket_id = 'review-images' 
AND name = '{user_id}/{filename}';
```

## Frontend Integration

### 1. Upload Component
The `ReviewInput` component handles image uploads with:
- Drag & drop support
- Multiple file selection
- Progress indicators
- Error handling
- Image previews

### 2. Display Components
Images are displayed in:
- Product page review sections
- Admin review management
- Review detail modals

### 3. Image Optimization
Consider implementing:
- Image compression before upload
- Thumbnail generation
- Lazy loading for better performance
- CDN integration for faster delivery

## Security Considerations

### 1. File Validation
- Server-side validation ensures only images are uploaded
- File size limits prevent abuse
- MIME type checking prevents malicious files

### 2. User Isolation
- Users can only access their own uploaded images
- File paths include user ID for isolation
- Admin access is restricted to service role

### 3. Public Access
- Images are publicly accessible for display
- Consider implementing signed URLs for sensitive content
- Monitor usage and implement rate limiting if needed

## Monitoring and Analytics

### 1. Storage Usage
Monitor bucket usage in Supabase dashboard:
- Total storage used
- Number of files
- Upload/download statistics

### 2. Error Tracking
Track common upload errors:
- File size exceeded
- Invalid file types
- Authentication failures
- Network timeouts

### 3. Performance Metrics
Monitor:
- Upload success rates
- Average upload times
- Image loading performance
- User engagement with images

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size (must be < 5MB)
   - Verify file type (images only)
   - Ensure user is authenticated
   - Check network connection

2. **Images Not Displaying**
   - Verify bucket is public
   - Check image URL format
   - Ensure RLS policies allow viewing
   - Check for CORS issues

3. **Permission Errors**
   - Verify user authentication
   - Check RLS policies
   - Ensure user is uploading to correct folder
   - Verify service role permissions

### Debug Commands

```sql
-- Check bucket configuration
SELECT * FROM storage.buckets WHERE id = 'review-images';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Check uploaded files
SELECT * FROM storage.objects WHERE bucket_id = 'review-images';

-- Check review images references
SELECT id, images FROM reviews WHERE images IS NOT NULL;
```

## Best Practices

1. **File Naming**: Use descriptive, unique filenames
2. **Error Handling**: Provide clear error messages to users
3. **Progress Feedback**: Show upload progress for better UX
4. **Image Optimization**: Compress images before upload
5. **Cleanup**: Regularly clean up orphaned images
6. **Monitoring**: Monitor storage usage and performance
7. **Backup**: Consider backup strategies for important images

## Future Enhancements

Consider implementing:
- Image compression and optimization
- Thumbnail generation
- Image editing capabilities
- Bulk upload functionality
- Image metadata storage
- Advanced search and filtering
- Image moderation tools
- CDN integration
