import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { Product } from '../types';
import { generateProductUrl } from '../utils/slugUtils';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatUIPrice } = useCurrency();

  // Debug logging for image issues
  React.useEffect(() => {
    console.log('ProductCard Debug:', {
      productTitle: product.title,
      hasImages: !!product.images,
      imagesLength: product.images?.length || 0,
      firstImage: product.images?.[0],
      mainImage: product.main_image
    });
  }, [product]);

  // Get current price based on selected options
  const getCurrentPrice = () => {
    return product.price;
  };










  const handleCardClick = () => {
    // Navigation handled by useScrollToTop hook
  };

  // Determine if this is a clothing product
  const isClothing = 
    // Check gender field (new approach)
    ((product as any).gender === 'Men' || (product as any).gender === 'Women' || (product as any).gender === 'Unisex') ||
    // Check categories field (backward compatibility)
    product.categories?.some(cat => 
      cat.toLowerCase().includes('men') || 
      cat.toLowerCase().includes('women') || 
      cat.toLowerCase().includes('unisex') ||
      cat.toLowerCase().includes('clothing')
    );

  // Generate appropriate URL
  const productUrl = isClothing 
    ? `/clothes/${product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
    : generateProductUrl(
        product.categories && product.categories.length > 0 
          ? product.categories[0] 
          : (product as any).category, 
        product.title
      );

  return (
    <Link
      to={productUrl}
      className="block group relative bg-white transition-all duration-300 overflow-hidden rounded-none"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-none h-80">
        {/* Main Image */}
        {product.images && product.images.length > 0 && product.images[0] ? (
          <OptimizedImage
            src={product.images[0]}
            alt={product.title}
            className="w-full object-cover transition-transform duration-300 h-80 group-hover:scale-102"
            width={400}
          />
        ) : (
          <div className="w-full h-80 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">No image</p>
            </div>
          </div>
        )}
        

        {/* Stock Badge for Clothing Items */}
        {isClothing && product.trackInventory && (
          <div className="absolute top-3 left-3">
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




      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold mb-1 transition-colors line-clamp-1 text-xs uppercase tracking-wide text-gray-900">
          {product.title}
        </h3>
        

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            {product.originalPrice && product.discountPercentage && product.discountPercentage > 0 ? (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-bold text-gray-900">
                    {formatUIPrice(getCurrentPrice(), 'INR')}
                  </div>
                  <div className="text-xs text-gray-400 line-through">
                    {formatUIPrice(product.originalPrice, 'INR')}
                  </div>
                </div>
                <div className="text-xs text-green-600 font-semibold">
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


    </Link>
  );
};

export default ProductCard;
