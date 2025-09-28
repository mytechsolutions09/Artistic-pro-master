import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  DollarSign, Users, ShoppingBag, TrendingUp, Eye, Download, Star, 
  Calendar, Clock, Bell, Settings, Plus, ArrowRight, Filter, Search,
  CheckCircle, AlertCircle, XCircle, Activity, CreditCard, Package,
  UserPlus, ShoppingCart, Heart, MessageSquare, Image, Palette, RefreshCw,
  Zap, Target, BarChart3, PieChart as PieChartIcon, TrendingDown, CheckSquare
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AnalyticsService, TaskService, UserService, ProductService } from '../../services/supabaseService';
import { useCurrency } from '../../contexts/CurrencyContext';

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [realtimeStats, setRealtimeStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { currencySettings, convertAmount, formatCurrency } = useCurrency();

  // Helper function to convert amounts to default currency
  const convertAmountToDefault = (amount: number, fromCurrency: string = 'USD') => {
    return convertAmount(amount, fromCurrency, currencySettings.defaultCurrency);
  };

  // Helper function to format amounts in default currency
  const formatAmountInDefault = (amount: number, fromCurrency: string = 'USD') => {
    const convertedAmount = convertAmountToDefault(amount, fromCurrency);
    return formatCurrency(convertedAmount, currencySettings.defaultCurrency);
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [analytics, realtime, orders, categories] = await Promise.all([
        AnalyticsService.getDashboardData(),
        AnalyticsService.getRealtimeStats(),
        AnalyticsService.getRecentOrders(4),
        AnalyticsService.getCategoryAnalytics()
      ]);
      setDashboardData(analytics);
      setRealtimeStats(realtime);
      setRecentOrders(orders);
      setCategoryData(categories);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      AnalyticsService.getRealtimeStats().then(setRealtimeStats);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh data based on time range
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const getMainStats = () => {
    if (!dashboardData || !realtimeStats) {
      return [
        { title: 'Total Revenue', value: formatAmountInDefault(0), change: '0%', trend: 'up', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100', description: 'vs last month' },
        { title: 'Active Users', value: '0', change: '0%', trend: 'up', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100', description: 'registered users' },
        { title: 'Total Tasks', value: '0', change: '0%', trend: 'up', icon: CheckCircle, color: 'text-purple-600', bgColor: 'bg-purple-100', description: 'active tasks' },
        { title: 'Products', value: '0', change: '0%', trend: 'up', icon: Package, color: 'text-pink-600', bgColor: 'bg-pink-100', description: 'in catalog' }
      ];
    }

    return [
      {
        title: 'Total Revenue',
        value: dashboardData.revenue?.total ? formatCurrency(dashboardData.revenue.total, currencySettings.defaultCurrency) : formatCurrency(0, currencySettings.defaultCurrency),
        change: `+${dashboardData.revenue?.growth || 0}%`,
        trend: 'up',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: 'vs last month'
      },
      {
        title: 'Active Users',
        value: dashboardData.users?.total?.toLocaleString() || '0',
        change: '+8.2%',
        trend: 'up',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        description: 'registered users'
      },
      {
        title: 'Total Tasks',
        value: dashboardData.tasks?.total_tasks?.toLocaleString() || '0',
        change: '+15.3%',
        trend: 'up',
        icon: CheckCircle,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        description: 'active tasks'
      },
      {
        title: 'Products',
        value: dashboardData.products?.total?.toLocaleString() || '0',
        change: '+22.1%',
        trend: 'up',
        icon: Package,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        description: 'in catalog'
      }
    ];
  };

  const mainStats = getMainStats();

  const getQuickStats = () => {
    if (!dashboardData || !realtimeStats) {
      return [
        { title: 'Today Orders', value: '0', icon: ShoppingCart, color: 'text-indigo-600', bgColor: 'bg-indigo-100', isRealtime: true },
        { title: 'Active Now', value: '0', icon: Activity, color: 'text-green-600', bgColor: 'bg-green-100', isRealtime: true },
        { title: 'Conversion', value: '0%', icon: Target, color: 'text-orange-600', bgColor: 'bg-orange-100', isRealtime: true },
        { title: 'Today Revenue', value: formatAmountInDefault(0), icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100', isRealtime: true }
      ];
    }

    return [
      {
        title: 'Today Orders',
        value: realtimeStats.todayOrders?.toString() || '0',
        icon: ShoppingCart,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        isRealtime: true
      },
      {
        title: 'Active Now',
        value: realtimeStats.activeUsers?.toString() || '0',
        icon: Activity,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        isRealtime: true
      },
      {
        title: 'Conversion',
        value: `${realtimeStats.conversionRate || '0'}%`,
        icon: Target,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        isRealtime: true
      },
      {
        title: 'Today Revenue',
        value: realtimeStats.todayRevenue ? formatAmountInDefault(realtimeStats.todayRevenue) : formatAmountInDefault(0),
        icon: TrendingUp,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        isRealtime: true
      }
    ];
  };

  const quickStats = getQuickStats();

  const revenueData = dashboardData?.revenue?.monthly || [];

  // Convert revenue data to default currency for display
  const convertedRevenueData = revenueData.map(item => ({
    ...item,
    revenue: convertAmountToDefault(item.revenue, 'INR') // Revenue is stored in INR base currency
  }));

  // Convert category sales to default currency for display
  const convertedCategoryData = categoryData.map(item => ({
    ...item,
    sales: convertAmountToDefault(item.sales, 'INR') // Sales are stored in INR base currency
  }));

  // Convert order amounts to default currency for display
  const convertedRecentOrders = recentOrders.map(order => ({
    ...order,
    amount: convertAmountToDefault(order.amount, order.currency || 'INR'),
    originalAmount: order.amount,
    originalCurrency: order.currency || 'INR'
  }));

  // Generate recent activities from real data
  const recentActivities = [
    ...recentOrders.slice(0, 2).map(order => ({
      type: 'order',
      message: `New order received from ${order.customer}`,
      details: `${order.artwork} - ${formatAmountInDefault(order.amount, order.currency || 'INR')}`,
      originalAmount: order.amount,
      time: order.time,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    })),
    {
      type: 'user',
      message: 'New artist registered',
      details: 'Artist joined as a verified creator',
      time: '15 minutes ago',
      icon: UserPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      type: 'payment',
      message: 'Payment received',
      details: `Order processed - ${formatAmountInDefault(recentOrders[0]?.amount || 0, recentOrders[0]?.currency || 'INR')}`,
      originalAmount: recentOrders[0]?.amount || 0,
      time: '1 hour ago',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  // Convert activity amounts to default currency for display
  const convertedRecentActivities = recentActivities.map(activity => ({
    ...activity,
    details: activity.originalAmount 
      ? activity.details.replace(/\$\d+\.?\d*/, formatAmountInDefault(activity.originalAmount, 'INR'))
      : activity.details
  }));

  // Get top artworks from real product data
  const getTopArtworks = () => {
    if (!dashboardData?.products?.products) return [];
    
    return dashboardData.products.products
      .filter(product => product.downloads > 0) // Only products with downloads
      .sort((a, b) => b.downloads - a.downloads) // Sort by downloads descending
      .slice(0, 3) // Get top 3
      .map(product => ({
        id: product.id,
        title: product.title,
        artist: product.artist || 'Unknown Artist',
        views: product.views ? `${(product.views / 1000).toFixed(1)}K` : '0',
        downloads: product.downloads || 0,
        revenue: (product.downloads || 0) * (product.price || 0), // Calculate revenue from downloads * price
        image: product.main_image || '/api/placeholder/60/60'
      }));
  };

  const topArtworks = getTopArtworks();

  // Convert artwork revenue to default currency for display
  const convertedTopArtworks = topArtworks.map(artwork => ({
    ...artwork,
    revenue: convertAmountToDefault(artwork.revenue, 'INR'), // Revenue stored in INR
    originalRevenue: artwork.revenue
  }));

  const quickActions = [
    {
      title: 'Add New Artwork',
      description: 'Upload and manage artworks',
      icon: Plus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: () => window.location.href = '/admin/products'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: () => window.location.href = '/admin/users'
    },
    {
      title: 'View Analytics',
      description: 'Detailed analytics and reports',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: () => window.location.href = '/admin/analytics'
    },
    {
      title: 'Task Management',
      description: 'Manage project tasks',
      icon: CheckSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      action: () => window.location.href = '/admin/tasks'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      action: () => window.location.href = '/admin/settings'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout title="">
      <div className="space-y-4">
        {/* Header Section - Compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-600">Welcome back!</span>
                {realtimeStats && (
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Live
                  </span>
                )}
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="text-xs text-gray-500">
                  All amounts in <strong>{currencySettings.defaultCurrency}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <button
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-xs"
                title="Refresh data"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="text-xs text-gray-500">
                {currentTime.toLocaleDateString()}
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-xs"
              >
                <option value="7d">7d</option>
                <option value="30d">30d</option>
                <option value="90d">90d</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Stats Cards - Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {mainStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-500 text-xs font-medium">{stat.title}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">{stat.description}</span>
                    </div>
                  </div>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats Row - Compact */}
        <div className="grid grid-cols-4 gap-2">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-2">
                  <div className={`${stat.bgColor} p-1.5 rounded-md relative`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    {stat.isRealtime && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs flex items-center truncate">
                      {stat.title}
                      {stat.isRealtime && (
                        <Zap className="w-2.5 h-2.5 ml-1 text-green-500 flex-shrink-0" />
                      )}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revenue Chart - Full Width */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue & Orders</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Orders</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={convertedRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => [
                  name === 'revenue' ? formatAmountInDefault(value, 'INR') : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Sales - Horizontal */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">Category Sales</h3>
            <span className="text-xs text-gray-500">{convertedCategoryData.length} categories</span>
          </div>
          
          {convertedCategoryData.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {convertedCategoryData.map((category, index) => (
                <div key={index} className="flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded-md">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span className="text-xs text-gray-700">{category.name}</span>
                  <span className="text-xs font-medium text-gray-900">{formatAmountInDefault(category.sales, 'INR')}</span>
                  <span className="text-xs text-gray-500">({category.value}%)</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2">
              <Package className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">No data</p>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {convertedRecentOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {order.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{order.customer}</p>
                      <p className="text-sm text-gray-500 truncate">{order.artwork}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatAmountInDefault(order.amount, order.originalCurrency || 'INR')}</p>
                      {currencySettings.defaultCurrency !== (order.originalCurrency || 'INR') && (
                        <div className="text-xs text-gray-400">{order.originalCurrency || 'INR'} {order.originalAmount.toFixed(2)}</div>
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {convertedRecentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`${activity.bgColor} p-2 rounded-lg`}>
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-sm text-gray-500">{activity.details}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Artworks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Top Artworks</h3>
                <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              {convertedTopArtworks.length > 0 ? (
                <div className="space-y-4">
                  {convertedTopArtworks.map((artwork) => (
                    <div key={artwork.id} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {artwork.image && artwork.image !== '/api/placeholder/60/60' ? (
                          <img 
                            src={artwork.image} 
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{artwork.title}</p>
                        <p className="text-sm text-gray-500">{artwork.artist}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span>{artwork.views} views</span>
                          <span>{artwork.downloads} downloads</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatAmountInDefault(artwork.revenue, 'INR')}</p>
                        {currencySettings.defaultCurrency !== 'INR' && (
                          <div className="text-xs text-gray-400">INR ₹{artwork.originalRevenue.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-sm font-medium text-gray-900 mb-1">No Top Artworks</h4>
                  <p className="text-xs text-gray-500">Products with downloads will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Activity Feed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading activity...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {convertedRecentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`${activity.bgColor} p-2 rounded-lg`}>
                          <Icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-sm text-gray-500">{activity.details}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.title}
                      onClick={action.action}
                      className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors group w-full text-left"
                    >
                      <div className={`${action.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-pink-500 ml-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;