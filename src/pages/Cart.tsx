import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateProductUrl } from '../utils/slugUtils';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Star,
  Heart,
  ShoppingBag,
  CreditCard,
  Tag,
  X
} from 'lucide-react';
import { CartManager } from '../services/orderService';
import { Cart } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { CouponService } from '../services/couponService';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { formatUIPrice, currencySettings } = useCurrency();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    // Load cart from CartManager
    setCart(CartManager.getCart());
    
    // Subscribe to cart changes
    const unsubscribe = CartManager.subscribe(setCart);
    return unsubscribe;
  }, []);

  const updateQuantity = (productId: string, quantity: number) => {
    CartManager.updateQuantity(productId, quantity);
  };

  const removeItem = (productId: string) => {
    CartManager.removeItem(productId);
  };

  const clearCart = () => {
    CartManager.clearCart();
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) return;
    navigate('/checkout');
  };

  // Coupon functions
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      // Validate coupon using database
      const validation = await CouponService.validateCoupon(couponCode, subtotal);
      
      if (!validation.is_valid) {
        setCouponError(validation.error_message);
        return;
      }

      // Get coupon details for display
      const activeCoupons = await CouponService.getActiveCoupons();
      const coupon = activeCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
      
      if (!coupon) {
        setCouponError('Invalid coupon code');
        return;
      }

      setAppliedCoupon({
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
        minAmount: coupon.min_amount,
        validUntil: coupon.valid_until,
        isActive: coupon.is_active
      });
      setCouponError('');
      setCouponCode('');
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      setCouponError('Failed to apply coupon');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const calculateCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.discount) / 100;
    } else {
      return appliedCoupon.discount;
    }
  };

  // Calculate the original price for the selected product type and size
  const getOriginalPrice = (item: any) => {
    if (item.selectedProductType === 'poster' && item.selectedPosterSize && item.product.posterPricing && item.product.posterPricing[item.selectedPosterSize]) {
      // For poster, use the poster pricing as the original price
      return item.product.posterPricing[item.selectedPosterSize];
    }
    // For digital products, use originalPrice as the original price
    return item.product.originalPrice;
  };

  // Calculate total discount from cart items
  const calculateTotalDiscount = () => {
    return cart.items.reduce((totalDiscount, item) => {
      if (item.product.discountPercentage && item.product.discountPercentage > 0) {
        const originalPrice = getOriginalPrice(item);
        const discountedPrice = item.selectedPrice;
        const itemDiscount = (originalPrice - discountedPrice) * item.quantity;
        return totalDiscount + itemDiscount;
      }
      return totalDiscount;
    }, 0);
  };

  const totalDiscount = calculateTotalDiscount();

  // Calculate subtotal (original prices before discount)
  const calculateSubtotal = () => {
    return cart.items.reduce((subtotal, item) => {
      const originalPrice = getOriginalPrice(item);
      return subtotal + (originalPrice * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const couponDiscount = calculateCouponDiscount();
  const finalTotal = subtotal - totalDiscount - couponDiscount;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          {/* Minimal Icon */}
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          
          {/* Clean Typography */}
          <h1 className="text-xl font-medium text-gray-900 mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Discover amazing digital artworks and add them to your cart to get started.
          </p>
          
          {/* Minimal Buttons */}
          <div className="space-y-2.5">
            <Link
              to="/browse"
              className="block w-full bg-[#F48FB1] hover:bg-[#E91E63] text-white py-2.5 px-5 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Browse Artwork
            </Link>
            <Link
              to="/categories"
              className="block w-full border border-gray-200 text-gray-700 py-2.5 px-5 rounded-lg text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              View Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.title}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div className="absolute -top-1 -right-1">
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link
                          to={generateProductUrl(
                            item.product.categories && item.product.categories.length > 0 
                              ? item.product.categories[0] 
                              : (item.product as any).category, 
                            item.product.title
                          )}
                          className="block hover:text-pink-600 transition-colors"
                        >
                          <h3 className="font-medium text-gray-800 text-sm mb-0.5">{item.product.title}</h3>
                          <p className="text-xs text-gray-500">
                            {item.selectedProductType === 'digital' 
                              ? 'Digital Download' 
                              : `Poster Size: ${item.selectedPosterSize || 'Standard'}`
                            }
                          </p>
                        </Link>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          {item.product.discountPercentage && item.product.discountPercentage > 0 ? (
                            <div className="space-y-0.5">
                              <p className="text-lg font-bold text-pink-600">{formatUIPrice(item.selectedPrice, 'INR')}</p>
                              <p className="text-xs text-gray-400 line-through">{formatUIPrice(getOriginalPrice(item), 'INR')}</p>
                              <p className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">
                                {item.product.discountPercentage}% OFF
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-gray-800">{formatUIPrice(item.selectedPrice, 'INR')}</p>
                          )}
                        </div>
                        
                        {/* Only show quantity controls for non-digital products */}
                        {item.selectedProductType !== 'digital' && (
                          <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-0.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-medium text-gray-800 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>{formatUIPrice(subtotal, 'INR')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping Fee</span>
                  <span>{formatUIPrice(0, 'INR')}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Product Discount</span>
                    <span>-{formatUIPrice(totalDiscount, 'INR')}</span>
                  </div>
                )}
                
                {/* Coupon Section */}
                <div className="border-t border-gray-200 pt-3">
                  {!appliedCoupon ? (
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-3 py-1.5 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-xs font-medium flex items-center space-x-1"
                        >
                          <Tag className="w-3 h-3" />
                          <span>Apply</span>
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-red-500 text-xs">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 p-2 rounded-md">
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-green-600" />
                        <span className="text-green-800 font-medium text-sm">{appliedCoupon.code}</span>
                        <span className="text-green-600 text-xs">
                          ({appliedCoupon.discount}{appliedCoupon.type === 'percentage' ? '%' : ' off'})
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon Discount</span>
                    <span>-{formatUIPrice(couponDiscount, 'INR')}</span>
                  </div>
                )}
                
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>{formatUIPrice(finalTotal, 'INR')}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Checkout</span>
              </button>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  Secure checkout powered by SSL encryption
                </p>
              </div>
            </div>
            
            {/* Benefits */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
              <h4 className="font-medium text-gray-800 mb-3 text-sm">Why Choose Digital Art?</h4>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs">✓</span>
                  </div>
                  <span>Instant download after purchase</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs">✓</span>
                  </div>
                  <span>High-resolution files (300 DPI)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs">✓</span>
                  </div>
                  <span>Multiple formats (JPG, PNG, PDF)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs">✓</span>
                  </div>
                  <span>Lifetime access & re-download</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
