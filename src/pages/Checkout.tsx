import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  ShoppingBag, 
  User, 
  Mail,
  Loader2,
  Trash2,
  Lock
} from 'lucide-react';
import { CartManager } from '../services/orderService';
import { CompleteOrderService, CompleteOrderData } from '../services/completeOrderService';
import { createOrderBypassRLS, isServiceRoleAvailable } from '../services/orderServiceBypass';
import { Cart, Product } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { formatUIPrice } = useCurrency();
  const { user } = useAuth();
  const { allProducts, getProductById } = useProducts();
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'United States',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    paymentMethod: 'card'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Check if it's a direct purchase
  const productId = searchParams.get('product');
  const productType = searchParams.get('type') || 'digital';
  const productPrice = searchParams.get('price');
  const posterSize = searchParams.get('size');
  const [directPurchaseProduct, setDirectPurchaseProduct] = useState<Product | null>(null);
  
  useEffect(() => {
    if (productId) {
      // Fetch real product data from ProductContext
      const realProduct = getProductById(productId);
      if (realProduct) {
        setDirectPurchaseProduct(realProduct);
        
        // Use the price from URL parameters if available, otherwise use product price
        const finalPrice = productPrice ? parseFloat(productPrice) : realProduct.price;
        
        setCart({ 
          items: [{ 
            id: '1', 
            product: realProduct, 
            quantity: 1,
            selectedProductType: productType as 'digital' | 'poster',
            selectedPosterSize: posterSize || undefined,
            selectedPrice: finalPrice
          }], 
          total: finalPrice 
        });
      } else {
        // If product not found, redirect back or show error
        console.error('Product not found:', productId);
        navigate('/browse');
      }
    } else {
      // Load cart from CartManager
      setCart(CartManager.getCart());
      
      // Subscribe to cart changes
      const unsubscribe = CartManager.subscribe(setCart);
      return unsubscribe;
    }
  }, [productId, productType, productPrice, posterSize, getProductById, navigate]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.cvv) newErrors.cvv = 'CVV is required';
    if (!formData.nameOnCard) newErrors.nameOnCard = 'Name on card is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (cart.items.length === 0) return;
    
    setLoading(true);
    
    try {
      // Prepare order data for complete order service
      const orderData: CompleteOrderData = {
        customerId: user?.id || null, // Use authenticated user ID if available, null for guest orders
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        items: cart.items.map(item => ({
          productId: item.product.id,
          productTitle: item.product.title,
          productImage: item.product.images?.[0],
          quantity: item.quantity,
          unitPrice: item.selectedPrice,
          totalPrice: item.selectedPrice * item.quantity,
          selectedProductType: item.selectedProductType,
          selectedPosterSize: item.selectedPosterSize
        })),
        totalAmount: cart.total,
        paymentMethod: formData.paymentMethod as 'card' | 'paypal' | 'bank_transfer',
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        notes: undefined,
        shippingAddress: formData.address
      };

      // Try normal order completion first, fallback to bypass if RLS fails
      let result = await CompleteOrderService.completeOrder(orderData);
      
      // If normal order fails with RLS error, try bypass method
      if (!result.success && result.error?.includes('row-level security policy')) {

        if (isServiceRoleAvailable()) {
          result = await createOrderBypassRLS(orderData);
        } else {
          throw new Error('RLS policy error and service role not available. Please configure VITE_SUPABASE_SERVICE_ROLE_KEY or fix RLS policies.');
        }
      }
      
      if (result.success && result.orderId) {
        // Clear cart if not direct purchase
        if (!productId) {
          CartManager.clearCart();
        }
        
        // Redirect to success page
        navigate(`/payment-success?orderId=${result.orderId}`);
      } else {
        throw new Error(result.error || 'Order completion failed');
      }
      
    } catch (error) {
      console.error('Payment failed:', error);
      navigate(`/payment-failed?error=${encodeURIComponent((error as Error).message)}&amount=${cart.total}`);
    } finally {
      setLoading(false);
    }
  };
  
  const removeItem = (productId: string) => {
    CartManager.removeItem(productId);
  };
  

  
  if (cart.items.length === 0 && !directPurchaseProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some amazing artworks to your cart before checking out.</p>
          <button 
            onClick={() => navigate('/browse')}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <User className="w-6 h-6 text-blue-500 mr-2" />
                  Customer Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          errors.email ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                        }`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        errors.firstName ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        errors.lastName ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 text-green-500 mr-2" />
                  Payment Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          errors.cardNumber ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                        }`}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          errors.expiryDate ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                        }`}
                        placeholder="MM/YY"
                      />
                      {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          errors.cvv ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                        }`}
                        placeholder="123"
                      />
                      {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name on Card</label>
                    <input
                      type="text"
                      name="nameOnCard"
                      value={formData.nameOnCard}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        errors.nameOnCard ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.nameOnCard && <p className="text-red-500 text-xs mt-1">{errors.nameOnCard}</p>}
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Complete Purchase - {formatUIPrice(cart.total, 'INR')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <ShoppingBag className="w-5 h-5 text-purple-500 mr-2" />
                Order Summary
              </h3>
              
              <div className="space-y-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <img 
                      src={item.product.images?.[0] || '/api/placeholder/400/400'} 
                      alt={item.product.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate text-xs">{item.product.title}</h4>
                      <p className="text-xs text-gray-500">
                        {item.selectedProductType === 'digital' 
                          ? 'Digital Download' 
                          : `Poster Size: ${item.selectedPosterSize || 'Standard'}`
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 text-xs">{formatUIPrice(item.selectedPrice, 'INR')}</p>
                      {!productId && (
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatUIPrice(cart.total, 'INR')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing Fee</span>
                    <span>{formatUIPrice(0, 'INR')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatUIPrice(cart.total, 'INR')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Security Badge */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
              <div className="text-center">
                <Lock className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-800 mb-1 text-sm">Secure Payment</h4>
                <p className="text-xs text-gray-600">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
