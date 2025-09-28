import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product } from '../types';
import CurrencyService from './currencyService';

// Lazy initialization for Supabase client
let _supabase: SupabaseClient | null = null;

// Function to get Supabase configuration
function getSupabaseConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Validate required environment variables
  if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
    console.error('❌ VITE_SUPABASE_URL is not set or is using default value');
    console.error('Please set VITE_SUPABASE_URL in your .env file');
    throw new Error('VITE_SUPABASE_URL is required');
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
    console.error('❌ VITE_SUPABASE_ANON_KEY is not set or is using default value');
    console.error('Please set VITE_SUPABASE_ANON_KEY in your .env file');
    throw new Error('VITE_SUPABASE_ANON_KEY is required');
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey
  };
}

// Lazy getter for Supabase client
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    try {
      const config = getSupabaseConfig();
      _supabase = createClient(config.url, config.anonKey);
      console.log('✅ Supabase client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      throw error;
    }
  }
  return _supabase;
}

// Backward compatibility export - this will be initialized when first accessed
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  }
});

// Types
export interface TaskData {
  id?: number;
  title: string;
  description?: string;
  priority: 'normal' | 'important' | 'urgent';
  status: 'todo' | 'inprogress' | 'review' | 'completed';
  due_date?: string;
  assignee?: string;
  avatar?: string;
  tags?: string[];
  progress?: number;
  comments?: number;
  attachments?: number;
  color?: string;
  category_id?: number;
  template_id?: number;
  estimated_hours?: number;
  actual_hours?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'artist' | 'customer';
  avatar?: string;
  created_at?: string;
  total_purchases?: number;
  is_active?: boolean;
}

// Product interface is imported from types/index.ts

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  payment_method: 'card' | 'paypal' | 'bank_transfer';
  payment_id?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  shipping_address?: string;
  download_links?: string[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_product_type?: 'digital' | 'poster';
  selected_poster_size?: string;
}

// Storage bucket configuration
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: import.meta.env.VITE_PRODUCT_IMAGES_BUCKET || 'product-images',
  CATEGORY_IMAGES: import.meta.env.VITE_CATEGORY_IMAGES_BUCKET || 'category-images',
  USER_AVATARS: import.meta.env.VITE_USER_AVATARS_BUCKET || 'user-avatars'
} as const;

// Helper function to check if bucket exists and create it if needed
async function ensureBucketExists(bucketName: string) {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.warn(`Could not create bucket ${bucketName}:`, createError);
        // Continue anyway - the bucket might already exist or user might not have permissions
      }
    }
  } catch (error) {
    console.warn(`Could not check bucket ${bucketName}:`, error);
    // Continue anyway - the bucket might already exist
  }
}

// Storage configuration check
export async function checkStorageConfiguration(): Promise<{
  isConfigured: boolean;
  buckets: string[];
  errors: string[];
}> {
  const result = {
    isConfigured: true,
    buckets: [] as string[],
    errors: [] as string[]
  };

  try {
    // Check if we can access storage
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      result.isConfigured = false;
      result.errors.push(`Storage access error: ${error.message}`);
      return result;
    }

    result.buckets = buckets.map(bucket => bucket.name);

    // Check if required buckets exist
    const requiredBuckets = [
      STORAGE_BUCKETS.PRODUCT_IMAGES,
      STORAGE_BUCKETS.CATEGORY_IMAGES,
      STORAGE_BUCKETS.USER_AVATARS
    ];

    for (const bucketName of requiredBuckets) {
      if (!result.buckets.includes(bucketName)) {
        result.isConfigured = false;
        result.errors.push(`Required bucket '${bucketName}' not found`);
      }
    }

    // Test upload permissions for product images bucket
    if (result.buckets.includes(STORAGE_BUCKETS.PRODUCT_IMAGES)) {
      try {
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
          .upload('test/test.txt', testFile);
        
        if (uploadError) {
          result.isConfigured = false;
          result.errors.push(`Upload permission error: ${uploadError.message}`);
        } else {
          // Clean up test file
          await supabase.storage
            .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
            .remove(['test/test.txt']);
        }
      } catch (testError) {
        result.isConfigured = false;
        result.errors.push(`Storage test failed: ${testError}`);
      }
    }

  } catch (error) {
    result.isConfigured = false;
    result.errors.push(`Storage configuration check failed: ${error}`);
  }

  return result;
}

