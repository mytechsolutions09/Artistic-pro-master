import React, { useState } from 'react';
import { X, Truck, MapPin, Clock, CheckCircle, AlertCircle, Package, RefreshCw } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  trackingData: any;
  onRefresh: () => void;
  isLoading: boolean;
}

interface TrackingStep {
  status: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  order,
  trackingData,
  onRefresh,
  isLoading
}) => {
  const [expandedSteps, setExpandedSteps] = useState<{ [key: number]: boolean }>({});

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in transit':
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in transit':
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'processing':
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Date not available';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date not available';
    }
  };

  const toggleStepExpansion = (index: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Truck className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
              <p className="text-sm text-gray-600">Order #{order?.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-teal-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order Date:</span>
                    <p className="font-medium">{formatDate(order?.created_at || order?.date)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-medium">₹{(order?.total || order?.total_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Shipping Address:</span>
                    <p className="font-medium">{order?.shipping_address || 'Address not available'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <p className="font-medium text-green-600">Paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          {trackingData && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
                {trackingData.isFallback && (
                  <span className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                    Demo Mode
                  </span>
                )}
              </div>
              
              <div className={`p-4 rounded-lg border-l-4 ${getStatusColor(trackingData.status)}`}>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(trackingData.status, false)}
                  <div>
                    <p className="font-semibold">{trackingData.status}</p>
                    <p className="text-sm opacity-75">{trackingData.description}</p>
                    {trackingData.currentLocation && (
                      <div className="flex items-center mt-1 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{trackingData.currentLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tracking Timeline */}
          {trackingData?.steps && trackingData.steps.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Timeline</h3>
              <div className="space-y-4">
                {trackingData.steps.map((step: TrackingStep, index: number) => (
                  <div key={index} className="relative">
                    {/* Timeline line */}
                    {index < trackingData.steps.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      {/* Status icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {getStatusIcon(step.status, step.completed)}
                      </div>
                      
                      {/* Step content */}
                      <div className="flex-1 min-w-0">
                        <div 
                          className="cursor-pointer"
                          onClick={() => toggleStepExpansion(index)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{step.status}</p>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">{formatDate(step.timestamp)}</span>
                              {step.location && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  <span>{step.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded details */}
                        {expandedSteps[index] && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="font-medium">Status:</span>
                                <span className="ml-2">{step.status}</span>
                              </div>
                              <div>
                                <span className="font-medium">Description:</span>
                                <span className="ml-2">{step.description}</span>
                              </div>
                              {step.location && (
                                <div>
                                  <span className="font-medium">Location:</span>
                                  <span className="ml-2">{step.location}</span>
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Timestamp:</span>
                                <span className="ml-2">{formatDate(step.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No tracking data */}
          {!trackingData && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tracking Information</h3>
              <p className="text-gray-600 mb-4">
                {order?.status === 'pending' 
                  ? 'Your order is being processed. Tracking information will be available once your order is shipped.'
                  : order?.status === 'completed'
                  ? 'This order has been completed. Please check your downloads section for digital products.'
                  : 'Tracking information is not available for this order yet.'
                }
              </p>
              <div className="space-y-2">
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
                {order?.status === 'completed' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Contact support if you need assistance with your completed order.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error state */}
          {trackingData?.error && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tracking Error</h3>
              <p className="text-gray-600 mb-4">{trackingData.error}</p>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {trackingData?.isFallback ? (
                <span>Demo tracking data - Real tracking will be available once shipped</span>
              ) : (
                <span>Last updated: {formatDate(new Date().toISOString())}</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;
