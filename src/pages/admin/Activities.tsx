import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Activity, User, Clock, ShoppingBag, Upload, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { ActivityService, Activity as ActivityType, ActivityStats } from '../../services/activityService';
import { useCurrency } from '../../contexts/CurrencyContext';

const Activities: React.FC = () => {
  const { currencySettings } = useCurrency();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load activities and stats
  const loadActivities = async () => {
    try {
      setLoading(true);
      const [activitiesData, statsData] = await Promise.all([
        ActivityService.filterActivities({ type: filterType, timeRange, limit: 50 }),
        ActivityService.getActivityStats()
      ]);
      setActivities(activitiesData);
      setStats(statsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  // Handle filter changes
  const handleFilterChange = async (newFilter: string) => {
    setFilterType(newFilter);
    setLoading(true);
    const filteredActivities = await ActivityService.filterActivities({ 
      type: newFilter, 
      timeRange, 
      limit: 50 
    });
    setActivities(filteredActivities);
    setLoading(false);
  };

  const handleTimeRangeChange = async (newTimeRange: string) => {
    setTimeRange(newTimeRange);
    setLoading(true);
    const filteredActivities = await ActivityService.filterActivities({ 
      type: filterType, 
      timeRange: newTimeRange, 
      limit: 50 
    });
    setActivities(filteredActivities);
    setLoading(false);
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadActivities();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      ShoppingBag,
      Upload,
      Edit,
      Eye,
      Trash2,
      User
    };
    return icons[iconName] || Activity;
  };

  const getActivityTypeInfo = (type: string) => {
    const typeInfo: { [key: string]: { icon: string; color: string; label: string } } = {
      order: { icon: 'ShoppingBag', color: 'text-green-600', label: 'Order' },
      upload: { icon: 'Upload', color: 'text-blue-600', label: 'Upload' },
      edit: { icon: 'Edit', color: 'text-purple-600', label: 'Edit' },
      view: { icon: 'Eye', color: 'text-gray-600', label: 'View' },
      delete: { icon: 'Trash2', color: 'text-red-600', label: 'Delete' },
      user: { icon: 'User', color: 'text-orange-600', label: 'User' },
      product: { icon: 'Upload', color: 'text-blue-600', label: 'Product' },
      category: { icon: 'Edit', color: 'text-purple-600', label: 'Category' }
    };
    return typeInfo[type] || { icon: 'Activity', color: 'text-gray-600', label: 'Activity' };
  };


  return (
    <AdminLayout title="Activities" noHeader={true}>
      <div className="p-6 space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Activity Feed</h2>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">Real-time system activities</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Live</span>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <span className="text-xs text-gray-500">Currency:</span>
                <span className="text-xs font-medium text-gray-700">{currencySettings.defaultCurrency}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <select 
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="all">All Activities</option>
              <option value="order">Orders</option>
              <option value="upload">Uploads</option>
              <option value="edit">Edits</option>
              <option value="category">Categories</option>
            </select>
            <select 
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-800">{stats?.totalActivities || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <ShoppingBag className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Orders Today</p>
                <p className="text-lg font-bold text-gray-800">{stats?.ordersToday || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-100 rounded-md">
                <Upload className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Uploads Today</p>
                <p className="text-lg font-bold text-gray-800">{stats?.uploadsToday || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-orange-100 rounded-md">
                <User className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Active Users</p>
                <p className="text-lg font-bold text-gray-800">{stats?.activeUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-800">Recent Activities</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No activities found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activities.map((activity) => {
                  const typeInfo = getActivityTypeInfo(activity.type);
                  const IconComponent = getIconComponent(typeInfo.icon);
                  return (
                    <div key={activity.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`p-1.5 rounded-md bg-gray-100 flex-shrink-0`}>
                          <IconComponent className={`w-4 h-4 ${typeInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-800 truncate">{activity.user}</span>
                            <span className="text-sm text-gray-600">{activity.action}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">{typeInfo.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1 truncate">{activity.details}</p>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeAgo(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Last Updated Indicator */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <span>{activities.length} activities</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Activities;