// Task Management Service
export class TaskService {
  static async getAllTasks(): Promise<TaskData[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  static async getTaskStats() {
    try {
      const { data, error } = await supabase
        .from('task_stats')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      return null;
    }
  }

  static async createTask(task: Omit<TaskData, 'id'>): Promise<TaskData | null> {
    try {
      const { data, error } = await supabase
        .rpc('create_task', {
          p_title: task.title,
          p_description: task.description,
          p_priority: task.priority,
          p_status: task.status,
          p_due_date: task.due_date,
          p_assignee: task.assignee,
          p_tags: JSON.stringify(task.tags || []),
          p_category_id: task.category_id,
          p_template_id: task.template_id,
          p_color: task.color || 'blue',
          p_estimated_hours: task.estimated_hours || 0
        });

      if (error) throw error;

      // Fetch the created task
      const { data: newTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  static async updateTask(id: number, updates: Partial<TaskData>): Promise<TaskData | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  }

  static async deleteTask(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  static async filterTasks(filters: {
    status?: string;
    priority?: string;
    assignee?: string;
    category_id?: number;
    tags?: string[];
    search?: string;
    due_date_from?: string;
    due_date_to?: string;
    overdue_only?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      const { data, error } = await supabase
        .rpc('filter_tasks', {
          p_status: filters.status,
          p_priority: filters.priority,
          p_assignee: filters.assignee,
          p_category_id: filters.category_id,
          p_tags: filters.tags ? JSON.stringify(filters.tags) : null,
          p_search: filters.search,
          p_due_date_from: filters.due_date_from,
          p_due_date_to: filters.due_date_to,
          p_overdue_only: filters.overdue_only || false,
          p_limit: filters.limit || 50,
          p_offset: filters.offset || 0
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error filtering tasks:', error);
      return [];
    }
  }

  static async getFilterOptions() {
    try {
      const { data, error } = await supabase
        .rpc('get_filter_options');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching filter options:', error);
      return null;
    }
  }

  static async cloneTask(id: number): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .rpc('clone_task', { p_task_id: id });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error cloning task:', error);
      return null;
    }
  }
}

// User Management Service
export class UserService {
  // Store mock users in memory for persistence during session
  private static mockUsers: User[] = [
    { id: '1', name: 'Luna Martinez', email: 'luna@email.com', role: 'artist', total_purchases: 0, is_active: true, created_at: '2024-01-15T10:30:00Z' },
    { id: '2', name: 'Alex Chen', email: 'alex@email.com', role: 'artist', total_purchases: 0, is_active: true, created_at: '2024-02-20T14:45:00Z' },
    { id: '3', name: 'Sarah Wilson', email: 'sarah@email.com', role: 'customer', total_purchases: 5, is_active: true, created_at: '2024-03-10T09:15:00Z' },
    { id: '4', name: 'Mike Johnson', email: 'mike@email.com', role: 'customer', total_purchases: 12, is_active: true, created_at: '2024-03-25T16:20:00Z' },
    { id: '5', name: 'Arpit Kanotra', email: 'arpitkanotra@ymail.com', role: 'admin', total_purchases: 0, is_active: true, created_at: '2024-01-01T00:00:00Z' }
  ];

  static async getAllUsers(): Promise<User[]> {
    try {
      // Return the in-memory mock users
      return [...this.mockUsers];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      // Mock implementation - in real app, this would create user in Supabase Auth
      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        created_at: new Date().toISOString()
      };
      // Add to mock users array
      this.mockUsers.push(newUser);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Mock implementation - in real app, this would update user in Supabase
      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      const updatedUser = { ...this.mockUsers[userIndex], ...updates };
      // Update the mock users array
      this.mockUsers[userIndex] = updatedUser;
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      // Mock implementation - in real app, this would delete user from Supabase
      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      // Remove from mock users array
      this.mockUsers.splice(userIndex, 1);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async getUserStats() {
    try {
      const users = await this.getAllUsers();
      return {
        total: users.length,
        customers: users.filter(u => u.role === 'customer').length,
        artists: users.filter(u => u.role === 'artist').length,
        admins: users.filter(u => u.role === 'admin').length,
        active: users.filter(u => u.is_active).length
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }
}

// Order Management Service
export class OrderService {
  static async getAllOrders(): Promise<Order[]> {
    try {
      // Mock orders data - in real implementation, this would connect to orders table
      const mockOrders: Order[] = [
        {
          id: 'ORD-001',
          customer_id: 'user-1',
          customer_name: 'Sarah Johnson',
          customer_email: 'sarah.johnson@email.com',
          items: [
            {
              id: 'item-1',
              product_id: 'p1',
              product_title: 'Ethereal Dreams',
              product_image: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=100',
              quantity: 1,
              unit_price: 29.99,
              total_price: 29.99
            }
          ],
          total_amount: 29.99,
          status: 'completed',
          payment_method: 'card',
          payment_id: 'pay_001',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          download_links: ['https://api.example.com/download/1']
        },
        {
          id: 'ORD-002',
          customer_id: 'user-2',
          customer_name: 'Mike Chen',
          customer_email: 'mike.chen@email.com',
          items: [
            {
              id: 'item-2',
              product_id: 'p2',
              product_title: 'Digital Portrait Collection',
              product_image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=100',
              quantity: 2,
              unit_price: 24.99,
              total_price: 49.98
            }
          ],
          total_amount: 49.98,
          status: 'processing',
          payment_method: 'paypal',
          payment_id: 'pay_002',
          created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          updated_at: new Date(Date.now() - 21600000).toISOString() // 6 hours ago
        },
        {
          id: 'ORD-003',
          customer_id: 'user-3',
          customer_name: 'Emily Davis',
          customer_email: 'emily.davis@email.com',
          items: [
            {
              id: 'item-3',
              product_id: 'p3',
              product_title: 'Abstract Art Bundle',
              product_image: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=100',
              quantity: 1,
              unit_price: 79.99,
              total_price: 79.99
            }
          ],
          total_amount: 79.99,
          status: 'pending',
          payment_method: 'card',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          notes: 'Customer requested expedited processing'
        }
      ];
      return mockOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  static async getOrderById(id: string): Promise<Order | null> {
    try {
      const orders = await this.getAllOrders();
      return orders.find(order => order.id === id) || null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  static async updateOrderStatus(id: string, status: Order['status'], notes?: string): Promise<Order | null> {
    try {
      // In real implementation, this would update the database
      console.log(`Updating order ${id} to status: ${status}`);
      if (notes) console.log(`Notes: ${notes}`);
      
      const orders = await this.getAllOrders();
      const order = orders.find(o => o.id === id);
      if (order) {
        return {
          ...order,
          status,
          notes: notes || order.notes,
          updated_at: new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('Error updating order status:', error);
      return null;
    }
  }

  static async getOrderStats() {
    try {
      // Get orders with currency information
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, status, created_at, currency_code, currency_rate');

      if (error) {
        console.error('Error fetching orders for stats:', error);
        return null;
      }

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const todayOrders = orders?.filter(order => 
        new Date(order.created_at) >= todayStart
      ) || [];
      
      // Calculate revenue with currency conversion
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

      const averageOrderValue = orders && orders.length > 0 
        ? totalRevenue / orders.length 
        : 0;

      return {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        processing: orders?.filter(o => o.status === 'processing').length || 0,
        completed: orders?.filter(o => o.status === 'completed').length || 0,
        cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
        todayOrders: todayOrders.length,
        todayRevenue,
        totalRevenue,
        averageOrderValue
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return null;
    }
  }

  static async filterOrders(filters: {
    status?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) {
    try {
      const orders = await this.getAllOrders();
      return orders.filter(order => {
        const matchesStatus = !filters.status || filters.status === 'all' || order.status === filters.status;
        const matchesPayment = !filters.payment_method || filters.payment_method === 'all' || order.payment_method === filters.payment_method;
        const matchesSearch = !filters.search || 
          order.customer_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          order.customer_email.toLowerCase().includes(filters.search.toLowerCase()) ||
          order.id.toLowerCase().includes(filters.search.toLowerCase());
        
        let matchesDate = true;
        if (filters.date_from) {
          matchesDate = matchesDate && new Date(order.created_at) >= new Date(filters.date_from);
        }
        if (filters.date_to) {
          matchesDate = matchesDate && new Date(order.created_at) <= new Date(filters.date_to);
        }
        
        return matchesStatus && matchesPayment && matchesSearch && matchesDate;
      });
    } catch (error) {
      console.error('Error filtering orders:', error);
      return [];
    }
  }

  static async refundOrder(id: string, reason?: string): Promise<boolean> {
    try {
      console.log(`Processing refund for order ${id}`);
      if (reason) console.log(`Refund reason: ${reason}`);
      // In real implementation, this would process the refund through payment gateway
      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }

  static async sendDownloadLinks(orderId: string, email?: string): Promise<boolean> {
    try {
      console.log(`Sending download links for order ${orderId}`);
      if (email) console.log(`Sending to: ${email}`);
      // In real implementation, this would send email with download links
      return true;
    } catch (error) {
      console.error('Error sending download links:', error);
      return false;
    }
  }
}

// Product Management Service
export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          favorites_count:favorites(count)
        `)
        .order('created_date', { ascending: false });

      if (error) throw error;
      
      // Transform database fields to interface fields
      return (data || []).map(product => ({
        ...product,
        productType: product.product_type || 'digital',
        posterSize: product.poster_size,
        posterPricing: product.poster_pricing,
        originalPrice: product.original_price,
        discountPercentage: product.discount_percentage,
        createdDate: product.created_date,
        itemDetails: product.item_details,
        delivery: product.delivery_info,
        didYouKnow: product.did_you_know,
        favoritesCount: product.favorites_count?.[0]?.count || 0
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  static async getProductStats() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('price, downloads, rating, status, featured');

      if (error) throw error;

      const products = data || [];
      const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.downloads), 0);
      const totalDownloads = products.reduce((sum, p) => sum + p.downloads, 0);
      const avgRating = products.length > 0 ? products.reduce((sum, p) => sum + p.rating, 0) / products.length : 0;

      return {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        featured: products.filter(p => p.featured).length,
        totalRevenue,
        totalDownloads,
        avgRating
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      return null;
    }
  }

  static async getProductByTitle(title: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('title', title)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      
      // Transform database fields to interface fields
      return data ? {
        ...data,
        productType: data.product_type || 'digital',
        posterSize: data.poster_size,
        posterPricing: data.poster_pricing,
        originalPrice: data.original_price,
        discountPercentage: data.discount_percentage,
        createdDate: data.created_date,
        itemDetails: data.item_details,
        delivery: data.delivery_info,
        didYouKnow: data.did_you_know
      } : null;
    } catch (error) {
      console.error('Error finding product by title:', error);
      return null;
    }
  }

  static async createProduct(productData: Omit<Product, 'id' | 'createdDate' | 'downloads' | 'rating' | 'reviews'> & {
    itemDetails?: any;
    delivery?: any;
    didYouKnow?: any;
  }): Promise<Product> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prevent duplicate titles (case-insensitive)
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .ilike('title', productData.title);
      if (existing && existing.length > 0) {
        throw new Error('A product with this name already exists. Please choose a different name.');
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          title: productData.title,
          price: productData.price,
          original_price: productData.originalPrice,
          discount_percentage: productData.discountPercentage,
          category: (productData.categories && productData.categories[0]) || 'General',
          categories: productData.categories,
          images: productData.images,
          main_image: productData.main_image || (productData.images && productData.images[0]) || null,
          pdf_url: productData.pdf_url || null,
          product_type: productData.productType,
          poster_size: productData.posterSize,
          poster_pricing: productData.posterPricing,
          featured: productData.featured,
          status: productData.status,
          description: productData.description,
          tags: productData.tags,
          created_by: user.id,
          item_details: productData.itemDetails || {},
          delivery_info: productData.delivery || {},
          did_you_know: productData.didYouKnow || {}
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Transform database fields to interface fields
      return {
        ...data,
        productType: data.product_type || 'digital',
        posterSize: data.poster_size,
        posterPricing: data.poster_pricing,
        originalPrice: data.original_price,
        discountPercentage: data.discount_percentage,
        createdDate: data.created_date,
        itemDetails: data.item_details,
        delivery: data.delivery_info,
        didYouKnow: data.did_you_know
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(id: string, updates: Partial<Product> & {
    itemDetails?: any;
    delivery?: any;
    didYouKnow?: any;
  }): Promise<Product> {
    try {
      console.log('ProductService.updateProduct called with:', { id, updates });
      console.log('Categories being sent:', updates.categories);
      
      const updateData: any = {
        title: updates.title,
        price: updates.price,
        original_price: updates.originalPrice,
        discount_percentage: updates.discountPercentage,
        category: (updates.categories && updates.categories[0]) || undefined,
        categories: updates.categories,
        images: updates.images,
        main_image: updates.main_image,
        pdf_url: updates.pdf_url,
        video_url: (updates as any).video_url,
        product_type: updates.productType,
        poster_size: updates.posterSize,
        poster_pricing: updates.posterPricing,
        featured: updates.featured,
        status: updates.status,
        description: updates.description,
        tags: updates.tags
      };

      // Add optional fields if they exist
      if (updates.itemDetails !== undefined) updateData.item_details = updates.itemDetails;
      if (updates.delivery !== undefined) updateData.delivery_info = updates.delivery;
      if (updates.didYouKnow !== undefined) updateData.did_you_know = updates.didYouKnow;

      console.log('Update data being sent to database:', updateData);
      console.log('Looking for product with ID:', id);

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Product updated successfully:', data);
      
      // Transform database fields to interface fields
      return {
        ...data,
        productType: data.product_type || 'digital',
        posterSize: data.poster_size,
        posterPricing: data.poster_pricing,
        originalPrice: data.original_price,
        discountPercentage: data.discount_percentage,
        createdDate: data.created_date,
        itemDetails: data.item_details,
        delivery: data.delivery_info,
        didYouKnow: data.did_you_know
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  static async searchProducts(query: string, filters?: {
    category?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
  }): Promise<Product[]> {
    try {
      let queryBuilder = supabase
        .from('products')
        .select('*');

      // Add text search
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);
      }

      // Add filters
      if (filters?.category) {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }
      if (filters?.status) {
        queryBuilder = queryBuilder.eq('status', filters.status);
      }
      if (filters?.minPrice !== undefined) {
        queryBuilder = queryBuilder.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        queryBuilder = queryBuilder.lte('price', filters.maxPrice);
      }
      if (filters?.featured !== undefined) {
        queryBuilder = queryBuilder.eq('featured', filters.featured);
      }

      const { data, error } = await queryBuilder.order('created_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('status', 'active')
        .order('created_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('status', 'active')
        .order('created_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  static async incrementDownloads(productId: string): Promise<boolean> {
    try {
      // Get current product to increment downloads
      const product = await this.getProductById(productId);
      if (!product) throw new Error('Product not found');

      const { error } = await supabase
        .from('products')
        .update({ downloads: product.downloads + 1 })
        .eq('id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error incrementing downloads:', error);
      return false;
    }
  }

  static async updateRating(productId: string, newRating: number): Promise<boolean> {
    try {
      // Get current product to calculate new average rating
      const product = await this.getProductById(productId);
      if (!product) throw new Error('Product not found');

      const currentTotal = product.rating * (product.reviews?.length || 0);
      const newTotal = currentTotal + newRating;
      const newCount = (product.reviews?.length || 0) + 1;
      const newAverageRating = newTotal / newCount;

      const { error } = await supabase
        .from('products')
        .update({ rating: newAverageRating })
        .eq('id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating rating:', error);
      return false;
    }
  }

  // Image Management Methods
  static async uploadProductImage(file: File, productId: string): Promise<string> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate file
      if (!file) throw new Error('No file provided');
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed');
      }

      // Bucket should already exist - no need to create it

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        if (error.message.includes('bucket')) {
          throw new Error(`Storage bucket '${STORAGE_BUCKETS.PRODUCT_IMAGES}' not found. Please create it in your Supabase dashboard.`);
        }
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('Failed to generate public URL for uploaded image');
      }

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  static async uploadProductImages(files: File[], productId: string): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadProductImage(file, productId));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  }

  static async deleteProductImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
        .remove([fileName]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  static async updateProductImages(productId: string, newImages: string[], oldImages: string[]): Promise<Product> {
    try {
      // Delete old images that are no longer needed
      const imagesToDelete = oldImages.filter(img => !newImages.includes(img));
      for (const imageUrl of imagesToDelete) {
        await this.deleteProductImage(imageUrl);
      }

      // Update product with new image URLs
      const { data, error } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product images:', error);
      throw error;
    }
  }

  static async getProductImageUrls(productId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
        .list(productId);

      if (error) throw error;

      const urls = data.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
          .getPublicUrl(`${productId}/${file.name}`);
        return publicUrl;
      });

      return urls;
    } catch (error) {
      console.error('Error getting product image URLs:', error);
      return [];
    }
  }

  // Enhanced createProduct method with image support
  static async createProductWithImages(productData: Omit<Product, 'id' | 'createdDate' | 'downloads' | 'rating' | 'reviews'>, images?: File[]): Promise<Product> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First create the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          title: productData.title,
          price: productData.price,
          categories: productData.categories,
          images: [], // Start with empty images array
          featured: productData.featured,
          status: productData.status,
          description: productData.description,
          tags: productData.tags,
          created_by: user.id
        }])
        .select()
        .single();

      if (productError) throw productError;

      // If images were provided, upload them
      if (images && images.length > 0) {
        const imageUrls = await this.uploadProductImages(images, product.id);
        
        // Update product with image URLs
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update({ images: imageUrls })
          .eq('id', product.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedProduct;
      }

      return product;
    } catch (error) {
      console.error('Error creating product with images:', error);
      throw error;
    }
  }

  // Bulk image operations
  static async bulkUploadImages(productId: string, files: File[]): Promise<string[]> {
    try {
      if (!files || files.length === 0) return [];
      
      const imageUrls = await this.uploadProductImages(files, productId);
      
      // Update product with new image URLs
      await this.updateProductImages(productId, imageUrls, []);
      
      return imageUrls;
    } catch (error) {
      console.error('Error in bulk image upload:', error);
      throw error;
    }
  }

  static async replaceProductImages(productId: string, newFiles: File[]): Promise<string[]> {
    try {
      // Get current product to get existing images
      const product = await this.getProductById(productId);
      if (!product) throw new Error('Product not found');

      // Delete all existing images
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          await this.deleteProductImage(imageUrl);
        }
      }

      // Upload new images
      const newImageUrls = await this.uploadProductImages(newFiles, productId);

      // Update product with new image URLs
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update({ images: newImageUrls })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return newImageUrls;
    } catch (error) {
      console.error('Error replacing product images:', error);
      throw error;
    }
  }

  // Image validation and processing
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, WebP, and GIF files are allowed' };
    }

    return { isValid: true };
  }

  // Removed compressImage method to preserve original file sizes and reduce egress costs
  // Images are now uploaded at their original resolution and quality
}

// Category Service
export class CategoryService {
  static async getAllCategories(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getCategoryById(id: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      return null;
    }
  }

  static async getCategoryBySlug(slug: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      return null;
    }
  }

  static async createCategory(categoryData: { name: string; slug: string; description?: string; image?: string; status?: string; featured?: boolean; tags?: string[] }): Promise<any> {
    try {
      console.log('Supabase createCategory called with:', categoryData);
      
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating category:', error);
        throw error;
      }
      
      console.log('Supabase category created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating category in Supabase:', error);
      throw error;
    }
  }

  static async updateCategory(id: string, updates: Partial<any>): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  static async getCategoryStats(): Promise<any> {
    try {
      // Get all categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoriesError) throw categoriesError;

      // Get all products with their categories
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('categories')
        .eq('status', 'active');

      if (productsError) throw productsError;

      // Calculate product counts for each category
      const categoryStats = (categories || []).map(category => {
        let product_count = 0;
        if (products) {
          product_count = products.filter(product => {
            // Handle both old single category and new categories array
            if (product.categories && Array.isArray(product.categories)) {
              return product.categories.includes(category.name);
            } else if ((product as any).category) {
              // Fallback for old data structure
              return (product as any).category === category.name;
            }
            return false;
          }).length;
        }

        return {
          id: category.id,
          name: category.name,
          product_count
        };
      });

      return categoryStats;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return [];
    }
  }

  // Refresh category counts by recalculating from products table
  static async refreshCategoryCounts(): Promise<boolean> {
    try {
      console.log('Starting category count refresh...');
      
      // Get all categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoriesError) throw categoriesError;

      if (!categories || categories.length === 0) {
        console.log('No categories found to update');
        return true;
      }

      // Get all active products once
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('categories, category')
        .eq('status', 'active');

      if (productsError) {
        console.error('Error fetching products for category count refresh:', productsError);
        throw productsError;
      }

      console.log(`Found ${products?.length || 0} active products to count`);

      // Update each category's count
      const updatePromises = (categories || []).map(async (category) => {
        // Count products that have this category in their categories array
        let count = 0;
        if (products) {
          count = products.filter(product => {
            // Handle both old single category and new categories array
            if (product.categories && Array.isArray(product.categories)) {
              return product.categories.includes(category.name);
            } else if ((product as any).category) {
              // Fallback for old data structure
              return (product as any).category === category.name;
            }
            return false;
          }).length;
        }

        // Update the category count
        const { error: updateError } = await supabase
          .from('categories')
          .update({ count })
          .eq('id', category.id);

        if (updateError) {
          console.error(`Error updating count for category ${category.name}:`, updateError);
          return false;
        } else {
          console.log(`Updated category ${category.name} count to ${count}`);
          return true;
        }
      });

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);
      const successCount = results.filter(Boolean).length;
      
      console.log(`Category count refresh completed: ${successCount}/${categories.length} categories updated successfully`);
      return successCount === categories.length;
    } catch (error) {
      console.error('Error refreshing category counts:', error);
      return false;
    }
  }
}

// Analytics Service
export class AnalyticsService {
  static async getDashboardData() {
    try {
      const [taskStats, userStats, productStats, orderStats] = await Promise.all([
        TaskService.getTaskStats(),
        UserService.getUserStats(),
        ProductService.getProductStats(),
        OrderService.getOrderStats()
      ]);

      // Get monthly revenue data from orders
      const monthlyRevenue = await this.getMonthlyRevenueData();

      return {
        tasks: taskStats,
        users: userStats,
        products: productStats,
        orders: orderStats,
        revenue: {
          total: orderStats?.totalRevenue || 0,
          growth: this.calculateGrowthRate(orderStats?.totalRevenue || 0),
          monthly: monthlyRevenue
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return null;
    }
  }

  static async getRealtimeStats() {
    try {
      // Get real-time data from database
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      // Get today's orders
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('id, total_amount, currency_code, currency_rate')
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString());

      // Get today's revenue
      // Always show revenue in INR for admin analytics
      const todayRevenue = todayOrders?.reduce((sum, order) => {
        const orderCurrency = order.currency_code || 'INR';
        const convertedAmount = CurrencyService.convertAmount(order.total_amount, orderCurrency, 'INR');
        return sum + convertedAmount;
      }, 0) || 0;

      // Get total orders for conversion rate calculation
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total users for conversion rate
      const { count: totalUsers } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true });

      const conversionRate = (totalUsers && totalUsers > 0) ? ((totalOrders || 0) / totalUsers * 100).toFixed(1) : '0.0';

      return {
        // Active users = total registered users for now (no presence tracking yet)
        activeUsers: totalUsers || 0,
        todayOrders: todayOrders?.length || 0,
        todayRevenue: todayRevenue,
        conversionRate: conversionRate
      };
    } catch (error) {
      console.error('Error fetching realtime stats:', error);
      return {
        activeUsers: 0,
        todayOrders: 0,
        todayRevenue: 0,
        conversionRate: '0.0'
      };
    }
  }

  static async getMonthlyRevenueData() {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const monthlyData = [];

      // Get data for last 7 months
      for (let i = 6; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const year = new Date().getFullYear() - (currentMonth - i < 0 ? 1 : 0);
        
        const monthStart = new Date(year, monthIndex, 1);
        const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59);

        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, currency_code, currency_rate')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const revenue = orders?.reduce((sum, order) => {
          const orderCurrency = order.currency_code || 'INR';
          const convertedAmount = CurrencyService.convertAmount(order.total_amount, orderCurrency, 'INR');
          return sum + convertedAmount;
        }, 0) || 0;

        monthlyData.push({
          month: months[monthIndex],
          revenue: revenue,
          orders: orders?.length || 0
        });
      }

      return monthlyData;
    } catch (error) {
      console.error('Error fetching monthly revenue data:', error);
      return [
        { month: 'Jan', revenue: 0, orders: 0 },
        { month: 'Feb', revenue: 0, orders: 0 },
        { month: 'Mar', revenue: 0, orders: 0 },
        { month: 'Apr', revenue: 0, orders: 0 },
        { month: 'May', revenue: 0, orders: 0 },
        { month: 'Jun', revenue: 0, orders: 0 },
        { month: 'Jul', revenue: 0, orders: 0 }
      ];
    }
  }

  static calculateGrowthRate(_currentRevenue: number): number {
    // Mock growth calculation - in real implementation, compare with previous period
    return Math.floor(Math.random() * 30) + 5; // 5-35% growth
  }

  static async getCategoryAnalytics() {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name, count');

      // Get actual order items with product category information
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          total_price,
          currency_code,
          currency_rate,
          products!inner(
            category
          )
        `);

      if (error || orderItemsError) {
        console.error('Error fetching category analytics:', error || orderItemsError);
        return [];
      }

      // Calculate category sales from actual orders
      const categorySales = categories?.map(category => {
        const categoryOrderItems = orderItems?.filter(item => 
          (item.products as any)?.category === category.name
        ) || [];
        
        // Calculate total sales for this category
        const totalSales = categoryOrderItems.reduce((sum, item) => {
          const itemCurrency = item.currency_code || 'INR';
          const convertedAmount = CurrencyService.convertAmount(
            item.total_price,
            itemCurrency,
            'INR'
          );
          return sum + convertedAmount;
        }, 0);

        // Calculate percentage based on total sales
        const totalAllSales = orderItems?.reduce((sum, item) => {
          const itemCurrency = item.currency_code || 'INR';
          const convertedAmount = CurrencyService.convertAmount(
            item.total_price,
            itemCurrency,
            'INR'
          );
          return sum + convertedAmount;
        }, 0) || 0;

        const percentage = totalAllSales > 0 ? Math.round((totalSales / totalAllSales) * 100) : 0;

        return {
          name: category.name,
          value: percentage,
          color: this.getCategoryColor(category.name),
          sales: totalSales
        };
      }) || [];

      // Filter out categories with no sales and sort by sales descending
      return categorySales
        .filter(category => category.sales > 0)
        .sort((a, b) => b.sales - a.sales);
    } catch (error) {
      console.error('Error fetching category analytics:', error);
      return [];
    }
  }

  static getCategoryColor(categoryName: string): string {
    const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
    const index = categoryName.length % colors.length;
    return colors[index];
  }

  static async getRecentOrders(limit: number = 5) {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, status, created_at, currency_code, currency_rate')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent orders:', error);
        return [];
      }

      return orders?.map(order => ({
        id: `#${order.id.slice(-4)}`,
        customer: order.customer_name,
        artwork: 'Artwork Purchase', // Could be enhanced to show actual product names
        amount: order.total_amount,
        status: order.status,
        time: this.getTimeAgo(order.created_at),
        avatar: order.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        currency: order.currency_code || 'INR',
        currencyRate: order.currency_rate || 1.0
      })) || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }

  static getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  }
}

// Database helper functions
export const initializeDatabase = async () => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }

    // Test connection
    const { data, error } = await supabase
      .from('tasks')
      .select('count(*)', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return false;
    }

    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Real-time subscriptions
export const subscribeToTasks = (callback: (payload: any) => void) => {
  return supabase
    .channel('tasks_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'tasks' 
      }, 
      callback
    )
    .subscribe();
};

export const subscribeToTaskStats = (callback: (payload: any) => void) => {
  return supabase
    .channel('task_stats_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'tasks' 
      }, 
      callback
    )
    .subscribe();
};

export default {
  TaskService,
  UserService,
  ProductService,
  OrderService,
  CategoryService,
  AnalyticsService,
  initializeDatabase,
  subscribeToTasks,
  subscribeToTaskStats
};
