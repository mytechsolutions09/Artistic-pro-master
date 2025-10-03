/**
 * Category Image Service
 * Optimizes image loading for category pages with intelligent preloading
 */

interface ImagePreloadOptions {
  priority?: boolean;
  quality?: 'low' | 'medium' | 'high';
  format?: 'webp' | 'jpeg' | 'png';
}

class CategoryImageService {
  private preloadedImages = new Set<string>();
  private preloadQueue: string[] = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private currentLoading = 0;

  /**
   * Preload images for above-the-fold products (first 8 products)
   */
  preloadAboveFoldImages(imageUrls: string[]): void {
    if (imageUrls.length === 0) return;

    // Preload first 8 images immediately with high priority
    const priorityImages = imageUrls.slice(0, 8);
    priorityImages.forEach(url => {
      if (!this.preloadedImages.has(url)) {
        this.preloadImage(url, { priority: true, quality: 'high' });
      }
    });

    // Queue remaining images for background loading
    const remainingImages = imageUrls.slice(8);
    this.queueImages(remainingImages);
  }

  /**
   * Queue images for background preloading
   */
  queueImages(imageUrls: string[]): void {
    imageUrls.forEach(url => {
      if (!this.preloadedImages.has(url) && !this.preloadQueue.includes(url)) {
        this.preloadQueue.push(url);
      }
    });

    this.processQueue();
  }

  /**
   * Process the preload queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) return;

    this.isProcessing = true;

    while (this.preloadQueue.length > 0 && this.currentLoading < this.maxConcurrent) {
      const url = this.preloadQueue.shift();
      if (url) {
        this.preloadImage(url, { priority: false, quality: 'medium' });
      }
    }

    this.isProcessing = false;
  }

  /**
   * Preload a single image
   */
  private preloadImage(url: string, options: ImagePreloadOptions = {}): void {
    if (this.preloadedImages.has(url)) return;

    this.currentLoading++;
    this.preloadedImages.add(url);

    const img = new Image();
    
    // Set up error handling
    img.onerror = () => {
      console.warn(`Failed to preload image: ${url}`);
      this.currentLoading--;
      this.processQueue(); // Continue processing queue
    };

    img.onload = () => {
      this.currentLoading--;
      this.processQueue(); // Continue processing queue
    };

    // Optimize image URL if possible
    const optimizedUrl = this.optimizeImageUrl(url, options);
    img.src = optimizedUrl;
  }

  /**
   * Optimize image URL for better performance
   */
  private optimizeImageUrl(url: string, options: ImagePreloadOptions): string {
    // If it's a Supabase URL, we can add optimization parameters
    if (url.includes('supabase') && url.includes('storage')) {
      const urlObj = new URL(url);
      
      // Add image transformation parameters
      if (options.quality === 'low') {
        urlObj.searchParams.set('width', '400');
        urlObj.searchParams.set('quality', '60');
      } else if (options.quality === 'medium') {
        urlObj.searchParams.set('width', '600');
        urlObj.searchParams.set('quality', '80');
      } else {
        urlObj.searchParams.set('width', '800');
        urlObj.searchParams.set('quality', '90');
      }

      // Prefer WebP format for better compression
      if (options.format === 'webp' || !options.format) {
        urlObj.searchParams.set('format', 'webp');
      }

      return urlObj.toString();
    }

    return url;
  }

  /**
   * Get optimized image URL for immediate display
   */
  getOptimizedUrl(url: string, quality: 'low' | 'medium' | 'high' = 'medium'): string {
    return this.optimizeImageUrl(url, { quality });
  }

  /**
   * Check if image is already preloaded
   */
  isPreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }

  /**
   * Clear preloaded images cache (useful for memory management)
   */
  clearCache(): void {
    this.preloadedImages.clear();
    this.preloadQueue = [];
  }

  /**
   * Get loading statistics
   */
  getStats(): { preloaded: number; queued: number; loading: number } {
    return {
      preloaded: this.preloadedImages.size,
      queued: this.preloadQueue.length,
      loading: this.currentLoading
    };
  }
}

// Export singleton instance
export const categoryImageService = new CategoryImageService();

// Export the class for testing
export { CategoryImageService };
