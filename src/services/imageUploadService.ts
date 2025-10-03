import { supabase } from './supabaseService';
import { checkEnvironmentVariables } from '../utils/envCheck';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

export type BucketType = 'category-images' | 'product-images' | 'main-images' | 'product-pdfs' | 'product-videos' | 'review-images' | 'homepage-hero-images' | 'homepage-slider-images' | 'homepage-featured-grid' | 'homepage-categories-images' | 'homepage-trending-images';

export class ImageUploadService {
  private static readonly BUCKETS = {
    'category-images': {
      name: 'category-images',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    'product-images': {
      name: 'product-images',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    'main-images': {
      name: 'main-images',
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    'product-pdfs': {
      name: 'product-pdfs',
      maxSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['application/pdf']
    },
    'product-videos': {
      name: 'product-videos',
      maxSize: 200 * 1024 * 1024, // 200MB
      allowedTypes: ['video/mp4', 'video/webm', 'video/ogg']
    },
    'review-images': {
      name: 'review-images',
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    },
    'homepage-hero-images': {
      name: 'homepage-hero-images',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    'homepage-slider-images': {
      name: 'homepage-slider-images',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    'homepage-featured-grid': {
      name: 'homepage-featured-grid',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    'homepage-categories-images': {
      name: 'homepage-categories-images',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    'homepage-trending-images': {
      name: 'homepage-trending-images',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    }
  };

  // Default bucket for backward compatibility
  private static readonly DEFAULT_BUCKET: BucketType = 'category-images';

  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile(
    file: File,
    bucketType: BucketType = this.DEFAULT_BUCKET,
    folder: string = 'public',
    customName?: string
  ): Promise<UploadResult> {
    try {
      // Check environment variables first
      if (!checkEnvironmentVariables()) {
        return { 
          success: false, 
          error: 'Environment variables not properly configured. Please check your .env file.' 
        };
      }
      
      // Get bucket configuration
      const bucketConfig = this.BUCKETS[bucketType];
      if (!bucketConfig) {
        return { success: false, error: `Invalid bucket type: ${bucketType}` };
      }

      // Validate file
      const validation = this.validateFile(file, bucketType);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate unique filename
      const fileName = customName || this.generateFileName(file);
      const filePath = `${folder}/${fileName}`;

      // Debug logging



      
      // Upload file with optimized caching headers to reduce egress costs
      const { error } = await supabase.storage
        .from(bucketConfig.name)
        .upload(filePath, file, {
          cacheControl: '31536000', // 1 year cache for static assets
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketConfig.name)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };

    } catch (error) {
      console.error('Upload exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Upload an image file to Supabase Storage (backward compatibility)
   */
  static async uploadImage(
    file: File,
    folder: string = 'public',
    customName?: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, this.DEFAULT_BUCKET, folder, customName);
  }

  /**
   * Upload a main image file
   */
  static async uploadMainImage(
    file: File,
    folder: string = 'main-images',
    customName?: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, 'main-images', folder, customName);
  }

  /**
   * Upload a product PDF file
   */
  static async uploadPdf(
    file: File,
    folder: string = 'product-pdfs',
    customName?: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, 'product-pdfs', folder, customName);
  }

  /**
   * Upload a product video file
   */
  static async uploadVideo(
    file: File,
    folder: string = 'product-videos',
    customName?: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, 'product-videos', folder, customName);
  }

  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(filePath: string, bucketType: BucketType = this.DEFAULT_BUCKET): Promise<UploadResult> {
    try {
      const bucketConfig = this.BUCKETS[bucketType];
      if (!bucketConfig) {
        return { success: false, error: `Invalid bucket type: ${bucketType}` };
      }

      const { error } = await supabase.storage
        .from(bucketConfig.name)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Delete exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Delete an image from Supabase Storage (backward compatibility)
   */
  static async deleteImage(filePath: string): Promise<UploadResult> {
    return this.deleteFile(filePath, this.DEFAULT_BUCKET);
  }

  /**
   * Update an existing file (delete old, upload new)
   */
  static async updateFile(
    file: File,
    bucketType: BucketType = this.DEFAULT_BUCKET,
    oldFilePath?: string,
    folder: string = 'public',
    customName?: string
  ): Promise<UploadResult> {
    try {
      // Delete old file if it exists
      if (oldFilePath) {
        await this.deleteFile(oldFilePath, bucketType);
      }

      // Upload new file
      return await this.uploadFile(file, bucketType, folder, customName);

    } catch (error) {
      console.error('Update exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Update an existing image (delete old, upload new) - backward compatibility
   */
  static async updateImage(
    file: File,
    oldFilePath?: string,
    folder: string = 'public',
    customName?: string
  ): Promise<UploadResult> {
    return this.updateFile(file, this.DEFAULT_BUCKET, oldFilePath, folder, customName);
  }

  /**
   * Test storage bucket connection and permissions
   */
  static async testBucketConnection(bucketType: BucketType = this.DEFAULT_BUCKET): Promise<{ success: boolean; error?: string; bucketInfo?: any }> {
    try {

      
      const bucketConfig = this.BUCKETS[bucketType];
      if (!bucketConfig) {
        return { success: false, error: `Invalid bucket type: ${bucketType}` };
      }
      
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (listError) {
        console.error('❌ Error listing buckets:', listError);
        return { success: false, error: `Failed to list buckets: ${listError.message}` };
      }
      
      const targetBucket = buckets.find(bucket => bucket.name === bucketConfig.name);
      if (!targetBucket) {
        console.error('❌ Target bucket not found:', bucketConfig.name);
        return { 
          success: false, 
          error: `Bucket '${bucketConfig.name}' not found. Available buckets: ${buckets.map(b => b.name).join(', ')}` 
        };
      }
      

      
      // Test upload permissions with a small test file
      const testContent = 'test';
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketConfig.name)
        .upload('test/connection-test.txt', testFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError);
        return { 
          success: false, 
          error: `Upload test failed: ${uploadError.message}. This indicates a policy or permission issue.` 
        };
      }
      

      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from(bucketConfig.name)
        .remove(['test/connection-test.txt']);
      
      if (deleteError) {
        console.warn('⚠️ Failed to clean up test file:', deleteError);
      }
      
      return { 
        success: true, 
        bucketInfo: targetBucket 
      };
      
    } catch (error) {
      console.error('💥 Bucket connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File, bucketType: BucketType = this.DEFAULT_BUCKET): { valid: boolean; error?: string } {
    const bucketConfig = this.BUCKETS[bucketType];
    if (!bucketConfig) {
      return { valid: false, error: `Invalid bucket type: ${bucketType}` };
    }

    // Check file size
    if (file.size > bucketConfig.maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${bucketConfig.maxSize / (1024 * 1024)}MB`
      };
    }

    // Check file type
    if (!bucketConfig.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${bucketConfig.allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename
   */
  private static generateFileName(file: File): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * Get image dimensions from file
   */
  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // Removed createThumbnail method to reduce egress costs
  // Thumbnails are now generated client-side using CSS transforms only
  // This preserves original file sizes and reduces server processing

  /**
   * Upload a review image with user-specific folder structure
   */
  static async uploadReviewImage(
    file: File,
    userId: string,
    customName?: string
  ): Promise<UploadResult> {
    try {
      // Validate file
      const bucketConfig = this.BUCKETS['review-images'];
      const validationResult = this.validateFile(file, 'review-images');
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substr(2, 8);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = customName || `review_${timestamp}_${randomString}.${fileExtension}`;
      
      // Create user-specific folder path
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('review-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl,
        path: filePath
      };

    } catch (error: any) {
      console.error('Review image upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Delete a review image
   */
  static async deleteReviewImage(filePath: string): Promise<UploadResult> {
    try {
      const { error } = await supabase.storage
        .from('review-images')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return {
          success: false,
          error: `Delete failed: ${error.message}`
        };
      }

      return {
        success: true
      };

    } catch (error: any) {
      console.error('Review image delete error:', error);
      return {
        success: false,
        error: error.message || 'Delete failed'
      };
    }
  }

  /**
   * Get public URL for a review image
   */
  static getReviewImageUrl(filePath: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from('review-images')
      .getPublicUrl(filePath);
    
    return publicUrl;
  }

  /**
   * Upload homepage hero image
   */
  static async uploadHomepageHeroImage(file: File, imageType: 'main' | 'featured' | 'categories'): Promise<UploadResult> {
    return this.uploadFile(file, 'homepage-hero-images', 'hero', `${imageType}_${Date.now()}.${file.name.split('.').pop()}`);
  }

  /**
   * Upload homepage slider image
   */
  static async uploadHomepageSliderImage(file: File, slideId: string): Promise<UploadResult> {
    return this.uploadFile(file, 'homepage-slider-images', 'slider', `slide_${slideId}_${Date.now()}.${file.name.split('.').pop()}`);
  }

  /**
   * Upload homepage featured grid image
   */
  static async uploadHomepageFeaturedGridImage(file: File, itemId: string): Promise<UploadResult> {
    return this.uploadFile(file, 'homepage-featured-grid', 'featured', `item_${itemId}_${Date.now()}.${file.name.split('.').pop()}`);
  }

  /**
   * Upload homepage categories image
   */
  static async uploadHomepageCategoriesImage(file: File, categoryId: string): Promise<UploadResult> {
    return this.uploadFile(file, 'homepage-categories-images', 'categories', `category_${categoryId}_${Date.now()}.${file.name.split('.').pop()}`);
  }

  /**
   * Upload homepage trending collections image
   */
  static async uploadHomepageTrendingImage(file: File, collectionId: string): Promise<UploadResult> {
    return this.uploadFile(file, 'homepage-trending-images', 'trending', `collection_${collectionId}_${Date.now()}.${file.name.split('.').pop()}`);
  }
}
