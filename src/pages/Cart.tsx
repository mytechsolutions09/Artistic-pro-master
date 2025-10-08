import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateProductUrl } from '../utils/slugUtils';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Heart,
  Tag,
  X
} from 'lucide-react';
import { CartManager } from '../services/orderService';
import { Cart } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { CouponService } from '../services/couponService';
import { FavoritesService } from '../services/favoritesService';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { formatUIPrice } = useCurrency();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCart(CartManager.getCart());
    const unsubscribe = CartManager.subscribe(setCart);
    
    // Load favorites from Supabase if user is logged in
    if (user) {
      loadUserFavorites();
    }
    
    return unsubscribe;
  }, [user]);

  const updateQuantity = (productId: string, quantity: number) => {
    CartManager.updateQuantity(productId, quantity);
  };

  const removeItem = (productId: string) => {
    CartManager.removeItem(productId);
  };

  const clearCart = () => {
    CartManager.clearCart();
  };

  const loadUserFavorites = async () => {
    if (!user) return;
    
    try {
      const userFavorites = await FavoritesService.getUserFavorites();
      const favoriteIds = userFavorites.map(fav => fav.product_id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      navigate('/sign-in');
      return;
    }

    setFavoritesLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const isCurrentlyFavorite = favorites.includes(productId);
      
      if (isCurrentlyFavorite) {
        await FavoritesService.removeFromFavorites(productId);
        setFavorites(prev => prev.filter(id => id !== productId));
      } else {
        await FavoritesService.addToFavorites(productId);
        setFavorites(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // You could add a toast notification here
    } finally {
      setFavoritesLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setLoading(true);
    setCouponError('');

    try {
      const result = await CouponService.applyCoupon(couponCode, cart.total);
      if (result.success) {
        setAppliedCoupon(result.coupon);
        setCouponCode('');
      } else {
        setCouponError(result.error || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponError('Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Calculate totals
  const subtotal = cart.total;
  const deliveryFee = 0; // No delivery charges
  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + deliveryFee - discount;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          
          <h1 className="text-xl font-medium text-gray-900 mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Discover amazing products and add them to your cart to get started.
          </p>
          
          <div className="space-y-2.5">
            <Link
              to="/"
              className="block w-full bg-black hover:bg-gray-800 text-white py-2.5 px-5 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.product.images?.[0] || '/api/placeholder/400/400'}
                      alt={item.product.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base mb-1">{item.product.title}</h3>
                        
                        {/* Product Variant Info */}
                        <div className="space-y-1">
                          {item.selectedProductType === 'clothing' && item.options && (
                            <>
                              {item.options.color && (
                                <p className="text-sm text-gray-500">Color: {item.options.color}</p>
                              )}
                              {item.options.size && (
                                <p className="text-sm text-gray-500">Size: {item.options.size}</p>
                              )}
                            </>
                          )}
                          {item.selectedProductType === 'poster' && item.selectedPosterSize && (
                            <p className="text-sm text-gray-500">Size: {item.selectedPosterSize}</p>
                          )}
                          {item.selectedProductType === 'digital' && (
                            <p className="text-sm text-gray-500">Digital Download</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-4 mt-3">
                          <button 
                            onClick={() => toggleFavorite(item.product.id)}
                            disabled={favoritesLoading[item.product.id]}
                            className={`transition-colors ${
                              favorites.includes(item.product.id)
                                ? 'text-red-500 hover:text-red-600'
                                : 'text-gray-400 hover:text-red-500'
                            } ${favoritesLoading[item.product.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Heart 
                              className={`w-4 h-4 ${
                                favorites.includes(item.product.id) ? 'fill-current' : ''
                              } ${favoritesLoading[item.product.id] ? 'animate-pulse' : ''}`} 
                            />
                          </button>
                          <button 
                            onClick={() => removeItem(item.product.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex flex-col items-end space-y-3">
                        {/* Price */}
                        <p className="font-bold text-gray-900 text-lg">
                          {formatUIPrice(item.selectedPrice, 'INR')}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatUIPrice(subtotal, 'INR')}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping charges</span>
                  <span className="font-semibold text-gray-900">Free</span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatUIPrice(discount, 'INR')}</span>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatUIPrice(total, 'INR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-teal-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-teal-700 transition-colors mb-4"
              >
                Checkout
              </button>

              {/* Promo Code Link */}
              <button
                onClick={() => setShowPromoCode(!showPromoCode)}
                className="w-full text-center text-gray-500 hover:text-gray-700 underline text-sm transition-colors"
              >
                Use a promo code
              </button>

              {/* Coupon Code Section */}
              {showPromoCode && (
                <div className="mt-4 space-y-2">
                  {!appliedCoupon ? (
                    <div>
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={loading || !couponCode.trim()}
                        className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {loading ? 'Applying...' : 'Apply Coupon'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                      <span className="text-green-800 text-sm">
                        Coupon applied: {appliedCoupon.code}
                      </span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-red-600 text-xs">{couponError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;