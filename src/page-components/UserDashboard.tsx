'use client'

import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/src/compat/router';
import {
  User, Settings, ShoppingBag, Heart, Download, X, Eye, EyeOff, Star,
  FileDown, TrendingUp, Calendar, LogOut,
  Package, Zap, Sparkles, Activity, Truck, Clock, CheckCircle, RotateCcw,
  Search, ChevronDown, ChevronUp, Edit, Shield, Key
} from 'lucide-react';
import { CompleteOrderService } from '../services/completeOrderService';
import { Order, Product } from '../types';
import { productBelongsToCategoryLabel } from '../utils/productFilterUtils';
// import { SITE_COLORS } from '../constants/colors';
import { getProgressToNextLevel } from '../constants/memberLevels';
import { useProducts } from '../contexts/ProductContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { generateProductUrl, generateSlug } from '../utils/slugUtils';
import { useAuth } from '../contexts/AuthContext';
import ReviewInput from '../components/ReviewInput';
import FilterSidebar from '../components/FilterSidebar';
import ReturnRequestForm from '../components/ReturnRequestForm';
import ReturnRequestsList from '../components/ReturnRequestsList';
import AddressManagement from '../components/AddressManagement';
import OrderTrackingModal from '../components/OrderTrackingModal';
import { delhiveryService } from '../services/DelhiveryService';
import { ReturnService } from '../services/returnService';
import { buildSequenceMap, formatSequenceNumber } from '../utils/sequenceNumberUtils';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { featuredArtworks, allProducts } = useProducts();
  const { formatUIPrice } = useCurrency();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: user?.user_metadata?.full_name || `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || user?.email?.split('@')[0] || '',
    lastName: '',
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
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [returnNotification, setReturnNotification] = useState<{
    show: boolean;
    message: string;
    type: 'error' | 'success' | 'info';
  }>({ show: false, message: '', type: 'info' });
  
  // Settings form state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  

  // Return request state
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Date filter state for orders
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
    showAll: true
  });

  // Pagination state for orders
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Order tracking state
  const [trackingData, setTrackingData] = useState<Record<string, any>>({});
  const [expandedTracking, setExpandedTracking] = useState<Record<string, boolean>>({});
  const [trackingLoading, setTrackingLoading] = useState<Record<string, boolean>>({});
  const [trackingErrors, setTrackingErrors] = useState<Record<string, string>>({});
  
  // Tracking modal state
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  
  // Order detail modal (for orders with more than 1 product)
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  
  // Change Password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: '',
    confirmPassword: '',
    general: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
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

    // Category filter (categories[] + legacy category)
    if (favoriteFilters.category) {
      filtered = filtered.filter((artwork) =>
        productBelongsToCategoryLabel(artwork as Product, favoriteFilters.category!)
      );
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
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const nameParts = fullName.split(' ');
      
      setUserProfile({
        firstName: user.user_metadata?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || nameParts.join(' ') || '',
        lastName: '',
        email: user.email || '',
        bio: user.user_metadata?.bio || 'Welcome to your dashboard!',
        location: user.user_metadata?.location || '',
        joinDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        avatar: user.user_metadata?.avatar_url || ''
      });
    }
  }, [user]);
  

  // Function to fetch return requests
  const fetchReturnRequests = async () => {
    try {
      const customerEmail = user?.email;
      if (!customerEmail) return;
      
      const requests = await ReturnService.getCustomerReturns(customerEmail);
      setReturnRequests(requests);
    } catch (error) {
      console.error('Error fetching return requests:', error);
    }
  };

  // Function to fetch user orders
  const fetchUserOrders = async () => {
    setOrdersLoading(true);
    try {
      // Get current user ID from auth context
      const userId = user?.id;
      
      if (!userId) {
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
                id: item.product_id || item.id || `item-${Date.now()}-${Math.random()}`, // Ensure unique ID
                orderItemId: item.id, // Preserve the actual order item ID from database
                title: item.products?.title || 'Unknown Product',
                price: itemPrice,
                images: item.products?.main_image ? [item.products.main_image] : 
                        (item.products?.images && item.products.images.length > 0 ? item.products.images : []),
                productType: productType,
                posterSize: posterSize,
                // Add clothing options if available
                ...(item.options && {
                  color: item.options.color,
                  size: item.options.size
                })
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
            customerEmail: dbOrder.customer_email,
            shipping_address: dbOrder.shipping_address,
            billing_address: dbOrder.billing_address
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

  useEffect(() => {
    fetchUserOrders();
    fetchReturnRequests();
  }, [user]);

  const orderSequenceMap = React.useMemo(
    () =>
      buildSequenceMap(
        userOrders.map((order) => ({
          id: order.id,
          createdAt: order.date,
        }))
      ),
    [userOrders]
  );

  const getOrderDisplayNumber = (orderId: string) =>
    formatSequenceNumber('ORD', orderSequenceMap[orderId]);


  // Fetch real tracking data from Delhivery for orders
  const fetchTrackingData = async (order: Order) => {
    // Check if order has a waybill number (this would be stored in order notes or metadata)
    const waybill = (order as any).metadata?.waybill || (order as any).trackingNumber;
    
    if (!waybill) {
      // If no waybill, generate fallback tracking data
      return generateFallbackTrackingData(order);
    }

    try {
      setTrackingLoading(prev => ({ ...prev, [order.id]: true }));
      setTrackingErrors(prev => ({ ...prev, [order.id]: '' }));

      const trackingResult = await delhiveryService.trackShipment(waybill);
      
      if (trackingResult && trackingResult.length > 0) {
        const trackingInfo = trackingResult[0];
        const steps = parseDelhiveryTrackingSteps(trackingInfo);
        
        const trackingData = {
          status: mapDelhiveryStatus(trackingInfo.status),
          trackingNumber: waybill,
          carrier: 'Delhivery',
          estimatedDelivery: trackingInfo.expected_delivery_date ? new Date(trackingInfo.expected_delivery_date) : null,
          steps: steps,
          rawData: trackingInfo
        };
        
        setTrackingData(prev => ({ ...prev, [order.id]: trackingData }));
      } else {
        // If no tracking data found, use fallback
        const fallbackData = generateFallbackTrackingData(order);
        setTrackingData(prev => ({ ...prev, [order.id]: fallbackData }));
      }
    } catch (error) {
      console.error('Error fetching tracking data for order:', order.id, error);
      setTrackingErrors(prev => ({ 
        ...prev, 
        [order.id]: 'Unable to fetch tracking information. Please try again later.' 
      }));
      
      // Use fallback data on error
      const fallbackData = generateFallbackTrackingData(order);
      setTrackingData(prev => ({ ...prev, [order.id]: fallbackData }));
    } finally {
      setTrackingLoading(prev => ({ ...prev, [order.id]: false }));
    }
  };

  // Generate fallback tracking data when Delhivery data is not available
  const generateFallbackTrackingData = (order: Order) => {
    const orderDate = new Date(order.date);
    const now = new Date();
    const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let trackingStatus = 'processing';
    let trackingSteps: any[] = [];
    let currentLocation = 'Mumbai Hub';
    let estimatedDelivery = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    
    // Check if order has physical products
    const hasPhysicalProducts = order.items.some((item: any) => item.productType !== 'digital');
    
    if (order.status === 'completed') {
      // For digital-only orders, completed means delivered immediately
      if (!hasPhysicalProducts) {
        trackingStatus = 'delivered';
        currentLocation = 'Digital Download Available';
        trackingSteps = [
          { 
            status: 'Order Placed', 
            description: 'Your order has been confirmed and payment received', 
            location: 'System',
            timestamp: orderDate.toISOString(),
            completed: true
          },
          { 
            status: 'Completed', 
            description: 'Your digital products are ready for download', 
            location: 'Digital Download Available',
            timestamp: orderDate.toISOString(),
            completed: true
          }
        ];
      } else {
        // For physical products, completed means order fulfilled but may still be delivering
        trackingStatus = 'delivered';
        currentLocation = order.shipping_address || 'Delivered';
        trackingSteps = [
          { 
            status: 'Order Placed', 
            description: 'Your order has been confirmed and payment received', 
            location: 'Mumbai Hub',
            timestamp: orderDate.toISOString(),
            completed: true
          },
          { 
            status: 'Processing', 
            description: 'Your order is being prepared and quality checked', 
            location: 'Mumbai Hub',
            timestamp: new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true
          },
          { 
            status: 'Shipped', 
            description: 'Your order has been dispatched from our warehouse', 
            location: 'Mumbai Hub',
            timestamp: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true
          },
          { 
            status: 'Out for Delivery', 
            description: 'Your order is out for delivery to your address', 
            location: order.shipping_address || 'Local Delivery Hub',
            timestamp: new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true
          },
          { 
            status: 'Delivered', 
            description: 'Your order has been successfully delivered', 
            location: (order as any).shipping_address || 'Delivered',
            timestamp: new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true
          }
        ];
      }
    } else if (order.status === 'pending') {
      if (daysSinceOrder >= 3) {
        trackingStatus = 'in transit';
        currentLocation = 'In Transit';
        trackingSteps = [
          { 
            status: 'Order Placed', 
            description: 'Your order has been confirmed and payment received', 
            location: 'Mumbai Hub',
            timestamp: orderDate.toISOString(),
            completed: true
          },
          { 
            status: 'Processing', 
            description: 'Your order is being prepared and quality checked', 
            location: 'Mumbai Hub',
            timestamp: new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true
          },
          { 
            status: 'Shipped', 
            description: 'Your order has been dispatched from our warehouse', 
            location: 'Mumbai Hub',
            timestamp: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true
          },
          { 
            status: 'In Transit', 
            description: 'Your order is on its way to your city', 
            location: 'In Transit',
            timestamp: new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false
          },
          { 
            status: 'Out for Delivery', 
            description: 'Your order will be out for delivery soon', 
            location: 'Local Delivery Hub',
            timestamp: null,
            completed: false
          }
        ];
      } else if (daysSinceOrder >= 1) {
        trackingStatus = 'shipped';
        currentLocation = 'Mumbai Hub';
        trackingSteps = [
          { 
            status: 'Order Placed', 
            description: 'Your order has been confirmed and payment received', 
            location: 'Mumbai Hub',
            timestamp: orderDate.toISOString(),
            completed: true
          },
          { 
            status: 'Processing', 
            description: 'Your order is being prepared and quality checked', 
            location: 'Mumbai Hub',
            timestamp: new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true
          },
          { 
            status: 'Shipped', 
            description: 'Your order has been dispatched from our warehouse', 
            location: 'Mumbai Hub',
            timestamp: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false
          },
          { 
            status: 'In Transit', 
            description: 'Your order will be in transit soon', 
            location: 'In Transit',
            timestamp: null,
            completed: false
          }
        ];
      } else {
        trackingStatus = 'processing';
        currentLocation = 'Mumbai Hub';
        trackingSteps = [
          { 
            status: 'Order Placed', 
            description: 'Your order has been confirmed and payment received', 
            location: 'Mumbai Hub',
            timestamp: orderDate.toISOString(),
            completed: true
          },
          { 
            status: 'Processing', 
            description: 'Your order is being prepared and quality checked', 
            location: 'Mumbai Hub',
            timestamp: new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false
          },
          { 
            status: 'Shipped', 
            description: 'Your order will be shipped soon', 
            location: 'Mumbai Hub',
            timestamp: null,
            completed: false
          },
          { 
            status: 'Delivered', 
            description: 'Your order will be delivered soon', 
            location: order.shipping_address || 'Local Delivery Hub',
            timestamp: null,
            completed: false
          }
        ];
      }
    } else if (order.status === 'processing') {
      // For processing orders (physical products being prepared)
      trackingStatus = 'processing';
      currentLocation = 'Mumbai Hub';
      trackingSteps = [
        { 
          status: 'Order Placed', 
          description: 'Your order has been confirmed and payment received', 
          location: 'Mumbai Hub',
          timestamp: orderDate.toISOString(),
          completed: true
        },
        { 
          status: 'Processing', 
          description: 'Your order is being prepared and quality checked', 
          location: 'Mumbai Hub',
          timestamp: orderDate.toISOString(),
          completed: true
        },
        { 
          status: 'Shipping', 
          description: 'Your order will be shipped soon', 
          location: 'Awaiting Shipment',
          timestamp: null,
          completed: false
        },
        { 
          status: 'Out for Delivery', 
          description: 'Your order will be out for delivery', 
          location: order.shipping_address || 'Local Delivery Hub',
          timestamp: null,
          completed: false
        },
        { 
          status: 'Delivered', 
          description: 'Your order will be delivered to your address', 
          location: order.shipping_address || 'Delivery Address',
          timestamp: null,
          completed: false
        }
      ];
    }

    return {
      status: trackingStatus,
      description: getStatusDescription(trackingStatus),
      currentLocation: currentLocation,
      trackingNumber: (order as any).metadata?.waybill || `TRK${order.id.slice(-8).toUpperCase()}`,
      carrier: 'Lurevi Logistics',
      estimatedDelivery: estimatedDelivery,
      steps: trackingSteps,
      isFallback: true
    };
  };

  // Helper function to get status descriptions
  const getStatusDescription = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'Your order has been successfully delivered';
      case 'in transit':
        return 'Your order is on its way to your location';
      case 'shipped':
        return 'Your order has been dispatched from our warehouse';
      case 'processing':
        return 'Your order is being prepared and quality checked';
      default:
        return 'Your order is being processed';
    }
  };

  // Parse Delhivery tracking response into our step format
  const parseDelhiveryTrackingSteps = (trackingInfo: any) => {
    const steps = [];
    const orderDate = new Date(trackingInfo.order_date || trackingInfo.created_at);
    
    // Order placed step
    steps.push({
      status: 'completed',
      title: 'Order Placed',
      date: orderDate,
      description: 'Your order has been confirmed'
    });

    // Processing step
    if (trackingInfo.status !== 'pending') {
      steps.push({
        status: 'completed',
        title: 'Processing',
        date: new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        description: 'Your order is being prepared'
      });
    }

    // Shipped step
    if (trackingInfo.status === 'in_transit' || trackingInfo.status === 'delivered') {
      steps.push({
        status: trackingInfo.status === 'delivered' ? 'completed' : 'current',
        title: 'Shipped',
        date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        description: 'Your order is on its way'
      });
    }

    // Delivered step
    if (trackingInfo.status === 'delivered') {
      steps.push({
        status: 'completed',
        title: 'Delivered',
        date: new Date(trackingInfo.delivery_date || orderDate.getTime() + 4 * 24 * 60 * 60 * 1000),
        description: 'Your order has been delivered'
      });
    } else {
      steps.push({
        status: 'pending',
        title: 'Delivered',
        date: null,
        description: 'Your order will be delivered soon'
      });
    }

    return steps;
  };

  // Map Delhivery status to our status format
  const mapDelhiveryStatus = (delhiveryStatus: string) => {
    switch (delhiveryStatus) {
      case 'delivered':
        return 'delivered';
      case 'in_transit':
        return 'shipped';
      case 'picked_up':
        return 'shipped';
      case 'pending':
        return 'processing';
      default:
        return 'processing';
    }
  };

  // Fetch tracking data for all orders when orders are loaded
  useEffect(() => {
    if (userOrders.length > 0) {
      userOrders.forEach(order => {
        fetchTrackingData(order);
      });
    }
  }, [userOrders]);

  // const toggleTrackingExpansion = (orderId: string) => {
  //   setExpandedTracking(prev => ({
  //     ...prev,
  //     [orderId]: !prev[orderId]
  //   }));
  // };

  // Handle tracking modal
  const openTrackingModal = (order: Order) => {
    setSelectedOrderForTracking(order);
    setShowTrackingModal(true);
  };

  const openOrderDetailModal = (order: Order) => {
    if (order.items.length > 1) {
      setSelectedOrderForDetail(order);
      setShowOrderDetailModal(true);
    }
  };

  const closeOrderDetailModal = () => {
    setSelectedOrderForDetail(null);
    setShowOrderDetailModal(false);
  };

  const closeTrackingModal = () => {
    setShowTrackingModal(false);
    setSelectedOrderForTracking(null);
  };

  const refreshTrackingData = async () => {
    if (selectedOrderForTracking) {
      await fetchTrackingData(selectedOrderForTracking);
    }
  };
  
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

  const handleReturnRequest = (order: any, item: any) => {
    setSelectedOrder(order);
    setSelectedOrderItem(item);
    setShowReturnForm(true);
    setActiveTab('returns'); // Switch to returns tab
  };

  const handleReturnSuccess = async () => {
    setShowReturnForm(false);
    setSelectedOrderItem(null);
    setSelectedOrder(null);
    // Refresh orders and return requests to show updated status
    await fetchUserOrders();
    await fetchReturnRequests();
  };

  const handleReturnCancel = () => {
    setShowReturnForm(false);
    setSelectedOrderItem(null);
    setSelectedOrder(null);
  };

  const showReturnNotification = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setReturnNotification({ show: true, message, type });
    setTimeout(() => {
      setReturnNotification({ show: false, message: '', type: 'info' });
    }, 5000);
  };

  // Check if a return request already exists for an order item
  const hasActiveReturnRequest = (orderId: string, itemId: string) => {
    return returnRequests.some(request => 
      request.order_id === orderId && 
      request.order_item_id === itemId &&
      ['pending', 'approved', 'processing'].includes(request.status)
    );
  };

  const handleReviewProduct = (product: any, orderId?: string, orderItemId?: string) => {
    setSelectedProductForReview({
      ...product,
      orderId,
      orderItemId
    });
    setShowReviewInput(true);
  };


  // Handle change password modal
  const handleChangePassword = async () => {
    setShowChangePasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    // Reset errors
    setPasswordErrors({ newPassword: '', confirmPassword: '', general: '' });
    
    // Validation
    if (!passwordForm.newPassword) {
      setPasswordErrors(prev => ({ ...prev, newPassword: 'Please enter a new password' }));
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordErrors(prev => ({ ...prev, newPassword: 'Password must be at least 6 characters long' }));
      return;
    }
    
    if (!passwordForm.confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const { supabase } = await import('../services/supabaseService');
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      
      if (error) {
        throw error;
      }
      
      // Success - close modal and reset form
      setShowChangePasswordModal(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setPasswordErrors({ newPassword: '', confirmPassword: '', general: '' });
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordErrors(prev => ({ 
        ...prev, 
        general: 'Failed to update password. Please try again.' 
      }));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {

      await signOut();

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
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'returns', label: 'Returns', icon: RotateCcw },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'downloads', label: 'Downloads', icon: Download }
  ];

  const renderOverview = () => {
    const recentActivity = userOrders.slice(0, 3);
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    const memberProgress = getProgressToNextLevel(userOrders.length, totalSpent);

    return (
      <div className="space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="group relative overflow-hidden p-3 rounded-lg bg-white shadow-sm shadow-gray-100 text-gray-900 hover:shadow-lg hover:shadow-gray-200 transition-all duration-200 cursor-pointer">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div className="w-5 h-5 rounded flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-700" />
                </div>
                <Calendar className="w-3 h-3 text-gray-500" />
              </div>
              <p className="text-base font-bold mb-0.5 text-gray-900 font-sans font-normal">{userProfile.firstName.toUpperCase()}</p>
              <p className="text-gray-600 text-xs font-sans font-normal">Member since {new Date(userProfile.joinDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden p-3 rounded-lg bg-white shadow-sm shadow-gray-100 text-gray-900 hover:shadow-lg hover:shadow-gray-200 transition-all duration-200 cursor-pointer">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div className="w-5 h-5 rounded flex items-center justify-center">
                  <ShoppingBag className="w-3 h-3 text-gray-700" />
                </div>
                <TrendingUp className="w-3 h-3 text-gray-500" />
              </div>
              <p className="text-lg font-bold mb-0.5 text-gray-900 font-sans font-normal">{userOrders.length}</p>
              <p className="text-gray-600 text-xs font-sans font-normal">Total Orders</p>
            </div>
          </div>

          <div className="group relative overflow-hidden p-3 rounded-lg bg-white shadow-sm shadow-gray-100 text-gray-900 hover:shadow-lg hover:shadow-gray-200 transition-all duration-200 cursor-pointer">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div className="w-5 h-5 rounded flex items-center justify-center">
                  <Download className="w-3 h-3 text-gray-700" />
                </div>
                <Zap className="w-3 h-3 text-gray-500" />
              </div>
              <p className="text-lg font-bold mb-0.5 text-gray-900 font-sans font-normal">{userDownloads.length}</p>
              <p className="text-gray-600 text-xs font-sans font-normal">Downloads</p>
            </div>
          </div>

          <div className="group relative overflow-hidden p-3 rounded-lg bg-white shadow-sm shadow-gray-100 text-gray-900 hover:shadow-lg hover:shadow-gray-200 transition-all duration-200 cursor-pointer">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div className="w-5 h-5 rounded flex items-center justify-center">
                  <Heart className="w-3 h-3 text-gray-700" />
                </div>
                <Sparkles className="w-3 h-3 text-gray-500" />
              </div>
              <p className="text-lg font-bold mb-0.5 text-gray-900 font-sans font-normal">{userFavorites.length}</p>
              <p className="text-gray-600 text-xs font-sans font-normal">Favorites</p>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm shadow-gray-100 overflow-hidden hover:shadow-md hover:shadow-gray-200 transition-shadow duration-200">
              <div className="px-4 py-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100">
                      <Activity className="w-4 h-4 text-gray-700" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 font-sans font-normal">Recent Activity</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="font-medium text-xs text-gray-600 bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-colors font-sans font-normal"
                  ><span className="font-sans font-normal">View All</span></button>
                </div>
              </div>
              <div className="p-4">
                {recentActivity.length > 0 ? (
                  <div className="space-y-2">
                     {recentActivity.map((order, index) => (
                       <div key={order.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg hover:shadow-sm hover:shadow-gray-100 transition-all duration-200">
                         <div className="w-6 h-6 rounded flex items-center justify-center text-gray-900 font-bold text-xs bg-white shadow-sm font-sans font-normal">
                           #{index + 1}
                         </div>
                         <div className="flex-1">
                           <p className="font-semibold text-gray-900 text-sm font-sans font-normal">Order #{getOrderDisplayNumber(order.id)}</p>
                           <p className="text-xs text-gray-700 font-sans font-normal">{order.items.length} items • {formatUIPrice(order.total, 'INR')}</p>
                           <p className="text-xs text-gray-500 font-sans font-normal">{new Date(order.date).toLocaleDateString()}</p>
                         </div>
                         <div className={`px-2 py-1 rounded-full text-xs font-medium font-sans font-normal ${
                           order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                           order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                           order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                           'bg-gray-100 text-gray-800'
                         }`}>
                           {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                         </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <h4 className="text-sm font-semibold text-gray-900 mb-1 font-sans font-normal">No Recent Activity</h4>
                    <p className="text-gray-600 text-xs font-sans font-normal">Your recent orders will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <div className="bg-white rounded-lg shadow-sm shadow-gray-100 overflow-hidden hover:shadow-md hover:shadow-gray-200 transition-shadow duration-200">
              <div className="px-4 py-3 bg-white">
                <h3 className="text-sm font-bold text-gray-900 flex items-center font-sans font-normal">
                  <Zap className="w-4 h-4 mr-2 text-gray-700" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-3 space-y-2">
                 <button
                   type="button"
                   onClick={(e) => {
                     e.preventDefault();
                     e.stopPropagation();

                     try {
                       navigate('/browse');

                     } catch (error) {
                       console.error('Navigation error:', error);
                       window.location.href = '/browse';
                     }
                   }}
                   className="w-full bg-white text-gray-900 border border-gray-300 px-2 py-1 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5 hover:bg-gray-50"
                 >
                   <ShoppingBag className="w-3.5 h-3.5 text-gray-700" />
                   <span className="font-medium text-xs font-sans font-normal">Browse Artwork</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => {

                     setActiveTab('downloads');
                   }}
                   className="w-full bg-white text-gray-900 border border-gray-300 px-2 py-1 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5 hover:bg-gray-50"
                 >
                   <Download className="w-3.5 h-3.5 text-gray-700" />
                   <span className="font-medium text-xs font-sans font-normal">My Downloads</span>
                 </button>
                 <button
                   onClick={() => setActiveTab('favorites')}
                   className="w-full bg-white text-gray-900 border border-gray-300 px-2 py-1 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5 hover:bg-gray-50"
                 >
                   <Heart className="w-3.5 h-3.5 text-gray-700" />
                   <span className="font-medium text-xs font-sans font-normal">Favorites</span>
                 </button>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="p-3 rounded-lg text-gray-900 relative overflow-hidden bg-white shadow-sm shadow-gray-100 hover:shadow-md hover:shadow-gray-200 transition-shadow duration-200">
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-sm font-bold font-sans font-normal">{currentMemberLevel.name}</h4>
                </div>
                <p className="text-gray-600 text-xs mb-2 font-sans font-normal">
                  {currentMemberLevel.description}
                </p>
                
                {nextMemberLevel ? (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 font-sans font-normal">Progress to {nextMemberLevel.name}</span>
                      <span className="font-semibold text-gray-900 font-sans font-normal">{Math.min(memberProgress.ordersProgress, memberProgress.spentProgress).toFixed(0)}%</span>
                    </div>
                     <div className="w-full bg-white rounded-full h-1 mb-1 border">
                       <div 
                         className="bg-gray-500 rounded-full h-1 transition-all duration-300"
                         style={{ width: `${Math.min(memberProgress.ordersProgress, memberProgress.spentProgress)}%` }}
                       ></div>
                     </div>
                    <p className="text-xs text-gray-600 font-sans font-normal">
                      {memberProgress.ordersNeeded > 0 && `${memberProgress.ordersNeeded} more orders`}
                      {memberProgress.ordersNeeded > 0 && memberProgress.spentNeeded > 0 && ' • '}
                      {memberProgress.spentNeeded > 0 && `$${memberProgress.spentNeeded.toFixed(0)} more to spend`}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1 font-sans font-normal">🎉 Maximum Level Achieved!</p>
                    <p className="text-xs text-gray-600 font-sans font-normal">You're a true Art Legend!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const toggleOrderAccordion = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const renderOrders = () => {
    // Filter orders by date and search query
    const filteredOrders = userOrders.filter(order => {
      const normalizedQuery = orderSearchQuery.trim().toLowerCase();

      // Date filter
      const orderDate = new Date(order.date);
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
      
      const matchesDate = dateFilter.showAll || (() => {
        if (startDate && endDate) {
          return orderDate >= startDate && orderDate <= endDate;
        } else if (startDate) {
          return orderDate >= startDate;
        } else if (endDate) {
          return orderDate <= endDate;
        }
        return true;
      })();

      // Search filter (order number, order ID, status, customer name, product titles)
      const orderNumber = getOrderDisplayNumber(order.id).toLowerCase();
      const customerName = String((order as any).customerName || (order as any).customer_name || '').toLowerCase();
      const matchesSearch =
        !normalizedQuery ||
        orderNumber.includes(normalizedQuery) ||
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.status.toLowerCase().includes(normalizedQuery) ||
        customerName.includes(normalizedQuery) ||
        order.items.some(item => item.title.toLowerCase().includes(normalizedQuery));
      
      return matchesDate && matchesSearch;
    });

    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'completed':
        case 'delivered':
          return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        case 'processing':
        case 'shipped':
          return 'bg-blue-50 text-blue-700 border border-blue-200';
        case 'pending':
          return 'bg-amber-50 text-amber-700 border border-amber-200';
        case 'cancelled':
          return 'bg-red-50 text-red-700 border border-red-200';
        default:
          return 'bg-gray-50 text-gray-700 border border-gray-200';
      }
    };

    return (
      <div className="space-y-3 font-['Inter']">
        {/* Single Row Header */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={orderSearchQuery}
              onChange={(e) => { setOrderSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-32 pl-7 pr-2 py-1 text-xs bg-gray-50 border-0 rounded focus:outline-none focus:ring-1 focus:ring-gray-200"
            />
          </div>

          {!dateFilter.showAll && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => { setDateFilter({ ...dateFilter, startDate: e.target.value }); setCurrentPage(1); }}
                className="px-1.5 py-1 text-xs bg-gray-50 border-0 rounded focus:outline-none focus:ring-1 focus:ring-gray-200"
              />
              <span className="text-gray-300 text-xs">–</span>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => { setDateFilter({ ...dateFilter, endDate: e.target.value }); setCurrentPage(1); }}
                className="px-1.5 py-1 text-xs bg-gray-50 border-0 rounded focus:outline-none focus:ring-1 focus:ring-gray-200"
              />
            </div>
          )}
          
          <button
            onClick={() => { setDateFilter(prev => ({ ...prev, showAll: !prev.showAll, startDate: '', endDate: '' })); setCurrentPage(1); }}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              dateFilter.showAll 
                ? 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {dateFilter.showAll ? 'Filter' : 'Clear'}
          </button>

          <div className="flex-1" />

          <span className="text-xs text-gray-500 font-medium">Orders ({filteredOrders.length})</span>
          <span className="text-xs text-gray-400">{Math.min((currentPage - 1) * ordersPerPage + 1, filteredOrders.length)}–{Math.min(currentPage * ordersPerPage, filteredOrders.length)}</span>
          
          <select
            value={ordersPerPage}
            onChange={(e) => { setOrdersPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="pl-2 pr-5 py-1 text-xs bg-gray-50 border-0 rounded focus:outline-none text-gray-600 cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.25rem center', backgroundSize: '0.65rem' }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Return Notification */}
        {returnNotification.show && (
          <div className={`p-4 rounded-lg flex items-center justify-between ${
            returnNotification.type === 'error' ? 'bg-red-50 text-red-700' :
            returnNotification.type === 'success' ? 'bg-emerald-50 text-emerald-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            <div className="flex items-center gap-2">
              {returnNotification.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {returnNotification.type === 'error' && <X className="w-4 h-4" />}
              {returnNotification.type === 'info' && <Clock className="w-4 h-4" />}
              <span className="text-sm font-medium">{returnNotification.message}</span>
            </div>
            <button onClick={() => setReturnNotification({ show: false, message: '', type: 'info' })} className="p-1 rounded bg-white border border-gray-300 hover:bg-gray-50">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}

        {/* Orders List */}
        {ordersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {orderSearchQuery || !dateFilter.showAll 
                ? 'Try adjusting your search or filters'
                : 'Your order history will appear here once you make a purchase'}
            </p>
            <button
              onClick={() => navigate('/browse')}
              className="px-5 py-2.5 bg-white text-gray-900 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Orders List - Grid on large screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredOrders
                .slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)
                .map((order) => {
                const firstItem = order.items[0];
                const remainingCount = order.items.length - 1;
                
                return (
                  <div
                    key={order.id}
                    role={order.items.length > 1 ? 'button' : undefined}
                    tabIndex={order.items.length > 1 ? 0 : undefined}
                    onClick={order.items.length > 1 ? () => openOrderDetailModal(order) : undefined}
                    onKeyDown={order.items.length > 1 ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOrderDetailModal(order); } } : undefined}
                    className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all flex flex-col aspect-square ${order.items.length > 1 ? 'cursor-pointer' : ''}`}
                  >
                    {/* TOP HALF: Product Image */}
                    <div className="h-1/2 bg-gray-100 relative overflow-hidden group/img">
                      <img 
                        src={firstItem?.images?.[0] || '/api/placeholder/400/400'} 
                        alt={firstItem?.title}
                        className="w-full h-full object-cover group-hover/img:object-contain group-hover/img:bg-white transition-all duration-200"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                      />
                      {remainingCount > 0 && (
                        <div className="absolute bottom-2 right-2 w-5 h-5 bg-gray-900 text-white text-[9px] font-medium rounded-full flex items-center justify-center z-10">
                          +{remainingCount}
                        </div>
                      )}
                      <span className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-medium rounded-full z-10 ${getStatusStyle(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    {/* BOTTOM HALF: Info & Actions */}
                    <div className="h-1/2 p-3 flex flex-col">
                      {/* Order ID */}
                      <span className="text-[10px] text-gray-400 font-medium">#{getOrderDisplayNumber(order.id)}</span>
                      
                      {/* Product Info */}
                      <h3 
                        className="font-medium text-gray-900 text-sm truncate mt-1 hover:text-gray-600 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (firstItem?.title) {
                            const item = firstItem as any;
                            const categoriesArr = item.categories || [];
                            const categoriesLower = categoriesArr.map((c: string) => c.toLowerCase()).join(' ');
                            const isClothing = item.productType === 'clothing' || item.gender || 
                              categoriesLower.includes('men') || categoriesLower.includes('women') || categoriesLower.includes('clothing');
                            const isFB = categoriesLower.includes('food & beverage') || categoriesLower.includes('f&b') || 
                              categoriesLower.includes('food-beverage') || categoriesLower.includes('dry fruit') || 
                              categoriesLower.includes('dried fruit') || categoriesLower.includes('spice');
                            
                            const slug = generateSlug(firstItem.title);
                            
                            if (isClothing) {
                              navigate(`/clothes/${slug}`);
                            } else if (isFB) {
                              navigate(`/${slug}`);  // F&B products use direct URL
                            } else {
                              // Use actual category from product lookup (e.g. /minimalist/terracotta-harmony), never default to 'art'
                              const product = allProducts.find((p: any) => generateSlug(p.title) === slug);
                              const category = product?.categories?.[0] || (product as any)?.category || categoriesArr[0] || item.category;
                              const categorySlug = category ? generateSlug(category) : '';
                              if (categorySlug) navigate(`/${categorySlug}/${slug}`);
                            }
                          }
                        }}
                      >
                        {firstItem?.title}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        {firstItem?.productType === 'poster' && firstItem?.posterSize 
                          ? `Poster ${firstItem.posterSize}`
                          : firstItem?.productType === 'clothing'
                          ? 'Clothing'
                          : 'Digital'} • {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="font-semibold text-gray-900 text-sm mt-1">{formatUIPrice(order.total, 'INR')}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={(e) => { e.stopPropagation(); openTrackingModal(order); }}
                          disabled={trackingLoading[order.id]}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {trackingLoading[order.id] ? (
                            <div className="w-2.5 h-2.5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Truck className="w-2.5 h-2.5" />
                          )}
                          Track
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReviewProduct(firstItem, order.id, (firstItem as any).orderItemId); }}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <Star className="w-2.5 h-2.5" />
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compact Pagination */}
            {filteredOrders.length > ordersPerPage && (
              <div className="flex items-center justify-center gap-1 pt-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded disabled:opacity-30"
                >
                  ←
                </button>
                
                <div className="flex items-center gap-0.5">
                  {(() => {
                    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
                    const pages = [];
                    let startPage = Math.max(1, currentPage - 1);
                    let endPage = Math.min(totalPages, currentPage + 1);
                    
                    if (currentPage === 1) endPage = Math.min(3, totalPages);
                    if (currentPage === totalPages) startPage = Math.max(1, totalPages - 2);
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-6 h-6 text-xs rounded border ${
                            currentPage === i
                              ? 'bg-white text-gray-900 border-gray-400'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    return pages;
                  })()}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredOrders.length / ordersPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(filteredOrders.length / ordersPerPage)}
                  className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded disabled:opacity-30"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };


  const renderFavorites = () => {

    const updateFavoriteFilters = (newFilters: Partial<typeof favoriteFilters>) => {
      setFavoriteFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleRemoveFavorite = (artworkId: string) => {
      // In a real app, this would remove from backend

      // For now, just show an alert
      alert('Favorite removed! (This would be saved to your account in a real app)');
    };

    const handleViewProduct = (artwork: any) => {
      navigate(generateProductUrl(artwork.category, artwork.title));
    };

    return (
      <div className="space-y-4">
        {/* Favorites Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-800 font-sans font-normal">My Favorites</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFavoriteFilters(!showFavoriteFilters)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="font-sans font-normal text-xs">Filters</span>
              </button>
              <button
                onClick={() => navigate('/browse')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="font-sans font-normal text-xs">Browse More</span>
              </button>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 font-sans font-normal">Saved Items</p>
                <p className="text-xs text-gray-500 mt-1 font-sans font-normal">{filteredFavorites.length} of {userFavorites.length} favorites</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Heart className="w-5 h-5 text-gray-700" />
                </div>
                <span className="text-2xl font-bold text-gray-900 font-sans font-normal">{userFavorites.length}</span>
              </div>
            </div>
          </div>
          {userFavorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2 font-sans font-normal">No Favorites Yet</h4>
              <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto font-sans font-normal">Save artwork you love to see them here. Click the heart icon on any product to add it to your favorites.</p>
              <button
                onClick={() => navigate('/browse')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="font-sans font-normal text-xs">Browse Artwork</span>
              </button>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2 font-sans font-normal">No Favorites Match Your Filters</h4>
              <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto font-sans font-normal">Try adjusting your filters to see more results.</p>
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
                className="px-3 py-1.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <span className="font-sans font-normal text-xs">Clear all filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFavorites.map((artwork) => (
                <div key={artwork.id} className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewProduct(artwork)}>
                  <div className="relative overflow-hidden">
                    <img
                      src={artwork.images?.[0] || '/api/placeholder/400/400'}
                      alt={artwork.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProduct(artwork);
                        }}
                        className="p-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        title="View Product"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-700" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(artwork.id);
                        }}
                        className="p-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Remove from Favorites"
                      >
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 truncate text-sm font-sans font-normal">
                      {artwork.title}
                    </h4>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-900 text-base font-sans font-normal">{formatUIPrice(artwork.price, 'INR')}</span>
                      <div className="flex items-center text-xs text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium font-sans font-normal">{artwork.rating}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProduct(artwork);
                        }}
                        className="flex-1 py-1.5 px-2.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                      >
                        <span className="font-sans font-normal">View Details</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/checkout?product=${artwork.id}`);
                        }}
                        className="flex-1 py-1.5 px-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                      >
                        <span className="font-sans font-normal">Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    if (ordersLoading) {
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-8 w-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Download Items Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                        <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

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
      <div className="space-y-4">
        {/* Downloads Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FileDown className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-800 font-sans font-normal">My Downloads</h3>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 font-sans font-normal">Available Downloads</p>
                <p className="text-xs text-gray-500 mt-1 font-sans font-normal">{downloadableItems.length} digital files ready</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileDown className="w-5 h-5 text-gray-700" />
                </div>
                <span className="text-2xl font-bold text-gray-900 font-sans font-normal">{downloadableItems.length}</span>
              </div>
            </div>
          </div>
          {downloadableItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileDown className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2 font-sans font-normal">No Digital Downloads Available</h4>
              <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto font-sans font-normal">Purchase digital products to access PDF files and high-resolution images for download.</p>
              <button
                onClick={() => navigate('/browse')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="font-sans font-normal text-xs">Browse Artwork</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {downloadableItems.map((item) => (
                <div key={`${item.orderId}-${item.id}`} className="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors h-fit">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start space-x-3">
                      <img src={item.images?.[0] || '/api/placeholder/400/400'} alt={item.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 font-sans font-normal">{item.title}</h4>
                        <p className="text-xs text-gray-500 mb-2 font-sans font-normal">
                          {item.productType === 'poster' && item.posterSize 
                            ? `Poster Size: ${item.posterSize} • Poster Product`
                            : 'Digital Product'
                          }
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="font-sans font-normal">Purchased: {new Date(item.orderDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900 text-sm">{formatUIPrice(item.price, 'INR')}</span>
                      <button
                        onClick={() => handleDownload(item.downloadUrl || '', item.title)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                        title="Download Files"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="font-sans font-normal">Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => {

    const validateForm = () => {
      const errors: Record<string, string> = {};
      
      if (!userProfile.firstName.trim()) {
        errors.firstName = 'Name is required';
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
        // Split the name into first and last name
        const nameParts = userProfile.firstName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
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

    const handleDownloadData = async () => {
      try {
        // Create a data export object
        const userData = {
          profile: {
            firstName: userProfile.firstName,
            lastName: '',
            fullName: userProfile.firstName,
            email: userProfile.email,
            bio: userProfile.bio,
            joinDate: userProfile.joinDate
          },
          orders: userOrders,
          favorites: userFavorites,
          downloads: userDownloads,
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
      <div className="space-y-4">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-800 font-sans font-normal">Profile Management</h3>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <span className="font-sans font-normal">{isSaving ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormErrors({});
                      // Reset to original values
                      const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
                      const nameParts = fullName.split(' ');
                      
                      setUserProfile({
                        firstName: user?.user_metadata?.full_name || `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || nameParts.join(' ') || '',
                        lastName: '',
                        email: user?.email || '',
                        location: user?.user_metadata?.location || '',
                        bio: user?.user_metadata?.bio || 'Welcome to your dashboard!',
                        joinDate: user?.created_at || new Date().toISOString(),
                        avatar: user?.user_metadata?.avatar || null
                      });
                    }}
                    className="px-3 py-1.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <span className="font-sans font-normal">Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="font-sans font-normal">Edit Profile</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans font-normal">Name</label>
                <input
                  type="text"
                  value={userProfile.firstName}
                  onChange={(e) => {
                    setUserProfile({ ...userProfile, firstName: e.target.value });
                    if (formErrors.firstName) setFormErrors({ ...formErrors, firstName: '' });
                  }}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isEditing 
                      ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  placeholder="Name"
                />
                {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-sans font-normal">Email</label>
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => {
                    setUserProfile({ ...userProfile, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm ${
                    formErrors.email 
                      ? 'border-red-300 focus:ring-red-300' 
                      : ''
                  }`}
                  required
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-sans font-normal">Bio</label>
              <textarea
                value={userProfile.bio}
                onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
              />
            </div>
          </div>
      </div>

      {/* Address Management & Privacy & Security - Side by Side */}
      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div>
            <AddressManagement userId={user.id} />
          </div>
          <div>
            {/* Privacy & Security */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-800 font-sans font-normal">Privacy & Security</h3>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={handleChangePassword}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Key className="w-3.5 h-3.5 text-gray-700" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 text-xs font-sans font-normal">Change Password</h4>
                      <p className="text-gray-600 text-[10px] font-sans font-normal">Update your account password</p>
                    </div>
                  </div>
                </button>
                
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  };

  const renderReturns = () => {
    if (showReturnForm && selectedOrderItem && selectedOrder) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 font-sans font-normal">Request Return</h2>
            <button
              onClick={handleReturnCancel}
              className="p-2 rounded bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ReturnRequestForm
            orderId={selectedOrder.id}
            itemId={selectedOrderItem.orderItemId}
            productTitle={selectedOrderItem.title}
            productImage={selectedOrderItem.images?.[0]}
            quantity={1}
            unitPrice={selectedOrderItem.price}
            totalPrice={selectedOrderItem.price}
            selectedProductType={selectedOrderItem.productType}
            onSuccess={handleReturnSuccess}
            onCancel={handleReturnCancel}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-sans font-normal">Returns & Refunds</h2>
            <p className="text-gray-600 text-sm mt-1">Track your return requests and refund status</p>
          </div>
          <button
            onClick={() => navigate('/returns-and-refunds')}
            className="bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            View Return Policy
          </button>
        </div>

        <ReturnRequestsList customerEmail={user?.email || ''} />
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'settings': return renderSettings();
      case 'orders': return renderOrders();
      case 'returns': return renderReturns();
      case 'favorites': return renderFavorites();
      case 'downloads': return renderDownloads();
      default: return renderSettings();
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-white font-sans">
      <div className="relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main Content */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm shadow-gray-100 overflow-hidden">
              <div className="p-4">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded transition-all duration-200 ${
                  isActive
                    ? 'text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="w-6 h-6 rounded flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium font-sans font-normal">{tab.label}</span>
              </button>
            );
          })}
          
          {/* Logout Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              handleLogout();
            }}
            className="flex flex-col items-center space-y-1 px-3 py-2 rounded transition-all duration-200 text-red-600 hover:text-red-700"
          >
            <div className="w-6 h-6 rounded flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium font-sans font-normal">Logout</span>
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

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={showTrackingModal}
        onClose={closeTrackingModal}
        order={selectedOrderForTracking}
        trackingData={selectedOrderForTracking ? trackingData[selectedOrderForTracking.id] : null}
      />

      {/* Order Detail Modal (for orders with more than 1 product) */}
      {showOrderDetailModal && selectedOrderForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeOrderDetailModal}>
          <div
            className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-medium">Order #{getOrderDisplayNumber(selectedOrderForDetail.id)}</span>
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  selectedOrderForDetail.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  selectedOrderForDetail.status === 'processing' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  selectedOrderForDetail.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  (selectedOrderForDetail.status === 'cancelled' || selectedOrderForDetail.status === 'failed') ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  {selectedOrderForDetail.status.charAt(0).toUpperCase() + selectedOrderForDetail.status.slice(1)}
                </span>
              </div>
              <button onClick={closeOrderDetailModal} className="p-2 rounded bg-white border border-gray-300 text-gray-600 hover:bg-gray-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-xs text-gray-500 mb-4">{new Date(selectedOrderForDetail.date).toLocaleDateString('en-US', { dateStyle: 'medium' })} • {formatUIPrice(selectedOrderForDetail.total, 'INR')} total</p>
              <div className="space-y-4">
                {selectedOrderForDetail.items.map((item: any, idx: number) => (
                  <div key={item.orderItemId || idx} className="flex gap-3 p-3 rounded-lg border border-gray-100">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      <img src={item.images?.[0] || '/api/placeholder/400/400'} alt={item.title} className="w-full h-full object-cover" onContextMenu={(e) => e.preventDefault()} draggable={false} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.productType === 'poster' && item.posterSize ? `Poster ${item.posterSize}` : item.productType === 'clothing' ? 'Clothing' : 'Digital'}
                      </p>
                      <p className="font-semibold text-gray-900 text-sm mt-1">{formatUIPrice(item.price, 'INR')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => { openTrackingModal(selectedOrderForDetail); }}
                          disabled={trackingLoading[selectedOrderForDetail.id]}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                          {trackingLoading[selectedOrderForDetail.id] ? <div className="w-2.5 h-2.5 border-2 border-gray-400 border-t-white rounded-full animate-spin" /> : <Truck className="w-2.5 h-2.5" />}
                          Track
                        </button>
                        <button
                          onClick={() => { handleReviewProduct(item, selectedOrderForDetail.id, item.orderItemId); closeOrderDetailModal(); }}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          <Star className="w-2.5 h-2.5" />
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Key className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-sans font-normal">Change Password</h3>
              </div>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordForm({ newPassword: '', confirmPassword: '' });
                  setPasswordErrors({ newPassword: '', confirmPassword: '', general: '' });
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="p-2 rounded bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {passwordErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-sans font-normal">{passwordErrors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans font-normal">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className={`w-full px-4 py-2 pr-10 border ${
                      passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 font-sans font-normal">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans font-normal">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-2 pr-10 border ${
                      passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 font-sans font-normal">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handlePasswordSubmit}
                  disabled={isChangingPassword}
                  className="flex-1 bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-sans font-normal">{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordForm({ newPassword: '', confirmPassword: '' });
                    setPasswordErrors({ newPassword: '', confirmPassword: '', general: '' });
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  disabled={isChangingPassword}
                  className="flex-1 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-sans font-normal">Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;




