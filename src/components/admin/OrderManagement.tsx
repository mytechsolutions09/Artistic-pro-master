import React, { useState, useEffect } from 'react';
import { 
  Package, Calendar, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, 
  Search, RefreshCw, FileText, ChevronDown, ChevronUp
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
        <div className="space-y-3">
                {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Order Header */}
              <div 
                className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300"
                onClick={() => toggleOrderExpansion(order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {order.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">#{order.id.slice(-8)}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{order.customer_name}</p>
                        <p className="text-xs text-gray-500 font-mono">{order.customer_email}</p>
                      </div>
                        </div>
                      </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.total_amount, order.currency_code || 'INR')}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                          <select
                            value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                        className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                <div className="p-1 text-gray-400 hover:text-indigo-600 transition-colors">
                        {expandedOrders.has(order.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
                    </div>
                  </div>
                </div>

              {/* Order Details (Expandable) */}
              {expandedOrders.has(order.id) && (
                <div className="p-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Order Items */}
              <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <Package className="w-5 h-5 text-indigo-600 mr-2" />
                        Order Items
                      </h4>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-start space-x-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              {item.products?.main_image || item.product_image ? (
                                <img 
                                  src={item.products?.main_image || item.product_image} 
                                  alt={item.product_title}
                                  className="w-12 h-12 object-cover rounded-lg shadow-sm border border-gray-100"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shadow-sm';
                                      fallback.innerHTML = '<svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a7 7 0 00-7 7 7 7 0 007 7 7 7 0 007-7 7 7 0 00-7-7zm0 12a5 5 0 110-10 5 5 0 010 10z"/></svg>';
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shadow-sm">
                                  <Package className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                            </div>
                            
                            {/* Product Details */}
                      <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 mb-2 leading-tight">{item.product_title}</p>
                              
                              {/* Product Type & Details */}
                              <div className="space-y-1">
                                {/* Check if this is a clothing item by looking for options (color/size) or product title */}
                                {(() => {
                                  const isClothing = (item.selected_product_type === 'clothing') ||
                                                   (item.options && (item.options.color || item.options.size)) ||
                                                   (item.product_title && (
                                                     item.product_title.toLowerCase().includes('sweatshirt') ||
                                                     item.product_title.toLowerCase().includes('hoodie') ||
                                                     item.product_title.toLowerCase().includes('t-shirt') ||
                                                     item.product_title.toLowerCase().includes('shirt') ||
                                                     item.product_title.toLowerCase().includes('jacket') ||
                                                     item.product_title.toLowerCase().includes('sweater') ||
                                                     item.product_title.toLowerCase().includes('crewneck') ||
                                                     item.product_title.toLowerCase().includes('oversized')
                                                   ));
                                  
                                  // Debug logging - log ALL item data
                                  console.log('Order item data:', {
                                    id: item.id,
                                    product_title: item.product_title,
                                    selected_product_type: item.selected_product_type,
                                    selected_poster_size: item.selected_poster_size,
                                    options: item.options,
                                    quantity: item.quantity,
                                    isClothing: isClothing,
                                    full_item: item
                                  });
                                  
                                  if (isClothing && item.options && (item.options.color || item.options.size)) {
                                    // This is a clothing item with options - show color, size, and quantity as badges
                                    return (
                                      <div className="flex flex-wrap gap-1">
                                        {item.options.color && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300">
                                            🎨 {item.options.color}
                                          </span>
                                        )}
                                        {item.options.size && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                                            📏 {item.options.size}
                                          </span>
                                        )}
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300">
                                          📦 {item.quantity}
                                        </span>
                                      </div>
                                    );
                                  } else if (isClothing) {
                                    // Clothing item but no options data - check if size is in selected_poster_size (data corruption)
                                    const hasSizeInPosterSize = item.selected_poster_size && item.selected_product_type === 'poster';
                                    
                                    return (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                          Clothing
                                        </span>
                                        {hasSizeInPosterSize && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            Size: {item.selected_poster_size}
                                          </span>
                                        )}
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                          Qty: {item.quantity}
                                        </span>
                                        {hasSizeInPosterSize && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                            Data Issue
                                          </span>
                                        )}
                                      </div>
                                    );
                                  } else {
                                    // This is not a clothing item - show type and quantity
                                    return (
                                      <>
                                        <p className="text-xs text-gray-500">
                                          <span className="font-medium">Type:</span> {' '}
                                          <span className="capitalize">
                                            {item.selected_product_type === 'poster' ? 'Poster' : 'Digital'}
                                          </span>
                                        </p>
                                        {item.selected_product_type === 'poster' && item.selected_poster_size && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Size: {item.selected_poster_size}
                                          </span>
                                        )}
                                        <p className="text-xs text-gray-500">
                                          <span className="font-medium">Quantity:</span> {item.quantity}
                                        </p>
                                      </>
                                    );
                                  }
                                })()}
                              </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-gray-900">
                                {formatCurrency(item.total_price, order.currency_code || 'INR')}
                              </p>
                              <p className="text-xs text-gray-500 font-medium">
                                {formatCurrency(item.unit_price, order.currency_code || 'INR')} each
                              </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                    {/* Order Information */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                        Order Information
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {/* Payment Information */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 shadow-sm">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm font-bold text-blue-900">💳 Payment Details</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-700 font-medium">Method:</span>
                              <span className="text-blue-900 font-bold capitalize bg-blue-200 px-2 py-1 rounded-full">{order.payment_method}</span>
                            </div>
                            {order.payment_id && (
                              <div className="flex justify-between items-center">
                                <span className="text-blue-700 font-medium">Payment ID:</span>
                                <span className="text-blue-900 font-mono text-xs bg-blue-200 px-2 py-1 rounded-full border border-blue-300">{order.payment_id}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200 shadow-sm">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm font-bold text-green-900">⏰ Order Timeline</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Created:</span>
                              <span className="text-green-900 font-semibold bg-green-200 px-2 py-1 rounded-full">{new Date(order.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium">Updated:</span>
                              <span className="text-green-900 font-semibold bg-green-200 px-2 py-1 rounded-full">{new Date(order.updated_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Information */}
                        {order.shipping_address && (
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200 shadow-sm">
                            <div className="flex items-center mb-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                              <span className="text-sm font-bold text-purple-900">🚚 Shipping Address</span>
                            </div>
                            <p className="text-xs text-purple-900 leading-relaxed bg-purple-200 px-3 py-2 rounded-lg border border-purple-300">{order.shipping_address}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {order.notes && (
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200 shadow-sm">
                            <div className="flex items-center mb-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                              <span className="text-sm font-bold text-orange-900">📝 Notes</span>
                            </div>
                            <p className="text-xs text-orange-900 leading-relaxed bg-orange-200 px-3 py-2 rounded-lg border border-orange-300">{order.notes}</p>
                          </div>
                        )}
            </div>
          </div>
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
