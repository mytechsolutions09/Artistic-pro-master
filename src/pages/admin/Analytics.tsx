import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Eye, RefreshCw, Download, Calendar, Filter, BarChart3, PieChart as PieChartIcon, Users, DollarSign, ShoppingBag, Star } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AnalyticsService } from '../../services/supabaseService';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [realtimeStats, setRealtimeStats] = useState<any>(null);

  // Helper to format INR amounts with Indian grouping
  const formatINR = (amount: number | undefined | null) => {
    const value = Number(amount || 0);
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
  };

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setRefreshing(true);
      const [analytics, realtime] = await Promise.all([
        AnalyticsService.getDashboardData(),
        AnalyticsService.getRealtimeStats()
      ]);
      setAnalyticsData(analytics);
      setRealtimeStats(realtime);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      AnalyticsService.getRealtimeStats().then(setRealtimeStats);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const performanceData = analyticsData?.revenue?.monthly || [
    { month: 'Jan', revenue: 4000, downloads: 240, visitors: 1200 },
    { month: 'Feb', revenue: 3000, downloads: 139, visitors: 980 },
    { month: 'Mar', revenue: 5000, downloads: 380, visitors: 1400 },
    { month: 'Apr', revenue: 4500, downloads: 430, visitors: 1300 },
    { month: 'May', revenue: 6000, downloads: 520, visitors: 1600 },
    { month: 'Jun', revenue: 5500, downloads: 490, visitors: 1550 },
    { month: 'Jul', revenue: 7000, downloads: 600, visitors: 1800 }
  ];

  const topCategories = [
    { name: 'Abstract', sales: 1240, growth: 15.2, color: '#ec4899' },
    { name: 'Animals', sales: 980, growth: 8.7, color: '#8b5cf6' },
    { name: 'Paintings', sales: 756, growth: -2.1, color: '#06b6d4' },
    { name: 'Floral', sales: 654, growth: 12.4, color: '#10b981' },
    { name: 'Technology', sales: 543, growth: 22.8, color: '#f59e0b' }
  ];

  const categoryChartData = topCategories.map(cat => ({
    name: cat.name,
    value: cat.sales,
    color: cat.color
  }));

  // Export analytics data
  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <AdminLayout title="">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Analytics & Reports</h2>
            <p className="text-sm text-gray-600">Comprehensive insights into your platform performance</p>
          </div>
          <div className="flex items-center space-x-3 mt-3 lg:mt-0">
            <button
              onClick={loadAnalytics}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-50 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{formatINR(analyticsData?.revenue?.total)}
              </p>
              <p className="text-sm text-green-600 font-medium">+27.2% from last month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-50 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold text-gray-800">
                {realtimeStats?.activeUsers || analyticsData?.users?.active || '0'}
              </p>
              <p className="text-sm text-blue-600 font-medium">Currently online</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-50 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-800">
                {analyticsData?.products?.totalDownloads?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-purple-600 font-medium">All time</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-50 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-800">
                {analyticsData?.products?.avgRating?.toFixed(1) || '0.0'}
              </p>
              <p className="text-sm text-yellow-600 font-medium">Customer satisfaction</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-pink-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Revenue & Performance</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Downloads</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Visitors</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => [
                  name === 'revenue' ? `₹${formatINR(value)}` : Number(value).toLocaleString(),
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="downloads" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="visitors" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span className="text-gray-600">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">${category.sales}</span>
                  <span className={`text-xs font-medium ${
                    category.growth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {category.growth > 0 ? '+' : ''}{category.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-50">
          <div className="p-6 border-b border-pink-100">
            <h3 className="text-lg font-semibold text-gray-800">Performance Metrics</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-bold text-gray-900">
                    {realtimeStats?.conversionRate || '3.4'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${realtimeStats?.conversionRate || 34}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Customer Satisfaction</span>
                  <span className="text-sm font-bold text-gray-900">
                    {analyticsData?.products?.avgRating?.toFixed(1) || '4.8'}/5.0
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((analyticsData?.products?.avgRating || 4.8) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Market Growth</span>
                  <span className="text-sm font-bold text-gray-900">+27.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '72%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-50">
          <div className="p-6 border-b border-pink-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Live Statistics</h3>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {realtimeStats?.todayOrders || '0'}
                </div>
                <div className="text-sm text-gray-600">Orders Today</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₹{formatINR(realtimeStats?.todayRevenue)}
                </div>
                <div className="text-sm text-gray-600">Revenue Today</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {realtimeStats?.activeUsers || '0'}
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {analyticsData?.products?.total || '0'}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;