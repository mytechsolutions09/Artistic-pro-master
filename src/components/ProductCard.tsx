'use client'

import React from 'react';
import { Link } from '@/src/compat/router';
import { useCurrency } from '../contexts/CurrencyContext';
import { Product } from '../types';
import { generateProductUrl } from '../utils/slugUtils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatUIPrice } = useCurrency();

  const getCurrentPrice = () => {
    return product.price;
  };

  const handleCardClick = () => {
    // Navigation handled by useScrollToTop hook
  };

  // Determine if this is a clothing product
  const isClothing = 
    ((product as any).gender === 'Men' || (product as any).gender === 'Women' || (product as any).gender === 'Unisex') ||
    product.categories?.some(cat => 
      cat.toLowerCase().includes('men') || 
      cat.toLowerCase().includes('women') || 
      cat.toLowerCase().includes('unisex') ||
      cat.toLowerCase().includes('clothing')
    );

  // Determine if this is an F&B product
  const categoriesLower = (product.categories || []).map(c => c.toLowerCase()).join(' ');
  const isFB = categoriesLower.includes('food & beverage') || 
               categoriesLower.includes('f&b') || 
               categoriesLower.includes('food-beverage') ||
               categoriesLower.includes('dry fruit') || 
               categoriesLower.includes('dried fruit') || 
               categoriesLower.includes('spice');

  // Generate canonical URL for this product type
  const productSlug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const isNormalItem = product.categories && product.categories.includes('Normal');

  const productUrl = isClothing
    ? `/clothes/${productSlug}`
    : isFB
      ? `/${productSlug}`
      : generateProductUrl(
          product.categories && product.categories.length > 0
            ? product.categories[0]
            : (product as any).category || 'general',
          product.title
        );

  const initialImageSrc = (product.images && product.images.length > 0 && product.images[0]) 
    ? product.images[0] 
    : (product.main_image || '/placeholder-image.jpg');

  const [imageSrc, setImageSrc] = React.useState<string>(initialImageSrc);
  const [hasImageError, setHasImageError] = React.useState<boolean>(false);

  React.useEffect(() => {
    const newSrc = (product.images && product.images.length > 0 && product.images[0])
      ? product.images[0]
      : (product.main_image || '/placeholder-image.jpg');
    setImageSrc(newSrc);
    setHasImageError(false);
  }, [product.images, product.main_image]);

  const handleImageError = () => {
    if (imageSrc !== product.main_image && product.main_image) {
      setImageSrc(product.main_image);
    } else if (imageSrc !== '/placeholder-image.jpg') {
      setImageSrc('/placeholder-image.jpg');
    } else {
      setHasImageError(true);
    }
  };

  return (
    <Link
      to={productUrl}
      className="block group relative bg-white transition-all duration-300 overflow-hidden rounded-2xl shadow-lg hover:shadow-xl"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-white flex items-center justify-center">
        {/* Main Image */}
        {!hasImageError && imageSrc ? (
          <img
            src={imageSrc}
            alt={`${product.title} — digital art print by Lurevi`}
            width={800}
            height={800}
            className={`transition-transform duration-300 group-hover:scale-105 ${
              isNormalItem 
                ? 'w-full h-full object-cover' 
                : 'max-w-full max-h-full w-auto h-auto object-contain'
            }`}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            style={isNormalItem ? undefined : { maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400 p-2">
              <svg className="w-10 h-10 mx-auto mb-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-400 truncate max-w-[120px]">{product.title}</p>
            </div>
          </div>
        )}

        {/* Stock Badge for Clothing Items */}
        {isClothing && product.trackInventory && (
          <div className="absolute top-3 left-3 z-10">
            {product.stockQuantity === 0 ? (
              <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-md">
                OUT OF STOCK
              </span>
            ) : product.stockQuantity && product.stockQuantity <= (product.lowStockThreshold || 10) ? (
              <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                LOW STOCK
              </span>
            ) : null}
          </div>
        )}

        {/* Hover Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md transform translate-y-0 opacity-100 sm:translate-y-full sm:group-hover:translate-y-0 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 ease-in-out border-t border-gray-100/50 shadow-md z-10">
          <h3 className="font-semibold mb-1 transition-colors line-clamp-1 text-xs uppercase tracking-wide text-gray-900">
            {product.title}
          </h3>
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-col">
              {product.originalPrice && product.discountPercentage && product.discountPercentage > 0 ? (
                <div className="flex flex-col space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-bold text-gray-900">
                      {formatUIPrice(getCurrentPrice(), 'INR')}
                    </div>
                    <div className="text-[10px] text-gray-600 line-through">
                      {formatUIPrice(product.originalPrice, 'INR')}
                    </div>
                  </div>
                  <div className="text-[10px] text-green-700 font-semibold">
                    {product.discountPercentage}% OFF
                  </div>
                </div>
              ) : (
                <div className="text-sm font-bold text-gray-900">
                  {formatUIPrice(getCurrentPrice(), 'INR')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
