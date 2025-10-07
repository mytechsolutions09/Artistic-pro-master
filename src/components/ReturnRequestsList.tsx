import React, { useState, useEffect } from 'react';
import { RotateCcw, Clock, CheckCircle, XCircle, AlertCircle, Package, Truck, MapPin, Calendar, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { ReturnService, ReturnRequestData } from '../services/returnService';
import { delhiveryService, ReturnTrackingInfo } from '../services/DelhiveryService';

interface ReturnRequestsListProps {
  customerEmail: string;
}

const ReturnRequestsList: React.FC<ReturnRequestsListProps> = ({ customerEmail }) => {
  const [returns, setReturns] = useState<ReturnRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<Record<string, ReturnTrackingInfo>>({});
  const [loadingTracking, setLoadingTracking] = useState<Record<string, boolean>>({});
  const [expandedReturns, setExpandedReturns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadReturns();
  }, [customerEmail]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      console.log('Loading returns for customer:', customerEmail);
      const returnRequests = await ReturnService.getCustomerReturns(customerEmail);
      console.log('Found return requests:', returnRequests);
      console.log('Return statuses:', returnRequests.map(r => ({ id: r.id, status: r.status, product: r.product_title })));
      setReturns(returnRequests);
      
      // Auto-load tracking info for approved/processing returns
      returnRequests.forEach(returnRequest => {
        if (returnRequest.status === 'approved' || returnRequest.status === 'processing') {
          loadTrackingInfo(returnRequest.id);
        }
      });
    } catch (error) {
      console.error('Error loading returns:', error);
      setError('Failed to load return requests');
    } finally {
      setLoading(false);
    }
  };

  const loadTrackingInfo = async (returnId: string) => {
    try {
      setLoadingTracking(prev => ({ ...prev, [returnId]: true }));
      
      // Extract tracking number from admin notes
      const returnRequest = returns.find(r => r.id === returnId);
      if (!returnRequest?.admin_notes) return;
      
      const trackingMatch = returnRequest.admin_notes.match(/tracking: ([A-Z0-9]+)/i);
      if (!trackingMatch) return;
      
      const trackingNumber = trackingMatch[1];
      const tracking = await delhiveryService.trackReturnPickup(trackingNumber);
      
      setTrackingInfo(prev => ({ ...prev, [returnId]: tracking }));
    } catch (error) {
      console.error('Error loading tracking info:', error);
    } finally {
      setLoadingTracking(prev => ({ ...prev, [returnId]: false }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'approved':
        return 'Approved - Pickup Scheduled';
      case 'rejected':
        return 'Rejected';
      case 'processing':
        return 'Processing Return';
      case 'completed':
        return 'Return Completed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const toggleAccordion = (returnId: string) => {
    setExpandedReturns(prev => ({
      ...prev,
      [returnId]: !prev[returnId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-600">Loading return requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="text-center py-8">
        <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Return Requests</h3>
        <p className="text-gray-600">You haven't requested any returns yet.</p>
      </div>
    );
  }

  // Count returns by status
  const statusCounts = returns.reduce((acc, returnRequest) => {
    acc[returnRequest.status] = (acc[returnRequest.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-3">
      {/* Return Status Summary */}
      {returns.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Return Summary</h4>
          <div className="flex flex-wrap gap-3 text-xs">
            {statusCounts.pending && (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-yellow-500" />
                <span className="text-yellow-700">{statusCounts.pending} Pending</span>
              </span>
            )}
            {statusCounts.approved && (
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-green-700">{statusCounts.approved} Approved</span>
              </span>
            )}
            {statusCounts.processing && (
              <span className="flex items-center space-x-1">
                <Package className="w-3 h-3 text-blue-500" />
                <span className="text-blue-700">{statusCounts.processing} Processing</span>
              </span>
            )}
            {statusCounts.completed && (
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span className="text-green-600">{statusCounts.completed} Completed</span>
              </span>
            )}
            {statusCounts.rejected && (
              <span className="flex items-center space-x-1">
                <XCircle className="w-3 h-3 text-red-500" />
                <span className="text-red-700">{statusCounts.rejected} Rejected</span>
              </span>
            )}
          </div>
        </div>
      )}

      {returns.map((returnRequest) => {
        const isExpanded = expandedReturns[returnRequest.id];
        return (
          <div key={returnRequest.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm shadow-teal-100 hover:shadow-md hover:shadow-teal-200 transition-shadow duration-200">
            {/* Accordion Header */}
            <button
              onClick={() => toggleAccordion(returnRequest.id)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-teal-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Return #{returnRequest.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {returnRequest.product_title} • {formatDate(returnRequest.requested_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(returnRequest.status)}`}>
                    {getStatusIcon(returnRequest.status)}
                    <span className="ml-1">{getStatusText(returnRequest.status)}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </button>

            {/* Accordion Content */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-4 space-y-4">

                  {/* Product Details */}
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm shadow-teal-50">
                    <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <span className="ml-1 font-medium">{returnRequest.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="ml-1 font-medium">{formatCurrency(returnRequest.unit_price)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="ml-1 font-medium">{formatCurrency(returnRequest.total_price)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Reason:</span>
                        <span className="ml-1 font-medium">{returnRequest.reason}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {returnRequest.customer_notes && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Your Notes:</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded p-3 shadow-sm shadow-teal-50">{returnRequest.customer_notes}</p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {returnRequest.admin_notes && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Admin Response:</h5>
                      <p className="text-sm text-gray-600 bg-blue-50 rounded p-3 shadow-sm shadow-teal-50">{returnRequest.admin_notes}</p>
                    </div>
                  )}

                  {/* Pickup Tracking */}
                  {(returnRequest.status === 'approved' || returnRequest.status === 'processing') && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-purple-800 flex items-center">
                          <Truck className="w-4 h-4 mr-1" />
                          Pickup Tracking
                        </h5>
                        <button
                          onClick={() => loadTrackingInfo(returnRequest.id)}
                          disabled={loadingTracking[returnRequest.id]}
                          className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${loadingTracking[returnRequest.id] ? 'animate-spin' : ''}`} />
                          Refresh
                        </button>
                      </div>
              
                      {loadingTracking[returnRequest.id] ? (
                        <div className="flex items-center text-sm text-purple-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                          Loading tracking information...
                        </div>
                      ) : trackingInfo[returnRequest.id] ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-purple-600 mr-2" />
                              <span className="text-purple-700">
                                <strong>Status:</strong> {trackingInfo[returnRequest.id].status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Truck className="w-4 h-4 text-purple-600 mr-2" />
                              <span className="text-purple-700">
                                <strong>Location:</strong> {trackingInfo[returnRequest.id].current_location}
                              </span>
                            </div>
                            {trackingInfo[returnRequest.id].estimated_delivery_date && (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-purple-600 mr-2" />
                                <span className="text-purple-700">
                                  <strong>ETA:</strong> {new Date(trackingInfo[returnRequest.id].estimated_delivery_date!).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Tracking History */}
                          {trackingInfo[returnRequest.id].tracking_history && trackingInfo[returnRequest.id].tracking_history.length > 0 && (
                            <div className="mt-3">
                              <h6 className="text-xs font-medium text-purple-800 mb-2">Tracking History:</h6>
                              <div className="space-y-2">
                                {trackingInfo[returnRequest.id].tracking_history.map((history, index) => (
                                  <div key={index} className="bg-white rounded p-2 text-xs shadow-sm shadow-teal-50">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="font-medium text-gray-800">{history.status}</span>
                                        <p className="text-gray-600">{history.description}</p>
                                      </div>
                                      <span className="text-gray-500 text-right">
                                        {new Date(history.timestamp).toLocaleDateString('en-IN', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <div className="text-gray-500 mt-1">
                                      📍 {history.location}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-purple-600">
                          <p>Pickup tracking information will be available once the pickup is scheduled.</p>
                          <p className="text-xs text-purple-500 mt-1">Contact support if you need immediate assistance.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Refund Information */}
                  {returnRequest.refund_amount && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-green-800 mb-2">Refund Information</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700">Refund Amount:</span>
                          <span className="ml-1 font-medium text-green-800">{formatCurrency(returnRequest.refund_amount)}</span>
                        </div>
                        {returnRequest.refund_method && (
                          <div>
                            <span className="text-green-700">Refund Method:</span>
                            <span className="ml-1 font-medium text-green-800">{returnRequest.refund_method}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Processing Date */}
                  {returnRequest.processed_at && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Processed on:</span> {formatDate(returnRequest.processed_at)}
                    </div>
                  )}

                  {/* Pending Review Status */}
                  {returnRequest.status === 'pending' && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Under Review
                      </h5>
                      <div className="space-y-2 text-sm text-yellow-700">
                        <p>Your return request is being reviewed by our team.</p>
                        <p>We'll notify you via email once your request is approved or if we need additional information.</p>
                        <p className="text-xs text-yellow-600 mt-2">
                          Expected review time: 1-2 business days
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {returnRequest.status === 'approved' && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">Next Steps:</h5>
                      <div className="flex items-center space-x-4 text-sm text-blue-700">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          <span>Package your item securely</span>
                        </div>
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 mr-1" />
                          <span>We'll arrange pickup</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReturnRequestsList;
