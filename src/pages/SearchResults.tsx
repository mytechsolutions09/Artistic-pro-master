import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, Grid, List, Star, Download, Eye } from 'lucide-react';
import { ProductService } from '../services/supabaseService';
import NormalItemsService, { NormalItem } from '../services/normalItemsService';
import { Product } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import { NavigationVisibilityService } from '../services/navigationVisibilityService';

interface SearchResult extends Product {
  itemType?: 'product' | 'normal_item' | 'fb_item';
  isNormalItem?: boolean;
}

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
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
  const { currentCurrency, formatCurrency } = useCurrency();

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchFilters = {
        category: filters.category || undefined,
        minPrice: filters.priceRange[0] || undefined,
        maxPrice: filters.priceRange[1] || undefined,
        featured: filters.featured || undefined,
        productType: filters.productType !== 'all' ? filters.productType : undefined,
        tags: filters.tags && filters.tags.length > 0 ? filters.tags : undefined,
        status: filters.status !== 'all' ? filters.status : undefined
      };

      // Search across all product types in parallel
      const [productResults, normalItemsResults, fbItemsResults] = await Promise.all([
        ProductService.searchProducts(query, searchFilters),
        searchNormalItems(query),
        searchFBItems(query)
      ]);

      // Combine and normalize all results
      const allResults: SearchResult[] = [];

      // Identify F&B items to exclude from regular products
      const fbCategories = [
        'Food & Beverage',
        'F&B',
        'F & B',
        'food & beverage',
        'f&b',
        'f & b',
        'Food',
        'Beverage',
        'Dry Fruits',
        'Dried Fruits',
        'Spices',
      ];
      const isFBProduct = (product: Product) => {
        const categories = product.categories || [];
        const category = (product as any).category || '';
        return categories.some((cat: string) => 
          fbCategories.some(fbCat => cat.toLowerCase().includes(fbCat.toLowerCase()))
        ) || fbCategories.some(fbCat => category.toLowerCase().includes(fbCat.toLowerCase()));
      };

      // Add products (art, clothing) - exclude F&B items as they're handled separately
      productResults.forEach(product => {
        if (!isFBProduct(product)) {
          allResults.push({
            ...product,
            itemType: 'product',
            isNormalItem: false
          });
        }
      });

      // Add normal items (convert to Product format for ProductCard)
      normalItemsResults.forEach(item => {
        const normalizedItem: SearchResult = {
          id: item.id,
          title: item.title,
          description: item.description || '',
          price: item.price,
          originalPrice: item.original_price,
          discountPercentage: item.discount_percentage,
          images: item.images || (item.main_image ? [item.main_image] : []),
          main_image: item.main_image || item.images?.[0],
          slug: item.slug,
          category: 'Normal',
          categories: ['Normal'],
          rating: 0,
          downloads: 0,
          status: item.status === 'active' ? 'active' : 'inactive',
          created_date: item.created_at,
          createdDate: item.created_at,
          itemType: 'normal_item',
          isNormalItem: true,
          productType: 'normal'
        };
        allResults.push(normalizedItem);
      });

      // Apply visibility rules from admin nav toggles (F&B / Clothes)
      allResults.splice(0, allResults.length, ...NavigationVisibilityService.filterProductsByVisibility(allResults));

      // Apply filters
      let filteredResults = allResults.filter(result => {
        // Price filter
        if (filters.priceRange[0] > 0 && result.price < filters.priceRange[0]) return false;
        if (filters.priceRange[1] < 10000 && result.price > filters.priceRange[1]) return false;
        
        // Status filter
        if (filters.status !== 'all' && result.status !== filters.status) return false;
        
        // Product type filter (only for products, not normal items)
        if (filters.productType !== 'all' && result.itemType === 'product') {
          if (filters.productType === 'digital' && result.productType !== 'digital') return false;
          if (filters.productType === 'poster' && result.productType !== 'poster') return false;
        }
        
        return true;
      });
      
      // Apply sorting
      let sortedResults = [...filteredResults];
      switch (filters.sortBy) {
        case 'price-low':
          sortedResults.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          sortedResults.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          sortedResults.sort((a, b) => {
            const aDate = new Date(a.created_date || a.createdDate || 0).getTime();
            const bDate = new Date(b.created_date || b.createdDate || 0).getTime();
            return bDate - aDate;
          });
          break;
        case 'downloads':
          sortedResults.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
          break;
        case 'rating':
          sortedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          // Relevance sorting (keep original order from search)
          break;
      }
      
      setProducts(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchNormalItems = async (query: string): Promise<NormalItem[]> => {
    try {
      const allItems = await NormalItemsService.getActiveItems();
      if (!query.trim()) return allItems;
      
      const queryLower = query.toLowerCase();
      return allItems.filter(item =>
        item.title.toLowerCase().includes(queryLower) ||
        item.description?.toLowerCase().includes(queryLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(queryLower))
      );
    } catch (error) {
      console.error('Error searching normal items:', error);
      return [];
    }
  };

  const searchFBItems = async (query: string): Promise<Product[]> => {
    try {
      // F&B items are stored in products table with F&B-related categories
      // Search for products with F&B categories
      const fbCategories = [
        'Food & Beverage',
        'F&B',
        'F & B',
        'food & beverage',
        'f&b',
        'f & b',
        'Food',
        'Beverage',
        'Dry Fruits',
        'Dried Fruits',
        'Spices',
      ];
      
      // Search all products first
      const allProducts = await ProductService.searchProducts(query, { status: 'active' });
      
      // Filter for F&B items by checking categories
      const fbProducts = allProducts.filter(product => {
        const categories = product.categories || [];
        const category = (product as any).category || '';
        
        // Check if product has F&B-related category
        const hasFBCategory = categories.some((cat: string) => 
          fbCategories.some(fbCat => cat.toLowerCase().includes(fbCat.toLowerCase()))
        ) || fbCategories.some(fbCat => category.toLowerCase().includes(fbCat.toLowerCase()));
        
        // Also check if title/description matches F&B keywords
        const queryLower = query.toLowerCase();
        const fBKeywords = ['dry fruit', 'dried fruit', 'spice', 'almond', 'cashew', 'walnut', 'raisin', 'date', 'turmeric', 'cumin', 'pepper'];
        const matchesFBKeywords = fBKeywords.some(keyword => 
          product.title.toLowerCase().includes(keyword) ||
          product.description?.toLowerCase().includes(keyword)
        );
        
        return hasFBCategory || (query.trim() && matchesFBKeywords);
      });
      
      return fbProducts;
    } catch (error) {
      console.error('Error searching F&B items:', error);
      return [];
    }
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Search Results</h1>
            <p className="text-base text-gray-600">
              Found {products.length} {products.length === 1 ? 'result' : 'results'} for "{query}"
            </p>
          </div>
        </div>

        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          {/* Left Side - Filters Button and Search Bar */}
          <div className="mb-4 sm:mb-0 flex items-center space-x-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 text-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                defaultValue={query}
                placeholder="Search entire website..."
                className="w-64 pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.set('q', e.currentTarget.value);
                    setSearchParams(newSearchParams);
                  }
                }}
              />
            </div>
          </div>
          
          {/* Right Side - Item Count and Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="text-sm text-gray-600">{products.length} items</span>
            
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="sort-dropdown"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Popular</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-0.5 0-1 0.5-1 1s0.5 1 1 1 1-0.5 1-1-0.5-1-1-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or browse other categories
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
                className="text-pink-500 hover:text-pink-600 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Sidebar - Modal (Outside main content flow) */}
      {showFilters && (
        <FilterSidebar 
          filters={filters}
          onFilterChange={updateFilters}
          products={products}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default SearchResults;
