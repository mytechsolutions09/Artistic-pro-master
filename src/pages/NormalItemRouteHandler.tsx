import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NormalItemsService from '../services/normalItemsService';
import NormalItemsPage from './NormalItemsPage';
import CategoryDetailPage from './CategoryDetailPage';

/**
 * Route handler that checks if a slug belongs to a normal item (by title-generated slug).
 * If yes, shows NormalItemsPage, otherwise falls through to CategoryDetailPage.
 */
const NormalItemRouteHandler: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [isNormalItem, setIsNormalItem] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIfNormalItem = async () => {
      if (!categorySlug) {
        setIsNormalItem(false);
        setLoading(false);
        return;
      }

      try {
        // Check if this slug matches a normal item's title-generated slug
        const item = await NormalItemsService.getItemByTitleSlug(categorySlug);
        setIsNormalItem(item !== null);
      } catch (error) {
        console.error('Error checking normal item:', error);
        setIsNormalItem(false);
      } finally {
        setLoading(false);
      }
    };

    checkIfNormalItem();
  }, [categorySlug]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // If it's a normal item, show NormalItemsPage
  // NormalItemsPage will use categorySlug as the slug parameter
  if (isNormalItem) {
    return <NormalItemsPage />;
  }

  // Otherwise, show CategoryDetailPage
  return <CategoryDetailPage />;
};

export default NormalItemRouteHandler;
