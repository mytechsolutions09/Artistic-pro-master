import { supabase } from './supabase';
import { logMemoryUsage, isMemoryUsageHigh } from '../utils/memoryUtils';

/**
 * Memory-optimized service for database operations
 * Implements pagination, caching, and memory-aware loading
 */
export class MemoryOptimizedService {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly DEFAULT_PAGE_SIZE = 50;
  private static readonly MAX_PAGE_SIZE = 100;

  /**
   * Get cached data if available and not expired
   */
  private static getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Cache data with TTL
   */
  private static setCachedData(key: string, data: any, ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear expired cache entries
   */
  private static clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  static clearCache(): void {
    this.cache.clear();
    logMemoryUsage('Cache cleared');
  }

  /**
   * Memory-optimized product fetching with pagination
   */
  static async getProductsPaginated(
    page: number = 1,
    pageSize: number = this.DEFAULT_PAGE_SIZE,
    filters?: {
      category?: string;
      featured?: boolean;
      status?: string;
    }
  ): Promise<{ data: any[]; totalCount: number; hasMore: boolean }> {
    const cacheKey = `products-${page}-${pageSize}-${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      logMemoryUsage('Products loaded from cache');
      return cached;
    }

    // Check memory usage before loading
    if (isMemoryUsageHigh(85)) {
      console.warn('High memory usage, reducing page size');
      pageSize = Math.min(pageSize, 20);
    }

    try {
      logMemoryUsage('Products - Before DB Query');
      
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('created_date', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      const result = {
        data: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > page * pageSize
      };

      // Cache the result
      this.setCachedData(cacheKey, result);
      
      logMemoryUsage('Products - After DB Query');
      
      return result;
    } catch (error) {
      console.error('Error fetching paginated products:', error);
      return { data: [], totalCount: 0, hasMore: false };
    }
  }

  /**
   * Memory-optimized category fetching
   */
  static async getCategories(): Promise<any[]> {
    const cacheKey = 'categories';
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      logMemoryUsage('Categories loaded from cache');
      return cached;
    }

    try {
      logMemoryUsage('Categories - Before DB Query');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Cache the result
      this.setCachedData(cacheKey, data || []);
      
      logMemoryUsage('Categories - After DB Query');
      
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Memory-optimized order fetching with pagination
   */
  static async getOrdersPaginated(
    page: number = 1,
    pageSize: number = this.DEFAULT_PAGE_SIZE,
    filters?: {
      status?: string;
      customerId?: string;
    }
  ): Promise<{ data: any[]; totalCount: number; hasMore: boolean }> {
    const cacheKey = `orders-${page}-${pageSize}-${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      logMemoryUsage('Orders loaded from cache');
      return cached;
    }

    // Reduce page size if memory usage is high
    let adjustedPageSize = pageSize;
    if (isMemoryUsageHigh(85)) {
      adjustedPageSize = Math.min(pageSize, 25);
    }

    try {
      logMemoryUsage('Orders - Before DB Query');
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              title,
              main_image,
              pdf_url
            )
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      // Apply pagination
      const from = (page - 1) * adjustedPageSize;
      const to = from + adjustedPageSize - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      const result = {
        data: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > page * adjustedPageSize
      };

      // Cache the result with shorter TTL for orders (more dynamic data)
      this.setCachedData(cacheKey, result, 2 * 60 * 1000); // 2 minutes
      
      logMemoryUsage('Orders - After DB Query');
      
      return result;
    } catch (error) {
      console.error('Error fetching paginated orders:', error);
      return { data: [], totalCount: 0, hasMore: false };
    }
  }

  /**
   * Clean up cache periodically
   */
  static startCacheCleanup(): void {
    setInterval(() => {
      this.clearExpiredCache();
      logMemoryUsage('Cache cleanup completed');
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Start cache cleanup on service initialization
MemoryOptimizedService.startCacheCleanup();
