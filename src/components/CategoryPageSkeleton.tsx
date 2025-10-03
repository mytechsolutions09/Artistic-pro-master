import React from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';

interface CategoryPageSkeletonProps {
  showFilters?: boolean;
  productCount?: number;
}

const CategoryPageSkeleton: React.FC<CategoryPageSkeletonProps> = ({ 
  showFilters = false, 
  productCount = 8 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-8">
        {/* Header Card with Controls Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Left Side - Filters Button Skeleton */}
            <div className="flex justify-center lg:justify-start">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>

            {/* Center - Header Content Skeleton */}
            <div className="text-center">
              <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>

            {/* Right Side - Sort Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(productCount)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Load More Button Skeleton */}
        <div className="mt-8 flex items-center justify-center">
          <div className="h-12 bg-gray-200 rounded-md w-48 animate-pulse"></div>
        </div>
      </div>

      {/* Filters Sidebar Skeleton - Only show if showFilters is true */}
      {showFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl">
            <div className="p-6">
              {/* Filter Header Skeleton */}
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Filter Sections Skeleton */}
              <div className="space-y-6">
                {/* Price Range Skeleton */}
                <div>
                  <div className="h-5 bg-gray-200 rounded w-20 mb-3 animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="flex justify-between mt-2">
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Rating Filter Skeleton */}
                <div>
                  <div className="h-5 bg-gray-200 rounded w-16 mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Featured Filter Skeleton */}
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Apply Button Skeleton */}
              <div className="mt-8">
                <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPageSkeleton;
