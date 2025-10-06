import React from 'react';

const ClothingPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Category Navigation Bar Skeleton */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 overflow-x-auto py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-300 rounded w-24 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar Skeleton */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
              <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
              <div className="h-8 bg-gray-300 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="block group relative bg-white transition-all duration-300 overflow-hidden rounded-none animate-pulse">
              {/* Image Container Skeleton - matches clothing ProductCard */}
              <div className="relative overflow-hidden rounded-none">
                <div className="w-full h-80 bg-gradient-to-br from-gray-200 to-gray-300">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
                
                {/* Stock Badge skeleton (for clothing items) */}
                <div className="absolute top-3 left-3">
                  <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                </div>
              </div>

              {/* Content Skeleton - matches clothing ProductCard structure */}
              <div className="p-3">
                {/* Title skeleton */}
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                
                {/* Price Section skeleton */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-col">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClothingPageSkeleton;
