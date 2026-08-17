'use client'

import React from 'react';
import { Link } from '@/src/compat/router';
import { Download, Star, Heart } from 'lucide-react';
import { ArtWork } from '../types';
import { generateProductUrl } from '../utils/slugUtils';
import { useCurrency } from '../contexts/CurrencyContext';
import { optimizeImageUrl } from '../utils/imageOptimization';
import { getOptimalImageQuality } from '../utils/performanceUtils';

interface ArtCardProps {
  artwork: ArtWork;
  size?: 'small' | 'medium' | 'large';
}

const ArtCard: React.FC<ArtCardProps> = ({ artwork, size = 'medium' }) => {
  const { formatUIPrice, currencySettings } = useCurrency();
  const quality = getOptimalImageQuality();
  
  const cardClasses = {
    small: 'w-full',
    medium: 'w-full',
    large: 'w-full'
  };

  const imageClasses = {
    small: 'h-48',
    medium: 'h-56',
    large: 'h-64'
  };

  const optimizedSrc = (url?: string) => {
    const src = url || '';
    if (!src) return '';

    // Tune width per tile size to give the CDN a sensible resize target.
    const width = size === 'small' ? 400 : size === 'medium' ? 600 : 800;
    return optimizeImageUrl(src, width, quality);
  };

  const handleCardClick = () => {
    // Navigation handled by useScrollToTop hook
  };

  const initialSrc = (artwork.images && artwork.images.length > 0 && artwork.images[0])
    ? artwork.images[0]
    : ((artwork as any).main_image || '/placeholder-image.jpg');

  const [imgSrc, setImgSrc] = React.useState<string>(initialSrc);
  const [hasError, setHasError] = React.useState<boolean>(false);

  React.useEffect(() => {
    const nextSrc = (artwork.images && artwork.images.length > 0 && artwork.images[0])
      ? artwork.images[0]
      : ((artwork as any).main_image || '/placeholder-image.jpg');
    setImgSrc(nextSrc);
    setHasError(false);
  }, [artwork.images, (artwork as any).main_image]);

  const handleImageError = () => {
    if (imgSrc !== (artwork as any).main_image && (artwork as any).main_image) {
      setImgSrc((artwork as any).main_image);
    } else if (imgSrc !== '/placeholder-image.jpg') {
      setImgSrc('/placeholder-image.jpg');
    } else {
      setHasError(true);
    }
  };

  return (
    <Link 
      to={generateProductUrl(artwork.category, artwork.title)} 
      className={`${cardClasses[size]} bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100 block`}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        {hasError ? (
          <div className={`w-full ${imageClasses[size]} flex items-center justify-center bg-gray-100 text-gray-400`}>
            <div className="text-center p-4">
              <svg className="w-10 h-10 mx-auto mb-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-gray-400 truncate block max-w-[150px] mx-auto">{artwork.title}</span>
            </div>
          </div>
        ) : (artwork as any).video_url ? (
          <div className={`relative w-full ${imageClasses[size]}`}>
            <img
              src={optimizedSrc(imgSrc)}
              alt={artwork.title}
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              className={`w-full ${imageClasses[size]} object-cover`}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"></path>
              </svg>
            </div>
          </div>
        ) : (
          <img
            src={optimizedSrc(imgSrc)}
            alt={artwork.title}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className={`w-full ${imageClasses[size]} object-cover group-hover:scale-105 transition-transform duration-300`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md backdrop-blur-sm">
            <Heart className="w-5 h-5 text-gray-600 hover:text-pink-500 transition-colors" />
          </button>
        {/* Hover Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md transform translate-y-0 opacity-100 sm:translate-y-full sm:group-hover:translate-y-0 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 ease-in-out border-t border-gray-100/50 shadow-md z-10">
          <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-pink-600 transition-colors line-clamp-1">
            {artwork.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2">by Digital Artist</p>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
              <span className="text-xs font-medium text-gray-700">{artwork.rating}</span>
              <span className="text-xs text-gray-500">({artwork.downloads})</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Download className="w-3.5 h-3.5 mr-1" />
              {artwork.downloads}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-800">{formatUIPrice(artwork.price, 'INR')}</span>
            <button 
              className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
              onClick={handleCardClick}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArtCard;




