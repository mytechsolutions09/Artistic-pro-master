import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Star, Heart } from 'lucide-react';
import { ArtWork } from '../types';
import { generateProductUrl } from '../utils/slugUtils';
import { useCurrency } from '../contexts/CurrencyContext';

interface ArtCardProps {
  artwork: ArtWork;
  size?: 'small' | 'medium' | 'large';
}

const ArtCard: React.FC<ArtCardProps> = ({ artwork, size = 'medium' }) => {
  const { formatUIPrice, currencySettings } = useCurrency();
  
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

  const handleCardClick = () => {
    // Navigation handled by useScrollToTop hook
  };

  return (
    <Link 
      to={generateProductUrl(artwork.category, artwork.title)} 
      className={`${cardClasses[size]} bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100 block`}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        { (artwork as any).video_url ? (
          <div className={`relative w-full ${imageClasses[size]}`}>
            <img
              src={artwork.images && artwork.images.length > 0 ? artwork.images[0] : ''}
              alt={artwork.title}
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
            src={artwork.images[0]}
            alt={artwork.title}
            className={`w-full ${imageClasses[size]} object-cover group-hover:scale-105 transition-transform duration-300`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md backdrop-blur-sm">
            <Heart className="w-5 h-5 text-gray-600 hover:text-pink-500 transition-colors" />
          </button>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
            {artwork.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-pink-600 transition-colors line-clamp-1">
          {artwork.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">by Digital Artist</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{artwork.rating}</span>
            <span className="text-sm text-gray-500">({artwork.downloads})</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Download className="w-4 h-4 mr-1" />
            {artwork.downloads}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-800">{formatUIPrice(artwork.price, 'INR')}</span>
          <button 
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors duration-200"
            onClick={handleCardClick}
          >
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ArtCard;
