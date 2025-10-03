import React, { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { Product } from '../types';
import { Filter, ChevronDown, Shirt, X } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const MenClothingPage: React.FC = () => {
  const { adminProducts, loading, error } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000] as [number, number],
    rating: 0,
    featured: false,
    sortBy: 'relevance',
    category: 'Men' as string | undefined,
    productType: 'all' as 'digital' | 'poster' | 'all',
    tags: [] as string[],
    status: 'all' as 'active' | 'inactive' | 'all',
    clothingType: 'all' as string, // New filter for clothing types
    size: [] as string[], // Size filter
    color: [] as string[], // Color filter
  });

  // Clothing-specific filter options
  const clothingTypes = ['all', 't-shirt', 'shirt', 'jeans', 'jacket', 'hoodie', 'pants', 'shorts', 'sweater'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Navy', 'Brown'];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Filter products for Men's clothing category
    const menProducts = adminProducts.filter(product => {
      // Check if product has 'Men' or 'men' or 'Clothing' in categories
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories.some(cat => 
          cat.toLowerCase().includes('men') || 
          cat.toLowerCase().includes('clothing') ||
          cat.toLowerCase() === 'men'
        );
      }
      return false;
    });
    setFilteredProducts(menProducts);
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
  }, [filters]);

  // Update displayed products for infinite scroll
  useEffect(() => {
    const endIndex = currentPage * itemsPerPage;
    const newDisplayedProducts = filteredProducts.slice(0, endIndex);
    setDisplayedProducts(newDisplayedProducts);
    setHasMore(endIndex < filteredProducts.length);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const applyFilters = () => {
    // Start with all men's products
    let filtered = adminProducts.filter(product => {
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories.some(cat => 
          cat.toLowerCase().includes('men') || 
          cat.toLowerCase().includes('clothing') ||
          cat.toLowerCase() === 'men'
        );
      }
      return false;
    });

    // Clothing type filter
    if (filters.clothingType !== 'all') {
      filtered = filtered.filter(product => 
        product.tags && product.tags.some(tag => 
          tag.toLowerCase().includes(filters.clothingType.toLowerCase())
        )
      );
    }

    // Size filter
    if (filters.size && filters.size.length > 0) {
      filtered = filtered.filter(product =>
        filters.size.some(size => 
          product.tags && product.tags.some(tag => tag.toLowerCase().includes(size.toLowerCase()))
        )
      );
    }

    // Color filter
    if (filters.color && filters.color.length > 0) {
      filtered = filtered.filter(product =>
        filters.color.some(color => 
          product.tags && product.tags.some(tag => tag.toLowerCase().includes(color.toLowerCase()))
        )
      );
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
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        break;
      default:
        // relevance - keep default order
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage + 1);
        setLoadingMore(false);
      }, 500);
    }
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 500
        && !loadingMore
        && hasMore
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error loading products: {error}
          </div>
        </div>
      </div>
    );
  }

  const { formatCurrency, currentCurrency } = useCurrency();

  const handlePriceChange = (index: number, value: number) => {
    const newRange: [number, number] = [...filters.priceRange] as [number, number];
    newRange[index] = value;
    
    if (index === 0 && value > newRange[1]) {
      newRange[1] = value;
    } else if (index === 1 && value < newRange[0]) {
      newRange[0] = value;
    }
    
    handleFilterChange({ priceRange: newRange });
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 10000],
      rating: 0,
      featured: false,
      sortBy: 'relevance',
      category: 'Men',
      productType: 'all',
      tags: [],
      status: 'all',
      clothingType: 'all',
      size: [],
      color: [],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <Shirt className="w-6 h-6" style={{ color: '#ff6e00' }} />
            <h1 className="text-2xl font-bold text-gray-900">Necessary Milan</h1>
          </div>
        </div>

        {/* Filter Bar - Full Width */}
        <div className="mb-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Top Bar - Always Visible */}
          <div className="px-3 py-2 flex flex-wrap justify-between items-center gap-2 border-b border-gray-200">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                  showFilters 
                    ? 'border-gray-300 hover:bg-gray-50' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
                style={showFilters ? { backgroundColor: '#fff4ed', borderColor: '#ff6e00', color: '#ff6e00' } : {}}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 rotate-180" />}
              </button>
              
              {/* Clothing Type Dropdown */}
               <div className="relative">
                 <select
                   value={filters.clothingType}
                   onChange={(e) => handleFilterChange({ clothingType: e.target.value })}
                   className={`clothing-type-select px-3 py-1.5 text-sm rounded-lg appearance-none pr-8 transition-colors focus:ring-0 ${
                     filters.clothingType !== 'all' 
                       ? 'text-white font-medium' 
                       : 'bg-white border-2 border-gray-300 focus:border-orange-500 hover:border-orange-500'
                   }`}
                   style={
                     filters.clothingType !== 'all' 
                       ? { 
                           backgroundColor: '#ff6e00', 
                           outline: 'none', 
                           border: 'none', 
                           boxShadow: 'none', 
                           accentColor: '#ff6e00',
                           WebkitAppearance: 'none',
                           MozAppearance: 'none',
                           backgroundImage: 'none'
                         }
                       : { 
                           outline: 'none', 
                           boxShadow: 'none', 
                           accentColor: '#ff6e00',
                           WebkitAppearance: 'none',
                           MozAppearance: 'none',
                           backgroundImage: 'none'
                         }
                   }
                  onFocus={(e) => {
                    if (filters.clothingType === 'all') {
                      e.target.style.borderColor = '#ff6e00';
                      e.target.style.boxShadow = 'none';
                      e.target.style.outline = 'none';
                    }
                  }}
                  onBlur={(e) => {
                    if (filters.clothingType === 'all') {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (filters.clothingType === 'all') {
                      e.target.style.borderColor = '#ff6e00';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filters.clothingType === 'all' && document.activeElement !== e.target) {
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                >
                  {clothingTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                 <ChevronDown 
                   className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors"
                   style={{ color: filters.clothingType !== 'all' ? 'white' : '#9ca3af' }}
                 />
               </div>

              <span className="text-xs text-gray-600">
                {displayedProducts.length} of {filteredProducts.length} products
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                  className="sort-select px-3 py-1.5 text-sm bg-white border-2 border-gray-300 rounded-lg appearance-none pr-8 focus:border-orange-500 hover:border-orange-500 focus:ring-0"
                  style={{ outline: 'none', boxShadow: 'none', accentColor: '#ff6e00', backgroundImage: 'none', borderColor: '#d1d5db' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff6e00';
                    e.target.style.boxShadow = 'none';
                    e.target.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = '#ff6e00'}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expanded Filters Section */}
          {showFilters && (
            <div className="px-3 py-3 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Size Filter */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">Size</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => {
                          const newSizes = filters.size.includes(size)
                            ? filters.size.filter(s => s !== size)
                            : [...filters.size, size];
                          handleFilterChange({ size: newSizes });
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          filters.size.includes(size)
                            ? 'text-white'
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                        style={filters.size.includes(size) ? { backgroundColor: '#ff6e00' } : {}}
                        onMouseEnter={(e) => {
                          if (!filters.size.includes(size)) {
                            e.currentTarget.style.borderColor = '#ff6e00';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!filters.size.includes(size)) {
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">Color</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          const newColors = filters.color.includes(color)
                            ? filters.color.filter(c => c !== color)
                            : [...filters.color, color];
                          handleFilterChange({ color: newColors });
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          filters.color.includes(color)
                            ? 'text-white'
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                        style={filters.color.includes(color) ? { backgroundColor: '#ff6e00' } : {}}
                        onMouseEnter={(e) => {
                          if (!filters.color.includes(color)) {
                            e.currentTarget.style.borderColor = '#ff6e00';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!filters.color.includes(color)) {
                            e.currentTarget.style.borderColor = '#d1d5db';
                          }
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">Price Range</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{formatCurrency(filters.priceRange[0], currentCurrency)}</span>
                      <span>{formatCurrency(filters.priceRange[1], currentCurrency)}</span>
                    </div>
                    <div className="relative h-2">
                      <div className="absolute w-full h-full bg-gray-200 rounded-lg"></div>
                      <div
                        className="absolute h-full rounded-lg z-[5]"
                        style={{
                          backgroundColor: '#ff6e00',
                          left: `${(filters.priceRange[0] / 10000) * 100}%`,
                          width: `${((filters.priceRange[1] - filters.priceRange[0]) / 10000) * 100}%`,
                        }}
                      ></div>
                      <input
                        type="range"
                        min={0}
                        max={10000}
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceChange(0, parseFloat(e.target.value))}
                        className="absolute w-full h-full bg-transparent appearance-none cursor-pointer slider z-10"
                      />
                      <input
                        type="range"
                        min={0}
                        max={10000}
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(1, parseFloat(e.target.value))}
                        className="absolute w-full h-full bg-transparent appearance-none cursor-pointer slider z-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">Rating</h4>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange({ rating: parseFloat(e.target.value) })}
                    className="rating-select w-full px-2.5 py-1.5 bg-white border-2 border-gray-300 rounded-lg text-xs focus:border-orange-500 hover:border-orange-500 focus:ring-0"
                    style={{ outline: 'none', boxShadow: 'none', accentColor: '#ff6e00', backgroundImage: 'none', borderColor: '#d1d5db' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ff6e00';
                      e.target.style.boxShadow = 'none';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = '#ff6e00'}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.target) {
                        e.target.style.borderColor = '#d1d5db';
                      }
                    }}
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.0}>4.0+ Stars</option>
                    <option value={3.5}>3.5+ Stars</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Clear All Filters</span>
                </button>
                <div className="text-xs text-gray-600">
                  {filters.size.length + filters.color.length + (filters.clothingType !== 'all' ? 1 : 0) + (filters.featured ? 1 : 0) + (filters.rating > 0 ? 1 : 0)} filters applied
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Load More Button (backup for infinite scroll) */}
            {!loadingMore && hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#ff6e00' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e56300'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6e00'}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Slider Styles */}
      <style>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
        }
        .slider::-webkit-slider-runnable-track {
          background: transparent;
        }
        .slider::-moz-range-track {
          background: transparent;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ff6e00;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ff6e00;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Override default select styles with accent-color */
        .clothing-type-select,
        .sort-select,
        .rating-select {
          accent-color: #ff6e00 !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
          background-image: none !important;
          background-repeat: no-repeat !important;
          background-position: right 0.5rem center !important;
          background-size: 1.5em 1.5em !important;
          padding-right: 2.5rem !important;
        }
        
        /* Remove default arrow for all browsers */
        .clothing-type-select::-ms-expand,
        .sort-select::-ms-expand,
        .rating-select::-ms-expand {
          display: none;
        }
        
        /* Remove any background images that browsers add */
        select.clothing-type-select,
        select.sort-select,
        select.rating-select {
          background-image: none !important;
        }
        
        .clothing-type-select:focus {
          outline: none !important;
          box-shadow: none !important;
          border-color: #ff6e00 !important;
        }
        
        .clothing-type-select:hover {
          border-color: #ff6e00 !important;
        }
        
        .clothing-type-select:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          border-color: #ff6e00 !important;
        }
        
        /* Override option colors - these work in some browsers */
        .clothing-type-select option:checked,
        .sort-select option:checked,
        .rating-select option:checked {
          background-color: #ff6e00 !important;
          background: #ff6e00 !important;
          color: white !important;
        }
        
        .clothing-type-select option:hover,
        .sort-select option:hover,
        .rating-select option:hover {
          background-color: #fff4ed !important;
          background: #fff4ed !important;
          color: #ff6e00 !important;
        }
        
        .clothing-type-select option,
        .sort-select option,
        .rating-select option {
          background-color: white;
          color: #374151;
        }
        
        .clothing-type-select option:focus,
        .sort-select option:focus,
        .rating-select option:focus {
          background-color: #ff6e00 !important;
          background: #ff6e00 !important;
          color: white !important;
        }
        
        /* Apply same styles to all select elements */
        .sort-select:focus,
        .rating-select:focus {
          outline: none !important;
          box-shadow: none !important;
          border-color: #ff6e00 !important;
        }
        
        .sort-select:hover,
        .rating-select:hover,
        .clothing-type-select:hover {
          border-color: #ff6e00 !important;
          box-shadow: none !important;
        }
        
        /* Ensure no pink/blue rings appear */
        .sort-select:focus-within,
        .rating-select:focus-within,
        .clothing-type-select:focus-within {
          border-color: #ff6e00 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        
        .sort-select:focus-visible,
        .rating-select:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          border-color: #ff6e00 !important;
        }
      `}</style>
    </div>
  );
};

export default MenClothingPage;

