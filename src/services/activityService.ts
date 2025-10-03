import { supabase } from './supabaseService';
import CurrencyService from './currencyService';

export interface Activity {
  id: string;
  type: 'order' | 'upload' | 'edit' | 'view' | 'delete' | 'user' | 'product' | 'category';
  user: string;
  user_id?: string;
  action: string;
  details: string;
  timestamp: string;
  icon: string;
  color: string;
  metadata?: any;
}

export interface ActivityStats {
  totalActivities: number;
  ordersToday: number;
  uploadsToday: number;
  activeUsers: number;
  recentActivity: Activity[];
}

export class ActivityService {
  // Get all activities from various sources
  static async getAllActivities(limit: number = 50): Promise<Activity[]> {
    try {
      const activities: Activity[] = [];

      // Get recent orders with currency information
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, total_amount, status, created_at, updated_at, currency_code, currency_rate')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!ordersError && orders) {
        orders.forEach(order => {
          // Get currency information
          const orderCurrency = order.currency_code || 'INR';
          const currencyRate = order.currency_rate || 1.0;
          
          // Convert amount to display currency (from stored currency to current default)
          const currencySettings = CurrencyService.getCurrencySettings();
          const displayCurrency = currencySettings.defaultCurrency;
          
          // Convert the amount from order currency to display currency
          const convertedAmount = CurrencyService.convertAmount(
            order.total_amount, 
            orderCurrency, 
            displayCurrency
          );
          
          // Format the amount with proper currency symbol
          const formattedAmount = CurrencyService.formatCurrency(convertedAmount, displayCurrency);
          
          activities.push({
            id: `order-${order.id}`,
            type: 'order',
            user: order.customer_name,
            user_id: order.customer_email,
            action: order.status === 'completed' ? 'completed purchase' : 'placed order',
            details: `Order #${order.id.slice(-8)} - ${order.status === 'completed' ? 'Completed' : 'Pending'} (${formattedAmount})`,
            timestamp: order.updated_at || order.created_at,
            icon: 'ShoppingBag',
            color: 'text-green-600',
            metadata: { 
              orderId: order.id, 
              amount: order.total_amount, 
              status: order.status,
              currency: orderCurrency,
              displayAmount: convertedAmount,
              displayCurrency: displayCurrency
            }
          });
        });
      }

      // Get recent product uploads/updates
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title, created_date, updated_at, created_by')
        .order('created_date', { ascending: false })
        .limit(15);

      if (!productsError && products) {
        products.forEach(product => {
          const isNew = new Date(product.created_date).getTime() === new Date(product.updated_at || product.created_date).getTime();
          activities.push({
            id: `product-${product.id}`,
            type: 'upload',
            user: 'Artist',
            user_id: product.created_by,
            action: isNew ? 'uploaded new artwork' : 'updated artwork',
            details: `${product.title}`,
            timestamp: product.updated_at || product.created_date,
            icon: 'Upload',
            color: 'text-blue-600',
            metadata: { productId: product.id, isNew }
          });
        });
      }

      // Get recent category updates
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (!categoriesError && categories) {
        categories.forEach(category => {
          const isNew = new Date(category.created_at).getTime() === new Date(category.updated_at || category.created_at).getTime();
          activities.push({
            id: `category-${category.id}`,
            type: 'category',
            user: 'Admin',
            action: isNew ? 'created category' : 'updated category',
            details: `${category.name}`,
            timestamp: category.updated_at || category.created_at,
            icon: 'Edit',
            color: 'text-purple-600',
            metadata: { categoryId: category.id, isNew }
          });
        });
      }

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return activities.slice(0, limit);
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  // Get activity statistics
  static async getActivityStats(): Promise<ActivityStats> {
    try {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      // Get today's orders with currency information
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, currency_code, currency_rate')
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString());

      // Get today's product uploads
      const { data: todayProducts, error: productsError } = await supabase
        .from('products')
        .select('id, created_date')
        .gte('created_date', todayStart.toISOString())
        .lt('created_date', todayEnd.toISOString());

      // Get total orders count
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total products count
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get recent activities
      const recentActivity = await this.getAllActivities(10);

      return {
        totalActivities: (totalOrders || 0) + (totalProducts || 0),
        ordersToday: todayOrders?.length || 0,
        uploadsToday: todayProducts?.length || 0,
        activeUsers: Math.floor(Math.random() * 50) + 20, // Mock data for now
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {
        totalActivities: 0,
        ordersToday: 0,
        uploadsToday: 0,
        activeUsers: 0,
        recentActivity: []
      };
    }
  }

  // Filter activities by type and time range
  static async filterActivities(filters: {
    type?: string;
    timeRange?: string;
    limit?: number;
  }): Promise<Activity[]> {
    try {
      let activities = await this.getAllActivities(100);

      // Filter by type
      if (filters.type && filters.type !== 'all') {
        activities = activities.filter(activity => activity.type === filters.type);
      }

      // Filter by time range
      if (filters.timeRange) {
        const now = new Date();
        let startDate: Date;

        switch (filters.timeRange) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0); // All time
        }

        activities = activities.filter(activity => 
          new Date(activity.timestamp) >= startDate
        );
      }

      return activities.slice(0, filters.limit || 50);
    } catch (error) {
      console.error('Error filtering activities:', error);
      return [];
    }
  }

  // Log a new activity (for future use)
  static async logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      // In a real implementation, you might want to store activities in a dedicated table

      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  }

  // Get activities by user
  static async getActivitiesByUser(userId: string, limit: number = 20): Promise<Activity[]> {
    try {
      const activities = await this.getAllActivities(100);
      return activities
        .filter(activity => activity.user_id === userId)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }

  // Get activity trends (for analytics)
  static async getActivityTrends(days: number = 7): Promise<{ date: string; count: number }[]> {
    try {
      const trends = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);

        // Count orders for this day
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateStart.toISOString())
          .lt('created_at', dateEnd.toISOString());

        // Count product uploads for this day
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .gte('created_date', dateStart.toISOString())
          .lt('created_date', dateEnd.toISOString());

        trends.push({
          date: dateStart.toISOString().split('T')[0],
          count: (orderCount || 0) + (productCount || 0)
        });
      }

      return trends;
    } catch (error) {
      console.error('Error fetching activity trends:', error);
      return [];
    }
  }
}
