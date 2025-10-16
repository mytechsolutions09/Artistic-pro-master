import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Mail, 
  Receipt, 
  Home, 
  ShoppingBag,
  Calendar,
  CreditCard,
  User,
  Star
} from 'lucide-react';
import { Order } from '../types';
import { OrderManager } from '../services/orderService';
import { CompleteOrderService } from '../services/completeOrderService';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import ReviewInput from '../components/ReviewInput';
import { MetaPixelService } from '../services/metaPixelService';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<any>(null);
  const { formatUIPrice, currencySettings } = useCurrency();
  const { user } = useAuth();
  
  const orderId = searchParams.get('orderId');
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        try {
          // First try to get from database using CompleteOrderService
          const result = await CompleteOrderService.getOrderById(orderId);
          if (result.success && result.order) {
            // Transform database order to match the expected Order interface
            const transformedOrder: Order = {
              id: result.order.id,
              userId: result.order.customer_id || '',
              items: await (async () => {
                // Map order items using the stored configuration
                return result.order.order_items?.map((item: any) => {
                  // Check if this is a clothing item by checking for gender field or clothing-related categories
                  const isClothingItem = item.products?.gender || 
                    item.products?.categories?.some((cat: string) => 
                      ['men', 'women', 'clothing'].some(keyword => 
                        cat.toLowerCase().includes(keyword)
                      )
                    );
                  
                  return {
                    id: item.product_id, // Use product_id instead of order item id
                    title: item.product_title,
                    price: item.unit_price,
                    category: 'artwork', // Default category
                    images: [item.product_image || '/api/placeholder/400/400'],
                    featured: false,
                    downloads: 0,
                    rating: 0,
                    tags: [],
                    // Use 'clothing' as productType if it's a clothing item
                    productType: isClothingItem ? 'clothing' : (item.selected_product_type || 'digital'),
                    posterSize: item.selected_poster_size,
                    itemDetails: null
                  };
                }) || [];
              })(),
              total: result.order.total_amount,
              status: result.order.status,
              date: result.order.created_at,
              paymentId: result.order.payment_id,
              paymentMethod: result.order.payment_method,
              downloadLinks: result.order.download_links || [],
              customerEmail: result.order.customer_email
            };
            setOrder(transformedOrder);
            
            // Track Purchase event for Meta Pixel
            MetaPixelService.trackPurchase({
              content_ids: transformedOrder.items.map(item => item.id),
              content_type: 'product',
              value: transformedOrder.total,
              currency: 'INR',
              num_items: transformedOrder.items.length
            });
          } else {
            // Fallback to mock OrderManager
            const foundOrder = OrderManager.getOrderById(orderId);
            if (foundOrder) {
              setOrder(foundOrder);
              
              // Track Purchase event
              MetaPixelService.trackPurchase({
                content_ids: foundOrder.items.map(item => item.id),
                content_type: 'product',
                value: foundOrder.total,
                currency: 'INR',
                num_items: foundOrder.items.length
              });
            } else {
              setOrder(null);
            }
          }
        } catch (error) {
          console.error('Error fetching order:', error);
          // Fallback to mock OrderManager
          const foundOrder = OrderManager.getOrderById(orderId);
          if (foundOrder) {
            setOrder(foundOrder);
            
            // Track Purchase event
            MetaPixelService.trackPurchase({
              content_ids: foundOrder.items.map(item => item.id),
              content_type: 'product',
              value: foundOrder.total,
              currency: 'INR',
              num_items: foundOrder.items.length
            });
          } else {
            setOrder(null);
          }
        }
      }
      setLoading(false);
    };
    
    fetchOrder();
  }, [orderId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }
  
  const handleReviewProduct = (product: any) => {
    setSelectedProductForReview(product);
    setShowReviewInput(true);
  };

  const handleReviewSubmitted = (review: any) => {

    // You can add additional logic here, like showing a success message
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Payment Successful!</h1>
                <p className="text-sm text-green-50">Order #{order.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/90">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(order.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <CreditCard className="w-3.5 h-3.5" />
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {order.items.map((item, index) => (
                  <div key={index} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-3 sm:gap-4">
                      <img 
                        src={item.images?.[0] || '/api/placeholder/400/400'} 
                        alt={item.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.title}</h3>
                        {(item.productType === 'digital' || item.productType === 'poster' || item.productType === 'clothing') && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            {item.productType === 'poster' && item.posterSize && (
                              <>
                                <span>{item.posterSize}</span>
                                <span>•</span>
                              </>
                            )}
                            {item.productType === 'clothing' && (
                              <>
                                {item.color && <span>Color: {item.color}</span>}
                                {item.color && item.size && <span>•</span>}
                                {item.size && <span>Size: {item.size}</span>}
                                {(item.color || item.size) && <span>•</span>}
                              </>
                            )}
                            <span className="capitalize">{item.productType}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 sm:mt-3">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">{formatUIPrice(item.price, 'INR')}</p>
                          {user && (
                            <button
                              onClick={() => handleReviewProduct(item)}
                              className="inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 font-medium transition-colors"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">{formatUIPrice(order.total, 'INR')}</span>
                </div>
              </div>
            </div>

            {/* Email Confirmation - Mobile */}
            <div className="lg:hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Confirmation Email Sent</h4>
                  <p className="text-xs text-gray-600 truncate">{order.customerEmail}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-3 sm:p-4 space-y-2">
                <Link
                  to="/dashboard"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>My Dashboard</span>
                </Link>
                <Link
                  to="/browse"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2.5 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>
                <Link
                  to="/"
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
            
            {/* Payment Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-900">Payment Status</h3>
              </div>
              <div className="p-3 sm:p-4 space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Completed
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment ID</span>
                  <span className="font-mono text-xs text-gray-900">{order.paymentId?.slice(-12)}</span>
                </div>
              </div>
            </div>

            {/* Email Confirmation - Desktop */}
            <div className="hidden lg:block bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Email Sent!</h4>
                <p className="text-xs text-gray-600 break-words">
                  Confirmation sent to <strong className="text-gray-900">{order.customerEmail}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Input Modal */}
      {showReviewInput && selectedProductForReview && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ReviewInput
              productId={selectedProductForReview.id}
              productTitle={selectedProductForReview.title}
              userId={user.id}
              userName={user.user_metadata?.name || user.email || 'Anonymous'}
              onReviewSubmitted={handleReviewSubmitted}
              onClose={() => {
                setShowReviewInput(false);
                setSelectedProductForReview(null);
              }}
              className="border-0 rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
