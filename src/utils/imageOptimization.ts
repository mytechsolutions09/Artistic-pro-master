/**
 * Image optimization utilities for better performance
 */

// Cache for loaded images
const imageCache = new Map<string, string>();

/**
 * Optimize image URL with compression parameters
 */
export const optimizeImageUrl = (
  url: string,
  width?: number,
  quality: number = 80
): string => {
  try {
    // Return cached URL if available
    const cacheKey = `${url}-${width}-${quality}`;
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!;
    }

    let optimizedUrl = url;

    // Optimize Pexels images
    if (url.includes('pexels.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'compress');
      urlObj.searchParams.set('cs', 'tinysrgb');
      urlObj.searchParams.set('fit', 'crop');
      
      // Set appropriate width
      const targetWidth = width || (window.innerWidth > 768 ? 800 : 400);
      urlObj.searchParams.set('w', targetWidth.toString());
      
      optimizedUrl = urlObj.toString();
    }
    // Optimize Supabase storage images
    else if (url.includes('supabase')) {
      const urlObj = new URL(url);
      if (width) {
        urlObj.searchParams.set('width', width.toString());
      }
      urlObj.searchParams.set('quality', quality.toString());
      optimizedUrl = urlObj.toString();
    }

    // Cache the optimized URL
    imageCache.set(cacheKey, optimizedUrl);
    
    return optimizedUrl;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return url; // Return original URL if optimization fails
  }
};

/**
 * Preload critical images
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = async (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.map(url => preloadImage(url)));
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (url: string, sizes: number[]): string => {
  return sizes
    .map(size => `${optimizeImageUrl(url, size)} ${size}w`)
    .join(', ');
};

/**
 * Create blur data URL placeholder
 */
export const createBlurDataUrl = (color: string = '#e5e7eb'): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`;
};

/**
 * Clear image cache
 */
export const clearImageCache = (): void => {
  imageCache.clear();
};

/**
 * Get cache size
 */
export const getCacheSize = (): number => {
  return imageCache.size;
};

/**
 * Check if image is cached
 */
export const isImageCached = (url: string, width?: number, quality: number = 80): boolean => {
  const cacheKey = `${url}-${width}-${quality}`;
  return imageCache.has(cacheKey);
};

/**
 * Estimate image file size reduction
 */
export const estimateCompression = (originalWidth: number, targetWidth: number): number => {
  const ratio = targetWidth / originalWidth;
  return Math.round((1 - ratio * ratio) * 100); // Approximate compression percentage
};

/**
 * Get optimal image width based on viewport
 */
export const getOptimalImageWidth = (): number => {
  const width = window.innerWidth;
  
  if (width < 640) return 400; // Mobile
  if (width < 768) return 600; // Tablet portrait
  if (width < 1024) return 800; // Tablet landscape
  if (width < 1280) return 1000; // Desktop
  return 1200; // Large desktop
};

/**
 * Create responsive sizes attribute
 */
export const createSizesAttribute = (
  mobile: string = '100vw',
  tablet: string = '50vw',
  desktop: string = '33vw'
): string => {
  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
};

/**
 * Detect WebP support
 */
let webpSupported: boolean | null = null;

export const supportsWebP = async (): Promise<boolean> => {
  if (webpSupported !== null) {
    return webpSupported;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      webpSupported = img.width > 0 && img.height > 0;
      resolve(webpSupported);
    };
    img.onerror = () => {
      webpSupported = false;
      resolve(false);
    };
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
};
