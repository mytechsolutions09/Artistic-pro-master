/**
 * Memory utility functions for optimizing application memory usage
 */

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

/**
 * Get current memory usage statistics
 */
export function getMemoryStats(): MemoryStats | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: Math.round(usagePercentage * 100) / 100
    };
  }
  return null;
}

/**
 * Check if memory usage is above threshold
 */
export function isMemoryUsageHigh(threshold: number = 80): boolean {
  const stats = getMemoryStats();
  return stats ? stats.usagePercentage > threshold : false;
}

/**
 * Log memory usage with optional prefix
 */
export function logMemoryUsage(prefix: string = 'Memory'): void {
  const stats = getMemoryStats();
  if (stats) {
    console.log(`${prefix}: ${stats.usagePercentage}% (${formatBytes(stats.usedJSHeapSize)}/${formatBytes(stats.jsHeapSizeLimit)})`);
  }
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounced function to avoid excessive memory monitoring calls
 */
export function createDebouncedMemoryMonitor(callback: (stats: MemoryStats) => void, delay: number = 1000) {
  let timeoutId: NodeJS.Timeout;
  
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const stats = getMemoryStats();
      if (stats) {
        callback(stats);
      }
    }, delay);
  };
}

/**
 * Clean up large objects and arrays to free memory
 */
export function cleanupLargeObjects(obj: any, maxSize: number = 100): void {
  if (Array.isArray(obj) && obj.length > maxSize) {
    // Keep only the most recent items
    obj.splice(0, obj.length - maxSize);
  }
  
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (Array.isArray(obj[key]) && obj[key].length > maxSize) {
        obj[key].splice(0, obj[key].length - maxSize);
      }
    });
  }
}

/**
 * Memory-efficient array operations
 */
export class MemoryEfficientArray<T> {
  private items: T[] = [];
  private maxSize: number;
  private cache: Map<string, T[]> = new Map();

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  add(item: T): void {
    this.items.push(item);
    if (this.items.length > this.maxSize) {
      this.items.shift(); // Remove oldest item
    }
    this.cache.clear();
  }

  get(filterFn?: (item: T) => boolean, cacheKey?: string): T[] {
    if (filterFn) {
      if (cacheKey && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }
      
      const filtered = this.items.filter(filterFn);
      if (cacheKey) {
        this.cache.set(cacheKey, filtered);
      }
      return filtered;
    }
    
    return [...this.items]; // Return copy to prevent mutations
  }

  clear(): void {
    this.items = [];
    this.cache.clear();
  }

  get length(): number {
    return this.items.length;
  }
}

/**
 * Throttled memory monitoring for production use
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private isMonitoring = false;
  private intervalId: NodeJS.Timeout | null = null;
  private threshold = 80;
  private onHighUsage?: (stats: MemoryStats) => void;

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  startMonitoring(threshold: number = 80, onHighUsage?: (stats: MemoryStats) => void): void {
    if (this.isMonitoring) return;
    
    this.threshold = threshold;
    this.onHighUsage = onHighUsage;
    this.isMonitoring = true;
    
    this.intervalId = setInterval(() => {
      const stats = getMemoryStats();
      if (stats && stats.usagePercentage > this.threshold) {
        logMemoryUsage('⚠️ High Memory Usage');
        if (this.onHighUsage) {
          this.onHighUsage(stats);
        }
      }
    }, 5000); // Check every 5 seconds
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
  }

  getCurrentStats(): MemoryStats | null {
    return getMemoryStats();
  }
}
