import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { generateProductUrl } from '../utils/slugUtils';
import { FavoritesService } from '../services/favoritesService';
import { Heart } from 'lucide-react';
import { generateImagePlaceholder } from '../utils/imageOptimization';
import ImageSkeleton from './ImageSkeleton';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatUIPrice, currencySettings } = useCurrency();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Debug logging for image issues (removed for production)
  // console.log(`🖼️ ProductCard "${product.title}":`, {
  //   hasImages: !!product.images,
  //   imagesLength: product.images?.length || 0,
  //   currentImageIndex,
  //   currentImageUrl: product.images?.[currentImageIndex],
  //   mainImage: product.main_image,
  //   imageLoaded,
  //   imageError
  // });
  const selectedProductType = 'digital';
  const selectedPosterSize = (() => {
    if (product.posterSize && product.posterPricing && product.posterPricing[product.posterSize]) {
      return product.posterSize;
    }
    if (product.posterPricing && Object.keys(product.posterPricing).length > 0) {
      return Object.keys(product.posterPricing)[0];
    }
    return 'A4';
  })();

  // Debug logging
  console.log(`🔍 ProductCard Debug for "${product.title}":`, {
    productType: product.productType,
    selectedProductType,
    posterPricing: product.posterPricing,
    posterSize: product.posterSize,
    selectedPosterSize
  });

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

  // Lazy loading with Intersection Observer
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgElement = entry.target as HTMLImageElement;
            if (imgElement.dataset.src) {
              imgElement.src = imgElement.dataset.src;
              imgElement.removeAttribute('data-src');
              observer.unobserve(imgElement);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [currentImageIndex, product.images]);

  // Handle image load events
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Try fallback image
    const img = e.currentTarget;
    const currentSrc = img.src;
    
    // If it's not already a fallback, try a different approach
    if (!currentSrc.includes('picsum.photos') && !currentSrc.includes('placeholder')) {
      // Try a simple placeholder service
      img.src = `https://picsum.photos/800/800?random=${Math.floor(Math.random() * 1000)}`;
      return; // Don't set error state yet, let it try the fallback
    }
    
    setImageError(true);
    setImageLoaded(false);
  };

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

  // Reset image loading state when image index changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentImageIndex]);

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

  return (
    <Link
      to={generateProductUrl(
        product.categories && product.categories.length > 0 
          ? product.categories[0] 
          : (product as any).category, 
        product.title
      )}
      className="block group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Main Image */}
        {product.images && product.images.length > 0 && product.images[currentImageIndex] ? (
          <>
            {/* Loading skeleton - only show briefly */}
            {!imageLoaded && !imageError && (
              <ImageSkeleton 
                className="absolute inset-0 z-10" 
                aspectRatio="square"
                showText={false}
              />
            )}
            
            <img
              ref={imgRef}
              src={product.images[currentImageIndex]}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-300 ease-out"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            
            {/* Error placeholder - only show if image fails */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">Image unavailable</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">No image</p>
            </div>
          </div>
        )}
        
        {/* Image Navigation Arrows - Hidden Permanently */}
        {product.images && product.images.length > 1 && (
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

        {/* View Details Button on Hover */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          {isHovered ? (
            <Link
              to={generateProductUrl(
        product.categories && product.categories.length > 0 
          ? product.categories[0] 
          : (product as any).category, 
        product.title
      )}
              className="bg-white/90 hover:bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2"
              onClick={handleCardClick}
            >
              <span className="text-sm">View Details</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            product.images.length > 1 && (
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
            )
          )}
        </div>

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-pink-200 text-pink-800 text-xs font-bold rounded-full shadow-md">
              Featured
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              isFavorite 
                ? 'bg-pink-600 text-white hover:bg-pink-700' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-pink-600'
            } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favoriteLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            )}
          </button>
        </div>



      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div className="group-hover:text-pink-600 transition-colors duration-300">
          <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 group-hover:text-pink-600 transition-colors duration-300">
            {product.title}
          </h3>
        </div>
        
        {/* Rating and Downloads */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {renderStars(product.rating)}
            <span className="text-sm text-gray-600 ml-2 font-medium">({product.rating})</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="font-medium">{product.downloads.toLocaleString()}</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between">
          {product.originalPrice && product.discountPercentage && product.discountPercentage > 0 ? (
            <div className="flex items-center space-x-2">
              <div className="text-lg font-bold text-pink-600">
                {formatUIPrice(getCurrentPrice(), 'INR')}
              </div>
              <div className="text-sm text-gray-400 line-through">
                {formatUIPrice(getOriginalPrice(), 'INR')}
              </div>
            </div>
          ) : (
            <div className="text-lg font-bold text-pink-600">
              {formatUIPrice(getCurrentPrice(), 'INR')}
            </div>
          )}
          {product.originalPrice && product.discountPercentage && product.discountPercentage > 0 && (
            <div className="text-xs text-green-600 font-semibold">
              {product.discountPercentage}% OFF
            </div>
          )}
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex items-center space-x-2 overflow-hidden">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-gray-600 text-[10px] font-medium hover:text-pink-600 transition-colors duration-300 uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wide">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Description Preview */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {product.description}
        </p>


      </div>


    </Link>
  );
};

export default ProductCard;
