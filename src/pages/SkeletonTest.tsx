import React, { useState } from 'react';
import { HomepageSkeleton, HeroSectionSkeleton, ProductGridSkeleton, CategoryGridSkeleton } from '../components/HomepageSkeleton';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ImageSkeleton from '../components/ImageSkeleton';

const SkeletonTest: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(true);

  const toggleSkeleton = () => {
    setShowSkeleton(!showSkeleton);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Skeleton Loading Test</h1>
          <button
            onClick={toggleSkeleton}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
          >
            {showSkeleton ? 'Hide' : 'Show'} Skeleton
          </button>
        </div>

        {showSkeleton ? (
          <div className="space-y-12">
            {/* Complete Homepage Skeleton */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">Complete Homepage Skeleton</h2>
              <HomepageSkeleton />
            </section>

            {/* Individual Component Skeletons */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">Individual Component Skeletons</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-600 mb-4">Hero Section</h3>
                  <HeroSectionSkeleton />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-600 mb-4">Product Grid (3 columns)</h3>
                  <ProductGridSkeleton title="Best Sellers" columns={3} />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-600 mb-4">Product Grid (4 columns)</h3>
                  <ProductGridSkeleton title="Featured Artwork" columns={4} />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-600 mb-4">Category Grid</h3>
                  <CategoryGridSkeleton />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-600 mb-4">Product Card Skeletons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-600 mb-4">Image Skeletons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Square</p>
                      <ImageSkeleton aspectRatio="square" className="w-full" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Portrait</p>
                      <ImageSkeleton aspectRatio="portrait" className="w-full" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Landscape</p>
                      <ImageSkeleton aspectRatio="landscape" className="w-full" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Video</p>
                      <ImageSkeleton aspectRatio="video" className="w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Skeleton components are hidden</div>
            <div className="text-gray-400 text-sm mt-2">Click the button above to show them</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkeletonTest;
