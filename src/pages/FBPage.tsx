import React, { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { Product } from '../types';
import { ChevronDown } from 'lucide-react';

const FBPage: React.FC = () => {
  const { adminProducts, loading, error } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  // F&B categories
  const categories = [
    { id: 'all', label: 'VIEW ALL' },
    { id: 'dry-fruits', label: 'DRY FRUITS' },
    { id: 'dried-fruits', label: 'DRIED FRUITS' },
    { id: 'spices', label: 'SPICES' },
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Filter products for F&B items - be strict to exclude art products
    const fbCategories = [
      'Food & Beverage',
      'F&B',
      'F & B',
      'food & beverage',
      'f&b',
      'f & b',
      'Food & Beverages',
      'Dry Fruits',
      'Dried Fruits',
      'Spices',
    ];
    
    // Categories that indicate art products (to exclude)
    const artCategories = ['Art', 'Digital Art', 'Illustration', 'Poster', 'Print', 'Minimalist', 'Abstract', 'Photography'];
    
    let fbProducts = adminProducts.filter(product => {
      // Must be active
      if (product.status !== 'active') return false;
      
      const categories = product.categories || [];
      const category = (product as any).category || '';
      const allCategories = [...categories, category].map(c => c?.toLowerCase() || '').join(' ');
      
      // Explicitly exclude art products based on their categories/keywords.
      // Do NOT auto-exclude by productType, because we reuse 'poster' for
      // some non-art physical products (e.g. F&B items).
      const isArtProduct = artCategories.some(artCat =>
        allCategories.includes(artCat.toLowerCase())
      );
      
      if (isArtProduct) return false;
      
      // Must have explicit F&B category (strict matching - no keyword matching to avoid art products)
      const hasFBCategory = fbCategories.some(fbCat => {
        const fbLower = fbCat.toLowerCase();
        // Check for exact match or contains match in categories
        return categories.some((cat: string) => {
          const catLower = cat?.toLowerCase() || '';
          return catLower === fbLower || 
                 (catLower.includes(fbLower) && !catLower.includes('art') && !catLower.includes('print') && !catLower.includes('poster'));
        }) || (category?.toLowerCase() === fbLower || 
               (category?.toLowerCase().includes(fbLower) && !category?.toLowerCase().includes('art') && !category?.toLowerCase().includes('print')));
      });
      
      // Only include if it has explicit F&B category (no keyword matching)
      return hasFBCategory;
    });

    // Filter by selected category
    if (selectedCategory !== 'all') {
      fbProducts = fbProducts.filter(product => {
        const categories = product.categories || [];
        const category = (product as any).category || '';
        const allCategories = [...categories, category].join(' ').toLowerCase();
        
        switch (selectedCategory) {
          case 'dry-fruits':
            return allCategories.includes('dry fruit') && !allCategories.includes('dried');
          case 'dried-fruits':
            return allCategories.includes('dried fruit');
          case 'spices':
            return allCategories.includes('spice');
          default:
            return true;
        }
      });
    }

    // Filter by selected filter (brand, origin, etc.)
    // This can be extended based on product tags or custom fields
    if (selectedFilter !== 'all') {
      // For now, filter by tags if available
      fbProducts = fbProducts.filter(product => {
        if (!product.tags || product.tags.length === 0) return true;
        return product.tags.some(tag => tag.toLowerCase() === selectedFilter.toLowerCase());
      });
    }
    
    // Sort products
    const sorted = fbProducts.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          const dateA = new Date(a.createdDate || a.created_date || 0).getTime();
          const dateB = new Date(b.createdDate || b.created_date || 0).getTime();
          return dateB - dateA;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
    
    setFilteredProducts(sorted);
  }, [adminProducts, selectedCategory, selectedFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded font-sans font-normal">
            Error loading products: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Category Navigation Bar */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`text-xs font-medium tracking-wider whitespace-nowrap transition-colors pb-1 font-sans font-normal ${
                  selectedCategory === category.id
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium tracking-wider text-gray-900 font-sans font-normal">FILTER:</span>
              <div className="relative">
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="text-xs border-0 rounded px-3 py-1.5 pr-8 bg-gray-50 focus:outline-none appearance-none font-sans font-normal"
                  style={{
                    outline: 'none',
                    boxShadow: 'none',
                    border: 'none',
                    accentColor: '#9ca3af',
                    backgroundImage: 'none'
                  }}
                >
                  <option value="all">ALL</option>
                  {/* Add more filter options based on product tags or custom fields */}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium tracking-wider text-gray-900 font-sans font-normal">SORT BY:</span>
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs border-0 rounded px-3 py-1.5 pr-8 bg-gray-50 focus:outline-none appearance-none font-sans font-normal"
                  style={{
                    outline: 'none',
                    boxShadow: 'none',
                    border: 'none',
                    accentColor: '#9ca3af',
                    backgroundImage: 'none'
                  }}
                >
                  <option value="featured">FEATURED</option>
                  <option value="newest">NEWEST</option>
                  <option value="price-low">PRICE: LOW TO HIGH</option>
                  <option value="price-high">PRICE: HIGH TO LOW</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
              <span className="text-xs text-gray-600 font-sans font-normal">{filteredProducts.length} PRODUCTS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-700 mb-2 font-sans font-normal">No products found</h3>
            <p className="text-gray-500 font-sans font-normal">Check back soon for new arrivals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default FBPage;

// Add custom styles
const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Remove all focus and color styles from select dropdowns */
  select {
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
  }
  
  select:focus {
    outline: none !important;
    box-shadow: none !important;
    border-color: transparent !important;
    border: none !important;
  }
  
  select:focus-visible {
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
  }
  
  /* Dropdown options match bar color */
  select option {
    background-color: #f9fafb !important;
    color: #374151 !important;
  }
  
  select option:checked {
    background-color: #f3f4f6 !important;
    color: #111827 !important;
  }
  
  select option:hover {
    background-color: #e5e7eb !important;
    color: #111827 !important;
  }
  
  select option:focus {
    background-color: #e5e7eb !important;
    color: #111827 !important;
  }
  
  /* Firefox specific */
  select:-moz-focusring {
    color: transparent !important;
    text-shadow: 0 0 0 #374151 !important;
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('style[data-fb-page-styles]')) {
  style.setAttribute('data-fb-page-styles', 'true');
  document.head.appendChild(style);
}
