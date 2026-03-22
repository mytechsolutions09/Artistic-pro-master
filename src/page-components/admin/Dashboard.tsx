'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import {
  DollarSign,
  Users,
  TrendingUp,
  Settings,
  Plus,
  ArrowRight,
  CheckCircle,
  Activity,
  CreditCard,
  Package,
  UserPlus,
  ShoppingCart,
  Image,
  RefreshCw,
  Zap,
  Target,
  BarChart3,
  CheckSquare,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AnalyticsService } from '../../services/supabaseService';
import { useCurrency } from '../../contexts/CurrencyContext';

const inputCls =
  'h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
const dateInputCls =
  'h-7 rounded-md border border-gray-200 bg-white px-1.5 text-[11px] text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
const cardCls = 'rounded-lg border border-gray-200 bg-white p-3 shadow-sm';
const btnOutline =
  'inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [realtimeStats, setRealtimeStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [chartDateFrom, setChartDateFrom] = useState<string>('');
  const [chartDateTo, setChartDateTo] = useState<string>('');
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
      setChartSeries(analytics?.revenue?.monthly || []);
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

  const revenueData = chartSeries || [];

  // Convert revenue data to default currency for display
  const convertedRevenueData = useMemo(() => {
    return revenueData.map((item: any) => ({
      ...item,
      revenue: convertAmountToDefault(item.revenue, 'INR') // Revenue is stored in INR base currency
    }));
  }, [revenueData, currencySettings.defaultCurrency, convertAmount]);

  const filteredRevenueData = useMemo(() => {
    return convertedRevenueData.filter((item: any) => {
      if (!chartDateFrom && !chartDateTo) return true;
      const bucketStart = item.monthStart ? new Date(item.monthStart) : null;
      const bucketEnd = item.monthEnd ? new Date(item.monthEnd) : null;
      if (!bucketStart || !bucketEnd) return true;

      const from = chartDateFrom ? new Date(`${chartDateFrom}T00:00:00`) : null;
      const to = chartDateTo ? new Date(`${chartDateTo}T23:59:59`) : null;

      if (from && bucketEnd < from) return false;
      if (to && bucketStart > to) return false;
      return true;
    });
  }, [convertedRevenueData, chartDateFrom, chartDateTo]);

  const hasRevenueData = useMemo(() => {
    return filteredRevenueData.some(
      (item: any) => (item.revenue || 0) > 0 || (item.orders || 0) > 0
    );
  }, [filteredRevenueData]);

  // Refetch chart data when date range changes for true range-based chart updates
  useEffect(() => {
    let cancelled = false;
    const loadRangeData = async () => {
      try {
        setChartLoading(true);
        const data = await AnalyticsService.getRevenueDataByDateRange(
          chartDateFrom || undefined,
          chartDateTo || undefined
        );
        if (!cancelled) {
          setChartSeries(data);
        }
      } catch (error) {
        console.error('Error loading chart range data:', error);
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    };

    loadRangeData();
    return () => { cancelled = true; };
  }, [chartDateFrom, chartDateTo]);

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
      title: 'Add artwork',
      description: 'Products catalog',
      icon: Plus,
      action: () => { window.location.href = '/admin/products'; },
    },
    {
      title: 'Users',
      description: 'Accounts',
      icon: Users,
      action: () => { window.location.href = '/admin/users'; },
    },
    {
      title: 'Analytics',
      description: 'Reports',
      icon: BarChart3,
      action: () => { window.location.href = '/admin/analytics'; },
    },
    {
      title: 'Tasks',
      description: 'Projects',
      icon: CheckSquare,
      action: () => { window.location.href = '/admin/tasks'; },
    },
    {
      title: 'Settings',
      description: 'System',
      icon: Settings,
      action: () => { window.location.href = '/admin/settings'; },
    },
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
    <AdminLayout title="Dashboard" noHeader>
      <div className="space-y-3 px-4 py-5 sm:px-6">
        <div className={cardCls}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-gray-900">Admin dashboard</h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
                <span>Welcome back</span>
                {realtimeStats && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-800">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    Live
                  </span>
                )}
                <span className="text-gray-400">·</span>
                <span>
                  Amounts in <span className="font-medium text-gray-700">{currencySettings.defaultCurrency}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={fetchDashboardData}
                disabled={refreshing}
                className={btnOutline}
                title="Refresh data"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <span className="text-[11px] tabular-nums text-gray-500">{currentTime.toLocaleString()}</span>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className={`${inputCls} w-[4.5rem]`}>
                <option value="7d">7d</option>
                <option value="30d">30d</option>
                <option value="90d">90d</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {mainStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="inline-flex min-w-[7.5rem] flex-1 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-1 sm:min-w-0"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-gray-500">{stat.title}</div>
                  <div className="truncate text-xs font-semibold tabular-nums text-gray-900">{stat.value}</div>
                  <div className="flex flex-wrap items-baseline gap-1 text-[10px]">
                    <span className={stat.trend === 'up' ? 'font-medium text-green-700' : 'font-medium text-red-700'}>
                      {stat.change}
                    </span>
                    <span className="text-gray-400">{stat.description}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="inline-flex min-w-[5.5rem] flex-1 items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50/80 px-2 py-1 sm:min-w-0"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    {stat.title}
                    {stat.isRealtime && <Zap className="h-2.5 w-2.5 shrink-0 text-green-600" />}
                  </div>
                  <div className="truncate text-xs font-semibold tabular-nums text-gray-900">{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={cardCls}>
          <div className="mb-2 flex flex-col gap-2 border-b border-gray-100 pb-2 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-xs font-semibold text-gray-900">Revenue &amp; orders</h3>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-600">
              <div className="flex flex-wrap items-center gap-1">
                <input
                  type="date"
                  value={chartDateFrom}
                  onChange={(e) => setChartDateFrom(e.target.value)}
                  className={dateInputCls}
                  title="From date"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="date"
                  value={chartDateTo}
                  onChange={(e) => setChartDateTo(e.target.value)}
                  className={dateInputCls}
                  title="To date"
                />
                {(chartDateFrom || chartDateTo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setChartDateFrom('');
                      setChartDateTo('');
                    }}
                    className="h-7 rounded-md border border-gray-200 px-2 text-[11px] text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                )}
              </div>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-900" /> Revenue
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> Orders
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredRevenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis
                yAxisId="revenue"
                stroke="#9ca3af"
                tickFormatter={(value: number) => formatCurrency(value, currencySettings.defaultCurrency)}
                tick={{ fontSize: 10 }}
                width={72}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                stroke="#9ca3af"
                allowDecimals={false}
                tick={{ fontSize: 10 }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '11px',
                }}
                formatter={(value: any, name: string) => [
                  name === 'revenue'
                    ? formatCurrency(Number(value || 0), currencySettings.defaultCurrency)
                    : Number(value || 0),
                  name === 'revenue' ? 'Revenue' : 'Orders',
                ]}
              />
              <Bar
                yAxisId="revenue"
                dataKey="revenue"
                fill="#111827"
                radius={[3, 3, 0, 0]}
                barSize={12}
                isAnimationActive={false}
              />
              <Bar
                yAxisId="orders"
                dataKey="orders"
                fill="#2563eb"
                radius={[3, 3, 0, 0]}
                barSize={12}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
          {chartLoading && (
            <div className="mt-2 text-center text-[11px] text-gray-500">Updating chart…</div>
          )}
          {!hasRevenueData && (
            <div className="mt-2 text-center text-[11px] text-gray-500">No revenue/order data for this range.</div>
          )}
        </div>

        <div className={cardCls}>
          <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-xs font-semibold text-gray-900">Category sales</h3>
            <span className="text-[10px] text-gray-500">{convertedCategoryData.length} categories</span>
          </div>
          {convertedCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={[...convertedCategoryData]
                  .sort((a, b) => (b.sales || 0) - (a.sales || 0))
                  .slice(0, 8)}
                margin={{ top: 4, right: 10, left: 10, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#9ca3af" interval={0} />
                <YAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                  width={68}
                  tickFormatter={(value: number) => formatCurrency(value, currencySettings.defaultCurrency)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, _name: string, props: any) => {
                    const salesAmount = formatCurrency(Number(value || 0), currencySettings.defaultCurrency);
                    const salesCount = props?.payload?.salesCount || 0;
                    return [salesAmount, `Amount • ${salesCount} sales`];
                  }}
                />
                <Bar
                  dataKey="sales"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="salesCount"
                    position="top"
                    formatter={(value: any) => `${Number(value || 0)} sales`}
                    style={{ fill: '#6b7280', fontSize: 9 }}
                  />
                  {convertedCategoryData
                    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
                    .slice(0, 8)
                    .map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#9ca3af'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-6 text-center">
              <Package className="mx-auto mb-1 h-4 w-4 text-gray-400" />
              <p className="text-[11px] text-gray-500">No category sales data</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className={`${cardCls} overflow-hidden p-0`}>
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-900">Recent orders</h3>
              <a
                href="/admin/orders"
                className="text-[11px] font-medium text-gray-700 hover:text-gray-900"
              >
                All
              </a>
            </div>
            <div className="space-y-2 p-3">
              {convertedRecentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-medium text-gray-700">
                    {order.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-gray-900">{order.customer}</p>
                    <p className="truncate text-[10px] text-gray-500">{order.artwork}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-medium tabular-nums text-gray-900">
                      {formatAmountInDefault(order.amount, order.originalCurrency || 'INR')}
                    </p>
                    {currencySettings.defaultCurrency !== (order.originalCurrency || 'INR') && (
                      <div className="text-[10px] text-gray-400">
                        {order.originalCurrency || 'INR'} {order.originalAmount.toFixed(2)}
                      </div>
                    )}
                    <span
                      className={`mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} overflow-hidden p-0`}>
            <div className="border-b border-gray-100 px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-900">Activity</h3>
            </div>
            <div className="space-y-2 p-3">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-6">
                  <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-[11px] text-gray-500">Loading…</span>
                </div>
              ) : (
                convertedRecentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex gap-2">
                      <div className="rounded-md border border-gray-100 bg-gray-50 p-1.5">
                        <Icon className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium leading-snug text-gray-900">{activity.message}</p>
                        <p className="text-[10px] text-gray-500">{activity.details}</p>
                        <p className="mt-0.5 text-[10px] text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={`${cardCls} overflow-hidden p-0`}>
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-900">Top artworks</h3>
              <a href="/admin/products" className="text-[11px] font-medium text-gray-700 hover:text-gray-900">
                All
              </a>
            </div>
            <div className="p-3">
              {convertedTopArtworks.length > 0 ? (
                <div className="space-y-2">
                  {convertedTopArtworks.map((artwork) => (
                    <div key={artwork.id} className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                        {artwork.image && artwork.image !== '/api/placeholder/60/60' ? (
                          <img src={artwork.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Image className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-gray-900">{artwork.title}</p>
                        <p className="truncate text-[10px] text-gray-500">{artwork.artist}</p>
                        <div className="mt-0.5 flex gap-2 text-[10px] text-gray-400">
                          <span>{artwork.views} v</span>
                          <span>{artwork.downloads} dl</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] font-medium tabular-nums text-gray-900">
                          {formatAmountInDefault(artwork.revenue, 'INR')}
                        </p>
                        {currencySettings.defaultCurrency !== 'INR' && (
                          <div className="text-[10px] text-gray-400">INR {artwork.originalRevenue.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Image className="mx-auto mb-1 h-8 w-8 text-gray-300" />
                  <p className="text-[11px] text-gray-500">No download data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="mb-2 border-b border-gray-100 pb-2">
            <h3 className="text-xs font-semibold text-gray-900">Quick actions</h3>
          </div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={action.action}
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-2 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-gray-700" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-gray-900">{action.title}</p>
                    <p className="truncate text-[10px] text-gray-500">{action.description}</p>
                  </div>
                  <ArrowRight className="h-3 w-3 shrink-0 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;




