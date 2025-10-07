import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Download, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Eye, 
  Tag,
  User,
  ArrowLeft,
  Check,
  X,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Play,
  Crown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  FileText,
  Truck,
  Info
} from 'lucide-react';

import ArtCard from '../components/ArtCard';
import ProductTabs from '../components/ProductTabs';
import { CartManager } from '../services/orderService';
import { NotificationManager } from '../components/Notification';
import { SITE_COLORS } from '../constants/colors';
import { useProducts } from '../contexts/ProductContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { parseProductUrl, findProductBySlugs, generateSlug } from '../utils/slugUtils';
import { ReviewService } from '../services/reviewService';
import { FavoritesService } from '../services/favoritesService';
import { Review } from '../types';

const ProductPage: React.FC = () => {
  const { categorySlug, productSlug } = useParams<{ categorySlug: string; productSlug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { allProducts, getRelatedProducts, loading } = useProducts();
  const { formatUIPrice, currencySettings } = useCurrency();
  const { user } = useAuth();
  const [selectedProductImage, setSelectedProductImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState('itemDetails');

  // Scroll to top on product change (stable hook order)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [categorySlug, productSlug]);
  const [selectedProductType, setSelectedProductType] = useState<'digital' | 'poster'>('digital');
  const [selectedPosterSize, setSelectedPosterSize] = useState<string>('A4');
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Always start at top when product changes (must be before any early returns)
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [categorySlug, productSlug]);

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

  // Get current price based on selected options
  const getCurrentPrice = (product: any) => {
    if (selectedProductType === 'poster' && product?.posterPricing && product.posterPricing[selectedPosterSize]) {
      // For poster, calculate discounted price if there's a discount
      const originalPrice = product.posterPricing[selectedPosterSize];
      if (product.discountPercentage && product.discountPercentage > 0) {
        return Math.round(originalPrice * (1 - (product.discountPercentage / 100)));
      }
      return originalPrice;
    }
    return product?.price || 0;
  };

  // Get original price for discount calculation
  const getOriginalPrice = (product: any) => {
    if (selectedProductType === 'poster' && product?.posterPricing && product.posterPricing[selectedPosterSize]) {
      // For poster, the posterPricing contains the original prices
      // The discounted price is calculated from this original price
      return product.posterPricing[selectedPosterSize];
    }
    return product?.originalPrice || product?.price || 0;
  };

  // Handle mouse movement for zoom positioning
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };



  // Ensure products are loaded when component mounts
  React.useEffect(() => {

    if (allProducts.length === 0 && !loading) {

    }
  }, [allProducts.length, loading]);

  // Initialize product type and size based on product data
  React.useEffect(() => {
    if (allProducts.length > 0) {
      const product = findProductBySlugs(allProducts, categorySlug || '', productSlug || '');
      if (product) {
        setSelectedProductType(product.productType || 'digital');
        if (product.posterSize && product.posterPricing && product.posterPricing[product.posterSize]) {
          setSelectedPosterSize(product.posterSize);
        } else if (product.posterPricing && Object.keys(product.posterPricing).length > 0) {
          setSelectedPosterSize(Object.keys(product.posterPricing)[0]);
        }
      }
    }
  }, [allProducts, categorySlug, productSlug]);


  // Keyboard navigation support
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        previousImage();
      } else if (event.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);


  // Global right-click prevention and developer tools protection
  React.useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12 key
      if (e.key === 'F12') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
      }
      
      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
      }
    };

    // Prevent right-click on the entire page
    document.addEventListener('contextmenu', handleGlobalContextMenu);
    
    // Prevent keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
    
    // Prevent drag and drop globally
    document.addEventListener('dragstart', (e) => e.preventDefault());
    
    return () => {
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', (e) => e.preventDefault());
    };
  }, []);

  // Find the product using category and product slugs
  const product = findProductBySlugs(allProducts, categorySlug || '', productSlug || '');
  
  // Debug: Log search results

  if (product) {
    // Product is loaded
  } else {
    // Product not found
  }

  // Load reviews for the current product
  React.useEffect(() => {
    const loadReviews = async () => {
      if (product && product.id) {
        setReviewsLoading(true);
        try {
          const productReviews = await ReviewService.getProductReviews(product.id);
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
  }, [product]);

  // Check if product is favorited
  React.useEffect(() => {
    const checkIfFavorited = async () => {
      if (product && product.id && user) {
        try {
          const favorites = await FavoritesService.getUserFavorites();
          const isProductFavorited = favorites.some(fav => fav.product_id === product.id);
          setIsFavorited(isProductFavorited);
        } catch (error) {
          console.error('Error checking favorites:', error);
          setIsFavorited(false);
        }
      } else {
        setIsFavorited(false);
      }
    };

    checkIfFavorited();
  }, [product, user]);

  // Show loading state while products are being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          {/* Beautiful Art-themed Loader */}
          <div className="relative mx-auto mb-6">
            {/* Main Canvas */}
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-2 border-[#FAC6CF] p-3 relative overflow-hidden">
              {/* Animated Paint Brush */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-1 bg-[#F48FB1] rounded-full animate-pulse"></div>
                <div className="w-6 h-1 bg-[#F48FB1] rounded-full mt-1 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-1 bg-[#F48FB1] rounded-full mt-1 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              
              {/* Animated Paint Drops */}
              <div className="absolute bottom-2 left-2">
                <div className="w-3 h-3 bg-[#FAC6CF] rounded-full animate-bounce"></div>
              </div>
              <div className="absolute bottom-3 right-3">
                <div className="w-2 h-2 bg-[#F48FB1] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="w-2.5 h-2.5 bg-[#E91E63] rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
              </div>
              
              {/* Animated Palette */}
              <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                <div className="w-4 h-4 bg-gradient-to-br from-[#FAC6CF] to-[#F48FB1] rounded-full animate-ping"></div>
              </div>
            </div>
            
            {/* Floating Art Elements */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#FAC6CF] rounded-full animate-pulse opacity-75"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#F48FB1] rounded-full animate-pulse opacity-75" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-[#E91E63] rounded-full animate-pulse opacity-75" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-[#FAC6CF] rounded-full animate-pulse opacity-75" style={{ animationDelay: '0.7s' }}></div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-[#F48FB1] to-[#E91E63] bg-clip-text text-transparent">
            Creating Art...
          </h2>
          <p className="text-gray-600 mb-2">Please wait while we prepare your masterpiece</p>
          <p className="text-sm text-[#F48FB1] font-medium">Loading product details</p>
        </div>
      </div>
    );
  }

  // Show product not found only after loading is complete
  if (!product && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <div className="space-y-2 mb-6 text-sm text-gray-600">
            <p>Debug Info:</p>
            <p>Category: {categorySlug || 'undefined'}</p>
            <p>Product: {productSlug || 'undefined'}</p>
            <p>Available Products: {allProducts.length}</p>
            <details className="mt-4">
              <summary className="cursor-pointer text-[#F48FB1]">Show Available Products</summary>
              <div className="mt-2 text-xs text-gray-500 max-h-32 overflow-y-auto">
                {allProducts.length > 0 ? (
                  allProducts.map((p, i) => (
                    <div key={i} className="mb-1">
                      • {p.title} ({(p as any).category || ((p as any).categories && (p as any).categories[0]) || 'General'})
                    </div>
                  ))
                ) : (
                  <span className="text-red-400">No products loaded!</span>
                )}
              </div>
            </details>
          </div>
          <Link to="/" className="text-[#F48FB1] hover:text-[#E91E63] font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get product images for gallery (filter out local blob URLs)
  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600'];
  const productImages = (rawImages as string[]).filter((u) => typeof u === 'string' && /^https?:\/\//i.test(u));
  
  // Debug: Log product images for troubleshooting



  // Reviews are now loaded from database via useEffect above
  
  // Calculate average rating and total reviews
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0;
  const totalReviews = reviews.length;

  // Get related products
  const productCategory = (product as any).category || (product.categories && product.categories[0]) || 'General';
  const relatedProducts = getRelatedProducts(product.id, productCategory, 4);

  const handleAddToCart = () => {
    // Add to cart logic here
    CartManager.addItem(product, quantity, selectedProductType, selectedPosterSize);
    // No notification - silent add to cart
  };

  const handleBuyNow = () => {
    try {
      // Buy now logic - redirect to checkout with this product and selected options
      if (!product || !product.id) {
        console.error('Product not found for Buy Now');
        return;
      }

      const currentPrice = getCurrentPrice(product);

      
      const params = new URLSearchParams({
        product: product.id,
        type: selectedProductType,
        price: currentPrice.toString()
      });
      
      if (selectedProductType === 'poster' && selectedPosterSize) {
        params.append('size', selectedPosterSize);
      }
      
      const checkoutUrl = `/checkout?${params.toString()}`;

      navigate(checkoutUrl);
    } catch (error) {
      console.error('Error in handleBuyNow:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/sign-in';
      return;
    }

    if (!product || !product.id) return;

    setFavoritesLoading(true);
    try {
      if (isFavorited) {
        await FavoritesService.removeFromFavorites(product.id);
        setIsFavorited(false);
      } else {
        await FavoritesService.addToFavorites(product.id);
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
        title: product.title,
        text: `Check out this amazing artwork: ${product.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Prevent right-click on images and product content
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Prevent drag and drop of images
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  



  // Media navigation (images + optional video at the end)
  const previousImage = () => {
    const hasVideo = Boolean((product as any).video_url);
    if (showVideo) {
      setShowVideo(false);
      setSelectedProductImage(productImages.length - 1);
      return;
    }
    if (selectedProductImage === 0) {
      if (hasVideo) {
        setShowVideo(true);
      } else {
        setSelectedProductImage(productImages.length - 1);
      }
    } else {
      setSelectedProductImage((prev) => prev - 1);
    }
  };

  const nextImage = () => {
    const hasVideo = Boolean((product as any).video_url);
    if (showVideo) {
      setShowVideo(false);
      setSelectedProductImage(0);
      return;
    }
    if (selectedProductImage === productImages.length - 1) {
      if (hasVideo) {
        setShowVideo(true);
      } else {
        setSelectedProductImage(0);
      }
    } else {
      setSelectedProductImage((prev) => prev + 1);
    }
  };

  const goToImage = (index: number) => {
    setShowVideo(false);
    setSelectedProductImage(index);
  };



  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50" onContextMenu={handleContextMenu}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
        {/* Product Top Section - Matching Image Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
          
          {/* Left Panel - Thumbnail Gallery */}
          <div className="hidden lg:flex lg:col-span-2 flex-col items-center space-y-2 sm:space-y-3">

            

            
            {/* Thumbnails Container with Hidden Slider - Single Column */}
            <div className="h-[400px] sm:h-[500px] lg:h-[500px] overflow-y-auto scrollbar-hide">
              {productImages.length > 1 ? (
                <div className="flex flex-col space-y-2 sm:space-y-3">
                  {productImages.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 overflow-hidden border-2 transition-all duration-200 ${
                        selectedProductImage === index 
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
                  {(product as any).video_url && (
                    <button
                      type="button"
                      onClick={() => setShowVideo(true)}
                      className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 overflow-hidden border-2 transition-all duration-200 ${
                        showVideo ? 'border-gray-600 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title="Play video"
                    >
                      <div className="relative w-full h-full">
                        <img
                          src={product.main_image || productImages[0]}
                          alt="Video preview"
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"></path>
                          </svg>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 overflow-hidden border-2 border-gray-200">
                    <img 
                      src={productImages[0]} 
                      alt={product.title} 
                      className="w-full h-full object-contain"
                      onContextMenu={handleContextMenu}
                      onDragStart={handleDragStart}
                      draggable={false}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Single Image</p>
                  {(product as any).video_url && (
                    <button
                      type="button"
                      onClick={() => setShowVideo(true)}
                      className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 overflow-hidden border-2 transition-all duration-200 ${
                        showVideo ? 'border-gray-600 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title="Play video"
                    >
                      <div className="relative w-full h-full">
                        <img
                          src={product.main_image || productImages[0]}
                          alt="Video preview"
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"></path>
                          </svg>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
            

          </div>

          {/* Central Panel - Main Media (video replaces image when selected) */}
          <div className="col-span-1 lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[600px]">
              {((product as any).video_url && showVideo) ? (
                <div className="w-full aspect-[6/5] max-w-[600px] overflow-hidden rounded-lg">
                  <video
                    src={(product as any).video_url}
                    controls
                    playsInline
                    preload="metadata"
                    poster={product.main_image || productImages[0]}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="w-full aspect-[6/5] max-w-[600px] overflow-hidden group cursor-zoom-in"
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={productImages[selectedProductImage]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
                    style={{
                      transform: `scale(1)`,
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = `scale(1.5)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = `scale(1)`;
                    }}
                    onContextMenu={handleContextMenu}
                    onDragStart={handleDragStart}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                  />
                </div>
              )}

              {/* Left Arrow - Outside and smaller */}
              {productImages.length > 1 && (
                <button
                  onClick={previousImage}
                  className="absolute -left-10 top-1/4 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md border border-gray-200 flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 z-10"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                </button>
              )}

              {/* Right Arrow - Outside and smaller */}
              {productImages.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute -right-10 top-1/4 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md border border-gray-200 flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 z-10"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              )}


            </div>
                </div>

          {/* Right Panel - Product Information */}
          <div className="col-span-1 lg:col-span-4">
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
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">In 20+ carts</span>
                </div>
              </div>

              {/* Product Title - moved above price */}
              <div className="mt-2">
                <h1 className="text-sm sm:text-base font-semibold text-gray-800 leading-tight text-center capitalize">
                  {product.title}
                </h1>
              </div>

              {/* Price Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  {/* Price on the left */}
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {product.originalPrice && product.discountPercentage && product.discountPercentage > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-baseline space-x-2">
                          <div className="text-lg sm:text-xl font-bold text-green-600">{formatUIPrice(getCurrentPrice(product), 'INR')}</div>
                          <div className="text-xs text-gray-500 line-through">{formatUIPrice(getOriginalPrice(product), 'INR')}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-pink-600 font-medium">
                            {product.discountPercentage ? `${product.discountPercentage}% OFF` : 'Discounted'}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-black font-medium">Limited Time Offer!</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-lg sm:text-xl font-bold text-green-600">{formatUIPrice(getCurrentPrice(product), 'INR')}</span>
                    )}
                  </div>
                  
                  {/* Reviews on the right */}
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-gray-700">{averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>Sale ends on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              {/* Product Category */}
              {product.category && (
                <div className="pb-2 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="px-2 py-1 bg-[#FAC6CF] text-[#E91E63] text-xs font-medium rounded-full">
                      {product.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Product Type Selection */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Type</label>
                    <select
                      value={selectedProductType}
                      onChange={(e) => setSelectedProductType(e.target.value as 'digital' | 'poster')}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white text-sm"
                    >
                      <option value="digital">Digital Download</option>
                      <option value="poster">Physical Poster</option>
                    </select>
                  </div>

                  {/* Poster Size Selection - Right next to Product Type */}
                  {selectedProductType === 'poster' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Poster Size</label>
                      {product.posterPricing && Object.keys(product.posterPricing).length > 0 ? (
                        <select
                          value={selectedPosterSize}
                          onChange={(e) => setSelectedPosterSize(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white text-sm"
                        >
                          {Object.entries(product.posterPricing).map(([size, price]) => {
                            const originalPrice = Number(price);
                            const discountedPrice = product.discountPercentage && product.discountPercentage > 0 
                              ? Math.round(originalPrice * (1 - (product.discountPercentage / 100)))
                              : originalPrice;
                            
                            return (
                              <option key={size} value={size}>
                                {size} - {formatUIPrice(discountedPrice, 'INR')}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <div className="text-xs text-gray-500 p-2 border border-gray-200 rounded-md bg-gray-50">
                          No poster sizes configured
                          <div className="text-xs text-red-500 mt-1">
                            Debug: {JSON.stringify(product.posterPricing)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Quantity Selection - Only show for posters */}
                {selectedProductType === 'poster' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                    <div className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm flex items-center justify-between">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-5 h-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-gray-700">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-5 h-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded flex items-center justify-center transition-colors text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-red-500">
                  Frames are not included
                </p>
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
                  disabled={!product || !product.id}
                  className="w-full bg-[#F48FB1] text-white py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#E91E63] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Product Description */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Description</h3>
                <div className="mb-2">
                  <p className={`text-xs text-gray-600 leading-relaxed ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                    {'description' in product && product.description ? product.description : "Beautiful handcrafted artwork that brings nature's beauty into your home. Perfect for living rooms, bedrooms, or as a thoughtful gift."}
                  </p>
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-xs text-[#F48FB1] hover:text-[#E91E63] font-medium mt-1 transition-colors"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </button>
                </div>
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
                    <div className="space-y-0">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Material:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? 'Premium matte paper' : 'Digital file'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Style:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? 'High-quality print' : 'Digital artwork'}</span>
                      </div>
                      {selectedProductType === 'digital' && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="font-medium text-gray-900">Size:</span>
                          <span className="text-gray-600">High resolution (300 DPI), 3000px X 4500px</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Origin:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? 'Printed in India' : 'Created digitally'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Frame:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? 'No frame included' : 'No frame needed'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="font-medium text-gray-900">Quality:</span>
                        <span className="text-gray-600">Premium grade</span>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: 'delivery',
                label: 'Delivery',
                icon: <Truck className="w-4 h-4" />,
                content: (
                  <div className="space-y-0">
                    <div className="space-y-0">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Delivery Method:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? 'Free Standard Delivery' : 'Instant Digital Download'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Delivery Time:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? '5-7 business days' : 'Immediately after purchase'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Tracking:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? 'Tracking information provided' : 'Not applicable'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Packaging:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? 'Secure packaging guaranteed' : 'Digital files only'}</span>
                      </div>
                      {selectedProductType === 'poster' && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="font-medium text-gray-900">Returns:</span>
                          <span className="text-gray-600">Accepted within 30 days</span>
                        </div>
                      )}
                      {selectedProductType === 'digital' && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="font-medium text-gray-900">File Formats:</span>
                          <span className="text-gray-600">PNG, PDF</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3">
                        <span className="font-medium text-gray-900">Support:</span>
                        <span className="text-gray-600">Customer service available</span>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: 'didYouKnow',
                label: 'Did You Know?',
                icon: <Info className="w-4 h-4" />,
                content: (
                  <div className="space-y-0">
                    <div className="space-y-0">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Eco-Friendly:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? 'Sustainable materials used' : 'Zero environmental impact'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Uniqueness:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? 'One-of-a-kind variations' : 'High-resolution digital file'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="font-medium text-gray-900">Compatibility:</span>
                        <span className="text-gray-600">{selectedProductType === 'poster' ? 'Standard framing sizes' : 'All modern devices'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="font-medium text-gray-900">Quality:</span>
                        <span className="text-gray-600">Premium grade guarantee</span>
                      </div>
                    </div>
                  </div>
                )
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Reviews Section - Using Site Colors - Left Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mb-0 mt-0">
          {/* Left Column - Reviews */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Decorative Header */}
          <div className="bg-gradient-to-r from-[#FAC6CF] to-[#F48FB1] h-1"></div>
          
              <div className="p-1 sm:p-2 lg:p-3">
            {/* Header with Rating and Write Review Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 sm:mb-2 space-y-1 sm:space-y-0">
              <div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#333333]">
                  Customer Reviews
                </h3>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Rating moved slightly to the right */}
                <div className="flex items-center space-x-2 bg-[#F5F5F5] rounded-lg px-2 py-1 border border-[#F5F5F5] shadow-sm">
                  <div className="text-lg sm:text-xl font-bold text-[#F48FB1]">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-[#333333]">out of 5</div>
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
                  <div className="text-xs text-[#333333] font-semibold">
                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </div>
                </div>
                
                <button 
                  onClick={handleWriteReview}
                  className="px-2 py-1 bg-gradient-to-r from-[#FAC6CF] to-[#F48FB1] hover:from-[#F48FB1] hover:to-[#E91E63] text-white rounded-md transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md text-xs"
                >
                  ✨ Write a Review
                </button>
              </div>
            </div>


            {/* Sort Options */}
                <div className="flex items-center justify-end mb-1 sm:mb-2">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-xs font-medium text-[#333333]">Sort by:</span>
                    <select className="text-xs border border-[#F5F5F5] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#F48FB1] focus:border-[#F48FB1] bg-white shadow-sm">
                  <option>Most Recent</option>
                  <option>Suggested</option>
                  <option>Highest Rated</option>
                  <option>Lowest Rated</option>
                </select>
              </div>
            </div>

            {/* Individual Reviews - 2x2 Grid Layout */}
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F48FB1]"></div>
                <span className="ml-3 text-gray-600">Loading reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <MessageCircle className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
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
                            <span className="text-white font-bold text-sm">
                              {review.userName && review.userName.includes('@') 
                                ? review.userName.split('@')[0].charAt(0).toUpperCase()
                                : review.userName ? review.userName.charAt(0).toUpperCase() : '?'
                              }
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-[#333333] text-sm">
                              {review.userName && review.userName.includes('@') 
                                ? review.userName.split('@')[0].charAt(0).toUpperCase() + review.userName.split('@')[0].slice(1)
                                : review.userName || 'Anonymous User'
                              }
                            </p>
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-[#F5F5F5] rounded-full flex items-center justify-center border border-[#FAC6CF]">
                                  <span className="text-[#F48FB1] text-xs font-bold">✓</span>
                                </div>
                                <span className="text-xs text-[#F48FB1] font-bold">Recommends</span>
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
                          <span className="text-xs font-medium text-[#333333] bg-[#F5F5F5] px-2 py-1 rounded-full">
                            {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Review Comment */}
                      <p className="text-[#333333] text-sm leading-relaxed mb-3 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>{review.comment}</p>
                      
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
                                <span className="text-xs text-gray-500">+{review.images.length - 2}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Review Actions */}
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => handleHelpfulVote(review.id)}
                          className="flex items-center space-x-1 text-[#333333] hover:text-[#F48FB1] transition-colors font-medium text-xs"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({helpfulVotes[review.id] || review.helpful || 0})</span>
                        </button>
                        {review.verified && (
                          <span className="px-2 py-1 bg-[#F48FB1] text-white text-xs rounded-full font-bold shadow-sm">
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
                        className="w-8 h-8 rounded-lg border border-[#F5F5F5] text-[#333333] hover:text-[#F48FB1] hover:border-[#F48FB1] transition-all duration-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ←
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-lg transition-all duration-300 font-medium text-sm ${
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
                        className="w-8 h-8 rounded-lg border border-[#F5F5F5] text-[#333333] hover:text-[#F48FB1] hover:border-[#F48FB1] transition-all duration-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Right Column - Review Images and Pictures */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {/* Review Images Gallery */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
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
                      <span className="text-gray-400 text-xs">No images yet</span>
                    </div>
                  ));
                })()}
              </div>
              {reviews.filter((review: Review) => review && review.images && review.images.length > 0).length > 0 && (
                <button className="w-full mt-3 sm:mt-4 py-2 text-[#F48FB1] hover:text-[#E91E63] text-xs sm:text-sm font-medium transition-colors">
                  View all review images →
                </button>
              )}
            </div>

            {/* Customer Photos Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <span className="w-2 h-2 bg-[#FAC6CF] rounded-full mr-2"></span>
                Customer Photos
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {(() => {
                  // Get the 3 latest reviews with images
                  const reviewsWithImages = reviews
                    .filter((review: Review) => review && review.images && review.images.length > 0)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, latest first
                    .slice(0, 3); // Take only first 3
                  
                  if (reviewsWithImages.length > 0) {
                    return reviewsWithImages.map((review: Review, index: number) => {
                      const userName = review.userName && review.userName.includes('@') 
                        ? review.userName.split('@')[0].charAt(0).toUpperCase() + review.userName.split('@')[0].slice(1)
                        : review.userName || 'Anonymous User';
                      
                      return (
                        <div key={review.id} className="flex items-start space-x-2 sm:space-x-3">
                          <img 
                            src={review.images?.[0] || ''} 
                            alt={`Customer photo from ${userName}`}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0 cursor-pointer hover:border-[#F48FB1] transition-colors"
                            onClick={() => review.images && handleImageClick(review.images[0])}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-800">{userName}</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{review.comment}</p>
                          </div>
                        </div>
                      );
                    });
                  }
                  
                  // Fallback: show placeholder if no reviews with images
                  return (
                    <div className="text-center py-4">
                      <div className="text-gray-400 mb-2">
                        <Eye className="w-8 h-8 mx-auto" />
                      </div>
                      <p className="text-gray-600 text-sm">No customer photos yet</p>
                    </div>
                  );
                })()}
              </div>
              <button className="w-full mt-3 sm:mt-4 py-2 text-[#F48FB1] hover:text-[#E91E63] text-xs sm:text-sm font-medium transition-colors">
                See more customer photos →
              </button>
            </div>


          </div>
        </div>

      </div>

      {/* Related Products Section */}
      <div className="py-6 sm:py-8 mt-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Related Products</h2>
              <p className="text-sm text-gray-600">Discover more amazing artwork you might love</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.length > 0 ? relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                to={`/${generateSlug('categories' in relatedProduct ? (relatedProduct.categories && relatedProduct.categories.length > 0 ? relatedProduct.categories[0] : 'general') : ('category' in relatedProduct ? relatedProduct.category : 'general'))}/${generateSlug(relatedProduct.title)}`}
                className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <img 
                    src={relatedProduct.images && relatedProduct.images.length > 0 ? relatedProduct.images[0] : 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600'} 
                    alt={relatedProduct.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!user) {
                          window.location.href = '/sign-in';
                          return;
                        }
                        try {
                          if (relatedProduct.id) {
                            await FavoritesService.addToFavorites(relatedProduct.id);
                          }
                        } catch (error) {
                          console.error('Error adding to favorites:', error);
                        }
                      }}
                      className="w-4 h-4 text-[#F48FB1] hover:text-[#E91E63] cursor-pointer transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-[#F48FB1] transition-colors duration-200 truncate" title={relatedProduct.title}>
                    {relatedProduct.title}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-2 truncate" title={'description' in relatedProduct ? relatedProduct.description : "Beautiful handcrafted artwork that brings nature's beauty into your home."}>
                    {'description' in relatedProduct ? relatedProduct.description : "Beautiful handcrafted artwork that brings nature's beauty into your home."}
                  </p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{formatUIPrice(relatedProduct.price, 'INR')}</span>
                      {'originalPrice' in relatedProduct && 'discountPercentage' in relatedProduct && relatedProduct.originalPrice && relatedProduct.discountPercentage && (
                        <span className="text-xs text-gray-500 line-through">{formatUIPrice(relatedProduct.originalPrice, 'INR')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 mb-3">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(relatedProduct.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({relatedProduct.rating || 0})</span>
                  </div>
                  
                  <div className="w-full bg-[#F48FB1] group-hover:bg-[#E91E63] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span>View Product</span>
                  </div>
                </div>
              </Link>
              )) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No related products found in this category.</p>
                </div>
              )}
            </div>
          
          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <Link 
              to={`/${generateSlug(productCategory)}`}
              className="inline-block bg-white border-2 border-[#F48FB1] text-[#F48FB1] hover:bg-[#F48FB1] hover:text-white font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              View All {productCategory} Products
            </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedReviewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <img
              src={selectedReviewImage}
              alt="Review image"
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-white rounded-xl overflow-hidden shadow-2xl">
            <button
              onClick={closeReviewModal}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#333333] mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">Rating</label>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-[#F5F5F5] hover:text-[#F48FB1] cursor-pointer transition-colors"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">Your Review</label>
                  <textarea
                    className="w-full p-3 border border-[#F5F5F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F48FB1] focus:border-[#F48FB1] resize-none"
                    rows={4}
                    placeholder="Share your experience with this product..."
                  />
                </div>
                <button className="w-full bg-[#F48FB1] hover:bg-[#E91E63] text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
