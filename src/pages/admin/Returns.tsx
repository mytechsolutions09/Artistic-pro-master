import React, { useState, useEffect } from 'react';
import { RotateCcw, Clock, CheckCircle, XCircle, Package, Truck, Eye, MessageSquare, DollarSign, Calendar, MapPin, ChevronDown, ChevronUp, Search, X as XIcon } from 'lucide-react';
import { ReturnService, ReturnRequestData } from '../../services/returnService';
import AdminLayout from '../../components/admin/AdminLayout';

const Returns: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequestData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState<string>('');
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupDetails, setPickupDetails] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerState: '',
    customerPincode: '',
    pickupDate: '',
    timeSlot: '',
    specialInstructions: ''
  });
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [expandedReturns, setExpandedReturns] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const returnRequests = await ReturnService.getAllReturns();
      setReturns(returnRequests);
    } catch (error) {
      console.error('Error loading returns:', error);
      setError('Failed to load return requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (returnId: string, newStatus: string) => {
    try {
      const result = await ReturnService.updateReturnStatus(
        returnId,
        newStatus as any,
        adminNotes,
        refundAmount || undefined,
        refundMethod || undefined
      );

      if (result.success) {
        await loadReturns(); // Refresh the list
        setShowModal(false);
        setSelectedReturn(null);
        setAdminNotes('');
        setRefundAmount(0);
        setRefundMethod('');
      } else {
        alert('Failed to update return status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating return status:', error);
      alert('Failed to update return status');
    }
  };

  const handleSchedulePickup = async () => {
    if (!selectedReturn) return;

    try {
      const result = await ReturnService.scheduleReturnPickup(
        selectedReturn.id,
        {
          name: pickupDetails.customerName,
          phone: pickupDetails.customerPhone,
          address: pickupDetails.customerAddress,
          city: pickupDetails.customerCity,
          state: pickupDetails.customerState,
          pincode: pickupDetails.customerPincode
        },
        {
          date: pickupDetails.pickupDate,
          timeSlot: pickupDetails.timeSlot,
          specialInstructions: pickupDetails.specialInstructions
        }
      );

      if (result.success) {
        alert(`Pickup scheduled successfully! Tracking Number: ${result.trackingNumber}`);
        await loadReturns();
        setShowPickupModal(false);
        setSelectedReturn(null);
        // Reset pickup details
        setPickupDetails({
          customerName: '',
          customerPhone: '',
          customerAddress: '',
          customerCity: '',
          customerState: '',
          customerPincode: '',
          pickupDate: '',
          timeSlot: '',
          specialInstructions: ''
        });
      } else {
        alert('Failed to schedule pickup: ' + result.error);
      }
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      alert('Failed to schedule pickup');
    }
  };

  const loadTimeSlots = async (pincode: string, date: string) => {
    if (pincode && date) {
      try {
        const slots = await ReturnService.getPickupTimeSlots(pincode, date);
        setTimeSlots(slots);
      } catch (error) {
        console.error('Error loading time slots:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'processing':
        return <Package className="w-3 h-3 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      default:
        return <Clock className="w-3 h-3 text-gray-500" />;
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

  const filteredReturns = returns.filter(returnRequest => {
    // Status filter
    const matchesStatus = statusFilter === 'all' || returnRequest.status === statusFilter;
    
    // Search filter (search in product title, customer email, return ID, order ID)
    const matchesSearch = !searchQuery || 
      returnRequest.product_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnRequest.requested_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnRequest.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnRequest.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnRequest.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Date filter
    const requestDate = new Date(returnRequest.requested_at);
    const matchesStartDate = !startDate || requestDate >= new Date(startDate);
    const matchesEndDate = !endDate || requestDate <= new Date(endDate + 'T23:59:59');
    
    return matchesStatus && matchesSearch && matchesStartDate && matchesEndDate;
  });

  const statusCounts = {
    all: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    processing: returns.filter(r => r.status === 'processing').length,
    completed: returns.filter(r => r.status === 'completed').length,
    rejected: returns.filter(r => r.status === 'rejected').length
  };

  if (loading) {
    return (
      <AdminLayout title="Returns">
        <div className="p-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-2 text-gray-600">Loading return requests...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Returns">
      <div className="p-3 space-y-3">
        {/* Statistics Subbar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <div className="bg-white p-2 rounded border border-gray-100">
            <div className="flex items-center space-x-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <div>
                <p className="text-[10px] text-gray-500">Total</p>
                <p className="text-base font-bold text-gray-900">{statusCounts.all}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded border border-gray-100">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-yellow-600" />
              <div>
                <p className="text-[10px] text-gray-500">Pending</p>
                <p className="text-base font-bold text-gray-900">{statusCounts.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded border border-gray-100">
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <div>
                <p className="text-[10px] text-gray-500">Approved</p>
                <p className="text-base font-bold text-gray-900">{statusCounts.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded border border-gray-100">
            <div className="flex items-center space-x-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              <div>
                <p className="text-[10px] text-gray-500">Processing</p>
                <p className="text-base font-bold text-gray-900">{statusCounts.processing}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded border border-gray-100">
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
              <div>
                <p className="text-[10px] text-gray-500">Completed</p>
                <p className="text-base font-bold text-gray-900">{statusCounts.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded border border-gray-100">
            <div className="flex items-center space-x-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <div>
                <p className="text-[10px] text-gray-500">Rejected</p>
                <p className="text-base font-bold text-gray-900">{statusCounts.rejected}</p>
              </div>
            </div>
          </div>
        </div>

      {/* Search and Date Filter */}
      <div className="bg-white rounded-lg shadow-sm p-2.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Search Bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, customer, return ID, order ID, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Start Date"
              />
            </div>
            <span className="text-xs text-gray-500">to</span>
            <div className="flex-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                placeholder="End Date"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-gray-400 hover:text-gray-600"
                title="Clear dates"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || startDate || endDate) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-500">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-800">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-teal-900"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {startDate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                From: {new Date(startDate).toLocaleDateString('en-IN')}
                <button
                  onClick={() => setStartDate('')}
                  className="ml-1 hover:text-blue-900"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {endDate && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                To: {new Date(endDate).toLocaleDateString('en-IN')}
                <button
                  onClick={() => setEndDate('')}
                  className="ml-1 hover:text-blue-900"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-sm p-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-gray-900">Status Filter</h2>
            <span className="text-xs text-gray-500">
              ({filteredReturns.length} of {returns.length} returns)
            </span>
          </div>
          <button
            onClick={loadReturns}
            className="bg-teal-600 text-white px-2.5 py-1 rounded text-xs hover:bg-teal-700 transition-colors"
          >
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      <div className="bg-white rounded-lg shadow-sm">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {filteredReturns.length === 0 ? (
          <div className="p-8 text-center">
            <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Return Requests</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'No return requests found.' 
                : `No ${statusFilter} return requests found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredReturns.map((returnRequest) => {
              const isExpanded = expandedReturns[returnRequest.id];
              return (
                <div key={returnRequest.id} className="bg-white border border-gray-200 rounded overflow-hidden">
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleAccordion(returnRequest.id)}
                    className="w-full p-2.5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-teal-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 text-teal-600" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            #{returnRequest.id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-xs text-gray-600 truncate max-w-xl">
                            {returnRequest.product_title} • {returnRequest.requested_by.split('@')[0]} • {formatDate(returnRequest.requested_at).split(',')[0]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(returnRequest.status)}`}>
                          {getStatusIcon(returnRequest.status)}
                          <span className="ml-1">{returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 border-t border-gray-100">
                      <div className="pt-2.5 space-y-2">
                        {/* Product Details */}
                        <div className="bg-gray-50 rounded p-2">
                          <h4 className="text-xs font-medium text-gray-900 mb-1">Product Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600">Product:</span>
                              <span className="ml-1 font-medium">{returnRequest.product_title}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Qty:</span>
                              <span className="ml-1 font-medium">{returnRequest.quantity} × {formatCurrency(returnRequest.unit_price)} = {formatCurrency(returnRequest.total_price)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Order:</span>
                              <span className="ml-1 font-medium">{returnRequest.order_id.slice(-8)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Customer:</span>
                            <span className="ml-1 font-medium">{returnRequest.requested_by}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Reason:</span>
                            <span className="ml-1 font-medium">{returnRequest.reason}</span>
                          </div>
                        </div>

                        {/* Customer Notes */}
                        {returnRequest.customer_notes && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-700 mb-0.5">Customer Notes:</h5>
                            <p className="text-xs text-gray-600 bg-gray-50 rounded p-2">{returnRequest.customer_notes}</p>
                          </div>
                        )}

                        {/* Admin Notes */}
                        {returnRequest.admin_notes && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-700 mb-0.5">Admin Notes:</h5>
                            <p className="text-xs text-gray-600 bg-blue-50 rounded p-2">{returnRequest.admin_notes}</p>
                          </div>
                        )}

                        {/* Refund Information */}
                        {returnRequest.refund_amount && (
                          <div className="bg-green-50 rounded p-2">
                            <h5 className="text-xs font-medium text-green-800 mb-1">Refund Info</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-green-700">Amount:</span>
                                <span className="ml-1 font-medium text-green-800">{formatCurrency(returnRequest.refund_amount)}</span>
                              </div>
                              {returnRequest.refund_method && (
                                <div>
                                  <span className="text-green-700">Method:</span>
                                  <span className="ml-1 font-medium text-green-800">{returnRequest.refund_method}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedReturn(returnRequest);
                              setAdminNotes(returnRequest.admin_notes || '');
                              setRefundAmount(returnRequest.refund_amount || 0);
                              setRefundMethod(returnRequest.refund_method || '');
                              setShowModal(true);
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Manage</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Managing Return */}
      {showModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Manage Return #{selectedReturn.id.slice(-8).toUpperCase()}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Return Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Return Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Product:</strong> {selectedReturn.product_title}</p>
                    <p><strong>Customer:</strong> {selectedReturn.requested_by}</p>
                    <p><strong>Reason:</strong> {selectedReturn.reason}</p>
                  </div>
                  <div>
                    <p><strong>Amount:</strong> {formatCurrency(selectedReturn.total_price)}</p>
                    <p><strong>Requested:</strong> {formatDate(selectedReturn.requested_at)}</p>
                    <p><strong>Current Status:</strong> {selectedReturn.status}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Add notes about this return request..."
                />
              </div>

              {/* Refund Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Method
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select method</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Store Credit">Store Credit</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                {selectedReturn.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                
                {selectedReturn.status === 'approved' && (
                  <>
                    <button
                      onClick={() => setShowPickupModal(true)}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Schedule Pickup</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'processing')}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Package className="w-4 h-4" />
                      <span>Start Processing</span>
                    </button>
                  </>
                )}

                {selectedReturn.status === 'processing' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedReturn.id, 'completed')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete</span>
                  </button>
                )}

                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Scheduling Modal */}
      {showPickupModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Schedule Return Pickup - #{selectedReturn.id.slice(-8).toUpperCase()}
              </h2>
              <button
                onClick={() => setShowPickupModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Customer Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={pickupDetails.customerName}
                      onChange={(e) => setPickupDetails({...pickupDetails, customerName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={pickupDetails.customerPhone}
                      onChange={(e) => setPickupDetails({...pickupDetails, customerPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      value={pickupDetails.customerAddress}
                      onChange={(e) => setPickupDetails({...pickupDetails, customerAddress: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter full address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={pickupDetails.customerCity}
                      onChange={(e) => setPickupDetails({...pickupDetails, customerCity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={pickupDetails.customerState}
                      onChange={(e) => setPickupDetails({...pickupDetails, customerState: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={pickupDetails.customerPincode}
                      onChange={(e) => {
                        setPickupDetails({...pickupDetails, customerPincode: e.target.value});
                        // Load time slots when pincode and date are available
                        if (e.target.value && pickupDetails.pickupDate) {
                          loadTimeSlots(e.target.value, pickupDetails.pickupDate);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Scheduling */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Pickup Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      value={pickupDetails.pickupDate}
                      onChange={(e) => {
                        setPickupDetails({...pickupDetails, pickupDate: e.target.value});
                        // Load time slots when pincode and date are available
                        if (e.target.value && pickupDetails.customerPincode) {
                          loadTimeSlots(pickupDetails.customerPincode, e.target.value);
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slot *
                    </label>
                    <select
                      value={pickupDetails.timeSlot}
                      onChange={(e) => setPickupDetails({...pickupDetails, timeSlot: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((slot, index) => (
                        <option key={index} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions
                    </label>
                    <textarea
                      value={pickupDetails.specialInstructions}
                      onChange={(e) => setPickupDetails({...pickupDetails, specialInstructions: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Any special instructions for pickup..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSchedulePickup}
                  disabled={!pickupDetails.customerName || !pickupDetails.customerPhone || !pickupDetails.customerAddress || !pickupDetails.customerCity || !pickupDetails.customerState || !pickupDetails.customerPincode || !pickupDetails.pickupDate || !pickupDetails.timeSlot}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Schedule Pickup</span>
                </button>
                <button
                  onClick={() => setShowPickupModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default Returns;
