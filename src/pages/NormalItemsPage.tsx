import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Download, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Eye, 
  ArrowLeft,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  FileText,
  Truck,
  Info
} from 'lucide-react';
import ProductTabs from '../components/ProductTabs';
import { CartManager } from '../services/orderService';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import NormalItemsService, { NormalItem } from '../services/normalItemsService';
import ProductCard from '../components/ProductCard';
import { FavoritesService } from '../services/favoritesService';

const NormalItemsPage: React.FC = () => {
  // Support both /normal/:itemSlug and /:itemSlug routes
  const { itemSlug, categorySlug } = useParams<{ itemSlug?: string; categorySlug?: string }>();
  const slug = itemSlug || categorySlug;
  const navigate = useNavigate();
  const { formatUIPrice } = useCurrency();
  const { user } = useAuth();
  const [item, setItem] = useState<NormalItem | null>(null);
  const [allItems, setAllItems] = useState<NormalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemImage, setSelectedItemImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState('itemDetails');

  // Load items
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const items = await NormalItemsService.getActiveItems();
        setAllItems(items);
        
        if (slug) {
          // Find item by title-generated slug (matches URL format)
          const foundItem = await NormalItemsService.getItemByTitleSlug(slug);
          setItem(foundItem);
        }
      } catch (error) {
        console.error('Error loading normal items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadItems();
  }, [slug]);

  // Scroll to top on item change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [slug]);

  // Check if item is favorited
  useEffect(() => {
    const checkIfFavorited = async () => {
      if (item && item.id && user) {
        try {
          // Normal items are now also products, so use 'product' type
          const isItemFavorited = await FavoritesService.isFavorite(item.id, 'product');
          setIsFavorited(isItemFavorited);
        } catch (error) {
          console.error('Error checking favorites:', error);
          setIsFavorited(false);
        }
      } else {
        setIsFavorited(false);
      }
    };

    checkIfFavorited();
  }, [item, user]);


  // Prevent right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Prevent drag and drop
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  // Image navigation
  const previousImage = () => {
    if (item && item.images.length > 0) {
      setSelectedItemImage((prev) => (prev === 0 ? item.images.length - 1 : prev - 1));
    }
  };

  const nextImage = () => {
    if (item && item.images.length > 0) {
      setSelectedItemImage((prev) => (prev === item.images.length - 1 ? 0 : prev + 1));
    }
  };

  const goToImage = (index: number) => {
    setSelectedItemImage(index);
  };

  const handleAddToCart = () => {
    if (!item) return;
    // Convert NormalItem to product-like format for cart
    // Normal items are physical products, not digital
    const cartItem = {
      id: item.id,
      title: item.title,
      price: item.price,
      main_image: item.main_image || item.images[0],
      images: item.images,
      category: 'Normal',
      originalPrice: item.original_price,
      discountPercentage: item.discount_percentage
    };
    // Pass undefined for product type since normal items are physical products
    // The cart will handle them as physical items
    CartManager.addItem(cartItem, quantity, undefined, undefined);
  };

  const handleBuyNow = () => {
    if (!item) return;
    const params = new URLSearchParams({
      product: item.id,
      price: item.price.toString()
    });
    // Don't pass type parameter - normal items are physical products
    navigate(`/checkout?${params.toString()}`);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/sign-in';
      return;
    }

    if (!item || !item.id) return;

    setFavoritesLoading(true);
    try {
      if (isFavorited) {
        // Normal items are now also products, so use 'product' type
        await FavoritesService.removeFromFavorites(item.id, 'product');
        setIsFavorited(false);
      } else {
        // Normal items are now also products, so use 'product' type
        await FavoritesService.addToFavorites(item.id, 'product');
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // You could show a notification here
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item?.title,
        text: `Check out this item: ${item?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Show not found if slug provided but item not found
  if (slug && !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Item Not Found</h1>
          <Link to="/normal" className="text-pink-600 hover:text-pink-700 font-medium">
            ← Back to Normal Items
          </Link>
        </div>
      </div>
    );
  }

  // If no slug, show list of all items
  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Normal Items</h1>
          {allItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No items available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allItems.map((normalItem) => (
                <ProductCard
                  key={normalItem.id}
                  product={{
                    id: normalItem.id,
                    title: normalItem.title,
                    price: normalItem.price,
                    main_image: normalItem.main_image || normalItem.images[0],
                    images: normalItem.images,
                    categories: ['Normal'],
                    category: 'Normal',
                    originalPrice: normalItem.original_price,
                    discountPercentage: normalItem.discount_percentage,
                    rating: 0,
                    downloads: 0,
                    slug: normalItem.slug
                  } as any}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get item images
  const itemImages = item.images && item.images.length > 0 
    ? item.images 
    : item.main_image 
      ? [item.main_image] 
      : ['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600'];

  // Get current price
  const getCurrentPrice = () => {
    if (item.original_price && item.discount_percentage && item.discount_percentage > 0) {
      return Math.round(item.original_price * (1 - (item.discount_percentage / 100)));
    }
    return item.price;
  };

  // Get related items (exclude current item)
  const relatedItems = allItems
    .filter(i => i.id !== item.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50" onContextMenu={handleContextMenu}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
        {/* Item Top Section - Matching ProductPage Layout */}
        <div className="grid grid-cols-[auto_1fr] lg:grid-cols-12 gap-2 sm:gap-4 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
          
          {/* Left Panel - Thumbnail Gallery */}
          <div className="flex col-span-1 lg:col-span-2 flex-col items-center space-y-2 sm:space-y-3">
            {/* Thumbnails Container */}
            <div className="h-[300px] sm:h-[400px] lg:h-[500px] overflow-y-auto scrollbar-hide w-16 sm:w-18 lg:w-20">
              {itemImages.length > 1 ? (
                <div className="flex flex-col space-y-2 sm:space-y-3">
                  {itemImages.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 overflow-hidden border-2 transition-all duration-200 ${
                        selectedItemImage === index 
                          ? 'border-gray-600 ring-2 ring-gray-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`View ${index + 1}`} 
                        className="w-full h-full object-contain"
                        onContextMenu={handleContextMenu}
                        onDragStart={handleDragStart}
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 overflow-hidden border-2 border-gray-200">
                    <img 
                      src={itemImages[0]} 
                      alt={item.title} 
                      className="w-full h-full object-contain"
                      onContextMenu={handleContextMenu}
                      onDragStart={handleDragStart}
                      draggable={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Central Panel - Main Image */}
          <div className="col-span-1 lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[600px]">
              <div 
                className="w-full aspect-[6/5] max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] max-w-[600px] overflow-hidden relative"
              >
                <img
                  src={itemImages[selectedItemImage]}
                  alt={item.title}
                  className="w-full h-full object-contain"
                  onContextMenu={handleContextMenu}
                  onDragStart={handleDragStart}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Navigation Arrows */}
              {itemImages.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="hidden lg:flex absolute -left-10 top-1/4 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md border border-gray-200 items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 z-10"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="hidden lg:flex absolute -right-10 top-1/4 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md border border-gray-200 items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 z-10"
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Item Information */}
          <div className="col-span-2 lg:col-span-4">
            <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
              {/* Top Actions */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favoritesLoading}
                    className="flex items-center space-x-2 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${
                        isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'
                      } ${favoritesLoading ? 'animate-pulse' : ''}`} 
                    />
                    <span className={`text-xs ${isFavorited ? 'text-red-500' : ''}`}>
                      {favoritesLoading ? 'Loading...' : (isFavorited ? 'Favorited' : 'Add to favorites')}
                    </span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 text-gray-600 hover:text-[#F48FB1] transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                    <span className="text-xs">Share</span>
                  </button>
                </div>
              </div>

              {/* Item Title */}
              <div className="mt-2">
                <h1 className="text-sm sm:text-base font-semibold text-gray-800 leading-tight text-center capitalize">
                  {item.title}
                </h1>
              </div>

              {/* Price Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {item.original_price && item.discount_percentage && item.discount_percentage > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-baseline space-x-2">
                          <div className="text-lg sm:text-xl font-bold text-green-600">
                            {formatUIPrice(getCurrentPrice(), 'INR')}
                          </div>
                          <div className="text-xs text-gray-500 line-through">
                            {formatUIPrice(item.original_price, 'INR')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-pink-600 font-medium">
                            {item.discount_percentage}% OFF
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-lg sm:text-xl font-bold text-green-600">
                        {formatUIPrice(getCurrentPrice(), 'INR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Description</h3>
                <div className="mb-2">
                  <p className={`text-xs text-gray-600 leading-relaxed ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                    {item.description || "Beautiful item that brings elegance into your space."}
                  </p>
                  {item.description && item.description.length > 100 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-xs text-[#F48FB1] hover:text-[#E91E63] font-medium mt-1 transition-colors"
                    >
                      {showFullDescription ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gray-900 text-white py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Add to cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#F48FB1] text-white py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#E91E63] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Information Section */}
        <div className="w-full px-3 sm:px-4 lg:px-6 mb-6 sm:mb-8 lg:mb-10">
          <ProductTabs
            tabs={[
              {
                id: 'itemDetails',
                label: 'Item Details',
                icon: <FileText className="w-4 h-4" />,
                content: (
                  <div className="space-y-0">
                    {item.item_details && Object.keys(item.item_details).length > 0 ? (
                      Object.entries(item.item_details).map(([key, value], index, arr) => (
                        <div 
                          key={key}
                          className={`flex justify-between items-center py-1.5 ${index < arr.length - 1 ? 'border-b border-gray-200' : ''}`}
                        >
                          <span className="font-medium text-gray-900 capitalize text-sm">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-gray-600 text-sm">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-0">
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm">Size:</span>
                          <span className="text-gray-600 text-sm">470 mm x 810 mm</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm">Material:</span>
                          <span className="text-gray-600 text-sm">Wood</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm">Style:</span>
                          <span className="text-gray-600 text-sm">Modern</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm">Quality:</span>
                          <span className="text-gray-600 text-sm">Premium grade</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="font-medium text-gray-900 text-sm">Return:</span>
                          <span className="text-gray-600 text-sm">Non-returnable and non-refundable</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              },
              {
                id: 'delivery',
                label: 'Delivery',
                icon: <Truck className="w-4 h-4" />,
                content: (
                  <div className="space-y-0">
                    {item.delivery_info && Object.keys(item.delivery_info).length > 0 ? (
                      Object.entries(item.delivery_info).map(([key, value], index, arr) => (
                        <div 
                          key={key}
                          className={`flex justify-between items-center py-1.5 ${index < arr.length - 1 ? 'border-b border-gray-200' : ''}`}
                        >
                          <span className="font-medium text-gray-900 capitalize text-sm">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-gray-600 text-sm">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-0">
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm">Delivery Method:</span>
                          <span className="text-gray-600 text-sm">Physical Shipping</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm">Delivery Time:</span>
                          <span className="text-gray-600 text-sm">30 days</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm">Shipping:</span>
                          <span className="text-gray-600 text-sm">Standard shipping included</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="font-medium text-gray-900 text-sm">Tracking:</span>
                          <span className="text-gray-600 text-sm">Tracking information provided</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              },
              {
                id: 'didYouKnow',
                label: 'Did You Know?',
                icon: <Info className="w-4 h-4" />,
                content: (
                  <div className="space-y-0">
                    {item.did_you_know && Object.keys(item.did_you_know).length > 0 ? (
                      Object.entries(item.did_you_know).map(([key, value], index, arr) => (
                        <div 
                          key={key}
                          className={`flex justify-between items-center py-1.5 ${index < arr.length - 1 ? 'border-b border-gray-200' : ''}`}
                        >
                          <span className="font-medium text-gray-900 capitalize text-sm">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-gray-600 text-sm">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-0">
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm">Quality:</span>
                          <span className="text-gray-600 text-sm">Premium grade guarantee</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="font-medium text-gray-900 text-sm">Uniqueness:</span>
                          <span className="text-gray-600 text-sm">One-of-a-kind design</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Related Items Section */}
        {relatedItems.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Related Items</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedItems.map((relatedItem) => (
                <ProductCard
                  key={relatedItem.id}
                  product={{
                    id: relatedItem.id,
                    title: relatedItem.title,
                    price: relatedItem.price,
                    main_image: relatedItem.main_image || relatedItem.images[0],
                    images: relatedItem.images,
                    categories: ['Normal'],
                    category: 'Normal',
                    originalPrice: relatedItem.original_price,
                    discountPercentage: relatedItem.discount_percentage,
                    rating: 0,
                    downloads: 0,
                    slug: relatedItem.slug
                  } as any}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NormalItemsPage;
