import React from 'react';
import CategoryCard from '../components/CategoryCard';
import CategoriesPageSkeleton from '../components/CategoriesPageSkeleton';
import { useCategories } from '../contexts/CategoryContext';

const CategoriesPage: React.FC = () => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return <CategoriesPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-2">Error loading categories</h3>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-0.5 0-1 0.5-1 1s0.5 1 1 1 1-0.5 1-1-0.5-1-1-1z" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 text-sm mb-4">Categories will appear here once they are added in the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
