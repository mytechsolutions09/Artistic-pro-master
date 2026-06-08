'use client'

import React from 'react';
import { Link } from '@/src/compat/router';
import { Category } from '../types';
import OptimizedImage from './OptimizedImage';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  // Handle image, image_url, and images fields for compatibility
  const getImageUrl = () => {
    if ('image' in category && category.image) {
      return category.image;
    }
    if ('image_url' in (category as any) && (category as any).image_url) {
      return (category as any).image_url;
    }
    if ('images' in category && category.images && category.images.length > 0) {
      return category.images[0];
    }
    // Fallback to placeholder
    return 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  const imageUrl = getImageUrl();

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-pink-50"
    >
      <div className="relative h-40 overflow-hidden">
        <OptimizedImage
          src={imageUrl}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          width={800}
          quality={70}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3 text-white pointer-events-none">
          <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
          <p className="text-sm text-white/90">{category.count} artworks</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;




