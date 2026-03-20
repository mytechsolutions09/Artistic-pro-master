'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from '@/src/compat/router';
import NormalItemsService, { NormalItem } from '../services/normalItemsService';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { generateSlug } from '../utils/slugUtils';

const ShopPage: React.FC = () => {
  const [items, setItems] = useState<NormalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const loadItems = async () => {
      try {
        setLoading(true);
        const data = await NormalItemsService.getActiveItems();
        if (isMounted) {
          setItems(data);
        }
      } catch (error) {
        console.error('Error loading normal items:', error);
      } finally {
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
    if (!searchTerm.trim()) return items;
    
    const searchLower = searchTerm.toLowerCase();
    return items.filter(item =>
      item.title.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    );
  }, [items, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">Discover our collection of products</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchTerm ? 'No products found matching your search.' : 'No products available yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  product={{
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    main_image: item.main_image || item.images[0],
                    images: item.images,
                    categories: ['Normal'],
                    category: 'Normal',
                    originalPrice: item.original_price,
                    discountPercentage: item.discount_percentage,
                    rating: 0,
                    downloads: 0,
                    slug: generateSlug(item.title)
                  } as any}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;




