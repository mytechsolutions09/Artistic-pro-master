/**
 * Image optimization utilities for client-side image handling
 * This reduces egress costs by avoiding server-side transformations
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Generate responsive image sizes for different breakpoints
 * This helps browsers choose the appropriate image size without server processing
 */
export const generateResponsiveImageSizes = (originalWidth: number, originalHeight: number) => {
  const breakpoints = [
    { name: 'xs', width: 320 },
    { name: 'sm', width: 640 },
    { name: 'md', width: 768 },
    { name: 'lg', width: 1024 },
    { name: 'xl', width: 1280 },
    { name: '2xl', width: 1536 }
  ];

  return breakpoints.map(breakpoint => {
    const aspectRatio = originalWidth / originalHeight;
    const height = Math.round(breakpoint.width / aspectRatio);
    
    return {
      breakpoint: breakpoint.name,
      width: breakpoint.width,
      height,
      size: `${breakpoint.width}x${height}`
    };
  });
};

/**
 * Generate srcset attribute for responsive images
 * This allows browsers to choose the best image size without server processing
 */
export const generateSrcSet = (baseUrl: string, sizes: Array<{ width: number; height: number }>) => {
  return sizes
    .map(size => `${baseUrl} ${size.width}w`)
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * This tells the browser which image size to use at different viewport widths
 */
export const generateSizes = (breakpoints: Array<{ name: string; width: number }>) => {
  return breakpoints
    .map((bp, index) => {
      if (index === 0) return `(max-width: ${bp.width}px) 100vw`;
      return `(max-width: ${bp.width}px) ${bp.width}px`;
    })
    .join(', ') + ', 100vw';
};

/**
 * Check if WebP format is supported by the browser
 */
export const isWebPSupported = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get the best image format for the current browser
 */
export const getBestImageFormat = async (): Promise<string> => {
  const webPSupported = await isWebPSupported();
  return webPSupported ? 'webp' : 'jpeg';
};

/**
 * Generate optimized image URL with format preference
 * This can be used to request WebP format when supported
 */
export const getOptimizedImageUrl = (originalUrl: string, format?: string): string => {
  // For now, return the original URL
  // In the future, this could be enhanced to request specific formats
  // from a CDN that supports format conversion
  return originalUrl;
};

/**
 * Lazy load images with intersection observer
 * This reduces initial page load and egress costs
 */
export const setupLazyLoading = (imageSelector: string = 'img[data-src]') => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    const images = document.querySelectorAll(imageSelector);
    images.forEach((img: Element) => {
      const imgElement = img as HTMLImageElement;
      if (imgElement.dataset.src) {
        imgElement.src = imgElement.dataset.src;
        imgElement.removeAttribute('data-src');
      }
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px', // Start loading 50px before the image comes into view
    threshold: 0.1
  });

  const images = document.querySelectorAll(imageSelector);
  images.forEach(img => imageObserver.observe(img));
};

/**
 * Enhanced lazy loading with error handling and retry logic
 */
export const setupAdvancedLazyLoading = (imageSelector: string = 'img[data-src]') => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return setupLazyLoading(imageSelector);
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          const src = img.dataset.src;
          img.src = src;
          img.removeAttribute('data-src');
          
          // Add error handling
          img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            // You could implement retry logic here
          };
          
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1
  });

  const images = document.querySelectorAll(imageSelector);
  images.forEach(img => imageObserver.observe(img));
};

/**
 * Preload critical images
 * This improves perceived performance without increasing egress
 */
export const preloadCriticalImages = (imageUrls: string[]) => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Calculate optimal image dimensions for a container
 * This helps with responsive image sizing
 */
export const calculateOptimalDimensions = (
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

/**
 * Generate placeholder for images while loading
 * This improves perceived performance
 */
export const generateImagePlaceholder = (width: number, height: number, color: string = '#f3f4f6'): string => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
        Loading...
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate a blur placeholder for images
 * This creates a low-quality version of the image for better perceived performance
 */
export const generateBlurPlaceholder = (imageUrl: string, width: number = 20, height: number = 20): string => {
  // This would typically involve server-side processing to create a blur version
  // For now, we'll return a simple gradient placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Image loading performance monitor
 * Tracks image loading times and provides insights
 */
export class ImagePerformanceMonitor {
  private static instance: ImagePerformanceMonitor;
  private metrics: Map<string, { startTime: number; endTime?: number; size?: number }> = new Map();

  static getInstance(): ImagePerformanceMonitor {
    if (!ImagePerformanceMonitor.instance) {
      ImagePerformanceMonitor.instance = new ImagePerformanceMonitor();
    }
    return ImagePerformanceMonitor.instance;
  }

  startTracking(imageUrl: string): void {
    this.metrics.set(imageUrl, { startTime: performance.now() });
  }

  endTracking(imageUrl: string, size?: number): void {
    const metric = this.metrics.get(imageUrl);
    if (metric) {
      metric.endTime = performance.now();
      metric.size = size;
      
      const loadTime = metric.endTime - metric.startTime;
      console.log(`Image loaded: ${imageUrl} in ${loadTime.toFixed(2)}ms (${size ? `${(size / 1024).toFixed(2)}KB` : 'unknown size'})`);
    }
  }

  getMetrics(): Array<{ url: string; loadTime: number; size?: number }> {
    return Array.from(this.metrics.entries())
      .filter(([_, metric]) => metric.endTime)
      .map(([url, metric]) => ({
        url,
        loadTime: metric.endTime! - metric.startTime,
        size: metric.size
      }));
  }

  getAverageLoadTime(): number {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return 0;
    
    const totalTime = metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return totalTime / metrics.length;
  }
}

/**
 * Optimize image loading with performance monitoring
 */
export const optimizeImageLoading = (imageUrl: string): Promise<HTMLImageElement> => {
  const monitor = ImagePerformanceMonitor.getInstance();
  monitor.startTracking(imageUrl);

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      monitor.endTracking(imageUrl);
      resolve(img);
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${imageUrl}`);
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
};
