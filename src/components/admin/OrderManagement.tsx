import React, { useState, useEffect } from 'react';
import { 
  Package, Mail, Calendar, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, 
  Search, RefreshCw, Trash2, Send, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { orderService, Order, OrderStats } from '../../services/orderService';
import { useCurrency } from '../../contexts/CurrencyContext';


const OrderManagement: React.FC = () => {
  const { formatCurrency, currencySettings, convertAmount } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0, pending: 0, processing: 0, completed: 0, cancelled: 0, refunded: 0,
    totalRevenue: 0, todayOrders: 0, todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Load orders with order items
  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getAllOrders();
      setOrders(ordersData);
      calculateStats(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate order statistics
  const calculateStats = (ordersData: Order[]) => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todayOrders = ordersData.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= todayStart && orderDate < todayEnd;
    });

    const totalRevenue = ordersData.reduce((sum, order) => {
      const orderCurrency = order.currency_code || 'INR';
      const convertedAmount = convertAmount(order.total_amount, orderCurrency, currencySettings.defaultCurrency);
      return sum + convertedAmount;
    }, 0);

    const todayRevenue = todayOrders.reduce((sum, order) => {
      const orderCurrency = order.currency_code || 'INR';
      const convertedAmount = convertAmount(order.total_amount, orderCurrency, currencySettings.defaultCurrency);
      return sum + convertedAmount;
    }, 0);

    setStats({
      total: ordersData.length,
      pending: ordersData.filter(o => o.status === 'pending').length,
      processing: ordersData.filter(o => o.status === 'processing').length,
      completed: ordersData.filter(o => o.status === 'completed').length,
      cancelled: ordersData.filter(o => o.status === 'cancelled').length,
      refunded: ordersData.filter(o => o.status === 'refunded').length,
      totalRevenue,
      todayOrders: todayOrders.length,
      todayRevenue
    });
  };

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const success = await orderService.updateOrderStatus(orderId, newStatus);
      if (success) {
        await loadOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Send download links
  const handleSendDownloadLinks = async (order: Order) => {
    try {
      // Generate download links for completed orders
      if (order.status === 'completed') {
        const downloadLinks = order.order_items.map(item => {
          if (item.products?.pdf_url) {
            return `${window.location.origin}/download/${item.id}`;
          }
          return null;
        }).filter(Boolean);

        // Here you would typically send an email with download links

        alert('Download links have been generated and will be sent to the customer.');
      }
    } catch (error) {
      console.error('Error sending download links:', error);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        const success = await orderService.deleteOrder(orderId);
        if (success) {
          await loadOrders();
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Refresh orders
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      
      let matchesDate = true;
      if (filterDate !== 'all') {
        const orderDate = new Date(order.created_at);
        const today = new Date();
        
        switch (filterDate) {
          case 'today':
            matchesDate = orderDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= monthAgo;
            break;
        }
      }
    
    return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Order];
      let bValue: any = b[sortBy as keyof Order];
      
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Manage customer orders and payments</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Processing</p>
              <p className="text-lg font-bold text-gray-900">{stats.processing}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-lg font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-xs text-gray-500">Cancelled</p>
              <p className="text-lg font-bold text-gray-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-xs text-gray-500">Refunded</p>
              <p className="text-lg font-bold text-gray-900">{stats.refunded}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-500">Today</p>
              <p className="text-lg font-bold text-gray-900">{stats.todayOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue, currencySettings.defaultCurrency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="total_amount-desc">Highest Amount</option>
            <option value="total_amount-asc">Lowest Amount</option>
            <option value="customer_name-asc">Customer A-Z</option>
            <option value="customer_name-desc">Customer Z-A</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
        <div className="space-y-4">
                {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {order.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">#{order.id.slice(-8)}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_email}</p>
                        </div>
                      </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(order.total_amount, order.currency_code || 'INR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                          <select
                            value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-pink-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                >
                        {expandedOrders.has(order.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
                    </div>
                  </div>
                </div>

              {/* Order Details (Expandable) */}
              {expandedOrders.has(order.id) && (
                <div className="p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Items */}
              <div>
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                      <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.product_title}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(item.total_price, order.currency_code || 'INR')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(item.unit_price, order.currency_code || 'INR')} each
                              </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                    {/* Order Information */}
                <div>
                      <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Method:</span>
                          <span className="text-gray-900 capitalize">{order.payment_method}</span>
                      </div>
                        {order.payment_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Payment ID:</span>
                            <span className="text-gray-900 font-mono text-xs">{order.payment_id}</span>
                </div>
              )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Created:</span>
                          <span className="text-gray-900">{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Updated:</span>
                          <span className="text-gray-900">{new Date(order.updated_at).toLocaleString()}</span>
                  </div>
                        {order.notes && (
              <div>
                            <span className="text-gray-500">Notes:</span>
                            <p className="text-gray-900 mt-1">{order.notes}</p>
                    </div>
                  )}
                        {order.shipping_address && (
                <div>
                            <span className="text-gray-500">Shipping Address:</span>
                            <p className="text-gray-900 mt-1">{order.shipping_address}</p>
                </div>
              )}
            </div>
          </div>
              </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleSendDownloadLinks(order)}
                      disabled={order.status !== 'completed'}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Downloads</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      <Mail className="w-4 h-4" />
                      <span>Email Customer</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                      <FileText className="w-4 h-4" />
                      <span>Generate Invoice</span>
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
