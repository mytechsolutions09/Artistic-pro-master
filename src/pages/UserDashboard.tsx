import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Settings, ShoppingBag, Heart, Download, Save, X, Eye, Star,
  FileDown, TrendingUp, Calendar, LogOut,
  Package, Zap, Sparkles, Activity
} from 'lucide-react';
import { CompleteOrderService } from '../services/completeOrderService';
import { Order } from '../types';
import { SITE_COLORS } from '../constants/colors';
import { getProgressToNextLevel } from '../constants/memberLevels';
import { useProducts } from '../contexts/ProductContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { generateProductUrl } from '../utils/slugUtils';
import { useAuth } from '../contexts/AuthContext';
import ReviewInput from '../components/ReviewInput';
import FilterSidebar from '../components/FilterSidebar';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { featuredArtworks } = useProducts();
  const { formatUIPrice } = useCurrency();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    bio: user?.user_metadata?.bio || 'Welcome to your dashboard!',
    location: user?.user_metadata?.location || '',
    joinDate: user?.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    avatar: user?.user_metadata?.avatar_url || ''
  });

  // User data
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const userFavorites = React.useMemo(() => featuredArtworks.slice(0, 4), [featuredArtworks]);
  
  // Settings form state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    orderUpdates: true
  });

  // Date filter state for orders
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    showAll: true
  });

  // Load saved notification preferences
  useEffect(() => {
    if (user?.user_metadata?.notification_preferences) {
      setNotificationPrefs(user.user_metadata.notification_preferences);
    }
  }, [user]);
  
  // Review state
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<any>(null);
  
  // Favorites filter state
  const [favoriteFilters, setFavoriteFilters] = useState({
    priceRange: [0, 10000] as [number, number],
    rating: 0,
    featured: false,
    sortBy: 'relevance',
    category: undefined as string | undefined,
    productType: 'all' as 'digital' | 'poster' | 'all',
    tags: [] as string[],
    status: 'all' as 'active' | 'inactive' | 'all'
  });
  const [showFavoriteFilters, setShowFavoriteFilters] = useState(false);
  const [filteredFavorites, setFilteredFavorites] = useState(userFavorites);
  
  // Update filtered favorites when userFavorites changes
  useEffect(() => {
    setFilteredFavorites(userFavorites);
  }, [userFavorites]);

  // Apply filters to favorites
  const applyFavoriteFilters = React.useCallback(() => {
    let filtered = [...userFavorites];

    // Category filter
    if (favoriteFilters.category) {
      filtered = filtered.filter(artwork => {
        return (artwork as any).category === favoriteFilters.category;
      });
    }

    // Product type filter
    if (favoriteFilters.productType !== 'all') {
      filtered = filtered.filter(artwork => artwork.productType === favoriteFilters.productType);
    }

    // Tags filter
    if (favoriteFilters.tags && favoriteFilters.tags.length > 0) {
      filtered = filtered.filter(artwork => 
        favoriteFilters.tags.some(tag => artwork.tags && artwork.tags.includes(tag))
      );
    }

    // Price filter
    filtered = filtered.filter(artwork => 
      artwork.price >= favoriteFilters.priceRange[0] && artwork.price <= favoriteFilters.priceRange[1]
    );

    // Rating filter
    if (favoriteFilters.rating > 0) {
      filtered = filtered.filter(artwork => artwork.rating >= favoriteFilters.rating);
    }

    // Featured filter
    if (favoriteFilters.featured) {
      filtered = filtered.filter(artwork => artwork.featured);
    }

    // Status filter
    if (favoriteFilters.status !== 'all') {
      filtered = filtered.filter(artwork => artwork.status === favoriteFilters.status);
    }

    // Sort results
    switch (favoriteFilters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      default:
        // Keep original order for 'relevance'
        break;
    }

    setFilteredFavorites(filtered);
  }, [userFavorites, favoriteFilters]);

  // Apply filters when filters or userFavorites change
  useEffect(() => {
    applyFavoriteFilters();
  }, [applyFavoriteFilters]);
  
  // Update user profile when user data changes
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        bio: user.user_metadata?.bio || 'Welcome to your dashboard!',
        location: user.user_metadata?.location || '',
        joinDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        avatar: user.user_metadata?.avatar_url || ''
      });
    }
  }, [user]);
  

  useEffect(() => {
    const fetchUserOrders = async () => {
      setOrdersLoading(true);
      try {
        // Get current user ID from auth context
        const userId = user?.id;
        
        if (!userId) {
          console.log('No authenticated user, skipping order fetch');
          setUserOrders([]);
          setOrdersLoading(false);
          return;
        }
        
        // First try to get orders from the database
        const dbOrdersResult = await CompleteOrderService.getUserOrders(userId);
        if (dbOrdersResult.success && dbOrdersResult.orders && dbOrdersResult.orders.length > 0) {
          // Transform database orders to match expected Order format
          const transformedOrders = dbOrdersResult.orders.map((dbOrder: any) => ({
            id: dbOrder.id,
            userId: dbOrder.customer_id,
            items: dbOrder.order_items?.map((item: any) => {
              // Calculate the correct price based on product type and size
              let itemPrice = item.price || item.products?.price || 0;
              const productType = item.selected_product_type || item.products?.product_type || 'digital';
              const posterSize = item.selected_poster_size || item.products?.poster_size;
              
              // If it's a poster and we have poster pricing, use that
              if (productType === 'poster' && posterSize && item.products?.poster_pricing) {
                const posterPricing = item.products.poster_pricing;
                if (typeof posterPricing === 'object' && posterPricing[posterSize]) {
                  itemPrice = posterPricing[posterSize];
                }
              }
              
              
              return {
                id: item.product_id, // Use product_id instead of order item id
                title: item.products?.title || 'Unknown Product',
                price: itemPrice,
                images: item.products?.main_image ? [item.products.main_image] : 
                        (item.products?.images && item.products.images.length > 0 ? item.products.images : []),
                productType: productType,
                posterSize: posterSize
              };
            }) || [],
            total: (() => {
              const dbTotal = dbOrder.total;
              // Calculate total from the transformed items (which have correct prices)
              const transformedItems = dbOrder.order_items?.map((item: any) => {
                let itemPrice = item.price || item.products?.price || 0;
                const productType = item.selected_product_type || item.products?.product_type || 'digital';
                const posterSize = item.selected_poster_size || item.products?.poster_size;
                
                if (productType === 'poster' && posterSize && item.products?.poster_pricing) {
                  const posterPricing = item.products.poster_pricing;
                  if (typeof posterPricing === 'object' && posterPricing[posterSize]) {
                    itemPrice = posterPricing[posterSize];
                  }
                }
                return itemPrice;
              }) || [];
              
              const calculatedTotal = transformedItems.reduce((sum: number, price: number) => sum + price, 0);
              return dbTotal || calculatedTotal;
            })(),
            status: dbOrder.status,
            date: dbOrder.created_at,
            paymentId: dbOrder.payment_id,
            paymentMethod: dbOrder.payment_method,
            downloadLinks: dbOrder.download_links || [],
            customerEmail: dbOrder.customer_email
          }));
          setUserOrders(transformedOrders);
        } else {
          // No database orders found, set empty array
          setUserOrders([]);
        }
      } catch (error) {
        console.error('Error fetching user orders:', error);
        // Set empty array on error
        setUserOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [user]);
  
  // Calculate downloadable items from completed orders (only digital products)
  const userDownloads = userOrders
    .filter(order => order.status === 'completed')
    .flatMap(order => order.items.filter(item => item.productType === 'digital'));

  
  const handleDownload = (downloadUrl: string, productTitle: string) => {
    if (downloadUrl) {
      // In a real app, this would handle secure downloads
      window.open(downloadUrl, '_blank');
    } else {
      alert(`Download link not available for "${productTitle}"`);
    }
  };

  const handleReviewProduct = (product: any, orderId?: string, orderItemId?: string) => {
    setSelectedProductForReview({
      ...product,
      orderId,
      orderItemId
    });
    setShowReviewInput(true);
  };


  const handleLogout = async () => {
    try {
      console.log('Logout button clicked');
      await signOut();
      console.log('Sign out successful, navigating to home');
      // Redirect to homepage after logout
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  // Member level calculations (available throughout component)
  const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
  const memberProgress = getProgressToNextLevel(userOrders.length, totalSpent);
  const currentMemberLevel = memberProgress.currentLevel;
  const nextMemberLevel = memberProgress.nextLevel;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => {
    const recentActivity = userOrders.slice(0, 3);
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    const memberProgress = getProgressToNextLevel(userOrders.length, totalSpent);

    return (
      <div className="space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="group relative overflow-hidden p-3 rounded-lg bg-white shadow-lg text-gray-800 transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-sm">
                  <User className="w-3 h-3 text-gray-800" />
                </div>
                <Calendar className="w-3 h-3 text-gray-600" />
              </div>
              <p className="text-lg font-bold mb-0.5 text-gray-800">{userProfile.name.toUpperCase()}</p>
              <p className="text-gray-800 text-xs">Member since {new Date(userProfile.joinDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden p-3 rounded-lg bg-white shadow-lg text-gray-800 transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-sm">
                  <ShoppingBag className="w-3 h-3 text-gray-800" />
                </div>
                <TrendingUp className="w-3 h-3 text-gray-600" />
              </div>
              <p className="text-xl font-bold mb-0.5 text-gray-800">{userOrders.length}</p>
              <p className="text-gray-800 text-xs">Total Orders</p>
            </div>
          </div>

          <div className="group relative overflow-hidden p-3 rounded-lg bg-white shadow-lg text-gray-800 transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-sm">
                  <Download className="w-3 h-3 text-gray-800" />
                </div>
                <Zap className="w-3 h-3 text-gray-600" />
              </div>
              <p className="text-xl font-bold mb-0.5 text-gray-800">{userDownloads.length}</p>
              <p className="text-gray-800 text-xs">Downloads</p>
            </div>
          </div>

          <div className="group relative overflow-hidden p-3 rounded-lg bg-white shadow-lg text-gray-800 transform hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-sm">
                  <Heart className="w-3 h-3 text-gray-800" />
                </div>
                <Sparkles className="w-3 h-3 text-gray-600" />
              </div>
              <p className="text-xl font-bold mb-0.5 text-gray-800">{userFavorites.length}</p>
              <p className="text-gray-800 text-xs">Favorites</p>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm">
                      <Activity className="w-4 h-4" style={{ color: '#374151' }} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="font-medium text-xs hover:opacity-80 transition-opacity text-gray-600 hover:text-gray-800"
                  >View All</button>
                </div>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((order, index) => (
                      <div key={order.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-800 font-bold text-xs bg-white shadow-sm">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">Order #{order.id.slice(-4)}</p>
                          <p className="text-xs text-gray-800">{order.items.length} items • {formatUIPrice(order.total, 'INR')}</p>
                          <p className="text-xs text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-base font-semibold text-gray-800 mb-2">No Recent Activity</h4>
                    <p className="text-gray-600 text-sm">Your recent orders will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 bg-white">
                <h3 className="text-base font-bold text-gray-800 flex items-center">
                  <Zap className="w-4 h-4 mr-2" style={{ color: '#374151' }} />
                  Quick Actions
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Browse button clicked');
                    try {
                      navigate('/browse');
                      console.log('Navigate called successfully');
                    } catch (error) {
                      console.error('Navigation error:', error);
                      window.location.href = '/browse';
                    }
                  }}
                  className="w-full bg-white text-gray-800 p-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-semibold text-sm">Browse Artwork</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Downloads button clicked');
                    setActiveTab('downloads');
                  }}
                  className="w-full bg-white text-gray-800 p-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-semibold text-sm">My Downloads</span>
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className="w-full bg-white text-gray-800 p-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Heart className="w-4 h-4" />
                  <span className="font-semibold text-sm">Favorites</span>
                </button>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="p-4 rounded-2xl text-gray-800 relative overflow-hidden bg-white shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20  rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg">{currentMemberLevel.icon}</span>
                  <h4 className="text-base font-bold">{currentMemberLevel.name}</h4>
                </div>
                <p className="text-gray-600 text-xs mb-2">
                  {currentMemberLevel.description}
                </p>
                
                {nextMemberLevel ? (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Progress to {nextMemberLevel.name}</span>
                      <span className="font-semibold text-gray-800">{Math.min(memberProgress.ordersProgress, memberProgress.spentProgress).toFixed(0)}%</span>
                    </div>
                    <div className="w-full  rounded-full h-1.5 mb-2">
                      <div 
                        className="0 rounded-full h-1.5 transition-all duration-300"
                        style={{ width: `${Math.min(memberProgress.ordersProgress, memberProgress.spentProgress)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {memberProgress.ordersNeeded > 0 && `${memberProgress.ordersNeeded} more orders`}
                      {memberProgress.ordersNeeded > 0 && memberProgress.spentNeeded > 0 && ' • '}
                      {memberProgress.spentNeeded > 0 && `$${memberProgress.spentNeeded.toFixed(0)} more to spend`}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">🎉 Maximum Level Achieved!</p>
                    <p className="text-xs text-gray-600">You're a true Art Legend!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    // Filter orders by date if filter is applied
    const filteredOrders = dateFilter.showAll 
      ? userOrders 
      : userOrders.filter(order => {
          const orderDate = new Date(order.date);
          const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
          const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
          
          if (startDate && endDate) {
            return orderDate >= startDate && orderDate <= endDate;
          } else if (startDate) {
            return orderDate >= startDate;
          } else if (endDate) {
            return orderDate <= endDate;
          }
          return true;
        });

    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;

    return (
      <div className="space-y-6">

        {/* Order List */}
        <div className="rounded-lg">
          <div className="p-4 bg-white rounded-lg shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-base font-semibold text-gray-800">Order History</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{totalOrders} orders</span>
                  {pendingOrders > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {pendingOrders} pending
                    </span>
                  )}
                </div>
              </div>
              
              {/* Date Filter */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showAllOrders"
                    checked={dateFilter.showAll}
                    onChange={(e) => setDateFilter({
                      ...dateFilter,
                      showAll: e.target.checked,
                      startDate: e.target.checked ? '' : dateFilter.startDate,
                      endDate: e.target.checked ? '' : dateFilter.endDate
                    })}
                    className="rounded  text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showAllOrders" className="text-sm font-medium text-gray-600">Show all</label>
                </div>
                
                {!dateFilter.showAll && (
                  <>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-600">From</label>
                      <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                        className="px-3 py-1.5  rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-600">To</label>
                      <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                        className="px-3 py-1.5  rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => setDateFilter({ startDate: '', endDate: '', showAll: true })}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800  rounded-md transition-colors"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div>
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2  mx-auto mb-3"></div>
                <p className="text-gray-800 text-sm">Loading your orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-gray-800 mb-1">
                  {dateFilter.showAll ? 'No Orders Yet' : 'No Orders Found'}
                </h4>
                <p className="text-gray-800 mb-4 text-sm">
                  {dateFilter.showAll 
                    ? 'Start shopping to see your order history here.'
                    : 'No orders found for the selected date range. Try adjusting your filter.'
                  }
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Browse orders button clicked');
                    navigate('/browse');
                  }}
                  className="inline-flex items-center space-x-2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Artwork</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-lg p-4 bg-white shadow-lg  hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">ORDER #{order.id.slice(-8)}</h4>
                  <p className="text-xs text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 text-sm">{formatUIPrice(order.total, 'INR')}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {order.items.map((item, itemIndex) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-md">
                    <div className="flex items-center space-x-2">
                      <img src={item.images?.[0] || '/api/placeholder/400/400'} alt={item.title} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate text-sm">{item.title}</p>
                        <p className="text-xs text-gray-600">
                          {item.productType === 'poster' && item.posterSize 
                            ? `Poster ${item.posterSize}`
                            : 'Digital'
                          }
                        </p>
                        <p className="text-xs text-gray-800 font-medium">{formatUIPrice(item.price, 'INR')}</p>
                      </div>
                    </div>
                    {order.status === 'completed' && (
                      <div className="flex items-center space-x-1">
                        {item.productType === 'digital' && (
                          <button
                            onClick={() => handleDownload(order.downloadLinks?.[itemIndex] || '', item.title)}
                            className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md hover:bg-green-200 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        )}
                        {(
                          <button
                            onClick={() => handleReviewProduct(item, order.id, `${order.id}-${itemIndex}`)}
                            className="flex items-center space-x-1 px-2 py-1  text-gray-600 text-xs rounded-md hover: transition-colors"
                          >
                            <Star className="w-3 h-3" />
                            <span>Review</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  const renderFavorites = () => {

    const updateFavoriteFilters = (newFilters: Partial<typeof favoriteFilters>) => {
      setFavoriteFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleRemoveFavorite = (artworkId: string) => {
      // In a real app, this would remove from backend
      console.log('Removing favorite:', artworkId);
      // For now, just show an alert
      alert('Favorite removed! (This would be saved to your account in a real app)');
    };

    const handleViewProduct = (artwork: any) => {
      navigate(generateProductUrl(artwork.category, artwork.title));
    };

    return (
      <div className="space-y-6">
        {/* Favorites Stats */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">My Favorites</h3>
              <p className="text-sm text-gray-800">{filteredFavorites.length} of {userFavorites.length} items</p>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-gray-600" />
              <span className="text-2xl font-bold text-gray-800">{userFavorites.length}</span>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Saved Artwork</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFavoriteFilters(!showFavoriteFilters)}
                  className="px-3 py-1.5 bg-white  rounded-md text-gray-600  transition-colors duration-200 flex items-center space-x-2 text-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Filters</span>
                </button>
                <button
                  onClick={() => navigate('/browse')}
                  className="text-sm text-gray-800 hover:text-gray-800 font-medium"
                >
                  Browse More →
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {userFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">No Favorites Yet</h4>
                <p className="text-gray-800 mb-6">Save artwork you love to see them here.</p>
                <button
                  onClick={() => navigate('/browse')}
                  className="inline-flex items-center space-x-2 bg-white text-gray-800 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <Heart className="w-5 h-5" />
                  <span>Browse Artwork</span>
                </button>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 mb-2">No Favorites Match Your Filters</h4>
                <p className="text-gray-800 mb-6">Try adjusting your filters to see more results.</p>
                <button
                  onClick={() => setFavoriteFilters({
                    priceRange: [0, 10000] as [number, number],
                    rating: 0,
                    featured: false,
                    sortBy: 'relevance',
                    category: undefined,
                    productType: 'all',
                    tags: [],
                    status: 'all'
                  })}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((artwork) => (
                  <div key={artwork.id} className="group bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => handleViewProduct(artwork)}>
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img
                        src={artwork.images?.[0] || '/api/placeholder/400/400'}
                        alt={artwork.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => handleViewProduct(artwork)}
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProduct(artwork);
                            }}
                            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md"
                            title="View Product"
                          >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(artwork.id);
                            }}
                            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md"
                            title="Remove from Favorites"
                          >
                          <Heart className="w-4 h-4 text-gray-600 fill-current" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1 cursor-pointer hover:text-gray-800 truncate" onClick={() => handleViewProduct(artwork)}>
                      {artwork.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">{formatUIPrice(artwork.price, 'INR')}</span>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        {artwork.rating}
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProduct(artwork);
                          }}
                          className="flex-1 bg-white text-gray-600 py-2 px-3 rounded-lg text-sm shadow-lg hover:shadow-xl transition-shadow duration-200"
                        >
                        View Details
                      </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/checkout?product=${artwork.id}`);
                          }}
                          className="flex-1 bg-white text-gray-800 py-2 px-3 rounded-lg text-sm shadow-lg hover:shadow-xl transition-shadow duration-200"
                        >
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Favorites Filter Sidebar */}
        {showFavoriteFilters && (
          <FilterSidebar 
            filters={favoriteFilters}
            onFilterChange={updateFavoriteFilters}
            products={userFavorites as any}
            onClose={() => setShowFavoriteFilters(false)}
          />
        )}
      </div>
    );
  };

  const renderDownloads = () => {
    // Get all completed orders and extract downloadable items (only digital products)
    const completedOrders = userOrders.filter(order => order.status === 'completed');
    const downloadableItems = completedOrders.flatMap(order => 
      order.items
        // Only show digital products for download
        .filter(item => item.productType === 'digital')
        .map((item, index) => ({
          ...item,
          orderId: order.id,
          orderDate: order.date,
          downloadUrl: order.downloadLinks?.[index] || null
        }))
    );

    const handleDownloadAll = () => {
      downloadableItems.forEach((item, index) => {
        setTimeout(() => {
          handleDownload(item.downloadUrl || '', item.title);
        }, index * 500); // Stagger downloads
      });
    };

    const handleViewOrder = (orderId: string) => {
      // In a real app, this would navigate to order details
      alert(`Viewing order details for: ${orderId}`);
    };

    return (
      <div className="space-y-6">
        {/* Download Stats */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">My Downloads</h3>
              <p className="text-sm text-gray-800">{downloadableItems.length} digital files available</p>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="w-6 h-6 text-green-500" />
              <span className="text-2xl font-bold text-gray-800">{downloadableItems.length}</span>
            </div>
          </div>
        </div>

        {/* Downloads List */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Downloadable Files</h3>
              <div className="flex items-center space-x-3">
                {downloadableItems.length > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All</span>
                  </button>
                )}
                <span className="text-sm text-gray-600">{downloadableItems.length} items</span>
              </div>
            </div>
          </div>
        <div className="p-6">
          {downloadableItems.length === 0 ? (
            <div className="text-center py-12">
              <FileDown className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">No Digital Downloads Available</h4>
              <p className="text-gray-800 mb-6">Purchase digital products to access PDF files and high-resolution images for download.</p>
              <button
                onClick={() => navigate('/browse')}
                className="inline-flex items-center space-x-2 bg-white text-gray-800 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Browse Artwork</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {downloadableItems.map((item) => (
                <div key={`${item.orderId}-${item.id}`} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center space-x-4">
                    <img src={item.images?.[0] || '/api/placeholder/400/400'} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600">
                        {item.productType === 'poster' && item.posterSize 
                          ? `Poster Size: ${item.posterSize} • Poster Product`
                          : 'Digital Product'
                        }
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">({item.rating})</span>
                        </div>
                        <span className="text-xs text-gray-600">
                          Purchased: {new Date(item.orderDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right mr-4">
                      <p className="text-sm font-semibold text-gray-800">{formatUIPrice(item.price, 'INR')}</p>
                      <p className="text-xs text-green-600">✓ Purchased</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(item.orderId)}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                        title="View Order"
                      >
                        <Package className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(generateProductUrl(item.category, item.title))}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Product"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(item.downloadUrl || '', item.title)}
                        className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
                        title="Download Files"
                      >
                        <Download className="w-5 h-5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {

    const validateForm = () => {
      const errors: Record<string, string> = {};
      
      if (!userProfile.name.trim()) {
        errors.name = 'Name is required';
      }
      
      if (!userProfile.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(userProfile.email)) {
        errors.email = 'Email is invalid';
      }
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSaveProfile = async () => {
      if (!validateForm()) {
        return;
      }
      
      setIsSaving(true);
      try {
        // Import Supabase client
        const { supabase } = await import('../services/supabaseService');
        
        // Update user metadata in Supabase
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: userProfile.name,
            location: userProfile.location,
            bio: userProfile.bio
          }
        });

        if (error) {
          throw error;
        }

        setIsEditing(false);
        setFormErrors({});
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      } finally {
        setIsSaving(false);
      }
    };

    const handleChangePassword = async () => {
      const newPassword = prompt('Enter your new password:');
      if (!newPassword) return;
      
      if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      
      try {
        const { supabase } = await import('../services/supabaseService');
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) {
          throw error;
        }
        
        alert('Password updated successfully!');
      } catch (error) {
        console.error('Error updating password:', error);
        alert('Failed to update password. Please try again.');
      }
    };

    const handleDownloadData = async () => {
      try {
        // Create a data export object
        const userData = {
          profile: {
            name: userProfile.name,
            email: userProfile.email,
            location: userProfile.location,
            bio: userProfile.bio,
            joinDate: userProfile.joinDate
          },
          orders: userOrders,
          favorites: userFavorites,
          downloads: userDownloads,
          notificationPreferences: notificationPrefs,
          exportDate: new Date().toISOString()
        };
        
        // Create and download JSON file
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Your data has been downloaded successfully!');
      } catch (error) {
        console.error('Error downloading data:', error);
        alert('Failed to download data. Please try again.');
      }
    };

    const handleDeleteAccount = async () => {
      const confirmText = 'DELETE';
      const userInput = prompt(`This action cannot be undone. Type "${confirmText}" to confirm account deletion:`);
      
      if (userInput !== confirmText) {
        alert('Account deletion cancelled.');
        return;
      }
      
      try {
        const { supabase } = await import('../services/supabaseService');
        
        // Delete user account
        const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
        
        if (error) {
          throw error;
        }
        
        alert('Account deleted successfully. You will be redirected to the homepage.');
        // Sign out and redirect
        await signOut();
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please contact support.');
      }
    };

    return (
      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-white      text-gray-800 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormErrors({});
                    // Reset to original values
                    setUserProfile({
                      name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
                      email: user?.email || '',
                      location: user?.user_metadata?.location || '',
                      bio: user?.user_metadata?.bio || 'Welcome to your dashboard!',
                      joinDate: user?.created_at || new Date().toISOString(),
                      avatar: user?.user_metadata?.avatar || null
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2  text-gray-800  rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white    text-gray-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => {
                setUserProfile({ ...userProfile, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
              }}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2  ${
                formErrors.name 
                  ? 'border-red-300 focus:ring-red-300' 
                  : ' focus:ring-gray-500'
              }`}
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input
              type="email"
              value={userProfile.email}
              onChange={(e) => {
                setUserProfile({ ...userProfile, email: e.target.value });
                if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
              }}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2  ${
                formErrors.email 
                  ? 'border-red-300 focus:ring-red-300' 
                  : ' focus:ring-gray-500'
              }`}
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Location</label>
            <input
              type="text"
              value={userProfile.location}
              onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-2  rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 "
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">Bio</label>
            <textarea
              value={userProfile.bio}
              onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
              disabled={!isEditing}
              rows={3}
              className="w-full px-4 py-2  rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 "
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Notification Preferences</h3>
          <button
            onClick={async () => {
              try {
                const { supabase } = await import('../services/supabaseService');
                const { error } = await supabase.auth.updateUser({
                  data: {
                    notification_preferences: notificationPrefs
                  }
                });
                
                if (error) throw error;
                alert('Notification preferences saved successfully!');
              } catch (error) {
                console.error('Error saving notification preferences:', error);
                alert('Failed to save notification preferences. Please try again.');
              }
            }}
            className="px-4 py-2 bg-white    text-gray-800 rounded-lg transition-colors text-sm"
          >
            Save Preferences
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates about new artwork and promotions</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notificationPrefs.emailNotifications}
                onChange={(e) => setNotificationPrefs({
                  ...notificationPrefs,
                  emailNotifications: e.target.checked
                })}
                className="sr-only" 
              />
              <div className={`relative w-10 h-6 rounded-full transition-colors ${
                notificationPrefs.emailNotifications ? '' : ''
              }`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notificationPrefs.emailNotifications ? 'right-1' : 'left-1'
                }`} />
              </div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Order Updates</h4>
              <p className="text-sm text-gray-600">Get notified about order status changes</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notificationPrefs.orderUpdates}
                onChange={(e) => setNotificationPrefs({
                  ...notificationPrefs,
                  orderUpdates: e.target.checked
                })}
                className="sr-only" 
              />
              <div className={`relative w-10 h-6 rounded-full transition-colors ${
                notificationPrefs.orderUpdates ? '' : ''
              }`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notificationPrefs.orderUpdates ? 'right-1' : 'left-1'
                }`} />
              </div>
            </label>
          </div>
        </div>
      </div>

        {/* Privacy Settings */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Privacy & Security</h3>
          <div className="space-y-4">
            <button 
              onClick={handleChangePassword}
              className="w-full text-left p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <h4 className="font-medium text-gray-800">Change Password</h4>
              <p className="text-sm text-gray-600">Update your account password</p>
            </button>
            <button 
              onClick={handleDownloadData}
              className="w-full text-left p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <h4 className="font-medium text-gray-800">Download My Data</h4>
              <p className="text-sm text-gray-600">Get a copy of your account data</p>
            </button>
            <button 
              onClick={handleDeleteAccount}
              className="w-full text-left p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 text-red-600"
            >
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-red-500">Permanently delete your account and data</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'orders': return renderOrders();
      case 'favorites': return renderFavorites();
      case 'downloads': return renderDownloads();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{
      background: `linear-gradient(to bottom right, ${SITE_COLORS.WHITE}, #fef7f0)`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F8BBD9' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundSize: '60px 60px'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f8fafc' fill-opacity='0.6'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4">


          {/* Main Content */}
          <div className="w-full">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dashboard Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t  z-40">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-gray-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? '' : ''
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
          
          {/* Logout Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Dashboard logout button clicked');
              handleLogout();
            }}
            className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 text-red-500 hover:text-red-700"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Review Input Modal */}
      {showReviewInput && selectedProductForReview && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ReviewInput
              productId={selectedProductForReview.id}
              productTitle={selectedProductForReview.title}
              userId={user.id}
              userName={user.user_metadata?.name || user.email || 'Anonymous'}
              orderId={selectedProductForReview.orderId}
              orderItemId={selectedProductForReview.orderItemId}
              onReviewSubmitted={() => {
                setShowReviewInput(false);
                setSelectedProductForReview(null);
              }}
              onClose={() => {
                setShowReviewInput(false);
                setSelectedProductForReview(null);
              }}
              className="border-0 rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;