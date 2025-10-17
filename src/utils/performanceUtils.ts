/**
 * Performance optimization utilities
 */

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Request idle callback with fallback
 */
export const requestIdleCallback = (callback: () => void): void => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
};

/**
 * Measure performance of a function
 */
export const measurePerformance = async <T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
};

/**
 * Check if device is on slow connection
 */
export const isSlowConnection = (): boolean => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType;
    const saveData = connection?.saveData;
    
    return saveData || effectiveType === 'slow-2g' || effectiveType === '2g';
  }
  return false;
};

/**
 * Get device memory in GB
 */
export const getDeviceMemory = (): number => {
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory;
  }
  return 4; // Default assumption
};

/**
 * Check if device has sufficient resources for high-quality images
 */
export const canHandleHighQualityImages = (): boolean => {
  const memory = getDeviceMemory();
  const slowConnection = isSlowConnection();
  
  return memory >= 4 && !slowConnection;
};

/**
 * Get optimal image quality based on device capabilities
 */
export const getOptimalImageQuality = (): number => {
  if (isSlowConnection()) return 60;
  if (getDeviceMemory() < 4) return 70;
  return 80; // Default quality
};

/**
 * Batch operations for better performance
 */
export const batchOperations = <T>(
  operations: (() => T)[],
  batchSize: number = 5
): Promise<T[]> => {
  return new Promise((resolve) => {
    const results: T[] = [];
    let currentIndex = 0;

    const processBatch = () => {
      const batch = operations.slice(currentIndex, currentIndex + batchSize);
      
      batch.forEach(op => {
        results.push(op());
      });

      currentIndex += batchSize;

      if (currentIndex < operations.length) {
        requestIdleCallback(processBatch);
      } else {
        resolve(results);
      }
    };

    processBatch();
  });
};

/**
 * Defer non-critical operations
 */
export const deferOperation = (callback: () => void, delay: number = 0): void => {
  if (delay > 0) {
    setTimeout(() => requestIdleCallback(callback), delay);
  } else {
    requestIdleCallback(callback);
  }
};

/**
 * Check if browser supports native lazy loading
 */
export const supportsNativeLazyLoading = (): boolean => {
  return 'loading' in HTMLImageElement.prototype;
};

/**
 * Observe element visibility for lazy loading
 */
export const observeElementVisibility = (
  element: HTMLElement,
  callback: () => void,
  options: IntersectionObserverInit = {}
): (() => void) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: '50px',
      threshold: 0.01,
      ...options
    }
  );

  observer.observe(element);

  // Return cleanup function
  return () => observer.disconnect();
};

/**
 * Prefetch resources
 */
export const prefetchResource = (url: string, type: 'image' | 'script' | 'style' = 'image'): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = (urls: string[]): void => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

