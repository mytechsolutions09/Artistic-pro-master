import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import CategoryPageSkeleton from '../components/CategoryPageSkeleton';
import { categoryImageService } from '../services/categoryImageService';
import { Product } from '../types';
import { generateCategorySlug, generateSlug } from '../utils/slugUtils';

const CategoryDetailPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { adminProducts, loading, error } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [1, 10000] as [number, number],
    rating: 0,
    featured: false,
    sortBy: 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const PRODUCTS_PER_PAGE = 8;

  useEffect(() => {
    if (categorySlug && adminProducts.length > 0) {


      
              // Check if this might be a product URL by looking for products with matching category slug
        const categoryProducts = adminProducts.filter(product => {
          // Handle both old single category and new categories array
          if (product.categories && Array.isArray(product.categories)) {
            return product.categories.some(category => {
              // First try exact category name match
              if (category === categorySlug) {
                return true;
              }
              
              // Then try slugified match
              const productCategorySlug = generateCategorySlug(category);
              const incomingCategorySlug = generateCategorySlug(categorySlug);
              const matches = productCategorySlug === incomingCategorySlug;
              

              return matches;
            });
          } else if ((product as any).category) {
            // Fallback for old data structure
            const category = (product as any).category;
            if (category === categorySlug) {
              return true;
            }
            
            const productCategorySlug = generateCategorySlug(category);
            const incomingCategorySlug = generateCategorySlug(categorySlug);
            const matches = productCategorySlug === incomingCategorySlug;
            

            return matches;
          }
          
          return false;
        });
      

      
      if (categoryProducts.length === 0) {

        // If no products found for this category, it might be a product URL
        // Check if there's a product with a title that matches this slug
        const possibleProduct = adminProducts.find(product => {
          const productTitleSlug = generateSlug(product.title);
          return productTitleSlug === categorySlug;
        });
        
        if (possibleProduct) {

          // This is likely a product URL, redirect to product page
          // Get the first category for the redirect URL
          const firstCategory = possibleProduct.categories && possibleProduct.categories.length > 0 
            ? possibleProduct.categories[0] 
            : (possibleProduct as any).category || 'unknown';
          window.location.href = `/${generateCategorySlug(firstCategory)}/${categorySlug}`;
          return;
        }
        

      }
      
      const foundCategory = {
        id: categorySlug,
        name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
        slug: categorySlug
      };
      setCategory(foundCategory);
      
      setFilteredProducts(categoryProducts);
      
      // Update price range based on actual products
      if (categoryProducts.length > 0) {
        const prices = categoryProducts.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setFilters(prev => ({
          ...prev,
          priceRange: [minPrice, maxPrice],
          sortBy: 'relevance'
        }));
      }
    }
  }, [categorySlug, adminProducts]);

  useEffect(() => {
    applyFilters();
  }, [filters, adminProducts, categorySlug]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setDisplayedProducts([]);
  }, [filters]);

  // Update displayed products based on current page
  useEffect(() => {
    const endIndex = currentPage * PRODUCTS_PER_PAGE;
    setDisplayedProducts(filteredProducts.slice(0, endIndex));
  }, [filteredProducts, currentPage]);

  // Preload images for better performance
  useEffect(() => {
    if (displayedProducts.length > 0) {
      // Extract all image URLs from displayed products
      const imageUrls = displayedProducts
        .flatMap(product => product.images || [])
        .filter(Boolean);

      if (imageUrls.length > 0) {
        // Preload above-the-fold images (first 8 products) with high priority
        categoryImageService.preloadAboveFoldImages(imageUrls);
      }
    }
  }, [displayedProducts]);

  const applyFilters = () => {
    if (!categorySlug) return;
    

    
          let filtered = adminProducts.filter(product => {
        // Handle both old single category and new categories array
        if (product.categories && Array.isArray(product.categories)) {
          // Check if any category in the array matches
          return product.categories.some(category => {
            // First try exact category name match
            if (category === categorySlug) {
              return true;
            }
            
            // Then try slugified match
            const productCategorySlug = generateCategorySlug(category);
            const incomingCategorySlug = generateCategorySlug(categorySlug);
            const matches = productCategorySlug === incomingCategorySlug;
            

            return matches;
          });
        } else if ((product as any).category) {
          // Fallback for old data structure
          const category = (product as any).category;
          if (category === categorySlug) {
            return true;
          }
          
          const productCategorySlug = generateCategorySlug(category);
          const incomingCategorySlug = generateCategorySlug(categorySlug);
          const matches = productCategorySlug === incomingCategorySlug;
          

          return matches;
        }
        
        return false;
      });
    


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

  // Load more products handler
  const handleLoadMore = () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setLoadingMore(false);
    }, 500); // Simulate loading delay
  };

  // Check if there are more products to load
  const hasMoreProducts = displayedProducts.length < filteredProducts.length;

  // Auto-load more products when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMoreProducts) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user is within 200px of the bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMoreProducts]);

  if (loading) {
    return <CategoryPageSkeleton showFilters={showFilters} productCount={8} />;
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

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-0.5 0-1 0.5-1 1s0.5 1 1 1 1-0.5 1-1-0.5-1-1-1z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Category not found</h3>
          <p className="text-gray-500 mb-4">The requested category could not be found.</p>
          <Link to="/browse" className="text-pink-500 hover:text-pink-600 font-medium">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-8">
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

        {/* Products Grid */}
        <div className="flex-1">
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
              
              {/* Loading more skeleton cards */}
              {loadingMore && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <ProductCardSkeleton key={`loading-${i}`} />
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No artwork found</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                This category doesn't have any products yet. Try exploring other categories or check back later.
              </p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMoreProducts && !loadingMore && (
          <div className="mt-8 flex items-center justify-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
            >
              Load More Products
            </button>
          </div>
        )}
      </div>

      {/* Filters Sidebar - Modal (Outside main content flow) */}
      {showFilters && (
        <FilterSidebar 
          filters={filters}
          onFilterChange={updateFilters}
          products={adminProducts.filter(product => {
            // Handle both old single category and new categories array
            if (product.categories && Array.isArray(product.categories)) {
              return product.categories.some(category => {
                const productCategorySlug = generateCategorySlug(category);
                return productCategorySlug === categorySlug;
              });
            } else if ((product as any).category) {
              // Fallback for old data structure
              const productCategorySlug = generateCategorySlug((product as any).category);
              return productCategorySlug === categorySlug;
            }
            return false;
          })}
          onClose={() => setShowFilters(false)}
          displayedCount={displayedProducts.length}
          filteredCount={filteredProducts.length}
        />
      )}
    </div>
  );
};

export default CategoryDetailPage;
