import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  // Handle both image and images fields for compatibility
  const getImageUrl = () => {
    // If category has a single image field (admin categories)
    if ('image' in category && category.image) {
      return category.image;
    }
    // If category has images array (frontend categories)
    if ('images' in category && category.images && category.images.length > 0) {
      return category.images[0];
    }
    // Fallback to placeholder
    return 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  const imageUrl = getImageUrl();

  return (
    <Link
      to={`/${category.slug}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-pink-50"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={imageUrl}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
          <p className="text-sm text-white/90">{category.count} artworks</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
