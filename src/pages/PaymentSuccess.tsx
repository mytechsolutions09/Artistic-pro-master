import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Download, 
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
                  console.log(`📋 Item ${item.product_title}:`, {
                    selectedProductType: item.selected_product_type,
                    selectedPosterSize: item.selected_poster_size,
                    unitPrice: item.unit_price
                  });
                  
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
                    productType: item.selected_product_type || 'digital',
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
          } else {
            // Fallback to mock OrderManager
            const foundOrder = OrderManager.getOrderById(orderId);
            setOrder(foundOrder || null);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
          // Fallback to mock OrderManager
          const foundOrder = OrderManager.getOrderById(orderId);
          setOrder(foundOrder || null);
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
  
  const handleDownload = async (downloadUrl: string, filename?: string) => {
    try {
      // Fetch the file from the URL
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Set the filename based on the URL or provided filename
      if (filename) {
        link.download = filename;
      } else {
        // Extract filename from URL
        const urlPath = downloadUrl.split('/').pop() || 'download';
        const urlParams = new URLSearchParams(urlPath.split('?')[1] || '');
        const actualFilename = urlParams.get('filename') || urlPath.split('?')[0];
        link.download = actualFilename;
      }
      
      // Append to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab if download fails
      window.open(downloadUrl, '_blank');
    }
  };

  const handleReviewProduct = (product: any) => {
    setSelectedProductForReview(product);
    setShowReviewInput(true);
  };

  const handleReviewSubmitted = (review: any) => {
    console.log('Review submitted:', review);
    // You can add additional logic here, like showing a success message
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Success Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-lg text-gray-600">Thank you for your purchase. Your digital artwork is ready for download.</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                <h2 className="text-xl font-bold text-white mb-2">Order Summary</h2>
                <div className="flex items-center space-x-4 text-green-100">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4" />
                    <span className="text-sm">Order #{order.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={item.images?.[0] || '/api/placeholder/400/400'} 
                          alt={item.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            {item.productType === 'poster' && item.posterSize && (
                              <>
                                <span>Poster Size: {item.posterSize}</span>
                                <span>•</span>
                              </>
                            )}
                            <span className="capitalize">{item.productType} Product</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{formatUIPrice(item.price, 'INR')}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleDownload(order.downloadLinks?.[index] || '', `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`)}
                            className="inline-flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                          {user && (
                            <button
                              onClick={() => handleReviewProduct(item)}
                              className="inline-flex items-center space-x-1 text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
                            >
                              <Star className="w-4 h-4" />
                              <span>Review</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-green-600">{formatUIPrice(order.total, 'INR')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Download Instructions */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Download className="w-5 h-5 text-blue-500 mr-2" />
                Download Instructions
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <p>Click the "Download" button next to each artwork above to start downloading your files.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <p>Each download includes high-resolution files in multiple formats (JPG, PNG, PDF).</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <p>You can re-download your purchases anytime from your <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 underline">dashboard</Link>.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                  <p>A confirmation email with download links has been sent to <strong>{order.customerEmail}</strong>.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
                Payment Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-xs text-gray-800">{order.paymentId?.slice(-12)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="capitalize text-gray-800">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-800">{new Date(order.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">What's Next?</h3>
              <div className="space-y-3">
                <Link
                  to="/dashboard"
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                  <span>View My Dashboard</span>
                </Link>
                <Link
                  to="/browse"
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Continue Shopping</span>
                </Link>
                <Link
                  to="/"
                  className="w-full flex items-center justify-center space-x-2 border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <Home className="w-5 h-5" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
            
            {/* Email Confirmation */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
              <div className="text-center">
                <Mail className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-800 mb-2">Email Sent!</h4>
                <p className="text-sm text-gray-600">
                  We've sent a confirmation email with your download links to <strong>{order.customerEmail}</strong>
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
