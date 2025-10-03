import React, { useState } from 'react';
import {
  HomepageSkeleton,
  HeroSectionSkeleton,
  ImageSliderSkeleton,
  FeaturedGridSkeleton,
  ProductGridSkeleton,
  CategoryGridSkeleton,
  TrendingCollectionsSkeleton,
  StatisticsSkeleton,
  NewsletterSkeleton
} from './HomepageSkeleton';

const SkeletonDemo: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(false);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Homepage Skeleton Demo</h1>
        <button
          onClick={() => setShowSkeleton(!showSkeleton)}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          {showSkeleton ? 'Hide Skeleton' : 'Show Skeleton'}
        </button>
      </div>

      {showSkeleton ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Complete Homepage Skeleton</h2>
            <HomepageSkeleton />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Individual Sections</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Hero Section</h3>
                <HeroSectionSkeleton />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Image Slider</h3>
                <ImageSliderSkeleton />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Featured Grid</h3>
                <FeaturedGridSkeleton />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Product Grid (3 columns)</h3>
                <ProductGridSkeleton title="Best Sellers" columns={3} />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Product Grid (4 columns)</h3>
                <ProductGridSkeleton title="Featured Artwork" columns={4} />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Category Grid</h3>
                <CategoryGridSkeleton />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Trending Collections</h3>
                <TrendingCollectionsSkeleton />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Statistics</h3>
                <StatisticsSkeleton />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Newsletter</h3>
                <NewsletterSkeleton />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Click the button above to see the skeleton loaders in action!</p>
        </div>
      )}
    </div>
  );
};

export default SkeletonDemo;
