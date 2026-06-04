'use client'

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  Eye,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  X as XIcon,
  RefreshCw,
} from 'lucide-react';
import { ReturnService, ReturnRequestData } from '../../services/returnService';
import AdminLayout from '../../components/admin/AdminLayout';

const inputCls =
  'h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

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
    specialInstructions: '',
  });
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [expandedReturns, setExpandedReturns] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      const returnRequests = await ReturnService.getAllReturns();
      setReturns(returnRequests);
    } catch (e) {
      console.error('Error loading returns:', e);
      setError('Failed to load return requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReturns();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (
    returnId: string,
    newStatus: 'approved' | 'rejected' | 'processing' | 'completed'
  ) => {
    try {
      const result = await ReturnService.updateReturnStatus(
        returnId,
        newStatus,
        adminNotes,
        refundAmount || undefined,
        refundMethod || undefined
      );

      if (result.success) {
        await loadReturns();
        setShowModal(false);
        setSelectedReturn(null);
        setAdminNotes('');
        setRefundAmount(0);
        setRefundMethod('');
      } else {
        alert('Failed to update return status: ' + result.error);
      }
    } catch (e) {
      console.error('Error updating return status:', e);
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
          pincode: pickupDetails.customerPincode,
        },
        {
          date: pickupDetails.pickupDate,
          timeSlot: pickupDetails.timeSlot,
          specialInstructions: pickupDetails.specialInstructions,
        }
      );

      if (result.success) {
        alert(`Pickup scheduled. Tracking: ${result.trackingNumber}`);
        await loadReturns();
        setShowPickupModal(false);
        setSelectedReturn(null);
        setPickupDetails({
          customerName: '',
          customerPhone: '',
          customerAddress: '',
          customerCity: '',
          customerState: '',
          customerPincode: '',
          pickupDate: '',
          timeSlot: '',
          specialInstructions: '',
        });
      } else {
        alert('Failed to schedule pickup: ' + result.error);
      }
    } catch (e) {
      console.error('Error scheduling pickup:', e);
      alert('Failed to schedule pickup');
    }
  };

  const loadTimeSlots = async (pincode: string, date: string) => {
    if (pincode && date) {
      try {
        const slots = await ReturnService.getPickupTimeSlots(pincode, date);
        setTimeSlots(slots);
      } catch (e) {
        console.error('Error loading time slots:', e);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    const cls = 'w-3 h-3 shrink-0';
    switch (status) {
      case 'pending':
        return <Clock className={`${cls} text-amber-600`} />;
      case 'approved':
        return <CheckCircle className={`${cls} text-green-600`} />;
      case 'rejected':
        return <XCircle className={`${cls} text-red-600`} />;
      case 'processing':
        return <Package className={`${cls} text-blue-600`} />;
      case 'completed':
        return <CheckCircle className={`${cls} text-green-700`} />;
      default:
        return <Clock className={`${cls} text-gray-500`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-600/20';
      case 'approved':
        return 'bg-green-50 text-green-900 ring-1 ring-inset ring-green-600/20';
      case 'rejected':
        return 'bg-red-50 text-red-900 ring-1 ring-inset ring-red-600/20';
      case 'processing':
        return 'bg-blue-50 text-blue-900 ring-1 ring-inset ring-blue-600/20';
      case 'completed':
        return 'bg-green-50 text-green-900 ring-1 ring-inset ring-green-700/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const toggleAccordion = (returnId: string) => {
    setExpandedReturns((prev) => ({
      ...prev,
      [returnId]: !prev[returnId],
    }));
  };

  const filteredReturns = returns.filter((returnRequest) => {
    const matchesStatus = statusFilter === 'all' || returnRequest.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      returnRequest.product_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnRequest.requested_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnRequest.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnRequest.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnRequest.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const requestDate = new Date(returnRequest.requested_at);
    const matchesStartDate = !startDate || requestDate >= new Date(startDate);
    const matchesEndDate = !endDate || requestDate <= new Date(endDate + 'T23:59:59');
    return matchesStatus && matchesSearch && matchesStartDate && matchesEndDate;
  });

  const statusCounts = {
    all: returns.length,
    pending: returns.filter((r) => r.status === 'pending').length,
    approved: returns.filter((r) => r.status === 'approved').length,
    processing: returns.filter((r) => r.status === 'processing').length,
    completed: returns.filter((r) => r.status === 'completed').length,
    rejected: returns.filter((r) => r.status === 'rejected').length,
  };

  const statItems: { label: string; value: number; Icon: typeof RotateCcw; iconClass: string }[] = [
    { label: 'Total', value: statusCounts.all, Icon: RotateCcw, iconClass: 'text-blue-600' },
    { label: 'Pending', value: statusCounts.pending, Icon: Clock, iconClass: 'text-amber-600' },
    { label: 'Approved', value: statusCounts.approved, Icon: CheckCircle, iconClass: 'text-green-600' },
    { label: 'Processing', value: statusCounts.processing, Icon: Package, iconClass: 'text-blue-600' },
    { label: 'Done', value: statusCounts.completed, Icon: CheckCircle, iconClass: 'text-teal-600' },
    { label: 'Rejected', value: statusCounts.rejected, Icon: XCircle, iconClass: 'text-red-600' },
  ];

  if (loading) {
    return (
      <AdminLayout title="Returns">
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
          Loading returns…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Returns">
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Review and process return requests</p>

        <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-gray-50/90 p-2">
          {statItems.map(({ label, value, Icon, iconClass }) => (
            <div
              key={label}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1"
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} />
              <span className="text-[11px] text-gray-500">{label}</span>
              <span className="text-xs font-semibold tabular-nums text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Product, customer, ID, order, reason…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputCls} w-full pl-7 pr-7`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
            <span className="text-[11px] text-gray-400">–</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="inline-flex h-8 items-center px-2 text-xs text-gray-600 hover:text-gray-900"
              >
                Clear dates
              </button>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="ml-auto inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-gray-100 pt-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Status</span>
            <span className="text-[10px] text-gray-400">
              ({filteredReturns.length}/{returns.length})
            </span>
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            ))}
          </div>

          {(searchQuery || startDate || endDate) && (
            <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-gray-100 pt-2 text-[10px] text-gray-500">
              <span>Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-0.5 rounded bg-gray-100 px-1.5 py-0.5">
                  “{searchQuery.slice(0, 24)}
                  {searchQuery.length > 24 ? '…' : ''}”
                  <button type="button" onClick={() => setSearchQuery('')} className="text-gray-600 hover:text-gray-900">
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {startDate && <span>From {new Date(startDate).toLocaleDateString('en-IN')}</span>}
              {endDate && <span>To {new Date(endDate).toLocaleDateString('en-IN')}</span>}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-red-600 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {error && (
            <div className="border-b border-red-100 bg-red-50 px-3 py-2">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {filteredReturns.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <RotateCcw className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-800">No returns</p>
              <p className="text-xs text-gray-500">
                {statusFilter === 'all' ? 'No requests match.' : `No ${statusFilter} requests.`}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredReturns.map((returnRequest) => {
                const isExpanded = expandedReturns[returnRequest.id];
                return (
                  <li key={returnRequest.id} className="bg-white">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(returnRequest.id)}
                      className="flex w-full items-center gap-2 p-2 text-left hover:bg-gray-50 sm:gap-3 sm:p-2.5"
                    >
                      <RotateCcw className="h-4 w-4 shrink-0 text-gray-500" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-gray-900">
                            #{returnRequest.id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${getStatusColor(returnRequest.status)}`}
                          >
                            {getStatusIcon(returnRequest.status)}
                            {returnRequest.status}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-gray-600">
                          {returnRequest.product_title} · {returnRequest.requested_by.split('@')[0]} ·{' '}
                          {formatDate(returnRequest.requested_at).split(',')[0]}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/80 px-2.5 pb-2.5 pt-2">
                        <div className="space-y-2 text-xs">
                          <div className="rounded-md border border-gray-200 bg-white p-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Product</p>
                            <div className="mt-1 grid gap-1 sm:grid-cols-3">
                              <p className="text-gray-800">
                                <span className="text-gray-500">Title: </span>
                                {returnRequest.product_title}
                              </p>
                              <p className="text-gray-800 tabular-nums">
                                <span className="text-gray-500">Line: </span>
                                {returnRequest.quantity} × {formatCurrency(returnRequest.unit_price)} ={' '}
                                {formatCurrency(returnRequest.total_price)}
                              </p>
                              <p className="font-mono text-gray-800">
                                <span className="text-gray-500">Order: </span>
                                {returnRequest.order_id.slice(-8)}
                              </p>
                            </div>
                          </div>
                          <div className="grid gap-1 sm:grid-cols-2">
                            <p className="text-gray-800">
                              <span className="text-gray-500">Customer: </span>
                              {returnRequest.requested_by}
                            </p>
                            <p className="text-gray-800">
                              <span className="text-gray-500">Reason: </span>
                              {returnRequest.reason}
                            </p>
                          </div>
                          {returnRequest.customer_notes && (
                            <div className="rounded border border-gray-200 bg-white p-2">
                              <p className="text-[10px] font-medium text-gray-500">Customer notes</p>
                              <p className="mt-0.5 text-gray-700">{returnRequest.customer_notes}</p>
                            </div>
                          )}
                          {returnRequest.admin_notes && (
                            <div className="rounded border border-gray-200 bg-white p-2">
                              <p className="text-[10px] font-medium text-gray-500">Admin notes</p>
                              <p className="mt-0.5 text-gray-700">{returnRequest.admin_notes}</p>
                            </div>
                          )}
                          {returnRequest.refund_amount != null && returnRequest.refund_amount > 0 && (
                            <div className="rounded border border-green-200 bg-green-50/50 p-2">
                              <p className="text-[10px] font-semibold text-green-900">Refund</p>
                              <p className="text-green-900 tabular-nums">
                                {formatCurrency(returnRequest.refund_amount)}
                                {returnRequest.refund_method && ` · ${returnRequest.refund_method}`}
                              </p>
                            </div>
                          )}
                          <div className="flex justify-end pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReturn(returnRequest);
                                setAdminNotes(returnRequest.admin_notes || '');
                                setRefundAmount(returnRequest.refund_amount || 0);
                                setRefundMethod(returnRequest.refund_method || '');
                                setShowModal(true);
                              }}
                              className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Manage
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {showModal && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg sm:max-w-xl"
            role="dialog"
            aria-labelledby="return-modal-title"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <h2 id="return-modal-title" className="text-sm font-semibold text-gray-900">
                Return #{selectedReturn.id.slice(-8).toUpperCase()}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-3">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-2 text-xs">
                <div className="grid gap-1 sm:grid-cols-2">
                  <p>
                    <span className="text-gray-500">Product: </span>
                    {selectedReturn.product_title}
                  </p>
                  <p>
                    <span className="text-gray-500">Customer: </span>
                    {selectedReturn.requested_by}
                  </p>
                  <p>
                    <span className="text-gray-500">Reason: </span>
                    {selectedReturn.reason}
                  </p>
                  <p className="tabular-nums">
                    <span className="text-gray-500">Amount: </span>
                    {formatCurrency(selectedReturn.total_price)}
                  </p>
                  <p>
                    <span className="text-gray-500">Requested: </span>
                    {formatDate(selectedReturn.requested_at)}
                  </p>
                  <p className="capitalize">
                    <span className="text-gray-500">Status: </span>
                    {selectedReturn.status}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-600">Admin notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  placeholder="Internal notes…"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-600">Refund (₹)</label>
                  <input
                    type="number"
                    value={refundAmount || ''}
                    onChange={(e) => setRefundAmount(parseInt(e.target.value, 10) || 0)}
                    className={inputCls + ' w-full'}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-600">Method</label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className={inputCls + ' w-full'}
                  >
                    <option value="">Select</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Store Credit">Store Credit</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-2">
                {selectedReturn.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'approved')}
                      className="inline-flex flex-1 min-w-[6rem] items-center justify-center gap-1 rounded-md bg-green-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'rejected')}
                      className="inline-flex flex-1 min-w-[6rem] items-center justify-center gap-1 rounded-md bg-red-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </>
                )}

                {selectedReturn.status === 'approved' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowPickupModal(true)}
                      className="inline-flex flex-1 min-w-[7rem] items-center justify-center gap-1 rounded-md bg-violet-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      Schedule pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(selectedReturn.id, 'processing')}
                      className="inline-flex flex-1 min-w-[7rem] items-center justify-center gap-1 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      <Package className="h-3.5 w-3.5" />
                      Processing
                    </button>
                  </>
                )}

                {selectedReturn.status === 'processing' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(selectedReturn.id, 'completed')}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-green-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Complete
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPickupModal && selectedReturn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg sm:max-w-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Pickup · #{selectedReturn.id.slice(-8).toUpperCase()}
              </h2>
              <button
                type="button"
                onClick={() => setShowPickupModal(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-3">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
                <h3 className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-gray-800">
                  <MapPin className="h-3.5 w-3.5" />
                  Customer
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="mb-0.5 block text-[10px] font-medium text-gray-600">Name *</label>
                    <input
                      type="text"
                      value={pickupDetails.customerName}
                      onChange={(e) =>
                        setPickupDetails({ ...pickupDetails, customerName: e.target.value })
                      }
                      className={inputCls + ' w-full'}
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] font-medium text-gray-600">Phone *</label>
                    <input
                      type="tel"
                      value={pickupDetails.customerPhone}
                      onChange={(e) =>
                        setPickupDetails({ ...pickupDetails, customerPhone: e.target.value })
                      }
                      className={inputCls + ' w-full'}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-0.5 block text-[10px] font-medium text-gray-600">Address *</label>
                    <textarea
                      value={pickupDetails.customerAddress}
                      onChange={(e) =>
                        setPickupDetails({ ...pickupDetails, customerAddress: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] font-medium text-gray-600">City *</label>
                    <input
                      type="text"
                      value={pickupDetails.customerCity}
                      onChange={(e) =>
                        setPickupDetails({ ...pickupDetails, customerCity: e.target.value })
                      }
                      className={inputCls + ' w-full'}
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] font-medium text-gray-600">State *</label>
                    <input
                      type="text"
                      value={pickupDetails.customerState}
                      onChange={(e) =>
                        setPickupDetails({ ...pickupDetails, customerState: e.target.value })
                      }
                      className={inputCls + ' w-full'}
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] font-medium text-gray-600">Pincode *</label>
                    <input
                      type="text"
                      value={pickupDetails.customerPincode}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPickupDetails({ ...pickupDetails, customerPincode: v });
                        if (v && pickupDetails.pickupDate) {
                          loadTimeSlots(v, pickupDetails.pickupDate);
                        }
                      }}
                      className={inputCls + ' w-full'}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-gray-200 p-2">
                <h3 className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-gray-800">
                  <Calendar className="h-3.5 w-3.5" />
                  Schedule
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="mb-0.5 block text-[10px] font-medium text-gray-600">Date *</label>
                    <input
                      type="date"
                      value={pickupDetails.pickupDate}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPickupDetails({ ...pickupDetails, pickupDate: v });
                        if (v && pickupDetails.customerPincode) {
                          loadTimeSlots(pickupDetails.customerPincode, v);
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className={inputCls + ' w-full'}
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-[10px] font-medium text-gray-600">Slot *</label>
                    <select
                      value={pickupDetails.timeSlot}
                      onChange={(e) =>
                        setPickupDetails({ ...pickupDetails, timeSlot: e.target.value })
                      }
                      className={inputCls + ' w-full'}
                    >
                      <option value="">Select</option>
                      {timeSlots.map((slot, index) => (
                        <option key={index} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-0.5 block text-[10px] font-medium text-gray-600">Instructions</label>
                    <textarea
                      value={pickupDetails.specialInstructions}
                      onChange={(e) =>
                        setPickupDetails({
                          ...pickupDetails,
                          specialInstructions: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-2">
                <button
                  type="button"
                  onClick={handleSchedulePickup}
                  disabled={
                    !pickupDetails.customerName ||
                    !pickupDetails.customerPhone ||
                    !pickupDetails.customerAddress ||
                    !pickupDetails.customerCity ||
                    !pickupDetails.customerState ||
                    !pickupDetails.customerPincode ||
                    !pickupDetails.pickupDate ||
                    !pickupDetails.timeSlot
                  }
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-violet-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Truck className="h-3.5 w-3.5" />
                  Confirm pickup
                </button>
                <button
                  type="button"
                  onClick={() => setShowPickupModal(false)}
                  className="inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Returns;
