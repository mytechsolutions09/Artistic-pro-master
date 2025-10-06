import React from 'react';

const ClothingProductPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Image Section Skeleton */}
          <div className="order-1 lg:order-2">
            <div className="flex gap-4">
              {/* Main Product Image Skeleton */}
              <div className="flex-1 relative aspect-[3/4] max-h-[450px] bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-full bg-gray-300"></div>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                {/* Zoom icon skeleton */}
                <div className="absolute top-3 right-3 w-9 h-9 bg-gray-400 rounded-full"></div>
              </div>

              {/* Right Side Thumbnail Slider Skeleton */}
              <div className="hidden md:flex flex-col items-center">
                <div className="h-[450px] overflow-y-auto">
                  <div className="flex flex-col space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-300 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Thumbnail Images Skeleton */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-2 mt-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-16 h-16 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Product Info Section Skeleton */}
          <div className="order-2 lg:order-1 mt-6 lg:mt-0 space-y-6 lg:space-y-8">
            <div>
              {/* Title Skeleton */}
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4 animate-pulse"></div>
              
              {/* Product Info Badges Skeleton */}
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="h-6 bg-gray-300 rounded w-16 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-24 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-18 animate-pulse"></div>
              </div>
              
              {/* Price Skeleton */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                <div className="h-8 bg-gray-300 rounded w-24 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-16 animate-pulse"></div>
              </div>

              {/* Stock Status Skeleton */}
              <div className="h-8 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>

            {/* Color, Size and Action Buttons Skeleton */}
            <div className="space-y-3">
              {/* Color Selection Skeleton */}
              <div>
                <div className="h-4 bg-gray-300 rounded w-32 mb-2 animate-pulse"></div>
                <div className="flex gap-1.5 flex-wrap">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Size Selection Skeleton */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Gift Card Checkbox Skeleton */}
              <div className="py-1">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex-1 h-10 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Sections Skeleton */}
        <div className="space-y-8 mt-8">
          {/* Description Skeleton */}
          <div>
            <div className="h-5 bg-gray-300 rounded w-24 mb-4 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-4/5 animate-pulse"></div>
            </div>
          </div>

          {/* Details Skeleton */}
          <div>
            <div className="h-5 bg-gray-300 rounded w-16 mb-4 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
            </div>
          </div>

          {/* Wash Care Skeleton */}
          <div>
            <div className="h-5 bg-gray-300 rounded w-20 mb-4 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>

          {/* Shipping Skeleton */}
          <div>
            <div className="h-5 bg-gray-300 rounded w-18 mb-4 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-4/5 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingProductPageSkeleton;
