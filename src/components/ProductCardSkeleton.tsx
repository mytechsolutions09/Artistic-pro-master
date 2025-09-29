import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="block group relative bg-white rounded-2xl shadow-sm transition-all duration-500 overflow-hidden border-0 animate-pulse">
      {/* Image Container Skeleton */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        
        {/* Image placeholder */}
        <div className="w-full h-full bg-gray-200"></div>
        
        {/* Badge skeleton */}
        <div className="absolute top-4 left-4">
          <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Favorite button skeleton */}
        <div className="absolute top-4 right-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Bottom indicators skeleton */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className="flex space-x-2">
            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5 space-y-4">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Rating and Downloads skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="w-8 h-4 bg-gray-200 rounded ml-2"></div>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Price Section skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-12 h-4 bg-gray-200 rounded"></div>
        </div>

        {/* Tags skeleton */}
        <div className="flex items-center space-x-2">
          <div className="w-12 h-3 bg-gray-200 rounded"></div>
          <div className="w-16 h-3 bg-gray-200 rounded"></div>
          <div className="w-10 h-3 bg-gray-200 rounded"></div>
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
