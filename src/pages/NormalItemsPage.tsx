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
import { ReviewService } from '../services/reviewService';
import { Review } from '../types';
import { MessageCircle, ThumbsUp } from 'lucide-react';

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);

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

  // Load reviews for the current item
  useEffect(() => {
    const loadReviews = async () => {
      if (item && item.id) {
        setReviewsLoading(true);
        try {
          // Normal items are synced to products table, so we can use the same ID
          const productReviews = await ReviewService.getProductReviews(item.id);
          setReviews(productReviews);
        } catch (error) {
          console.error('Error loading reviews:', error);
          setReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();
  }, [item]);

  // Get related items (exclude current item)
  // Show related items even if less than 4, as long as there's at least 1
  const relatedItems = item ? allItems
    .filter(i => i.id !== item.id && i.status === 'active')
    .slice(0, 4) : [];
  
  // Debug: Log related items (remove in production)
  useEffect(() => {
    if (item) {
      console.log('Normal Item:', item.title);
      console.log('Related items found:', relatedItems.length);
      console.log('Related items:', relatedItems.map(i => i.title));
    }
  }, [item, relatedItems]);

  // Pagination logic
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedReviewImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedReviewImage(null);
  };

  const handleHelpfulVote = (reviewId: string) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
  };

  const handleWriteReview = () => {
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
  };

  // Calculate average rating and total reviews
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
    : 0;
  const totalReviews = reviews.length;


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
          <h1 className="text-2xl font-semibold text-gray-800 mb-4 font-sans font-normal">Item Not Found</h1>
          <Link to="/normal" className="text-pink-600 hover:text-pink-700 font-medium font-sans font-normal">
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
          <h1 className="text-3xl font-semibold text-gray-900 mb-8 font-sans font-normal">Normal Items</h1>
          {allItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 font-sans font-normal">No items available yet.</p>
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
                <div className="flex items-center space-x-2 text-sm text-gray-600 font-sans font-normal">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favoritesLoading}
                    className="flex items-center space-x-2 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans font-normal"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${
                        isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'
                      } ${favoritesLoading ? 'animate-pulse' : ''}`} 
                    />
                    <span className={`text-xs font-sans font-normal ${isFavorited ? 'text-red-500' : ''}`}>
                      {favoritesLoading ? 'Loading...' : (isFavorited ? 'Favorited' : 'Add to favorites')}
                    </span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 text-gray-600 hover:text-[#F48FB1] transition-colors font-sans font-normal"
                  >
                    <Share2 className="w-3 h-3" />
                    <span className="text-xs font-sans font-normal">Share</span>
                  </button>
                </div>
              </div>

              {/* Item Title */}
              <div className="mt-2">
                <h1 className="text-sm sm:text-base font-semibold text-gray-800 leading-tight text-center capitalize font-sans font-normal">
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
                          <div className="text-lg sm:text-xl font-semibold text-green-600 font-sans font-normal">
                            {formatUIPrice(getCurrentPrice(), 'INR')}
                          </div>
                          <div className="text-xs text-gray-500 line-through font-sans font-normal">
                            {formatUIPrice(item.original_price, 'INR')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-pink-600 font-medium font-sans font-normal">
                            {item.discount_percentage}% OFF
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-lg sm:text-xl font-semibold text-green-600 font-sans font-normal">
                        {formatUIPrice(getCurrentPrice(), 'INR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 font-sans font-normal">Description</h3>
                <div className="mb-2">
                  <p className={`text-xs text-gray-600 leading-relaxed font-sans font-normal ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                    {item.description || "Beautiful item that brings elegance into your space."}
                  </p>
                  {item.description && item.description.length > 100 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-xs text-[#F48FB1] hover:text-[#E91E63] font-medium mt-1 transition-colors font-sans font-normal"
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
                  className="w-full bg-teal-800 text-white py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-teal-900 transition-all duration-200 shadow-md hover:shadow-lg font-sans font-normal"
                >
                  Add to cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#F48FB1] text-white py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#E91E63] transition-all duration-200 shadow-md hover:shadow-lg font-sans font-normal"
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
                          <span className="font-medium text-gray-900 capitalize text-sm font-sans font-normal">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-0">
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Size:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">470 mm x 810 mm</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Material:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">Wood</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Style:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">Modern</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Quality:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">Premium grade</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Return:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">Non-returnable and non-refundable</span>
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
                          <span className="font-medium text-gray-900 capitalize text-sm font-sans font-normal">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-0">
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Delivery Method:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">Physical Shipping</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Delivery Time:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">30 days</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Shipping:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">Standard shipping included</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Tracking:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">Tracking information provided</span>
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
                          <span className="font-medium text-gray-900 capitalize text-sm font-sans font-normal">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-0">
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Quality:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">Premium grade guarantee</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Uniqueness:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">One-of-a-kind design</span>
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

        {/* Reviews Section */}
        {item && (
          <div className="w-full px-3 sm:px-4 lg:px-6 mb-6 sm:mb-8 lg:mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Column - Reviews */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {/* Decorative Header */}
                  <div className="bg-gradient-to-r from-[#FAC6CF] to-[#F48FB1] h-1"></div>
                  
                  <div className="p-1 sm:p-2 lg:p-3">
                    {/* Header with Rating and Write Review Button */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 sm:mb-2 space-y-1 sm:space-y-0">
                      <div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-[#333333] font-sans font-normal">
                          Customer Reviews
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Rating */}
                        <div className="flex items-center space-x-2 bg-[#F5F5F5] rounded-lg px-2 py-1 border border-[#F5F5F5] shadow-sm">
                          <div className="text-lg sm:text-xl font-semibold text-[#F48FB1] font-sans font-normal">
                            {averageRating.toFixed(1)}
                          </div>
                          <div className="text-xs text-[#333333] font-sans font-normal">out of 5</div>
                          <div className="flex items-center space-x-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-2 h-2 sm:w-3 sm:h-3 ${
                                  i < Math.floor(averageRating) ? 'text-[#F48FB1] fill-current drop-shadow-sm' : 'text-[#F5F5F5]'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-[#333333] font-semibold font-sans font-normal">
                            ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleWriteReview}
                          className="px-2 py-1 bg-gradient-to-r from-[#FAC6CF] to-[#F48FB1] hover:from-[#F48FB1] hover:to-[#E91E63] text-white rounded-md transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md text-xs font-sans font-normal"
                        >
                          ✨ Write a Review
                        </button>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center justify-end mb-1 sm:mb-2">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className="text-xs font-medium text-[#333333] font-sans font-normal">Sort by:</span>
                        <select className="text-xs border border-[#F5F5F5] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#F48FB1] focus:border-[#F48FB1] bg-gray-50 shadow-sm font-sans font-normal">
                          <option>Most Recent</option>
                          <option>Suggested</option>
                          <option>Highest Rated</option>
                          <option>Lowest Rated</option>
                        </select>
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    {reviewsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F48FB1]"></div>
                        <span className="ml-3 text-gray-600 font-sans font-normal">Loading reviews...</span>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-3">
                          <MessageCircle className="w-12 h-12 mx-auto" />
                        </div>
                        <p className="text-gray-600 font-sans font-normal">No reviews yet. Be the first to review this product!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* 2x2 Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentReviews.filter((review: Review) => review && review.userName && review.comment).map((review: Review, index: number) => (
                            <div key={review.id} className={`bg-white rounded-xl p-4 border border-[#F5F5F5] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${
                              index % 2 === 0 ? 'hover:border-[#FAC6CF]' : 'hover:border-[#F48FB1]'
                            }`}>
                              {/* Review Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                                    index % 2 === 0 ? 'bg-[#F48FB1]' : 'bg-[#FAC6CF]'
                                  }`}>
                                    <span className="text-white font-semibold text-sm font-sans font-normal">
                                      {review.userName && review.userName.includes('@') 
                                        ? review.userName.split('@')[0].charAt(0).toUpperCase()
                                        : review.userName ? review.userName.charAt(0).toUpperCase() : '?'
                                      }
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[#333333] text-sm font-sans font-normal">
                                      {review.userName && review.userName.includes('@') 
                                        ? review.userName.split('@')[0].charAt(0).toUpperCase() + review.userName.split('@')[0].slice(1)
                                        : review.userName || 'Anonymous User'
                                      }
                                    </p>
                                    <div className="flex items-center space-x-1 mt-1">
                                      <div className="flex items-center space-x-1">
                                        <div className="w-3 h-3 bg-[#F5F5F5] rounded-full flex items-center justify-center border border-[#FAC6CF]">
                                          <span className="text-[#F48FB1] text-xs font-semibold font-sans font-normal">✓</span>
                                        </div>
                                        <span className="text-xs text-[#F48FB1] font-semibold font-sans font-normal">Recommends</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                  <div className="flex items-center space-x-1">
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < review.rating ? 'text-[#F48FB1] fill-current drop-shadow-sm' : 'text-[#F5F5F5]'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs font-medium text-[#333333] bg-[#F5F5F5] px-2 py-1 rounded-full font-sans font-normal">
                                    {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Review Comment */}
                              <p className="text-[#333333] text-sm leading-relaxed mb-3 overflow-hidden font-sans font-normal" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>{review.comment}</p>
                              
                              {/* Review Images */}
                              {review.images && review.images.length > 0 && (
                                <div className="mb-3">
                                  <div className="flex gap-2">
                                    {review.images.slice(0, 2).map((image, imgIndex) => (
                                      <div 
                                        key={imgIndex} 
                                        className="relative group cursor-pointer flex-shrink-0"
                                        onClick={() => handleImageClick(image)}
                                      >
                                        <img
                                          src={image}
                                          alt={`Review image ${imgIndex + 1}`}
                                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-[#F48FB1] transition-all duration-200"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Eye className="w-3 h-3 text-white" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {review.images.length > 2 && (
                                      <div 
                                        className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                                        onClick={() => review.images && handleImageClick(review.images[2])}
                                      >
                                        <span className="text-xs text-gray-500 font-sans font-normal">+{review.images.length - 2}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Review Actions */}
                              <div className="flex items-center justify-between">
                                <button 
                                  onClick={() => handleHelpfulVote(review.id)}
                                  className="flex items-center space-x-1 text-[#333333] hover:text-[#F48FB1] transition-colors font-medium text-xs font-sans font-normal"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>Helpful ({helpfulVotes[review.id] || review.helpful || 0})</span>
                                </button>
                                {review.verified && (
                                  <span className="px-2 py-1 bg-[#F48FB1] text-white text-xs rounded-full font-semibold shadow-sm font-sans font-normal">
                                    ✓ Verified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center mt-6 pt-4 border-t border-[#F5F5F5]">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="w-8 h-8 rounded-lg border border-[#F5F5F5] text-[#333333] hover:text-[#F48FB1] hover:border-[#F48FB1] transition-all duration-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed font-sans font-normal"
                              >
                                ←
                              </button>
                              
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`w-8 h-8 rounded-lg transition-all duration-300 font-medium text-sm font-sans font-normal ${
                                    page === currentPage 
                                      ? 'bg-[#F48FB1] text-white shadow-lg' 
                                      : 'border border-[#F5F5F5] text-[#333333] hover:text-[#F48FB1] hover:border-[#F48FB1] hover:shadow-md'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                              
                              <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 rounded-lg border border-[#F5F5F5] text-[#333333] hover:text-[#F48FB1] hover:border-[#F48FB1] transition-all duration-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed font-sans font-normal"
                              >
                                →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Review Images Gallery */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center font-sans font-normal">
                    <span className="w-2 h-2 bg-[#F48FB1] rounded-full mr-2"></span>
                    Review Images
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(() => {
                      // Collect all review images
                      const allReviewImages = reviews
                        .filter((review: Review) => review && review.images && review.images.length > 0)
                        .flatMap((review: Review) => review.images || [])
                        .slice(0, 3); // Take only first 3 images
                      
                      // If we have images, show them
                      if (allReviewImages.length > 0) {
                        return allReviewImages.map((image: string, index: number) => (
                          <div key={index} className="relative group cursor-pointer" onClick={() => handleImageClick(image)}>
                            <img
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-16 sm:h-20 object-cover rounded-lg border border-gray-200 hover:border-[#F48FB1] transition-all duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              </div>
                            </div>
                          </div>
                        ));
                      }
                      
                      // If no images, show 3 placeholders
                      return Array.from({ length: 3 }, (_, index) => (
                        <div key={index} className="w-full h-16 sm:h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs font-sans font-normal">No images yet</span>
                        </div>
                      ));
                    })()}
                  </div>
                  {reviews.filter((review: Review) => review && review.images && review.images.length > 0).length > 0 && (
                    <button className="w-full mt-3 sm:mt-4 py-2 text-[#F48FB1] hover:text-[#E91E63] text-xs sm:text-sm font-medium transition-colors font-sans font-normal">
                      View all review images →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Image Modal */}
            {showImageModal && selectedReviewImage && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-8"
                onClick={closeImageModal}
              >
                <div className="relative max-w-6xl max-h-screen w-full h-full flex items-center justify-center">
                  <img
                    src={selectedReviewImage}
                    alt="Review"
                    className="max-w-full max-h-full object-contain"
                  />
                  <button
                    onClick={closeImageModal}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Related Items Section */}
        {item && relatedItems && relatedItems.length > 0 && (
          <div className="py-6 sm:py-8 mt-4">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 font-sans font-normal">Related Products</h2>
                  <p className="text-sm text-gray-600 font-sans font-normal">Discover more amazing products you might love</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                
                <div className="text-center mt-8 sm:mt-10 lg:mt-12">
                  <Link 
                    to="/shop"
                    className="inline-block bg-white border-2 border-[#F48FB1] text-[#F48FB1] hover:bg-[#F48FB1] hover:text-white font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-200 text-sm sm:text-base font-sans font-normal"
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NormalItemsPage;
