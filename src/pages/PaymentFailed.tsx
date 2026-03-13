import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  XCircle, 
  RefreshCw, 
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
  
  const handleRetryPayment = () => {
    setRetryCount(prev => prev + 1);
    // Go back to the previous page to retry payment
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Error Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="text-center">
            <div className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-8 h-8 text-gray-700" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Payment Failed</h1>
            <p className="text-sm text-gray-600">We couldn't process your payment. Don't worry, you haven't been charged.</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Error Details */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-1">What Happened?</h2>
                <p className="text-sm text-gray-700">{errorMessage}</p>
              </div>
              
              <div className="p-4">
                {orderId && (
                  <div className="border border-gray-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-gray-700" />
                      <span className="font-semibold text-gray-900 text-sm">Transaction Details</span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                      <p>Order ID: <span className="font-mono">{orderId}</span></p>
                      {amount && <p>Amount: <span className="font-semibold">${amount}</span></p>}
                      <p>Status: <span className="font-semibold">Failed</span></p>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <button
                    onClick={handleRetryPayment}
                    className="inline-flex items-center space-x-2 border border-gray-300 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    {retryCount > 0 && `Retry attempt: ${retryCount}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>
                <Link
                  to="/browse"
                  className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>
                <Link
                  to="/"
                  className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
            
            {/* Support Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <HelpCircle className="w-4 h-4 text-gray-700 mr-2" />
                Need Help?
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-700">support@lurevi.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-700">+91 9625788455</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Our support team is available 24/7 to help you with payment issues.
                </p>
              </div>
            </div>
            
            {/* Security Notice */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-center">
                <div className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-4 h-4 text-gray-700" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">You Were Not Charged</h4>
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
