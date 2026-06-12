'use client'

import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from '@/src/compat/router';
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
  Info,
  Package,
  ShieldCheck
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
import { NavigationVisibilityService } from '../services/navigationVisibilityService';
import ProductPageSkeleton from '../components/ProductPageSkeleton';

interface ProductPageProps {
  initialProduct?: any;
}

const ProductPage: React.FC<ProductPageProps> = ({ initialProduct }) => {
  const { categorySlug, productSlug } = useParams<{ categorySlug: string; productSlug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { allProducts, getRelatedProducts, loading } = useProducts();
  const { formatUIPrice, currencySettings, currentCurrency } = useCurrency();
  const isInternational = currentCurrency !== 'INR';
  const { user } = useAuth();
  const [selectedProductImage, setSelectedProductImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState('itemDetails');

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
  const [transitionLoading, setTransitionLoading] = useState(false);

  // Reset selected product type to digital for international users if it is poster
  React.useEffect(() => {
    if (isInternational && selectedProductType === 'poster') {
      setSelectedProductType('digital');
    }
  }, [isInternational, selectedProductType]);

  // Scroll to top and reset states on product change (must be before any early returns)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setTransitionLoading(true);
    setSelectedProductImage(0);
    setShowVideo(false);
    setQuantity(1);
    setIsFavorited(false);
    setReviews([]);
    
    const timer = setTimeout(() => {
      setTransitionLoading(false);
    }, 400); // 400ms skeleton transition
    
    return () => clearTimeout(timer);
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
    const activeProduct = findProductBySlugs(allProducts, categorySlug || '', productSlug || '') || initialProduct;
    if (activeProduct) {
      if (isInternational) {
        setSelectedProductType('digital');
      } else {
        setSelectedProductType(activeProduct.productType || 'digital');
      }
      if (activeProduct.posterSize && activeProduct.posterPricing && activeProduct.posterPricing[activeProduct.posterSize]) {
        setSelectedPosterSize(activeProduct.posterSize);
      } else if (activeProduct.posterPricing && Object.keys(activeProduct.posterPricing).length > 0) {
        setSelectedPosterSize(Object.keys(activeProduct.posterPricing)[0]);
      }
    }
  }, [allProducts, categorySlug, productSlug, initialProduct, isInternational]);


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
  const product = findProductBySlugs(allProducts, categorySlug || '', productSlug || '') || initialProduct;

  const productCategory = (product as any)?.category || (product?.categories && product.categories[0]) || 'General';
  const productCategoryLower = productCategory.toLowerCase();
  const isFBCategory =
    productCategoryLower.includes('f & b') ||
    productCategoryLower.includes('f&b') ||
    productCategoryLower.includes('food & beverage') ||
    productCategoryLower.includes('food and beverage');
  const isCommissionedCategory =
    productCategoryLower.includes('commission') || productCategoryLower.includes('commissioned');
  const isClothing = (product as any)?.gender === 'Men' || (product as any)?.gender === 'Women' || (product as any)?.gender === 'Unisex' ||
    (product?.categories && product.categories.some((cat: string) => 
      cat.toLowerCase().includes('men') || 
      cat.toLowerCase().includes('women') || 
      cat.toLowerCase().includes('unisex') ||
      cat.toLowerCase().includes('clothing')
    ));
  const isNormalItem = (product?.categories && product.categories.includes('Normal')) || (product as any)?.category === 'Normal';

  // Stable "random" cart count between 5 and 30 per product
  const cartCount = React.useMemo(() => {
    if (!product) return 20;
    const seed = String(product.id || product.title || '');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return 5 + (Math.abs(hash) % 26); // 5..30
  }, [product?.id, product?.title]);
  
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

  // Show loading state while products are being fetched or transitioning
  if ((loading && !initialProduct) || transitionLoading) {
    return <ProductPageSkeleton />;
  }

  // Show product not found only after loading is complete
  if (!product && !loading && !transitionLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Product Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!NavigationVisibilityService.isProductVisible(product)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Product Unavailable</h1>
          <p className="text-sm text-gray-500 mb-6">This product category is currently deactivated by admin.</p>
          <Link to="/" className="inline-block px-4 py-2 border border-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Back to Home
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

  // Get related art products - filter from allProducts directly
  const getRelatedArtProducts = () => {
    if (!product || !allProducts || allProducts.length === 0) return [];
    
    // Filter all products to get art products from same category first, then any art products
    const artProducts = allProducts.filter(p => {
      if (p.id === product.id) return false; // Exclude current product
      
      const pData = p as any;
      
      // Exclude clothing products (have gender field)
      const isClothing = pData.gender === 'Men' || pData.gender === 'Women' || pData.gender === 'Unisex';
      if (isClothing) return false;
      
      // Exclude normal items (have category 'Normal' or in categories array)
      const isNormalItem = pData.categories?.includes('Normal') || pData.category === 'Normal';
      if (isNormalItem) return false;
      
      // Exclude F&B items (have category 'F & B' or 'Food & Beverage')
      const isFBItem = pData.categories?.some((cat: string) => 
        cat.toLowerCase().includes('f & b') || 
        cat.toLowerCase().includes('food & beverage') ||
        cat.toLowerCase().includes('food and beverage')
      ) || pData.category?.toLowerCase().includes('f & b');
      if (isFBItem) return false;
      
      // Include products that are NOT clothing, normal, or F&B
      // Art products typically don't have gender field and are not in Normal/F&B categories
      const productType = pData.productType || pData.product_type;
      const isArtProduct = !productType || productType === 'digital' || productType === 'poster';
      
      // Check status - include if active or status not set (for legacy products)
      const status = pData.status;
      const isActive = status === 'active' || !status;
      
      return isArtProduct && isActive;
    });
    
    // Prioritize products from same category
    const sameCategory = artProducts.filter(p => {
      const pCat = (p as any).category || (p.categories && p.categories[0]);
      return pCat === productCategory;
    });
    
    // If we have same category products, use those, otherwise use any art products
    const related = sameCategory.length > 0 ? sameCategory : artProducts;
    
    return related.slice(0, 4);
  };
  
  const relatedProducts = getRelatedArtProducts();

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
        price: currentPrice.toString(),
        quantity: quantity.toString()
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
    <div className="min-h-screen bg-[#ffffff]" onContextMenu={handleContextMenu}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mb-6 font-sans font-normal overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
          <Link to="/" className="hover:text-teal-800 transition-colors duration-200">Home</Link>
          <span className="text-gray-300 select-none font-sans font-normal">&gt;</span>
          <Link to="/categories" className="hover:text-teal-800 transition-colors duration-200">Categories</Link>
          <span className="text-gray-300 select-none font-sans font-normal">&gt;</span>
          <Link to={`/categories/${categorySlug}`} className="hover:text-teal-800 transition-colors duration-200 capitalize">
            {productCategory.toLowerCase() === 'general' ? (categorySlug ? categorySlug.replace(/-/g, ' ') : 'General') : productCategory}
          </Link>
          <span className="text-gray-300 select-none font-sans font-normal">&gt;</span>
          <span className="text-gray-900 font-medium font-sans font-normal truncate max-w-[200px] sm:max-w-none capitalize">
            {product.title}
          </span>
        </div>

        {/* Product Top Section - Matching Image Layout */}
        <div className="grid grid-cols-[auto_1fr] lg:grid-cols-12 gap-2 sm:gap-4 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
          
          {/* Left Panel - Thumbnail Gallery */}
          <div className="flex col-span-1 lg:col-span-2 flex-col items-center space-y-2 sm:space-y-3">

            

            
            {/* Thumbnails Container with Hidden Slider - Single Column */}
            <div className="h-[300px] sm:h-[400px] lg:h-[500px] overflow-y-auto scrollbar-hide w-16 sm:w-18 lg:w-20">
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
                        className="w-full h-full object-contain transition-transform duration-300 ease-in-out hover:scale-120"
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
                            className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-120"
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
                      alt={`${product.title} — digital art print by Lurevi`} 
                      className="w-full h-full object-contain transition-transform duration-300 ease-in-out hover:scale-120"
                      onContextMenu={handleContextMenu}
                      onDragStart={handleDragStart}
                      draggable={false}
                    />
                  </div>
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
                          className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-120"
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
                <div className="w-full aspect-[6/5] max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] max-w-[600px] overflow-hidden rounded-lg">
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
                  className="w-full aspect-[6/5] max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] max-w-[600px] overflow-hidden group cursor-zoom-in relative"
                >
                  <img
                    src={productImages[selectedProductImage]}
                    alt={`${product.title} — digital art print by Lurevi`}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-125 origin-center"
                    onContextMenu={handleContextMenu}
                    onDragStart={handleDragStart}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                  />
                </div>
              )}

              {/* Left Arrow - Hidden on mobile since thumbnails are visible */}
              {productImages.length > 1 && (
                <button
                  onClick={previousImage}
                  className="hidden lg:flex absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md border border-gray-200 items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 z-10"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                </button>
              )}

              {/* Right Arrow - Hidden on mobile since thumbnails are visible */}
              {productImages.length > 1 && (
                <button
                  onClick={nextImage}
                  className="hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md border border-gray-200 items-center justify-center transition-all duration-200 hover:shadow-lg hover:scale-105 z-10"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              )}


            </div>
                </div>

          {/* Right Panel - Product Information */}
          <div className="col-span-2 lg:col-span-4">
            <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
              {/* Top Actions */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-600 font-sans font-normal">
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
                    <span className={`text-xs font-sans font-normal ${isFavorited ? 'text-gray-600' : ''}`}>
                      {favoritesLoading ? 'Loading...' : (isFavorited ? 'Favorited' : 'Add to favorites')}
                    </span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-600 transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                    <span className="text-xs font-sans font-normal">Share</span>
                  </button>
                  <span className="text-xs text-gray-400 font-sans font-normal">•</span>
                  <span className="text-xs text-gray-500 font-sans font-normal">In {cartCount}+ carts</span>
                </div>
              </div>

              {/* Product Title */}
              <div className="mt-2 mb-4">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight text-left" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {product.title}
                  {!isFBCategory && !isClothing && !isNormalItem && " Art"}
                </h1>
              </div>

              {/* Price Section */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  {/* Price on the left */}
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {product.originalPrice && product.discountPercentage && product.discountPercentage > 0 ? (
                        <div className="space-y-1">
                        <div className="flex items-baseline space-x-2">
                          <div className="text-lg sm:text-xl font-semibold text-gray-900 font-sans font-normal">{formatUIPrice(getCurrentPrice(product), 'INR')}</div>
                          <div className="text-xs text-gray-600 line-through font-sans font-normal">{formatUIPrice(getOriginalPrice(product), 'INR')}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600 font-medium font-sans font-normal">
                            {product.discountPercentage ? `${product.discountPercentage}% OFF` : 'Discounted'}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-600 font-medium font-sans font-normal">Limited Time Offer!</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-lg sm:text-xl font-semibold text-gray-900 font-sans font-normal">{formatUIPrice(getCurrentPrice(product), 'INR')}</span>
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
                      <span className="text-xs font-medium text-gray-700 font-sans font-normal">{averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500 font-sans font-normal">({totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-0.5 font-sans font-normal">
                  <p>Sale ends on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              {/* Product Category */}
              {product.category && (
                <div className="pb-3 mb-4 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-1 bg-gray-200 text-gray-900 text-xs font-medium rounded-full font-sans font-normal">
                      {product.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Product Type & Poster Size - Hide for F&B, Commissioned Art, and International Users */}
              {!isInternational && !isFBCategory && !product.categories?.some((cat: string) => 
                cat.toLowerCase().includes('commission')
              ) && !product.category?.toLowerCase().includes('commission') && (
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2 font-sans font-normal">Product Type</label>
                    <div className="w-full border border-gray-300 rounded-md bg-gray-50 overflow-hidden">
                      <select
                        value={selectedProductType}
                        onChange={(e) => setSelectedProductType(e.target.value as 'digital' | 'poster')}
                        className="w-full px-3 py-1.5 pr-8 border-0 appearance-none bg-transparent focus:outline-none focus:ring-0 text-xs text-gray-700 font-sans font-normal text-left [&>option]:bg-white [&>option]:text-gray-700 [&>option]:text-left"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23718196' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          textAlign: 'left'
                        }}
                      >
                        <option value="digital">Digital Download</option>
                        <option value="poster">Physical Poster</option>
                      </select>
                    </div>
                  </div>

                  {/* Poster Size Selection - Right next to Product Type */}
                  {selectedProductType === 'poster' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2 font-sans font-normal">Poster Size</label>
                      {product.posterPricing && Object.keys(product.posterPricing).length > 0 ? (
                        <div className="w-full border border-gray-300 rounded-md bg-gray-50 overflow-hidden">
                          <select
                            value={selectedPosterSize}
                            onChange={(e) => setSelectedPosterSize(e.target.value)}
                            className="w-full px-3 py-1.5 pr-8 border-0 appearance-none bg-transparent focus:outline-none focus:ring-0 text-xs text-gray-700 font-sans font-normal [&>option]:bg-white [&>option]:text-gray-700"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23718196' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.5em 1.5em'
                            }}
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
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 p-2 border border-gray-200 rounded-md bg-gray-50 font-sans font-normal">
                          No poster sizes configured
                          <div className="text-xs text-red-500 mt-1 font-sans font-normal">
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
                    <label className="block text-xs font-medium text-gray-700 mb-1 font-sans font-normal">Quantity</label>
                    <div className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-gray-50 text-sm flex items-center justify-between">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-5 h-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-gray-700 font-sans font-normal">
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
                
                <p className="text-xs text-red-500 mt-2 mb-2 font-sans font-normal">
                  Frames are not included
                </p>
              </div>
              )}

              {/* Quantity - show for F&B products (same height as Add to cart button) */}
              {isFBCategory && (
                <div className="mb-4 flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700 font-sans font-normal whitespace-nowrap">Quantity</label>
                  <div className="inline-flex items-center gap-1 px-2 h-9 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm font-sans font-normal">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="min-w-[1.25rem] text-center font-medium text-gray-700">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg font-sans font-normal"
                >
                  Add to cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product || !product.id}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans font-normal"
                >
                  Buy Now
                </button>
              </div>

              {/* Product Description */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 font-sans font-normal">Description</h3>
                <div className="mb-3">
                  <p className={`text-xs text-gray-600 leading-relaxed font-sans font-normal ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                    {'description' in product && product.description ? product.description : "Beautiful handcrafted artwork that brings nature's beauty into your home. Perfect for living rooms, bedrooms, or as a thoughtful gift."}
                  </p>
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-xs text-gray-600 hover:text-gray-700 font-medium mt-1 transition-colors font-sans font-normal"
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
            tabs={isFBCategory ? [
              {
                id: 'itemDetails',
                label: 'Item Details',
                icon: <FileText className="w-4 h-4" />,
                content: (
                  <div className="space-y-0">
                    {product.itemDetails?.material && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Brand:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{product.itemDetails.material}</span>
                      </div>
                    )}
                    {product.itemDetails?.size && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Weight / Size:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{product.itemDetails.size}</span>
                      </div>
                    )}
                    {product.itemDetails?.style && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Category:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{product.itemDetails.style}</span>
                      </div>
                    )}
                    {product.itemDetails?.origin && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Origin:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{product.itemDetails.origin}</span>
                      </div>
                    )}
                    {(product.itemDetails as any)?.ingredients && (
                      <div className="flex flex-col py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal mb-1">Ingredients:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{(product.itemDetails as any).ingredients}</span>
                      </div>
                    )}
                    {(product.itemDetails as any)?.expiryDate && (
                      <div className="flex justify-between items-center py-1.5">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Best before:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{(product.itemDetails as any).expiryDate}</span>
                      </div>
                    )}
                    {!product.itemDetails?.material && !product.itemDetails?.size && !product.itemDetails?.origin && !(product.itemDetails as any)?.ingredients && (
                      <p className="text-gray-500 text-sm font-sans font-normal py-1.5">No item details available.</p>
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
                    {product.delivery?.standardDelivery && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Delivery:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{product.delivery.standardDelivery}</span>
                      </div>
                    )}
                    {product.delivery?.additionalInfo && (
                      <div className="flex flex-col py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal mb-1">Storage:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{product.delivery.additionalInfo}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                      <span className="font-medium text-gray-900 text-sm font-sans font-normal">Returns / Refunds:</span>
                      <span className="text-gray-600 text-sm font-sans font-normal">Not accepted for F&B orders</span>
                    </div>
                    {!product.delivery?.standardDelivery && !product.delivery?.additionalInfo && (
                      <p className="text-gray-500 text-sm font-sans font-normal py-1.5">Standard shipping applies.</p>
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
                    {product.didYouKnow?.uniqueFeatures && (
                      <div className="flex flex-col py-1.5">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal mb-1">Nutritional / Info:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal whitespace-pre-wrap">{product.didYouKnow.uniqueFeatures}</span>
                      </div>
                    )}
                    {!product.didYouKnow?.uniqueFeatures && (
                      <p className="text-gray-500 text-sm font-sans font-normal py-1.5">No additional info.</p>
                    )}
                  </div>
                )
              }
            ] : [
              {
                id: 'itemDetails',
                label: 'Item Details',
                icon: <FileText className="w-4 h-4" />,
                content: (
                  <div className="space-y-0">
                    <div className="space-y-0">
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Material:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? 'Premium matte paper' : 'Digital file'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Style:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? 'High-quality print' : 'Digital artwork'}</span>
                      </div>
                      {selectedProductType === 'digital' && (
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Size:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">High resolution (300 DPI), 3000px X 4500px</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Origin:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? 'Printed in India' : 'Created digitally'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Frame:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? 'No frame included' : 'No frame needed'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Quality:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">Premium grade</span>
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
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Delivery Method:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? 'Free Standard Delivery' : 'Instant Digital Download'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Delivery Time:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? '5-7 business days' : 'Immediately after purchase'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Tracking:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? 'Tracking information provided' : 'Not applicable'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Packaging:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? 'Secure packaging guaranteed' : 'Digital files only'}</span>
                      </div>
                      {selectedProductType === 'poster' && (
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">Returns / Refunds:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">
                            {(isFBCategory || isCommissionedCategory)
                              ? 'Not accepted for F&B and commissioned art orders'
                              : 'Accepted within 30 days'}
                          </span>
                        </div>
                      )}
                      {selectedProductType === 'digital' && (
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="font-medium text-gray-900 text-sm font-sans font-normal">File Formats:</span>
                          <span className="text-gray-600 text-sm font-sans font-normal">PNG, PDF</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-1.5">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Support:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">Customer service available</span>
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
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Eco-Friendly:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? 'Sustainable materials used' : 'Zero environmental impact'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Uniqueness:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? 'One-of-a-kind variations' : 'High-resolution digital file'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Compatibility:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">{selectedProductType === 'poster' ? 'Standard framing sizes' : 'All modern devices'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="font-medium text-gray-900 text-sm font-sans font-normal">Quality:</span>
                        <span className="text-gray-600 text-sm font-sans font-normal">Premium grade guarantee</span>
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

        {/* On-Page Content & Spec Table for SEO */}
        {!isFBCategory && !isClothing && !isNormalItem && (
          <div className="w-full px-3 sm:px-4 lg:px-6 mb-8 mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 font-sans">Artwork Details & Print Specifications</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Description Block */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 font-sans">About this Print</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-sans font-normal">
                    This premium wall art print showcases {product.title} in exquisite detail, featuring a vibrant color palette designed to elevate the mood of any room. Perfectly suited for living rooms, modern bedrooms, hallways, or home offices, this artwork seamlessly blends contemporary design aesthetics with classic artistic elements. Every piece is crafted to bring a sophisticated, creative atmosphere to your living spaces, serving as a captivating focal point for family and guests alike.
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed font-sans font-normal mt-3">
                    {isInternational 
                      ? "Available as an instant high-resolution digital download for self-printing. Please note that physical poster prints are only shipped within India."
                      : "Available as either an instant high-resolution digital download for self-printing or as a museum-quality physical poster delivered directly to your doorstep."}
                  </p>
                </div>

                {/* Spec Table */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 font-sans">Specifications</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 text-xs font-semibold text-gray-900 bg-gray-50 w-1/3">Sizes Available</td>
                          <td className="px-4 py-2 text-xs text-gray-600">A4, A3, A2, A1, and Custom Dimensions</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-xs font-semibold text-gray-900 bg-gray-50">Print Materials</td>
                          <td className="px-4 py-2 text-xs text-gray-600">200 GSM Premium Heavy-weight Matte Paper / Premium Canvas</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-xs font-semibold text-gray-900 bg-gray-50">Print Process</td>
                          <td className="px-4 py-2 text-xs text-gray-600">High-definition Giclée printing with Archival Inks</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-xs font-semibold text-gray-900 bg-gray-50">Digital File Quality</td>
                          <td className="px-4 py-2 text-xs text-gray-600">300 DPI High-Resolution JPEG / PDF files</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-xs font-semibold text-gray-900 bg-gray-50">Shipping & Delivery</td>
                          <td className="px-4 py-2 text-xs text-gray-600">Free shipping across India. Dispatched in 24-48 hours. Delivered in 3-5 business days.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Expert & Curation Panel */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 font-sans">Curator Note & Quality Verification</h4>
                <div className="flex items-start space-x-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-900">Arpit</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-medium">Head Curator</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-medium font-sans">Verified: June 2026</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-normal font-sans font-normal">
                      "Every piece in this collection has been technically audited for color profile accuracy, resolution limits (minimum 300 DPI), and aesthetic harmony. We certify this print for high-quality Giclée printing."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section - Using Site Colors - Left Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mb-0 mt-0">
          {/* Left Column - Reviews */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-2">
            {/* Header with Rating and Write Review Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-3 border-b border-gray-200 space-y-1 sm:space-y-0">
              <div>
                    <h3 className="text-sm font-semibold text-[#333333] font-sans font-normal">
                  Customer Reviews
                </h3>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Rating moved slightly to the right */}
                <div className="flex items-center space-x-1.5">
                  <div className="text-sm font-semibold text-black font-sans font-normal">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-[#333333] font-sans font-normal">out of 5</div>
                  <div className="flex items-center space-x-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-2 h-2 ${
                          i < Math.floor(averageRating) ? 'text-black fill-current drop-shadow-sm' : 'text-[#F5F5F5]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-[#333333] font-semibold font-sans font-normal">
                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-[#333333] font-sans font-normal">Sort by:</span>
                  <select className="appearance-none text-xs border border-[#F5F5F5] rounded-lg px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-gray-50 shadow-sm font-sans font-normal" style={{ backgroundImage: 'none', paddingRight: '0.375rem' }}>
                    <option>Most Recent</option>
                    <option>Suggested</option>
                    <option>Highest Rated</option>
                    <option>Lowest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Individual Reviews - 2x2 Grid Layout */}
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
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
              <div className="space-y-2">
                {/* 2x2 Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentReviews.filter((review: Review) => review && review.userName && review.comment).map((review: Review, index: number) => (
                    <div key={review.id} className={`bg-white rounded-lg p-2 border border-[#F5F5F5] shadow-sm hover:shadow-md transition-all duration-300 ${
                      index % 2 === 0 ? 'hover:border-gray-700' : 'hover:border-black'
                    }`}>
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                            index % 2 === 0 ? 'bg-black' : 'bg-gray-800'
                          }`}>
                            <span className="text-white font-semibold text-xs font-sans font-normal">
                              {review.userName && review.userName.includes('@') 
                                ? review.userName.split('@')[0].charAt(0).toUpperCase()
                                : review.userName ? review.userName.charAt(0).toUpperCase() : '?'
                              }
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-[#333333] text-xs font-sans font-normal">
                              {review.userName && review.userName.includes('@') 
                                ? review.userName.split('@')[0].charAt(0).toUpperCase() + review.userName.split('@')[0].slice(1)
                                : review.userName || 'Anonymous User'
                              }
                            </p>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <div className="flex items-center space-x-0.5">
                                <div className="w-2.5 h-2.5 bg-[#F5F5F5] rounded-full flex items-center justify-center border border-gray-700">
                                  <span className="text-black text-xs font-semibold font-sans font-normal">✓</span>
                                </div>
                                <span className="text-xs text-black font-semibold font-sans font-normal">Recommends</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-0.5">
                          <div className="flex items-center space-x-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-2 h-2 ${
                                  i < review.rating ? 'text-black fill-current drop-shadow-sm' : 'text-[#F5F5F5]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-[#333333] bg-[#F5F5F5] px-1.5 py-0.5 rounded-full font-sans font-normal">
                            {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Review Comment */}
                      <p className="text-[#333333] text-xs leading-relaxed mb-2 overflow-hidden font-sans font-normal" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>{review.comment}</p>
                      
                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="mb-2">
                          <div className="flex gap-1.5">
                            {review.images.slice(0, 2).map((image, imgIndex) => (
                              <div 
                                key={imgIndex} 
                                className="relative group cursor-pointer flex-shrink-0"
                                onClick={() => handleImageClick(image)}
                              >
                                <img
                                  src={image}
                                  alt={`Review image ${imgIndex + 1}`}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200 hover:border-black transition-all duration-200"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Eye className="w-2.5 h-2.5 text-white" />
                                  </div>
                                </div>
                              </div>
                            ))}
                            {review.images.length > 2 && (
                              <div 
                                className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
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
                          className="flex items-center space-x-1 text-[#333333] hover:text-black transition-colors font-medium text-xs font-sans font-normal"
                        >
                          <ThumbsUp className="w-2.5 h-2.5" />
                          <span>Helpful ({helpfulVotes[review.id] || review.helpful || 0})</span>
                        </button>
                        {review.verified && (
                          <span className="px-1.5 py-0.5 bg-black text-white text-xs rounded-full font-semibold shadow-sm font-sans font-normal">
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
                        className="w-8 h-8 rounded-lg border border-[#F5F5F5] text-[#333333] hover:text-black hover:border-black transition-all duration-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed font-sans font-normal"
                      >
                        ←
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-lg transition-all duration-300 font-medium text-sm font-sans font-normal ${
                            page === currentPage 
                              ? 'bg-black text-white shadow-lg' 
                              : 'border border-[#F5F5F5] text-[#333333] hover:text-black hover:border-black hover:shadow-md'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 rounded-lg border border-[#F5F5F5] text-[#333333] hover:text-black hover:border-black transition-all duration-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed font-sans font-normal"
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
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-2">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center font-sans font-normal">
                <span className="w-1.5 h-1.5 bg-black rounded-full mr-1.5"></span>
                Review Images
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
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
                          className="w-full h-12 object-cover rounded-lg border border-gray-200 hover:border-black transition-all duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Eye className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                      </div>
                    ));
                  }
                  
                  // If no images, show 3 placeholders
                  return Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className="w-full h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs font-sans font-normal">No images yet</span>
                    </div>
                  ));
                })()}
              </div>
              {reviews.filter((review: Review) => review && review.images && review.images.length > 0).length > 0 && (
                <button className="w-full mt-2 py-1 text-black hover:text-gray-700 text-xs font-medium transition-colors font-sans font-normal">
                  View all review images →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {product && relatedProducts && relatedProducts.length > 0 && (
        <div className="py-12 mt-8 bg-gray-50/50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Related Artworks</h2>
              <p className="text-sm text-gray-500 mt-2 font-sans">Handpicked pieces you might also appreciate</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/${generateSlug('categories' in relatedProduct ? (relatedProduct.categories && relatedProduct.categories.length > 0 ? relatedProduct.categories[0] : 'general') : ('category' in relatedProduct ? relatedProduct.category : 'general'))}/${generateSlug(relatedProduct.title)}`}
                  className="block bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 group relative flex flex-col h-full rounded-none overflow-hidden hover:shadow-lg"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden aspect-[4/5] bg-gray-50 flex items-center justify-center">
                    <img 
                      src={relatedProduct.images && relatedProduct.images.length > 0 ? relatedProduct.images[0] : 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600'} 
                      alt={relatedProduct.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Hover Favorite Button Overlay */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm z-10">
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
                        className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      {/* Category Label */}
                      <span className="text-[10px] font-semibold tracking-wider text-teal-800 uppercase block mb-1">
                        {('categories' in relatedProduct && relatedProduct.categories && relatedProduct.categories[0]) || relatedProduct.category || 'Artwork'}
                      </span>
                      {/* Product Title */}
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-teal-800 transition-colors duration-200 line-clamp-1 font-sans capitalize mb-1" title={relatedProduct.title}>
                        {relatedProduct.title}
                      </h3>
                      
                      {/* Price Section */}
                      <div className="flex items-baseline space-x-2 mb-2 mt-1">
                        <span className="text-sm font-bold text-gray-900 font-sans">{formatUIPrice(relatedProduct.price, 'INR')}</span>
                        {'originalPrice' in relatedProduct && 'discountPercentage' in relatedProduct && relatedProduct.originalPrice && relatedProduct.discountPercentage && (
                          <>
                            <span className="text-xs text-gray-400 line-through font-sans">{formatUIPrice(relatedProduct.originalPrice, 'INR')}</span>
                            <span className="text-xs font-semibold text-green-700 font-sans">{relatedProduct.discountPercentage}% OFF</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      {/* Rating (Compact) */}
                      {relatedProduct.rating && (
                        <div className="flex items-center space-x-1 mb-3">
                          <div className="flex items-center space-x-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-2.5 h-2.5 ${
                                  i < Math.floor(relatedProduct.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-500">({relatedProduct.rating})</span>
                        </div>
                      )}
                      
                      {/* Call To Action */}
                      <div className="w-full mt-2 py-2 bg-gray-900 group-hover:bg-teal-800 text-white text-xs font-semibold transition-colors duration-300 flex items-center justify-center space-x-1">
                        <span>Explore Artwork</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link 
                to={`/${generateSlug(productCategory)}`}
                className="inline-block bg-white border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold py-3 px-8 transition-all duration-300 text-xs tracking-wider uppercase"
              >
                View All {productCategory} Artworks
              </Link>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default ProductPage;




