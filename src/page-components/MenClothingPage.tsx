'use client'

import React, { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import ClothingPageSkeleton from '../components/ClothingPageSkeleton';
import { Product } from '../types';
import { ChevronDown } from 'lucide-react';
import { NavigationVisibilityService, type NavigationVisibilitySettings } from '../services/navigationVisibilityService';

const MenClothingPage: React.FC = () => {
  const { adminProducts, loading, error } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [visibilitySettings, setVisibilitySettings] = useState<NavigationVisibilitySettings>(
    NavigationVisibilityService.getSettings()
  );

  // Clothing categories - Match exactly with admin clothingTypes
  const categories = [
    { id: 'all', label: 'VIEW ALL' },
    { id: 'oversized-hoodies', label: 'OVERSIZED HOODIES' },
    { id: 'extra-oversized-hoodies', label: 'EXTRA OVERSIZED HOODIES' },
    { id: 'oversized-t-shirt', label: 'OVERSIZED T-SHIRT' },
    { id: 'regular-sized-sweatshirt', label: 'REGULAR SIZED SWEATSHIRT' },
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Filter products for Men's/Women's clothing category and explicitly exclude F&B
    let clothingProducts = adminProducts.filter(product => {
      const categories = (product.categories || []).map(c => c.toLowerCase());
      const tags = (product.tags || []).map((t: string) => t.toLowerCase());
      const combined = [...categories, ...tags].join(' ');

      // Exclude any F&B-style products
      const isFB = combined.includes('food & beverage') ||
                   combined.includes('f&b') ||
                   combined.includes('f & b') ||
                   combined.includes('dry fruit') ||
                   combined.includes('dried fruit') ||
                   combined.includes('spice');
      if (isFB) return false;

      // Check if product has gender field or clothing-related categories
      if ((product as any).gender) return true;
      
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories.some(cat => 
          cat.toLowerCase().includes('men') || 
          cat.toLowerCase().includes('women') ||
          cat.toLowerCase().includes('clothing') ||
          cat.toLowerCase() === 'men' ||
          cat.toLowerCase() === 'women'
        );
      }
      return false;
    });

    // Filter by selected category
    if (selectedCategory !== 'all') {
      clothingProducts = clothingProducts.filter(product => {
        const productType = product.clothingType?.toLowerCase() || '';
        
        // Match category with exact clothing types
        switch (selectedCategory) {
          case 'oversized-hoodies':
            return (productType === 'oversized hoodies' || 
                   productType.includes('oversized hoodie')) &&
                   !productType.includes('extra oversized');
          case 'extra-oversized-hoodies':
            return productType === 'extra oversized hoodies' || 
                   productType.includes('extra oversized hoodie');
          case 'oversized-t-shirt':
            return productType === 'oversized t-shirt' || 
                   productType.includes('oversized t-shirt');
          case 'regular-sized-sweatshirt':
            return productType === 'regular sized sweatshirt' || 
                   productType.includes('regular sized sweatshirt');
          default:
            return true;
        }
      });
    }

    // Filter by selected size
    if (selectedSize !== 'all') {
      clothingProducts = clothingProducts.filter(product => {
        return product.tags?.some(tag => tag.toLowerCase() === selectedSize.toLowerCase());
      });
    }
    
    // Sort products
    const sorted = clothingProducts.sort((a, b) => {
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
  }, [adminProducts, selectedCategory, selectedSize, sortBy]);

  useEffect(() => {
    const unsubscribe = NavigationVisibilityService.subscribe((settings) => {
      setVisibilitySettings(settings);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <ClothingPageSkeleton />;
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

  if (!visibilitySettings.clothesActive) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Clothes section is currently unavailable</h2>
          <p className="text-sm text-gray-600">This section has been temporarily deactivated by admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Category Navigation Bar */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 overflow-x-auto py-4 scrollbar-hide">
            <div className="flex items-center gap-8">
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
            {/* NECESSARY MILAN Badge - Right aligned with filters */}
            <span className="font-bold text-xs tracking-wider font-sans font-normal whitespace-nowrap" style={{ color: '#FF8000', fontWeight: 700 }}>
              NECESSARY MILAN
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium tracking-wider text-gray-900">FILTER:</span>
              <div className="relative">
                <select 
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="text-xs border-0 rounded px-3 py-1.5 pr-8 bg-gray-50 focus:outline-none appearance-none"
                  style={{
                    outline: 'none',
                    boxShadow: 'none',
                    border: 'none',
                    accentColor: '#9ca3af',
                    backgroundImage: 'none'
                  }}
                >
                  <option value="all">SIZE</option>
                  <option value="xs">XS</option>
                  <option value="s">S</option>
                  <option value="m">M</option>
                  <option value="l">L</option>
                  <option value="xl">XL</option>
                  <option value="xxl">XXL</option>
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

export default MenClothingPage;

// Add custom styles
const customStyles = `
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
if (typeof document !== 'undefined' && !document.querySelector('style[data-custom-styles]')) {
  const style = document.createElement('style');
  style.textContent = customStyles;
  style.setAttribute('data-custom-styles', 'true');
  document.head.appendChild(style);
}




