import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Memory-optimized state hook that provides efficient array operations
 * and automatic cleanup to reduce memory usage
 */
export function useMemoryOptimizedState<T>(initialValue: T[] = []) {
  const [state, setState] = useState<T[]>(initialValue);
  const cacheRef = useRef<Map<string, T[]>>(new Map());
  
  // Memoized operations to avoid recreating arrays
  const addItem = useCallback((item: T) => {
    setState(prev => {
      // Avoid creating new array if item already exists
      const exists = prev.some(existing => 
        typeof existing === 'object' && typeof item === 'object' 
          ? (existing as any).id === (item as any).id
          : existing === item
      );
      return exists ? prev : [...prev, item];
    });
    cacheRef.current.clear(); // Clear cache on state change
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setState(prev => prev.map(item => {
      if (typeof item === 'object' && (item as any).id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));
    cacheRef.current.clear();
  }, []);

  const removeItem = useCallback((id: string) => {
    setState(prev => prev.filter(item => 
      typeof item === 'object' ? (item as any).id !== id : item !== id
    ));
    cacheRef.current.clear();
  }, []);

  const setItems = useCallback((items: T[]) => {
    setState(items);
    cacheRef.current.clear();
  }, []);

  // Memoized filter operations with caching
  const filterItems = useCallback((filterFn: (item: T) => boolean, cacheKey?: string): T[] => {
    if (cacheKey && cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey)!;
    }
    
    const filtered = state.filter(filterFn);
    
    if (cacheKey) {
      cacheRef.current.set(cacheKey, filtered);
    }
    
    return filtered;
  }, [state]);

  // Cleanup function
  const cleanup = useCallback(() => {
    cacheRef.current.clear();
    setState([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cacheRef.current.clear();
    };
  }, []);

  return {
    items: state,
    addItem,
    updateItem,
    removeItem,
    setItems,
    filterItems,
    cleanup
  };
}
