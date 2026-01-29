import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Ruler, Star, MessageCircle, ThumbsUp, Eye } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { CartManager } from '../services/orderService';
import ClothingProductPageSkeleton from '../components/ClothingProductPageSkeleton';
import OpenGraphTags from '../components/OpenGraphTags';
import { MetaPixelService } from '../services/metaPixelService';
import OptimizedImage from '../components/OptimizedImage';
import { ReviewService } from '../services/reviewService';
import { Review } from '../types';

const ClothingProductPage: React.FC = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const { allProducts, loading } = useProducts();
  const { formatUIPrice } = useCurrency();
  const { user } = useAuth();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [hasGiftCard, setHasGiftCard] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Find the product by slug (clothing products) and explicitly exclude F&B
  const product = allProducts.find(p => {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (slug !== productSlug) return false;

    const categories = ((p as any).categories || []).map((c: string) => c.toLowerCase());
    const tags = ((p as any).tags || []).map((t: string) => t.toLowerCase());
    const combined = [...categories, ...tags].join(' ');

    // Exclude any F&B-style products from clothing page
    const isFB = combined.includes('food & beverage') ||
                 combined.includes('f&b') ||
                 combined.includes('f & b') ||
                 combined.includes('dry fruit') ||
                 combined.includes('dried fruit') ||
                 combined.includes('spice');
    if (isFB) return false;
    
    // Check both gender (new field) and categories (for backward compatibility)
    const productData = p as any;
    const hasGender = productData.gender === 'Men' || productData.gender === 'Women' || productData.gender === 'Unisex';
    const hasClothingCategory = productData.categories?.some((cat: string) => 
      cat.toLowerCase().includes('men') || 
      cat.toLowerCase().includes('women') ||
      cat.toLowerCase().includes('unisex') ||
      cat.toLowerCase().includes('clothing')
    );
    
    return hasGender || hasClothingCategory;
  }) as any;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [productSlug]);

  // Product data loaded and available
  useEffect(() => {
    if (product) {
      // Track ViewContent event for Meta Pixel
      MetaPixelService.trackViewContent({
        content_ids: [product.id],
        content_name: product.title,
        content_type: 'product',
        value: product.price,
        currency: 'INR'
      });
    }
  }, [product]);

  // Load reviews for the current product
  useEffect(() => {
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

  // Get related products - match by gender or clothing category
  const getRelatedClothingProducts = () => {
    if (!product) return [];
    
    const productGender = (product as any)?.gender;
    
    // Get all clothing products (those with gender field or clothing in categories)
    const clothingProducts = allProducts.filter(p => {
      const pData = p as any;
      const hasGender = pData.gender === 'Men' || pData.gender === 'Women' || pData.gender === 'Unisex';
      const hasClothingCategory = pData.categories?.some((cat: string) => 
        cat.toLowerCase().includes('men') || 
        cat.toLowerCase().includes('women') || 
        cat.toLowerCase().includes('unisex') ||
        cat.toLowerCase().includes('clothing')
      );
      const pStatus = (p as any).status;
      return (hasGender || hasClothingCategory) && p.id !== product.id && (pStatus === 'active' || !pStatus);
    });
    
    // If product has gender, prioritize same gender, otherwise return any clothing
    if (productGender) {
      const sameGender = clothingProducts.filter(p => (p as any).gender === productGender);
      return sameGender.length > 0 ? sameGender.slice(0, 4) : clothingProducts.slice(0, 4);
    }
    
    return clothingProducts.slice(0, 4);
  };
  
  const relatedProducts = getRelatedClothingProducts();
  
  // Debug: Log related products (remove in production)
  useEffect(() => {
    if (product) {
      console.log('Product:', product.title);
      console.log('Related products found:', relatedProducts.length);
      console.log('Related products:', relatedProducts.map(p => p.title));
    }
  }, [product, relatedProducts]);

  const handleAddToCart = async () => {
    // Validate size selection
    if (!selectedSize) {
      alert('Please select a size before adding to cart.');
      return;
    }

    // Validate color selection if colors are available
    if (availableColors.length > 0 && !selectedColor) {
      alert('Please select a color before adding to cart.');
      return;
    }

    if (!user) {
      navigate('/sign-in');
      return;
    }

    if (!product) return;

    try {
      // Include both size and color in the cart item
      const itemOptions = {
        size: selectedSize,
        ...(selectedColor && { color: selectedColor })
      };
      
      // Track AddToCart event for Meta Pixel
      MetaPixelService.trackAddToCart({
        content_ids: [product.id],
        content_name: product.title,
        content_type: 'product',
        value: product.price * quantity,
        currency: 'INR'
      });
      
      // Adding clothing item to cart
      CartManager.addItem(product as any, quantity, 'clothing', undefined, itemOptions);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleBuyNow = async () => {
    // Validate size selection
    if (!selectedSize) {
      alert('Please select a size before buying now.');
      return;
    }

    // Validate color selection if colors are available
    if (availableColors.length > 0 && !selectedColor) {
      alert('Please select a color before buying now.');
      return;
    }

    if (!user) {
      navigate('/sign-in');
      return;
    }

    await handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return <ClothingProductPageSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans font-normal">Product not found</h2>
          <Link to="/clothes" className="text-sm underline font-sans font-normal" style={{ color: '#ff6e00' }}>
            Back to Clothing
          </Link>
        </div>
      </div>
    );
  }

  // Prepare Open Graph data
  const productUrl = `/clothes/${productSlug}`;
  const productImage = product.main_image || product.images?.[0] || '';
  const productAvailability = (product.quantity || 0) > 0 ? 'in stock' : 'out of stock';

  // Extract available sizes from product tags (remove duplicates and sort)
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const availableSizes = [...new Set(
    product?.tags?.filter((tag: string) => 
      sizeOrder.includes(tag)
    ) || []
  )] as string[];
  availableSizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

      // Extract available colors from product tags (remove duplicates)
      const availableColors = [...new Set(
        product?.tags?.filter((tag: string) => 
          ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Grey', 'Navy', 'Brown', 'Pink', 'Violet', 'Beige', 'Yellow', 'Orange', 'Mauve', 'Slate Blue', 'Olive Green', 'Ivory Cream'].includes(tag)
        ) || []
      )];

  // Color hex map
  const colorHexMap: Record<string, string> = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Blue': '#3B82F6',
    'Red': '#EF4444',
    'Green': '#10B981',
    'Gray': '#6B7280',
    'Grey': '#6B7280',
    'Navy': '#1E3A8A',
    'Brown': '#92400E',
    'Pink': '#EC4899',
    'Violet': '#8B5CF6',
    'Beige': '#F5F5DC',
    'Yellow': '#FBBF24',
    'Orange': '#ff6e00',
    'Mauve': '#E0B0FF',
    'Slate Blue': '#6A5ACD',
    'Olive Green': '#808000',
    'Ivory Cream': '#FFF8DC'
  };

  return (
    <>
      {/* Open Graph Tags for Social Media Sharing */}
      <OpenGraphTags
        title={product.title}
        description={product.description || product.details || `Shop ${product.title} at Lurevi`}
        image={productImage}
        url={productUrl}
        type="product"
        price={product.price}
        currency="INR"
        availability={productAvailability}
        brand={product.brand || 'Lurevi'}
        condition="new"
      />
      
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Image Section - Shows first on mobile */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          <div className="order-1 lg:order-2">
            {/* Main Image with Left Thumbnails Layout */}
            <div className="flex gap-4 justify-end">
              {/* Left Side Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="w-16 md:w-20 flex flex-col gap-2 overflow-y-auto max-h-[450px] scrollbar-hide">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-[3/4] bg-gray-100 rounded overflow-hidden transition-all duration-200 ${
                        selectedImage === index 
                          ? 'opacity-100' 
                          : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      <OptimizedImage
                        src={image}
                        alt={`${product.title} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={80}
                        priority={index < 3}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1 max-w-md">
                <div 
                  className="relative aspect-[3/4] max-h-[450px] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setShowFullImage(true)}
                  key={`main-image-${selectedImage}`}
                >
                  <OptimizedImage
                    key={selectedImage}
                    src={product.images && product.images.length > 0 ? product.images[selectedImage] : product.main_image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    width={600}
                    priority={true}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-2 shadow-lg">
                    <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                  {/* Image number badge */}
                  {product.images && product.images.length > 1 && (
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium font-sans font-normal">
                      {selectedImage + 1} / {product.images.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Title and Price - Shows second on mobile, left side on desktop */}
          <div className="order-2 lg:order-1 mt-6 lg:mt-0 space-y-6 lg:space-y-8">
            <div>
              <h1 className="text-xl font-semibold uppercase tracking-tight mb-2 font-sans font-normal">
                {product.title}
              </h1>
              
              {/* Product Info Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Gender Badge */}
                {product.gender && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide border border-gray-300 rounded font-sans font-normal">
                    {product.gender}
                  </span>
                )}
                
                {/* Clothing Type */}
                {product.clothingType && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-700 rounded font-sans font-normal">
                    {product.clothingType}
                  </span>
                )}
                
                {/* Material */}
                {product.material && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-blue-50 text-blue-700 rounded font-sans font-normal">
                    {product.material}
                  </span>
                )}
                
                {/* Brand */}
                {product.brand && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded font-sans font-normal" style={{ backgroundColor: '#F5F5DC', color: '#ff6e00' }}>
                    {product.brand}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {product.originalPrice && product.originalPrice > product.price ? (
                  <>
                    <p className="text-lg text-gray-500 line-through font-sans font-normal">
                      {formatUIPrice(product.originalPrice)}
                    </p>
                    <p className="text-xl font-semibold font-sans font-normal" style={{ color: '#ff6e00' }}>
                      {formatUIPrice(product.price)}
                    </p>
                    {product.discountPercentage && (
                      <span className="px-2 py-1 text-sm font-semibold text-white rounded font-sans font-normal" style={{ backgroundColor: '#ff6e00' }}>
                        {product.discountPercentage}% OFF
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-xl font-semibold font-sans font-normal">
                    {formatUIPrice(product.price)}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              {product.trackInventory && (
                <div className="mt-3">
                  {product.stockQuantity === 0 ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-red-700 font-sans font-normal">Out of Stock</span>
                    </div>
                  ) : product.stockQuantity && product.stockQuantity <= (product.lowStockThreshold || 10) ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                      <span className="text-sm font-semibold text-orange-700 font-sans font-normal">Only {product.stockQuantity} left in stock!</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-green-700 font-sans font-normal">In Stock</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Color, Size and Action Buttons - Shows third on mobile, in left column on desktop */}
            <div className="space-y-3">

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide block mb-2 font-sans font-normal">
                  COLOR: {selectedColor || 'Select a color'}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {availableColors.map((color: any) => {
                    const colorHex = colorHexMap[color] || '#000';
                    const isWhite = colorHex.toLowerCase() === '#ffffff' || 
                                   colorHex.toLowerCase() === '#fff' || 
                                   colorHex.toLowerCase() === 'white' ||
                                   colorHex.toLowerCase() === 'rgb(255, 255, 255)';
                    
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-all ${
                          selectedColor === color ? 'opacity-100 scale-110' : 'opacity-60 hover:opacity-100'
                        } ${isWhite ? 'border border-gray-300' : ''}`}
                        style={{
                          backgroundColor: colorHex
                        }}
                        title={color}
                        aria-label={color}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide font-sans font-normal">
                    SIZE: {selectedSize || 'Select a size'}
                  </span>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1 hover:underline transition-colors font-sans font-normal"
                    style={{ color: '#ff6e00' }}
                  >
                    <Ruler className="w-3 h-3" />
                    SIZE CHART
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {availableSizes.map((size: any) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-1.5 text-xs font-medium transition-all rounded font-sans font-normal ${
                        selectedSize === size
                          ? 'text-white scale-105'
                          : 'text-gray-900 bg-gray-100 hover:bg-gray-200'
                      }`}
                      style={
                        selectedSize === size
                          ? { backgroundColor: '#ff6e00' }
                          : {}
                      }
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide font-sans font-normal">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-900 font-semibold transition-all font-sans font-normal"
                  >
                    −
                  </button>
                  <span className="text-base font-semibold text-gray-900 min-w-[2rem] text-center font-sans font-normal">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold transition-all font-sans font-normal"
                    style={{ backgroundColor: '#ff6e00' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e56300';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff6e00';
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.trackInventory && product.stockQuantity === 0}
                className={`flex-1 py-2.5 px-3 font-medium text-xs uppercase tracking-wide transition-all rounded font-sans font-normal ${
                  product.trackInventory && product.stockQuantity === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {product.trackInventory && product.stockQuantity === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.trackInventory && product.stockQuantity === 0}
                className="flex-1 py-2.5 px-3 text-white font-medium text-xs uppercase tracking-wide transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed font-sans font-normal"
                style={{ backgroundColor: product.trackInventory && product.stockQuantity === 0 ? '#ccc' : '#ff6e00' }}
                onMouseEnter={(e) => {
                  if (!(product.trackInventory && product.stockQuantity === 0)) {
                    e.currentTarget.style.backgroundColor = '#e56300';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(product.trackInventory && product.stockQuantity === 0)) {
                    e.currentTarget.style.backgroundColor = '#ff6e00';
                  }
                }}
              >
                {product.trackInventory && product.stockQuantity === 0 ? 'OUT OF STOCK' : 'BUY NOW'}
              </button>
            </div>

            {/* Validation Messages */}
            {(!selectedSize || (availableColors.length > 0 && !selectedColor)) && (
              <div className="mt-2 text-xs text-red-600 font-sans font-normal">
                {!selectedSize && 'Please select a size. '}
                {availableColors.length > 0 && !selectedColor && 'Please select a color.'}
              </div>
            )}

            {/* Extra Oversized Sizing Note */}
            {product.clothingType && product.clothingType.toLowerCase().includes('extra oversized') && (
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                <p className="text-xs font-medium font-sans font-normal" style={{ color: '#ea580c' }}>
                  <span className="font-semibold">Note:</span> If you usually wear M size, then go for S size. Do check size chart.
                </p>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Description Sections - Shows after all content on mobile and desktop */}
        <div className="space-y-8 mt-8">
          {/* Description */}
          {product.description && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 font-sans font-normal">DESCRIPTION</h2>
              <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line font-sans font-normal">
                {product.description}
              </div>
            </div>
          )}

          {/* Details */}
          {product.details && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 font-sans font-normal">DETAILS</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line font-sans font-normal">
                {product.details}
              </div>
            </div>
          )}

          {/* Wash Care */}
          {product.washCare && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 font-sans font-normal">WASH CARE</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line font-sans font-normal">
                {product.washCare}
              </div>
            </div>
          )}

          {/* Shipping */}
          {product.shipping && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 font-sans font-normal">SHIPPING</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line font-sans font-normal">
                {product.shipping}
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        {product && (
          <div className="mt-8 sm:mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Column - Reviews */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {/* Decorative Header */}
                  <div className="bg-teal-800 h-1"></div>
                  
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
                          <div className="text-lg sm:text-xl font-semibold text-teal-800 font-sans font-normal">
                            {averageRating.toFixed(1)}
                          </div>
                          <div className="text-xs text-[#333333] font-sans font-normal">out of 5</div>
                          <div className="flex items-center space-x-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-2 h-2 sm:w-3 sm:h-3 ${
                                  i < Math.floor(averageRating) ? 'text-teal-800 fill-current drop-shadow-sm' : 'text-[#F5F5F5]'
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
                          className="px-2 py-1 bg-teal-800 hover:bg-teal-700 text-white rounded-md transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md text-xs font-sans font-normal"
                        >
                          ✨ Write a Review
                        </button>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center justify-end mb-1 sm:mb-2">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className="text-xs font-medium text-[#333333] font-sans font-normal">Sort by:</span>
                        <select className="text-sm border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white shadow-sm font-sans font-normal text-black [&>option]:bg-white [&>option]:text-black [&>option:hover]:bg-gray-100 [&>option:hover]:text-black [&>option:checked]:bg-gray-100 [&>option:checked]:text-black">
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
                            <div key={review.id} className={`bg-white rounded-xl p-4 border border-[#F5F5F5] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:border-teal-800`}>
                              {/* Review Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-teal-800">
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
                                        <div className="w-3 h-3 bg-[#F5F5F5] rounded-full flex items-center justify-center border border-teal-800">
                                          <span className="text-teal-800 text-xs font-semibold font-sans font-normal">✓</span>
                                        </div>
                                        <span className="text-xs text-teal-800 font-semibold font-sans font-normal">Recommends</span>
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
                                          i < review.rating ? 'text-teal-800 fill-current drop-shadow-sm' : 'text-[#F5F5F5]'
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

      {/* Size Chart Modal */}
      {showSizeChart && (() => {
        const clothingType = product.clothingType || 'Oversized Hoodies';
        
        // Size charts for different clothing types
        const sizeCharts: Record<string, any> = {
          'Oversized Hoodies': {
            data: [
              { size: 'S', length: '28', chest: '47', shoulder: '22', sleeve: '24', armhole: '11.5' },
              { size: 'M', length: '29', chest: '49', shoulder: '23', sleeve: '24.5', armhole: '12' },
              { size: 'L', length: '30', chest: '51', shoulder: '24', sleeve: '25', armhole: '12.5' },
              { size: 'XL', length: '31', chest: '53', shoulder: '25', sleeve: '25.5', armhole: '13' },
              { size: 'XXL', length: '32', chest: '55', shoulder: '26', sleeve: '26', armhole: '13.5' },
            ],
            columns: ['SIZE', 'LENGTH (INCH)', 'CHEST (INCH)', 'SHOULDER (INCH)', 'SLEEVE LENGTH (INCH)', 'ARMHOLE (INCH)']
          },
          'Extra Oversized Hoodies': {
            data: [
              { size: 'S', length: '29', chest: '49', shoulder: '23', sleeve: '24.5', armhole: '12' },
              { size: 'M', length: '30', chest: '51', shoulder: '24', sleeve: '25', armhole: '12.5' },
              { size: 'L', length: '31', chest: '53', shoulder: '25', sleeve: '25.5', armhole: '13' },
              { size: 'XL', length: '32', chest: '55', shoulder: '26', sleeve: '26', armhole: '13.5' },
              { size: 'XXL', length: '33', chest: '57', shoulder: '27', sleeve: '26.5', armhole: '14' },
            ],
            columns: ['SIZE', 'LENGTH (INCH)', 'CHEST (INCH)', 'SHOULDER (INCH)', 'SLEEVE LENGTH (INCH)', 'ARMHOLE (INCH)']
          },
          'Regular Sized Sweatshirt': {
            data: [
              { size: 'S', length: '26', chest: '42' },
              { size: 'M', length: '27', chest: '44' },
              { size: 'L', length: '28', chest: '46' },
              { size: 'XL', length: '29', chest: '48' },
              { size: 'XXL', length: '30', chest: '50' },
              { size: 'XXXL', length: '31', chest: '52' },
            ],
            columns: ['SIZE', 'LENGTH (INCH)', 'CHEST (INCH)']
          },
          'Oversized T-Shirt': {
            data: [
              { size: 'S', length: '28', chest: '20', sleeve: '9.5' },
              { size: 'M', length: '29', chest: '21', sleeve: '10' },
              { size: 'L', length: '30', chest: '22', sleeve: '10.5' },
              { size: 'XL', length: '31', chest: '23', sleeve: '11' },
            ],
            columns: ['SIZE', 'LENGTH (INCH)', 'CHEST (INCH)', 'SLEEVE (INCH)']
          }
        };
        
        // Default to Oversized Hoodies if type not found
        const chartInfo = sizeCharts[clothingType] || sizeCharts['Oversized Hoodies'];
        const chartData = chartInfo.data;
        const columns = chartInfo.columns;
        
        return (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSizeChart(false)}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-6 uppercase text-center font-sans font-normal">SIZE CHART - {clothingType}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr style={{ backgroundColor: '#ff6e00' }} className="text-white">
                      {columns.map((col: string) => (
                        <th key={col} className="text-left py-3 px-4 font-semibold border border-gray-300 whitespace-nowrap font-sans font-normal">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row: any, index: number) => (
                      <tr key={row.size} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="py-3 px-4 font-semibold border border-gray-300 font-sans font-normal">{row.size}</td>
                        <td className="py-3 px-4 border border-gray-300 font-sans font-normal">{row.length}</td>
                        <td className="py-3 px-4 border border-gray-300 font-sans font-normal">{row.chest}</td>
                        {row.shoulder && <td className="py-3 px-4 border border-gray-300 font-sans font-normal">{row.shoulder}</td>}
                        {row.sleeve && <td className="py-3 px-4 border border-gray-300 font-sans font-normal">{row.sleeve}</td>}
                        {row.armhole && <td className="py-3 px-4 border border-gray-300 font-sans font-normal">{row.armhole}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-orange-50 rounded border border-orange-200">
                <p className="text-sm text-gray-700 font-sans font-normal">
                  <span className="font-semibold">Note:</span> All measurements are in inches. For the best fit, measure a similar garment you own and compare with the chart above.
                </p>
              </div>
              <button
                onClick={() => setShowSizeChart(false)}
                className="mt-4 px-6 py-2 text-white text-sm font-medium rounded transition-colors font-sans font-normal"
                style={{ backgroundColor: '#ff6e00' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e56300')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6e00')}
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}

      {/* Full Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-8"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-6xl max-h-screen w-full h-full flex items-center justify-center">
            <OptimizedImage
              src={product.images && product.images.length > 0 ? product.images[selectedImage] : product.main_image}
              alt={product.title}
              className="max-w-full max-h-full object-contain"
              width={1200}
              priority={true}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-900 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Related Products Section */}
      {product && relatedProducts && relatedProducts.length > 0 && (
        <div className="py-6 sm:py-8 mt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 font-sans font-normal">Related Products</h2>
                <p className="text-sm text-gray-600 font-sans font-normal">Discover more amazing clothing you might love</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((relatedProduct) => {
                  const productSlug = relatedProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                  return (
                    <Link
                      key={relatedProduct.id}
                      to={`/clothes/${productSlug}`}
                      className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="relative overflow-hidden rounded-t-xl">
                        <OptimizedImage
                          src={(relatedProduct.images && relatedProduct.images.length > 0) ? relatedProduct.images[0] : ((relatedProduct as any).main_image || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600')}
                          alt={relatedProduct.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          width={400}
                        />
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 truncate font-sans font-normal" title={relatedProduct.title}>
                          {relatedProduct.title}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900 font-sans font-normal">{formatUIPrice(relatedProduct.price, 'INR')}</span>
                            {'originalPrice' in relatedProduct && relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                              <span className="text-xs text-gray-500 line-through font-sans font-normal">{formatUIPrice(relatedProduct.originalPrice, 'INR')}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="w-full bg-white border border-gray-300 group-hover:border-gray-400 group-hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 font-sans font-normal">
                          <span>View Product</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              <div className="text-center mt-8 sm:mt-10 lg:mt-12">
                <Link 
                  to="/clothes"
                  className="inline-block bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-200 text-sm sm:text-base font-sans font-normal"
                >
                  View All Clothing Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </>
  );
};

export default ClothingProductPage;

