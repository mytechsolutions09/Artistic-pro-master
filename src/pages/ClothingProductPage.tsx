import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Ruler } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { CartManager } from '../services/orderService';

const ClothingProductPage: React.FC = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const { allProducts, loading } = useProducts();
  const { formatUIPrice } = useCurrency();
  const { user } = useAuth();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [hasGiftCard, setHasGiftCard] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  // Find the product by slug (clothing products)
  const product = allProducts.find(p => {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (slug !== productSlug) return false;
    
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

  // Debug: Log product data to see what fields are available
  useEffect(() => {
    if (product) {
      console.log('Product data:', {
        title: product.title,
        gender: product.gender,
        details: product.details,
        washCare: product.washCare,
        shipping: product.shipping,
        clothingType: product.clothingType
      });
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      return;
    }

    if (!user) {
      navigate('/sign-in');
      return;
    }

    if (!product) return;

    try {
      CartManager.addItem(product as any, 1, product.productType || 'clothing', selectedSize);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link to="/men" className="text-sm underline" style={{ color: '#ff6e00' }}>
            Back to Men's Clothing
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Section - Shows first on mobile */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          <div className="order-1 lg:order-2">
            {/* Product Image with Side Thumbnails */}
            <div className="flex gap-4">
              {/* Main Product Image */}
              <div 
                className="flex-1 relative aspect-[3/4] max-h-[450px] bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setShowFullImage(true)}
              >
                <img
                  src={product.images && product.images.length > 0 ? product.images[selectedImage] : product.main_image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-2 shadow-lg">
                  <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>

              {/* Right Side Thumbnail Slider */}
              {product.images && product.images.length > 1 && (
                <div className="hidden md:flex flex-col items-center">
                  <div className="h-[450px] overflow-y-auto scrollbar-hide">
                    <div className="flex flex-col space-y-2">
                      {product.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded transition-all duration-200 ${
                            selectedImage === index ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.title} ${index + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Thumbnail Images (Horizontal) */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:hidden gap-2 overflow-x-auto pb-2 mt-3">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded transition-all ${
                      selectedImage === index ? 'opacity-100' : 'opacity-60'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Title and Price - Shows second on mobile, left side on desktop */}
          <div className="order-2 lg:order-1 mt-6 lg:mt-0 space-y-6 lg:space-y-8">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight mb-2">
                {product.title}
              </h1>
              
              {/* Product Info Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Gender Badge */}
                {product.gender && (
                  <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide border border-gray-300 rounded">
                    {product.gender}
                  </span>
                )}
                
                {/* Clothing Type */}
                {product.clothingType && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-700 rounded">
                    {product.clothingType}
                  </span>
                )}
                
                {/* Material */}
                {product.material && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-blue-50 text-blue-700 rounded">
                    {product.material}
                  </span>
                )}
                
                {/* Brand */}
                {product.brand && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded" style={{ backgroundColor: '#F5F5DC', color: '#ff6e00' }}>
                    {product.brand}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {product.originalPrice && product.originalPrice > product.price ? (
                  <>
                    <p className="text-lg text-gray-500 line-through">
                      {formatUIPrice(product.originalPrice)}
                    </p>
                    <p className="text-xl font-bold" style={{ color: '#ff6e00' }}>
                      {formatUIPrice(product.price)}
                    </p>
                    {product.discountPercentage && (
                      <span className="px-2 py-1 text-sm font-bold text-white rounded" style={{ backgroundColor: '#ff6e00' }}>
                        {product.discountPercentage}% OFF
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-xl font-semibold">
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
                      <span className="text-sm font-semibold text-red-700">Out of Stock</span>
                    </div>
                  ) : product.stockQuantity && product.stockQuantity <= (product.lowStockThreshold || 10) ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                      <span className="text-sm font-semibold text-orange-700">Only {product.stockQuantity} left in stock!</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-green-700">In Stock</span>
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
                <span className="text-xs font-bold uppercase tracking-wide block mb-2">
                  COLOR: {selectedColor || 'Select a color'}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {availableColors.map((color: any) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === color ? 'opacity-100 scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: colorHexMap[color] || '#000'
                      }}
                      title={color}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide">
                    SIZE: {selectedSize || 'Select a size'}
                  </span>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-xs font-bold uppercase tracking-wide flex items-center gap-1 hover:underline transition-colors"
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
                      className={`py-1.5 text-xs font-medium transition-all rounded ${
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

            {/* Gift Card Checkbox */}
            <div className="py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasGiftCard}
                  onChange={(e) => setHasGiftCard(e.target.checked)}
                  className="w-3.5 h-3.5 rounded"
                  style={{ accentColor: '#ff6e00' }}
                />
                <span className="text-xs font-medium uppercase tracking-wide">HAVE A GIFT CARD?</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.trackInventory && product.stockQuantity === 0}
                className={`flex-1 py-2.5 px-3 font-medium text-xs uppercase tracking-wide transition-all rounded ${
                  product.trackInventory && product.stockQuantity === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {product.trackInventory && product.stockQuantity === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.trackInventory && product.stockQuantity === 0}
                className="flex-1 py-2.5 px-3 text-white font-medium text-xs uppercase tracking-wide transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </div>
        </div>

        {/* Description Sections - Shows after all content on mobile and desktop */}
        <div className="space-y-8 mt-8">
          {/* Description */}
          {product.description && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-4">DESCRIPTION</h2>
              <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          {/* Details */}
          {product.details && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-4">DETAILS</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {product.details}
              </div>
            </div>
          )}

          {/* Wash Care */}
          {product.washCare && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-4">WASH CARE</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {product.washCare}
              </div>
            </div>
          )}

          {/* Shipping */}
          {product.shipping && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-4">SHIPPING</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {product.shipping}
              </div>
            </div>
          )}
        </div>

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
              <h3 className="text-xl font-bold mb-6 uppercase text-center">SIZE CHART - {clothingType}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr style={{ backgroundColor: '#ff6e00' }} className="text-white">
                      {columns.map((col: string) => (
                        <th key={col} className="text-left py-3 px-4 font-bold border border-gray-300 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((row: any, index: number) => (
                      <tr key={row.size} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="py-3 px-4 font-bold border border-gray-300">{row.size}</td>
                        <td className="py-3 px-4 border border-gray-300">{row.length}</td>
                        <td className="py-3 px-4 border border-gray-300">{row.chest}</td>
                        {row.shoulder && <td className="py-3 px-4 border border-gray-300">{row.shoulder}</td>}
                        {row.sleeve && <td className="py-3 px-4 border border-gray-300">{row.sleeve}</td>}
                        {row.armhole && <td className="py-3 px-4 border border-gray-300">{row.armhole}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-orange-50 rounded border border-orange-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Note:</span> All measurements are in inches. For the best fit, measure a similar garment you own and compare with the chart above.
                </p>
              </div>
              <button
                onClick={() => setShowSizeChart(false)}
                className="mt-4 px-6 py-2 text-white text-sm font-medium rounded transition-colors"
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
            <img
              src={product.images && product.images.length > 0 ? product.images[selectedImage] : product.main_image}
              alt={product.title}
              className="max-w-full max-h-full object-contain"
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
      </div>
    </div>
  );
};

export default ClothingProductPage;

