import React from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';
import ImageSkeleton from './ImageSkeleton';

// Hero Section Skeleton
export const HeroSectionSkeleton: React.FC = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Card Skeleton */}
          <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-8 animate-pulse" style={{ minHeight: '300px' }}>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              <div className="h-10 bg-gray-300 rounded-full w-32 mt-6"></div>
            </div>
          </div>

          {/* Featured Card Skeleton */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-200 animate-pulse" style={{ minHeight: '300px' }}>
            <ImageSkeleton className="w-full h-full" aspectRatio="landscape" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="h-6 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>

          {/* Categories Card Skeleton */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-200 animate-pulse" style={{ minHeight: '300px' }}>
            <ImageSkeleton className="w-full h-full" aspectRatio="landscape" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="h-6 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Image Slider Skeleton
export const ImageSliderSkeleton: React.FC = () => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-[400px]">
            {/* Image Section Skeleton */}
            <div className="relative overflow-hidden h-full bg-gray-200">
              <ImageSkeleton className="w-full h-full" aspectRatio="landscape" />
            </div>

            {/* Text Description Section Skeleton */}
            <div className="p-8 flex flex-col justify-center h-full space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-12 bg-gray-200 rounded-full w-32 mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Featured Grid Skeleton
export const FeaturedGridSkeleton: React.FC = () => {
  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden shadow-lg bg-white animate-pulse">
              <ImageSkeleton className="w-full h-64" aspectRatio="landscape" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <div className="h-12 bg-gray-200 rounded-full w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ title?: string; subtitle?: string; showButton?: boolean; columns?: number }> = ({ 
  title = "Loading...", 
  subtitle = "Please wait while we load the content", 
  showButton = true,
  columns = 3 
}) => {
  const gridCols = columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                   columns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                   'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
        </div>
        
        <div className={`grid ${gridCols} gap-6 items-start`}>
          {[...Array(columns === 4 ? 4 : 3)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>

        {showButton && (
          <div className="text-center mt-8">
            <div className="h-12 bg-gray-200 rounded-full w-48 mx-auto animate-pulse"></div>
          </div>
        )}
      </div>
    </section>
  );
};

// Category Grid Skeleton
export const CategoryGridSkeleton: React.FC = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="relative">
                <ImageSkeleton className="w-full h-48" aspectRatio="landscape" />
                <div className="absolute top-3 right-3">
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <div className="h-12 bg-gray-200 rounded-full w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

// Trending Collections Skeleton
export const TrendingCollectionsSkeleton: React.FC = () => {
  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="relative">
                <ImageSkeleton className="w-full h-48" aspectRatio="landscape" />
                <div className="absolute top-3 left-3">
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <div className="h-12 bg-gray-200 rounded-full w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

// Statistics Section Skeleton
export const StatisticsSkeleton: React.FC = () => {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-12"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Newsletter Section Skeleton
export const NewsletterSkeleton: React.FC = () => {
  return (
    <section className="py-6 px-4 bg-pink-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:w-64 h-10 bg-gray-200 rounded-lg"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Complete Homepage Skeleton
export const HomepageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSectionSkeleton />
      <ImageSliderSkeleton />
      <FeaturedGridSkeleton />
      <ProductGridSkeleton title="Best Sellers" columns={3} />
      <ProductGridSkeleton title="Featured Artwork" columns={4} />
      <CategoryGridSkeleton />
      <TrendingCollectionsSkeleton />
      <StatisticsSkeleton />
      <NewsletterSkeleton />
    </div>
  );
};

export default HomepageSkeleton;
