import React from 'react';

const ProductPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: product gallery skeleton */}
          <div className="space-y-3">
            <div className="w-full aspect-square bg-gray-200 rounded-lg" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-200 rounded-md" />
              ))}
            </div>
          </div>

          {/* Right: product details skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-4/5" />

            <div className="flex items-center justify-between">
              <div className="h-8 bg-gray-200 rounded w-36" />
              <div className="h-5 bg-gray-200 rounded w-28" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-40" />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-10 bg-gray-200 rounded-md" />
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-10 bg-gray-200 rounded-md" />
              </div>
            </div>

            <div>
              <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-10 bg-gray-200 rounded-md" />
            </div>

            <div className="h-4 bg-gray-200 rounded w-36" />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="h-12 bg-gray-200 rounded-lg" />
              <div className="h-12 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Bottom tabs/content skeleton */}
        <div className="mt-10 space-y-4">
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded-md" />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-11/12" />
            <div className="h-4 bg-gray-200 rounded w-10/12" />
            <div className="h-4 bg-gray-200 rounded w-9/12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPageSkeleton;
