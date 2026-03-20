'use client'

import { useEffect, useState } from 'react';
import { useParams } from '@/src/compat/router';
import NormalItemsService from '../services/normalItemsService';
import NormalItemsPage from './NormalItemsPage';
import CategoryDetailPage from './CategoryDetailPage';
import ProductPage from './ProductPage';
import { useProducts } from '../contexts/ProductContext';
import { generateSlug } from '../utils/slugUtils';

/**
 * Route handler that checks if a slug belongs to a normal item, F&B product, or category.
 * Priority: Normal Item > F&B Product > Category
 */
const NormalItemRouteHandler: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { adminProducts, loading: productsLoading } = useProducts();
  const [itemType, setItemType] = useState<'normal' | 'fb' | 'category' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkItemType = async () => {
      if (!categorySlug) {
        setItemType('category');
        setLoading(false);
        return;
      }

      try {
        // First check if this slug matches a normal item's title-generated slug
        const normalItem = await NormalItemsService.getItemByTitleSlug(categorySlug);
        if (normalItem !== null) {
          setItemType('normal');
          setLoading(false);
          return;
        }

        // Then check if this slug matches an F&B product
        if (!productsLoading && adminProducts.length > 0) {
          const fbProduct = adminProducts.find(product => {
            const productSlug = generateSlug(product.title);
            if (productSlug !== categorySlug) return false;
            
            const categories = (product.categories || []).map((c: string) => c.toLowerCase()).join(' ');
            const isFB = categories.includes('food & beverage') || 
                         categories.includes('f&b') || 
                         categories.includes('food-beverage') ||
                         categories.includes('dry fruit') || 
                         categories.includes('dried fruit') || 
                         categories.includes('spice');
            return isFB;
          });
          
          if (fbProduct) {
            setItemType('fb');
            setLoading(false);
            return;
          }
        }

        // Otherwise, treat as category
        setItemType('category');
      } catch (error) {
        console.error('Error checking item type:', error);
        setItemType('category');
      } finally {
        setLoading(false);
      }
    };

    checkItemType();
  }, [categorySlug, adminProducts, productsLoading]);

  // Show loading state
  if (loading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  // If it's a normal item, show NormalItemsPage
  if (itemType === 'normal') {
    return <NormalItemsPage />;
  }

  // If it's an F&B product, show ProductPage
  if (itemType === 'fb') {
    return <ProductPage />;
  }

  // Otherwise, show CategoryDetailPage
  return <CategoryDetailPage />;
};

export default NormalItemRouteHandler;




