import React, { useState, useEffect, useMemo } from 'react';
import { Search, Package, RefreshCw } from 'lucide-react';
import ProductCardSkeleton from '../components/ProductCardSkeleton';

interface FBItem {
  id: string;
  title: string;
  category: 'dry-fruits' | 'dried-fruits' | 'spices';
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  weight: string;
  weight_unit: 'g' | 'kg';
  stock_quantity: number;
  brand?: string;
  origin?: string;
  images: string[];
  main_image?: string;
  status: 'active' | 'inactive' | 'draft';
}

const FBPage: React.FC = () => {
  const [items, setItems] = useState<FBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'dry-fruits' | 'dried-fruits' | 'spices'>('all');

  useEffect(() => {
    let isMounted = true;
    
    const loadItems = async () => {
      setLoading(true);
      try {
        // TODO: Implement actual data fetching from database
        // For now, using mock data
        setTimeout(() => {
          if (isMounted) {
            setItems([]);
            setLoading(false);
          }
        }, 500);
      } catch (error) {
        console.error('Error loading F & B items:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadItems();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize filtered items to avoid re-filtering on every render
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim() && selectedCategory === 'all') {
      return items.filter(item => item.status === 'active');
    }
    
    const searchLower = searchTerm.toLowerCase();
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory && item.status === 'active';
    });
  }, [items, searchTerm, selectedCategory]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'dry-fruits', label: 'Dry Fruits' },
    { id: 'dried-fruits', label: 'Dried Fruits' },
    { id: 'spices', label: 'Spices' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 font-sans font-normal">Food & Beverages</h1>
          <p className="text-gray-600 font-sans font-normal">Discover our collection of premium dry fruits, dried fruits, and spices</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search F & B items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-sans font-normal"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black font-sans font-normal bg-gray-50"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-sans font-normal">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No items found matching your criteria.' 
                : 'No F & B items available yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600 font-sans font-normal">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={item.main_image || item.images[0] || '/placeholder.png'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.discount_percentage && item.discount_percentage > 0 && (
                      <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-medium px-2 py-1 rounded-full font-sans font-normal">
                        {item.discount_percentage}% OFF
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded font-sans font-normal">
                        {item.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 font-sans font-normal line-clamp-2">{item.title}</h3>
                    {item.brand && (
                      <p className="text-xs text-gray-500 mb-2 font-sans font-normal">{item.brand}</p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-lg font-semibold text-pink-600 font-sans font-normal">
                          ₹{item.price}
                        </div>
                        {item.original_price && item.original_price > item.price && (
                          <div className="text-xs text-gray-400 line-through font-sans font-normal">
                            ₹{item.original_price}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-sans font-normal">
                        {item.weight} {item.weight_unit}
                      </div>
                    </div>
                    {item.origin && (
                      <p className="text-xs text-gray-500 mb-2 font-sans font-normal">Origin: {item.origin}</p>
                    )}
                    <div className="mt-3">
                      <button className="w-full px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-900 transition-colors text-sm font-sans font-normal">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Related Items Section - Show items from same category */}
        {filteredItems.length > 0 && (
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 font-sans font-normal">You Might Also Like</h2>
                <p className="text-sm text-gray-600 font-sans font-normal">Discover more amazing F & B products</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Show up to 4 items, but show section even if less than 4 */}
                {(filteredItems.length > 4 ? filteredItems.slice(0, 4) : filteredItems).map((relatedItem) => (
                  <div key={relatedItem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={relatedItem.main_image || relatedItem.images[0] || '/placeholder.png'}
                        alt={relatedItem.title}
                        className="w-full h-full object-cover"
                      />
                      {relatedItem.discount_percentage && relatedItem.discount_percentage > 0 && (
                        <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-medium px-2 py-1 rounded-full font-sans font-normal">
                          {relatedItem.discount_percentage}% OFF
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded font-sans font-normal">
                          {relatedItem.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 font-sans font-normal line-clamp-2">{relatedItem.title}</h3>
                      {relatedItem.brand && (
                        <p className="text-xs text-gray-500 mb-2 font-sans font-normal">{relatedItem.brand}</p>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-lg font-semibold text-pink-600 font-sans font-normal">
                            ₹{relatedItem.price}
                          </div>
                          {relatedItem.original_price && relatedItem.original_price > relatedItem.price && (
                            <div className="text-xs text-gray-400 line-through font-sans font-normal">
                              ₹{relatedItem.original_price}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-sans font-normal">
                          {relatedItem.weight} {relatedItem.weight_unit}
                        </div>
                      </div>
                      {relatedItem.origin && (
                        <p className="text-xs text-gray-500 mb-2 font-sans font-normal">Origin: {relatedItem.origin}</p>
                      )}
                      <div className="mt-3">
                        <button className="w-full px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-900 transition-colors text-sm font-sans font-normal">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FBPage;
