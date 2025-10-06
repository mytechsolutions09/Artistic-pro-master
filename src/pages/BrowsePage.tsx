import React, { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { Product } from '../types';

const BrowsePage: React.FC = () => {
  const { adminProducts, loading, error } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Fixed items per load for infinite scroll
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000] as [number, number],
    rating: 0,
    featured: false,
    sortBy: 'relevance',
    category: undefined as string | undefined,
    productType: 'all' as 'digital' | 'poster' | 'all',
    tags: [] as string[],
    status: 'all' as 'active' | 'inactive' | 'all'
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Set initial filtered products when adminProducts change
    setFilteredProducts(adminProducts);
    // Scroll to top when products load
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [adminProducts]);

  useEffect(() => {
    applyFilters();
  }, [filters, adminProducts]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setDisplayedProducts([]);
    setHasMore(true);
    // Scroll to top when filters change
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [filters]);

  // Update displayed products for infinite scroll
  useEffect(() => {
    const endIndex = currentPage * itemsPerPage;
    const newDisplayedProducts = filteredProducts.slice(0, endIndex);
    setDisplayedProducts(newDisplayedProducts);
    setHasMore(endIndex < filteredProducts.length);
    
    // Debug logging removed
  }, [filteredProducts, currentPage, itemsPerPage]);

  const applyFilters = () => {
    
    let filtered = [...adminProducts];

    // Exclude clothing products from browse page
    filtered = filtered.filter(product => {
      // Exclude if product has gender field (clothing indicator)
      if (product.gender) return false;
      
      // Exclude if categories contain clothing-related keywords
      if (product.categories && Array.isArray(product.categories)) {
        const hasClothingCategory = product.categories.some((cat: string) => 
          ['men', 'women', 'clothing'].some(keyword => 
            cat.toLowerCase().includes(keyword)
          )
        );
        if (hasClothingCategory) return false;
      }
      
      return true;
    });

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => {
        // Handle both old single category and new categories array
        if (product.categories && Array.isArray(product.categories)) {
          return product.categories.includes(filters.category!);
        }
        // Fallback for old data structure
        return (product as any).category === filters.category;
      });
    }

    // Product type filter
    if (filters.productType !== 'all') {
      filtered = filtered.filter(product => product.productType === filters.productType);
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(product => 
        filters.tags.some(tag => product.tags && product.tags.includes(tag))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(product => product.status === filters.status);
    }

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(product => product.featured);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'downloads':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'relevance':
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        break;
    }

    setFilteredProducts(filtered);
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };


  // Infinite scroll handler
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setLoadingMore(false);
    }, 500); // Simulate loading delay
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingMore) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [hasMore, loadingMore]);

  // Check if there are more products to load
  const hasMoreProducts = hasMore;

  // Get unique categories from admin products (excluding clothing categories)
  const getUniqueCategories = () => {
    // Flatten all categories from all products and get unique ones
    const allCategories = adminProducts.flatMap(product => {
      // Handle both old single category and new categories array
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories;
      }
      // Fallback for old data structure
      return (product as any).category ? [(product as any).category] : [];
    });
    
    // Exclude clothing-related categories
    const uniqueCategories = Array.from(new Set(allCategories.filter(cat => {
      if (!cat) return false;
      const lowerCat = cat.toLowerCase();
      return !['men', 'women', 'clothing'].some(keyword => lowerCat.includes(keyword));
    })));
    
    return uniqueCategories.map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      slug: category
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading products</h3>
          <p className="text-gray-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* All Filters Button */}
        <div className="mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 text-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>All Filters</span>
          </button>
        </div>



        {/* Active Filters Display */}
        {filters.category && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filter:</span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-50 border border-pink-200 rounded-full text-sm text-pink-700">
              <span>{filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}</span>
              <button
                onClick={() => updateFilters({ category: undefined })}
                className="hover:text-pink-900"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your filters or browse other categories
              </p>
              <button
                onClick={() => setFilters({
                  priceRange: [0, 10000] as [number, number],
                  rating: 0,
                  featured: false,
                  sortBy: 'relevance',
                  category: undefined,
                  productType: 'all',
                  tags: [],
                  status: 'all'
                })}
                className="text-pink-500 hover:text-pink-600 font-medium text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Infinite Scroll Trigger */}
        {hasMoreProducts && (
          <div id="load-more-trigger" className="mt-8 flex items-center justify-center">
            {loadingMore ? (
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, index) => (
                    <ProductCardSkeleton key={`loading-${index}`} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm">
                Scroll down to load more products
              </div>
            )}
          </div>
        )}

        {/* End of results message */}
        {!hasMoreProducts && displayedProducts.length > 0 && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            You've reached the end of the results ({displayedProducts.length} products)
          </div>
        )}
      </div>

      {/* Filters Sidebar - Modal (Outside main content flow) */}
      {showFilters && (
        <FilterSidebar 
          filters={filters}
          onFilterChange={updateFilters}
          products={adminProducts}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default BrowsePage;
