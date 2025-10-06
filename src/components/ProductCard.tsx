import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { generateProductUrl } from '../utils/slugUtils';
import { FavoritesService } from '../services/favoritesService';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatUIPrice } = useCurrency();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Debug logging for image issues (removed for production)

  //   hasImages: !!product.images,
  //   imagesLength: product.images?.length || 0,
  //   currentImageIndex,
  //   currentImageUrl: product.images?.[currentImageIndex],
  //   mainImage: product.main_image,
  //   imageLoaded,
  //   imageError
  // });

  // Debug logging removed

  // Get current price based on selected options
  const getCurrentPrice = () => {
    return product.price;
  };

  // Get original price for discount calculation
  const getOriginalPrice = () => {
    return product.originalPrice || product.price;
  };


  // Check if product is favorite on mount
  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, product.id]);



  // Auto-slide images on hover
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHovered && product.images && product.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === product.images.length - 1 ? 0 : prev + 1
        );
      }, 2000); // Change image every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isHovered, product.images?.length]);


  const checkFavoriteStatus = async () => {
    try {
      const favoriteStatus = await FavoritesService.isFavorite(product.id);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/sign-in';
      return;
    }

    try {
      setFavoriteLoading(true);
      const newFavoriteStatus = await FavoritesService.toggleFavorite(product.id);
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path fill="url(#halfStar)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
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
    ? `/men/${product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
    : generateProductUrl(
        product.categories && product.categories.length > 0 
          ? product.categories[0] 
          : (product as any).category, 
        product.title
      );

  return (
    <Link
      to={productUrl}
      className={`block group relative bg-white transition-all duration-300 overflow-hidden ${
        isClothing 
          ? 'rounded-none' 
          : 'rounded-xl shadow-sm hover:shadow-lg border border-gray-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className={`relative overflow-hidden ${isClothing ? 'rounded-none' : 'rounded-t-xl'}`}>
        {/* Main Image */}
        {product.images && product.images.length > 0 && product.images[currentImageIndex] ? (
          <img
            src={product.images[currentImageIndex]}
            alt={product.title}
            className={`w-full object-cover transition-transform duration-300 ${
              isClothing 
                ? 'h-80 group-hover:scale-102' 
                : 'h-56 group-hover:scale-105'
            }`}
          />
        ) : (
          <div className="w-full h-56 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">No image</p>
            </div>
          </div>
        )}
        {!isClothing && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        
        {/* Image Navigation Arrows - Hidden Permanently */}
        {!isClothing && product.images && product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 pointer-events-none"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 pointer-events-none"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Dots Indicator - Hidden for Clothing */}
        {!isClothing && product.images && product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <div className="flex space-x-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'bg-white scale-150 shadow-lg' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category Badge - Hidden for Clothing */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!isClothing && (
            <span className="px-3 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
              {product.categories && product.categories.length > 0 
                ? product.categories[0] 
                : (product as any).category}
            </span>
          )}
          
          {/* Stock Badge for Clothing Items */}
          {isClothing && product.trackInventory && (
            <>
              {product.stockQuantity === 0 ? (
                <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-md">
                  OUT OF STOCK
                </span>
              ) : product.stockQuantity && product.stockQuantity <= (product.lowStockThreshold || 10) ? (
                <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                  LOW STOCK
                </span>
              ) : null}
            </>
          )}
        </div>

        {/* Overlay Actions - Hidden for Clothing */}
        {!isClothing && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md backdrop-blur-sm"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favoriteLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Heart className={`w-5 h-5 text-gray-600 hover:text-pink-500 transition-colors ${isFavorite ? 'fill-current text-pink-500' : ''}`} />
              )}
            </button>
          </div>
        )}



      </div>

      {/* Content */}
      <div className={isClothing ? 'p-3' : 'p-4'}>
        <h3 className={`font-semibold mb-1 transition-colors line-clamp-1 ${
          isClothing 
            ? 'text-xs uppercase tracking-wide text-gray-900' 
            : 'text-gray-800 group-hover:text-pink-600'
        }`}>
          {product.title}
        </h3>
        
        {/* Stars and Reviews - Hidden for Clothing */}
        {!isClothing && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1">
              {renderStars(product.rating)}
              <span className="text-sm font-medium text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-500">({product.downloads})</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {product.downloads}
            </div>
          </div>
        )}

        <div className={`flex items-center justify-between ${isClothing ? 'mt-2' : ''}`}>
          <div className="flex flex-col">
            {product.originalPrice && product.discountPercentage && product.discountPercentage > 0 ? (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <div className={isClothing ? 'text-sm font-bold text-gray-900' : 'text-lg font-bold text-pink-600'}>
                    {formatUIPrice(getCurrentPrice(), 'INR')}
                  </div>
                  {!isClothing && (
                    <div className="text-sm text-gray-400 line-through">
                      {formatUIPrice(getOriginalPrice(), 'INR')}
                    </div>
                  )}
                </div>
                {!isClothing && (
                  <div className="text-xs text-green-600 font-semibold">
                    {product.discountPercentage}% OFF
                  </div>
                )}
              </div>
            ) : (
              <div className={isClothing ? 'text-sm font-bold text-gray-900' : 'text-lg font-bold text-gray-800'}>
                {formatUIPrice(getCurrentPrice(), 'INR')}
              </div>
            )}
          </div>
          {/* View Details Button - Hidden for Clothing */}
          {!isClothing && (
            <button 
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors duration-200"
              onClick={handleCardClick}
            >
              View Details
            </button>
          )}
        </div>
      </div>


    </Link>
  );
};

export default ProductCard;
