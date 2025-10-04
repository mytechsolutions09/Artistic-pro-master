import React, { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { Product } from '../types';

interface FilterSidebarProps {
  filters: {
    priceRange: [number, number];
    rating: number;
    featured: boolean;
    sortBy: string;
    category?: string;
    productType?: 'digital' | 'poster' | 'all';
    tags?: string[];
    status?: 'active' | 'inactive' | 'all';
  };
  onFilterChange: (newFilters: Partial<{
    priceRange: [number, number];
    rating: number;
    featured: boolean;
    sortBy: string;
    category?: string;
    productType?: 'digital' | 'poster' | 'all';
    tags?: string[];
    status?: 'active' | 'inactive' | 'all';
  }>) => void;
  products: Product[];
  onClose?: () => void;
  displayedCount?: number;
  filteredCount?: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, products, onClose, displayedCount, filteredCount }) => {
  const { currentCurrency, formatCurrency } = useCurrency();
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);

  // Calculate dynamic price range from products
  const productPrices = products.map(p => p.price);
  const maxPrice = Math.max(...productPrices, 10000);
  const minPrice = Math.min(...productPrices, 0);

  // Get unique tags from products (exclude clothing-related tags)
  const allTags = Array.from(new Set(products.flatMap(p => p.tags || []))).filter(tag => {
    const lowerTag = tag.toLowerCase();
    return !['men', 'women', 'clothing', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'].some(keyword => 
      lowerTag.includes(keyword) || lowerTag === keyword
    );
  });

  // Get unique categories from products (exclude clothing-related categories)
  const productCategories = Array.from(new Set(products.flatMap(p => p.categories || []))).filter(cat => {
    const lowerCat = cat.toLowerCase();
    return !['men', 'women', 'clothing'].some(keyword => lowerCat.includes(keyword));
  });

  useEffect(() => {
    setSelectedTags(filters.tags || []);
  }, [filters.tags]);

  // Prevent body scroll when filter sidebar is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Restore body scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePriceChange = (index: number, value: number) => {
    const newRange: [number, number] = [...filters.priceRange] as [number, number];
    newRange[index] = value;
    
    // Ensure min doesn't exceed max and vice versa
    if (index === 0 && value > newRange[1]) {
      newRange[1] = value;
    } else if (index === 1 && value < newRange[0]) {
      newRange[0] = value;
    }
    
    onFilterChange({ priceRange: newRange });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilterChange({ tags: newTags });
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    onFilterChange({
      priceRange: [minPrice, maxPrice],
      rating: 0,
      featured: false,
      category: undefined,
      productType: 'all',
      tags: [],
      status: 'all'
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed left-0 top-16 w-1/3 h-[calc(100vh-4rem)] bg-white shadow-xl border-r border-gray-200 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-serif text-gray-800">Filters</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Item Count Display */}
          {displayedCount !== undefined && filteredCount !== undefined && (
            <div className="text-sm text-gray-600">
              Showing {displayedCount} of {filteredCount} items
            </div>
          )}
        </div>

        {/* Filter Content */}
        <div className="px-8 py-6 space-y-8 pb-24">
          {/* Filter by Category */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Categories</h4>
            <div className="relative">
              <select 
                value={filters.category || 'all'}
                onChange={(e) => onFilterChange({ category: e.target.value === 'all' ? undefined : e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white shadow-sm"
              >
                <option value="all">All Categories</option>
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Product Type */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Product Type</h4>
            <div className="space-y-3 pl-1">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="productType"
                  value="all"
                  checked={filters.productType === 'all'}
                  onChange={(e) => onFilterChange({ productType: e.target.value as 'digital' | 'poster' | 'all' })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">All Types</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="productType"
                  value="digital"
                  checked={filters.productType === 'digital'}
                  onChange={(e) => onFilterChange({ productType: e.target.value as 'digital' | 'poster' | 'all' })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Digital Downloads</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="productType"
                  value="poster"
                  checked={filters.productType === 'poster'}
                  onChange={(e) => onFilterChange({ productType: e.target.value as 'digital' | 'poster' | 'all' })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Physical Posters</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Tags</h4>
              <div className="space-y-3 pl-1 max-h-40 overflow-y-auto">
                {allTags.map((tag) => (
                  <label key={tag} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 transition-colors"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Special Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Special Features</h4>
            <div className="space-y-3 pl-1">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => onFilterChange({ featured: e.target.checked })}
                  className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Featured Artworks</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">On Sale</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">New Arrivals</span>
              </label>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Price</h4>
            <div className="space-y-4 pl-1">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{formatCurrency(filters.priceRange[0], currentCurrency)}</span>
                <span>{formatCurrency(filters.priceRange[1], currentCurrency)}</span>
              </div>
              <div className="relative h-2">
                {/* Static gray background track */}
                <div className="absolute w-full h-full bg-gray-200 rounded-lg"></div>
                
                {/* Pink fill for the selected range */}
                <div
                  className="absolute h-full bg-pink-500 rounded-lg z-[5]"
                  style={{
                    left: `${((filters.priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                    width: `${((filters.priceRange[1] - filters.priceRange[0]) / (maxPrice - minPrice)) * 100}%`,
                  }}
                ></div>
                
                {/* Range inputs (thumbs) */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(0, parseFloat(e.target.value))}
                  className="absolute w-full h-full bg-transparent appearance-none cursor-pointer slider z-10"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(1, parseFloat(e.target.value))}
                  className="absolute w-full h-full bg-transparent appearance-none cursor-pointer slider z-10"
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Rating</h4>
            <div className="space-y-3 pl-1">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  value={0}
                  checked={filters.rating === 0}
                  onChange={(e) => onFilterChange({ rating: parseFloat(e.target.value) })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Any Rating</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  value={4.5}
                  checked={filters.rating === 4.5}
                  onChange={(e) => onFilterChange({ rating: parseFloat(e.target.value) })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">4.5+ Stars</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  value={4.0}
                  checked={filters.rating === 4.0}
                  onChange={(e) => onFilterChange({ rating: parseFloat(e.target.value) })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">4.0+ Stars</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  value={3.5}
                  checked={filters.rating === 3.5}
                  onChange={(e) => onFilterChange({ rating: parseFloat(e.target.value) })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">3.5+ Stars</span>
              </label>
            </div>
          </div>

          {/* Featured & Popular */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Featured & Popular</h4>
            <div className="space-y-3 pl-1">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => onFilterChange({ featured: e.target.checked })}
                  className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Featured Artworks</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Best Sellers</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">New Arrivals</span>
              </label>
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Sort By</h4>
            <div className="space-y-3 pl-1">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sortBy"
                  value="relevance"
                  checked={filters.sortBy === 'relevance'}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Relevance</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sortBy"
                  value="price-low"
                  checked={filters.sortBy === 'price-low'}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Price: Low to High</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sortBy"
                  value="price-high"
                  checked={filters.sortBy === 'price-high'}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Price: High to Low</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sortBy"
                  value="rating"
                  checked={filters.sortBy === 'rating'}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Highest Rated</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sortBy"
                  value="newest"
                  checked={filters.sortBy === 'newest'}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                  className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 transition-colors"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Newest First</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-white border-t border-gray-200 px-8 py-5 flex space-x-3">
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200"
          >
            Apply
          </button>
        </div>
      </div>

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
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default FilterSidebar;
