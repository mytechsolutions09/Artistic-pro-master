/**
 * Image Optimization Utilities
 * Provides optimized image URLs for better performance
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  blur?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Get optimized image URL for Supabase storage
 */
export const getOptimizedImageUrl = (
  originalUrl: string, 
  options: ImageOptimizationOptions = {}
): string => {
  // If it's not a Supabase URL, return as-is
  if (!originalUrl.includes('supabase') || !originalUrl.includes('storage')) {
    return originalUrl;
  }

  try {
    const url = new URL(originalUrl);
    
    // Set default values
    const {
      width = 800,
      height,
      quality = 85,
      format = 'webp',
      blur = 0,
      fit = 'cover'
    } = options;

    // Add transformation parameters
    if (width) url.searchParams.set('width', width.toString());
    if (height) url.searchParams.set('height', height.toString());
    if (quality) url.searchParams.set('quality', quality.toString());
    if (format && format !== 'auto') url.searchParams.set('format', format);
    if (blur > 0) url.searchParams.set('blur', blur.toString());
    if (fit) url.searchParams.set('resize', fit);

    return url.toString();
  } catch (error) {
    console.warn('Failed to optimize image URL:', error);
    return originalUrl;
  }
};

/**
 * Get responsive image URLs for different screen sizes
 */
export const getResponsiveImageUrls = (originalUrl: string) => {
  return {
    thumbnail: getOptimizedImageUrl(originalUrl, { width: 200, quality: 60 }),
    small: getOptimizedImageUrl(originalUrl, { width: 400, quality: 70 }),
    medium: getOptimizedImageUrl(originalUrl, { width: 600, quality: 80 }),
    large: getOptimizedImageUrl(originalUrl, { width: 800, quality: 85 }),
    xlarge: getOptimizedImageUrl(originalUrl, { width: 1200, quality: 90 })
  };
};

/**
 * Get blur placeholder URL
 */
export const getBlurPlaceholderUrl = (originalUrl: string): string => {
  return getOptimizedImageUrl(originalUrl, {
    width: 50,
    quality: 20,
    blur: 10,
    format: 'jpeg'
  });
};

/**
 * Generate a low-quality placeholder for progressive loading
 */
export const generateImagePlaceholder = (width: number = 400, height: number = 400): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect width="100%" height="100%" fill="url(#gradient)"/>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>
  `)}`;
};

/**
 * Check if image format is supported
 */
export const isWebPSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Get optimal format based on browser support
 */
export const getOptimalFormat = (preferredFormat: 'webp' | 'jpeg' | 'png' = 'webp'): string => {
  if (preferredFormat === 'webp' && isWebPSupported()) {
    return 'webp';
  }
  
  return 'jpeg'; // Fallback to JPEG
};

/**
 * Preload image with error handling
 */
export const preloadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    
    img.src = url;
  });
};

/**
 * Batch preload images with concurrency control
 */
export const preloadImages = async (
  urls: string[], 
  maxConcurrent: number = 3
): Promise<HTMLImageElement[]> => {
  const results: HTMLImageElement[] = [];
  const errors: Error[] = [];
  
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(url => 
      preloadImage(url).catch(error => {
        errors.push(error);
        return null;
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(Boolean) as HTMLImageElement[]);
  }
  
  if (errors.length > 0) {
    console.warn(`Failed to preload ${errors.length} images:`, errors);
  }
  
  return results;
};

/**
 * Get image dimensions from URL (for aspect ratio calculations)
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    img.src = url;
  });
};

/**
 * Calculate optimal image size based on container dimensions
 */
export const calculateOptimalImageSize = (
  containerWidth: number,
  containerHeight: number,
  imageAspectRatio: number
): { width: number; height: number } => {
  const containerAspectRatio = containerWidth / containerHeight;
  
  if (imageAspectRatio > containerAspectRatio) {
    // Image is wider than container
    return {
      width: containerWidth,
      height: Math.round(containerWidth / imageAspectRatio)
    };
  } else {
    // Image is taller than container
    return {
      width: Math.round(containerHeight * imageAspectRatio),
      height: containerHeight
    };
  }
};