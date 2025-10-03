import React from 'react';

const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="block bg-white rounded-xl shadow-sm overflow-hidden border border-pink-50 animate-pulse">
      {/* Image Container Skeleton */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        
        {/* Image placeholder */}
        <div className="w-full h-full bg-gray-200"></div>
        
        {/* Gradient overlay skeleton */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-400/40 to-transparent"></div>
        
        {/* Bottom text skeleton */}
        <div className="absolute bottom-3 left-3">
          <div className="h-5 bg-gray-300 rounded w-24 mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCardSkeleton;
