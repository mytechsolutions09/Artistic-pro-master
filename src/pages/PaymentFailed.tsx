import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  XCircle, 
  RefreshCw, 
  CreditCard, 
  Phone, 
  Mail, 
  Home, 
  ShoppingBag,
  AlertTriangle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  
  const errorMessage = searchParams.get('error') || 'Payment processing failed';
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  
  const commonIssues = [
    {
      icon: CreditCard,
      title: 'Insufficient Funds',
      description: 'Your card may not have enough balance for this transaction.',
      solution: 'Try a different payment method or add funds to your account.'
    },
    {
      icon: AlertTriangle,
      title: 'Card Declined',
      description: 'Your bank may have declined the transaction for security reasons.',
      solution: 'Contact your bank or try a different card.'
    },
    {
      icon: XCircle,
      title: 'Expired Card',
      description: 'The payment method may have expired.',
      solution: 'Update your payment information and try again.'
    },
    {
      icon: HelpCircle,
      title: 'Technical Error',
      description: 'A temporary technical issue occurred during processing.',
      solution: 'Wait a few minutes and try again.'
    }
  ];
  
  const handleRetryPayment = () => {
    setRetryCount(prev => prev + 1);
    // In a real app, this would redirect to the checkout with the same items
    navigate('/browse');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
      {/* Error Header */}
      <div className="bg-white shadow-sm border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
            <p className="text-lg text-gray-600">We couldn't process your payment. Don't worry, you haven't been charged.</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6">
                <h2 className="text-xl font-bold text-white mb-2">What Happened?</h2>
                <p className="text-red-100">{errorMessage}</p>
              </div>
              
              <div className="p-6">
                {orderId && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="font-semibold text-red-800">Transaction Details</span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-red-700">
                      <p>Order ID: <span className="font-mono">{orderId}</span></p>
                      {amount && <p>Amount: <span className="font-semibold">${amount}</span></p>}
                      <p>Status: <span className="font-semibold">Failed</span></p>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <button
                    onClick={handleRetryPayment}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-semibold text-lg"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Try Again</span>
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    {retryCount > 0 && `Retry attempt: ${retryCount}`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Common Issues */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Common Issues & Solutions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commonIssues.map((issue, index) => {
                  const Icon = issue.icon;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 mb-1">{issue.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                          <p className="text-xs text-blue-600 font-medium">{issue.solution}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Alternative Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Try These Alternatives</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/browse')}
                  className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <CreditCard className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
                  <span className="font-medium text-gray-700 group-hover:text-blue-700">Different Card</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Use another payment method</span>
                </button>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <ShoppingBag className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mb-2" />
                  <span className="font-medium text-gray-700 group-hover:text-purple-700">Save for Later</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Add to wishlist</span>
                </button>
                
                <Link
                  to="/contact"
                  className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                >
                  <Phone className="w-8 h-8 text-gray-400 group-hover:text-green-500 mb-2" />
                  <span className="font-medium text-gray-700 group-hover:text-green-700">Get Help</span>
                  <span className="text-xs text-gray-500 text-center mt-1">Contact support</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Go Back</span>
                </button>
                <Link
                  to="/browse"
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
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
            
            {/* Support Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 text-blue-500 mr-2" />
                Need Help?
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700">support@lurevi.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700">1-800-ART-HELP</span>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Our support team is available 24/7 to help you with payment issues.
                </p>
              </div>
            </div>
            
            {/* Security Notice */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">You Were Not Charged</h4>
                <p className="text-sm text-gray-600">
                  Since the payment failed, no money was deducted from your account. Your information is secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
