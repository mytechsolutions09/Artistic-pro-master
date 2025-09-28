import { supabase } from './supabaseService';
import { CurrencyService } from './currencyService';
import { Cart, CartItem, ArtWork } from '../types';

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  payment_method: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  shipping_address?: string;
  download_links?: string[];
  currency_code?: string;
  currency_rate?: number;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_product_type?: string;
  selected_poster_size?: string;
  currency_code?: string;
  currency_rate?: number;
  products?: {
    id: string;
    title: string;
    main_image?: string;
    pdf_url?: string;
  };
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  dateRange?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

class OrderService {
  // Get all orders with order items
  async getAllOrders(filters?: OrderFilters): Promise<Order[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              title,
              main_image,
              pdf_url
            )
          )
        `);

      // Apply filters
      if (filters?.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              title,
              main_image,
              pdf_url
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return null;
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      return true;
  } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return false;
    }
  }

  // Get order statistics
  async getOrderStats(): Promise<OrderStats> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*');

      if (error) {
        console.error('Error fetching orders for stats:', error);
        throw error;
      }

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const todayOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= todayStart && orderDate < todayEnd;
      }) || [];

      // Calculate revenue in default currency
      const currencySettings = CurrencyService.getCurrencySettings();
      const totalRevenue = orders?.reduce((sum, order) => {
        const orderCurrency = order.currency_code || 'INR';
        const convertedAmount = CurrencyService.convertAmount(
          order.total_amount,
          orderCurrency,
          currencySettings.defaultCurrency
        );
        return sum + convertedAmount;
      }, 0) || 0;

      const todayRevenue = todayOrders.reduce((sum, order) => {
        const orderCurrency = order.currency_code || 'INR';
        const convertedAmount = CurrencyService.convertAmount(
          order.total_amount,
          orderCurrency,
          currencySettings.defaultCurrency
        );
        return sum + convertedAmount;
      }, 0);

    return {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        processing: orders?.filter(o => o.status === 'processing').length || 0,
        completed: orders?.filter(o => o.status === 'completed').length || 0,
        cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
        refunded: orders?.filter(o => o.status === 'refunded').length || 0,
        totalRevenue,
        todayOrders: todayOrders.length,
        todayRevenue
      };
    } catch (error) {
      console.error('Error in getOrderStats:', error);
      throw error;
    }
  }

  // Delete order
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        return false;
      }

      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) {
        console.error('Error deleting order:', orderError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteOrder:', error);
      return false;
    }
  }
}

// Cart Manager for managing shopping cart state
class CartManager {
  private static cart: Cart = { items: [], total: 0 };
  private static subscribers: ((cart: Cart) => void)[] = [];
  
  static getCart(): Cart {
    return { ...this.cart };
  }
  
  static getItemCount(): number {
    return this.cart.items.reduce((count, item) => count + item.quantity, 0);
  }

  static addItem(product: ArtWork, quantity: number = 1, selectedProductType?: string, selectedPosterSize?: string): void {
    const existingItemIndex = this.cart.items.findIndex(
      item => item.product.id === product.id && 
      item.selectedProductType === selectedProductType && 
      item.selectedPosterSize === selectedPosterSize
    );

    let selectedPrice = product.price;
    
    // Calculate price based on product type and size
    if (selectedProductType === 'poster' && selectedPosterSize && product.posterPricing) {
      const originalPrice = product.posterPricing[selectedPosterSize] || product.price;
      // Apply discount if available
      if (product.discountPercentage && product.discountPercentage > 0) {
        selectedPrice = Math.round(originalPrice * (1 - (product.discountPercentage / 100)));
      } else {
        selectedPrice = originalPrice;
      }
    } else {
      // For digital products, use the price as-is (it's already the discounted price)
      selectedPrice = product.price;
    }
    
    if (existingItemIndex >= 0) {
      this.cart.items[existingItemIndex].quantity += quantity;
    } else {
      this.cart.items.push({
        product,
        quantity,
        selectedProductType,
        selectedPosterSize,
        selectedPrice
      });
    }

    this.calculateTotal();
    this.notifySubscribers();
  }
  
  static updateQuantity(productId: string, quantity: number): void {
    const itemIndex = this.cart.items.findIndex(item => item.product.id === productId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        this.cart.items.splice(itemIndex, 1);
      } else {
        this.cart.items[itemIndex].quantity = quantity;
      }
      
      this.calculateTotal();
      this.notifySubscribers();
    }
  }

  static removeItem(productId: string): void {
    this.cart.items = this.cart.items.filter(item => item.product.id !== productId);
    this.calculateTotal();
    this.notifySubscribers();
  }
  
  static clearCart(): void {
    this.cart = { items: [], total: 0 };
    this.notifySubscribers();
  }
  
  static subscribe(callback: (cart: Cart) => void): () => void {
    this.subscribers.push(callback);
  
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private static calculateTotal(): void {
    this.cart.total = this.cart.items.reduce((total, item) => {
      return total + (item.selectedPrice * item.quantity);
    }, 0);
  }

  private static notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.getCart()));
  }
}

// Order Manager for user-specific order operations
class OrderManager {
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              title,
              main_image,
              pdf_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserOrders:', error);
      return [];
    }
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              title,
              main_image,
              pdf_url
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return null;
    }
  }
}

export const orderService = new OrderService();
export { CartManager, OrderManager };
export default orderService;
