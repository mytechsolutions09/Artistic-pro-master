'use client'

import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, Download, Calendar, Users, DollarSign, Star } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AnalyticsService } from '../../services/supabaseService';

const inputCls =
  'h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const cardCls = 'rounded-lg border border-gray-200 bg-white p-3 shadow-sm';

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
      <AdminLayout title="Analytics" noHeader>
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="text-[11px] text-gray-500">Loading analytics…</span>
        </div>
      </AdminLayout>
    );
  }

  const kpiChips: {
    label: string;
    value: string;
    hint: string;
    Icon: typeof DollarSign;
    iconClass: string;
  }[] = [
    {
      label: 'Revenue',
      value: `₹${formatINR(analyticsData?.revenue?.total)}`,
      hint: '+27% vs last month',
      Icon: DollarSign,
      iconClass: 'text-green-600'
    },
    {
      label: 'Active',
      value: String(realtimeStats?.activeUsers || analyticsData?.users?.active || '0'),
      hint: 'Online now',
      Icon: Users,
      iconClass: 'text-blue-600'
    },
    {
      label: 'Downloads',
      value: analyticsData?.products?.totalDownloads?.toLocaleString() || '0',
      hint: 'All time',
      Icon: Download,
      iconClass: 'text-violet-600'
    },
    {
      label: 'Avg rating',
      value: analyticsData?.products?.avgRating?.toFixed(1) || '0.0',
      hint: 'Products',
      Icon: Star,
      iconClass: 'text-amber-600'
    }
  ];

  return (
    <AdminLayout title="Analytics" noHeader>
      <div className="space-y-4 px-4 py-5 sm:px-6">
        <div className={cardCls}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900">Analytics &amp; reports</h2>
              <p className="text-[11px] text-gray-500">Revenue, engagement, and catalog signals</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={loadAnalytics}
                disabled={refreshing}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={exportData}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className={`${inputCls} min-w-[7.5rem]`}>
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="90d">90 days</option>
                  <option value="1y">1 year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {kpiChips.map(({ label, value, hint, Icon, iconClass }) => (
            <div
              key={label}
              className="inline-flex min-w-[8.5rem] flex-1 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-1 sm:min-w-0"
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-gray-500">{label}</div>
                <div className="truncate text-xs font-semibold tabular-nums text-gray-900">{value}</div>
                <div className="text-[10px] text-gray-400">{hint}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className={`${cardCls} lg:col-span-2`}>
            <div className="mb-2 flex flex-col gap-1 border-b border-gray-100 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xs font-semibold text-gray-900">Revenue &amp; performance</h3>
              <div className="flex flex-wrap gap-2 text-[10px] text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-900" /> Revenue
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Downloads
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-violet-500" /> Visitors
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={performanceData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={36} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `₹${formatINR(value)}` : Number(value).toLocaleString(),
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#111827" fill="#111827" fillOpacity={0.08} strokeWidth={1.5} />
                <Area type="monotone" dataKey="downloads" stroke="#2563eb" fill="#2563eb" fillOpacity={0.06} strokeWidth={1.5} />
                <Area type="monotone" dataKey="visitors" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.06} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={cardCls}>
            <h3 className="mb-2 border-b border-gray-100 pb-1.5 text-xs font-semibold text-gray-900">Top categories</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={62}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number | string) => [Number(value).toLocaleString(), 'Sales']}
                  contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="truncate text-gray-600">{category.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 tabular-nums">
                    <span className="font-medium text-gray-900">{category.sales.toLocaleString()}</span>
                    <span className={category.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                      {category.growth > 0 ? '+' : ''}
                      {category.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className={`${cardCls} overflow-hidden p-0`}>
            <div className="border-b border-gray-100 px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-900">Performance</h3>
            </div>
            <div className="space-y-3 p-3">
              <div>
                <div className="mb-0.5 flex items-center justify-between text-[11px]">
                  <span className="text-gray-600">Conversion</span>
                  <span className="font-semibold tabular-nums text-gray-900">{realtimeStats?.conversionRate || '3.4'}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-gray-900 transition-all duration-300"
                    style={{ width: `${Math.min(100, Number(realtimeStats?.conversionRate) || 34)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-0.5 flex items-center justify-between text-[11px]">
                  <span className="text-gray-600">Satisfaction</span>
                  <span className="font-semibold tabular-nums text-gray-900">
                    {analyticsData?.products?.avgRating?.toFixed(1) || '4.8'}/5
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${((analyticsData?.products?.avgRating || 4.8) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-0.5 flex items-center justify-between text-[11px]">
                  <span className="text-gray-600">Market growth</span>
                  <span className="font-semibold text-gray-900">+27.2%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100">
                  <div className="h-1.5 w-[72%] rounded-full bg-blue-600 transition-all duration-300" />
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardCls} overflow-hidden p-0`}>
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-900">Live</h3>
              <div className="flex items-center gap-1 text-[10px] font-medium text-green-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Updating
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-3">
              <div className="rounded-md border border-gray-100 bg-gray-50/80 px-2 py-2 text-center">
                <div className="text-lg font-bold tabular-nums text-gray-900">{realtimeStats?.todayOrders || '0'}</div>
                <div className="text-[10px] text-gray-500">Orders today</div>
              </div>
              <div className="rounded-md border border-gray-100 bg-gray-50/80 px-2 py-2 text-center">
                <div className="text-lg font-bold tabular-nums text-gray-900">₹{formatINR(realtimeStats?.todayRevenue)}</div>
                <div className="text-[10px] text-gray-500">Revenue today</div>
              </div>
              <div className="rounded-md border border-gray-100 bg-gray-50/80 px-2 py-2 text-center">
                <div className="text-lg font-bold tabular-nums text-gray-900">{realtimeStats?.activeUsers || '0'}</div>
                <div className="text-[10px] text-gray-500">Active users</div>
              </div>
              <div className="rounded-md border border-gray-100 bg-gray-50/80 px-2 py-2 text-center">
                <div className="text-lg font-bold tabular-nums text-gray-900">{analyticsData?.products?.total || '0'}</div>
                <div className="text-[10px] text-gray-500">Products</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;




