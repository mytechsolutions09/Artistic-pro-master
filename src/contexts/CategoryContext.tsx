import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/categoryService';
import { CategoryService as SupabaseCategoryService } from '../services/supabaseService';
import { MemoryEfficientArray } from '../utils/memoryUtils';
import { logMemoryUsage, isMemoryUsageHigh } from '../utils/memoryUtils';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  refreshCategoryCounts: () => Promise<void>;
  forceRefreshCounts: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getFeaturedCategories: () => Category[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use memory-efficient array for categories
  const categoriesArray = useMemo(() => new MemoryEfficientArray<Category>(50), []);

  // Load categories from database on mount
  useEffect(() => {
    refreshCategories();
  }, []);

  // Auto-refresh category counts if they're all zero (indicating they need updating)
  useEffect(() => {
    const autoRefreshCounts = async () => {
      if (categories.length > 0 && categories.every(cat => cat.count === 0)) {
        console.log('All category counts are zero, refreshing counts...');
        await refreshCategoryCounts();
      }
    };
    
    autoRefreshCounts();
  }, [categories]);

  // Set up periodic refresh to keep counts up to date - optimized for memory usage
  useEffect(() => {
    const interval = setInterval(async () => {
      // Only refresh if we have categories and memory usage is not high
      if (categories.length > 0 && !isMemoryUsageHigh(75)) {
        console.log('Periodic category count refresh...');
        await refreshCategoryCounts();
        logMemoryUsage('CategoryContext - After Refresh');
      } else if (isMemoryUsageHigh(75)) {
        console.log('Skipping category refresh due to high memory usage');
      }
    }, 60000); // Refresh every 60 seconds (reduced frequency)

    return () => clearInterval(interval);
  }, [categories.length]);

  // Listen for custom events to trigger immediate refresh
  useEffect(() => {
    const handleCategoryCountsUpdated = async () => {
      console.log('Received categoryCountsUpdated event, refreshing...');
      await forceRefreshCounts();
    };

    window.addEventListener('categoryCountsUpdated', handleCategoryCountsUpdated);
    
    return () => {
      window.removeEventListener('categoryCountsUpdated', handleCategoryCountsUpdated);
    };
  }, []);

  // Refresh categories from database
  const refreshCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Refresh category counts specifically
  const refreshCategoryCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First refresh the counts in the database
      await SupabaseCategoryService.refreshCategoryCounts();
      
      // Then reload the categories
      await refreshCategories();
    } catch (err) {
      console.error('Error refreshing category counts:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh category counts');
    } finally {
      setLoading(false);
    }
  };

  // Force refresh category counts (for immediate updates)
  const forceRefreshCounts = async () => {
    try {
      console.log('Force refreshing category counts...');
      setError(null);
      
      // First refresh the counts in the database
      await SupabaseCategoryService.refreshCategoryCounts();
      
      // Then reload the categories without showing loading state
      const data = await categoryService.getAllCategories();
      setCategories(data);
      console.log('Category counts force refreshed successfully');
    } catch (err) {
      console.error('Error force refreshing category counts:', err);
      setError(err instanceof Error ? err.message : 'Failed to force refresh category counts');
    }
  };

  // Get category by ID
  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
  };

  // Get category by slug
  const getCategoryBySlug = (slug: string): Category | undefined => {
    return categories.find(cat => cat.slug === slug);
  };

  // Memoized featured categories to avoid recreating array on every call
  const getFeaturedCategories = useCallback((): Category[] => {
    const cacheKey = 'featured-categories';
    return categoriesArray.get(cat => Boolean(cat.featured), cacheKey);
  }, [categoriesArray]);

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    refreshCategories,
    refreshCategoryCounts,
    forceRefreshCounts,
    getCategoryById,
    getCategoryBySlug,
    getFeaturedCategories
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
