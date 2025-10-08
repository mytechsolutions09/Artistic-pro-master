// Alternative order service that bypasses RLS for order creation
// This uses a service role key to bypass RLS policies entirely

import { createClient } from '@supabase/supabase-js';

// Create a service role client that bypasses RLS
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Only create service client if service key is available
const supabaseService = supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) : null;

export interface CompleteOrderData {
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    productTitle: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    selectedProductType?: 'digital' | 'poster' | 'clothing';
    selectedPosterSize?: string;
    options?: {
      size?: string;
      color?: string;
      [key: string]: any;
    };
  }>;
  totalAmount: number;
  paymentMethod: 'card' | 'paypal' | 'bank_transfer' | 'razorpay' | 'cod';
  paymentId?: string;
  notes?: string;
  shippingAddress?: string;
  billingAddress?: string;
}

export interface OrderCompletionResult {
  success: boolean;
  orderId?: string;
  downloadLinks?: string[];
  emailSent?: boolean;
  error?: string;
}

/**
 * Create order using service role (bypasses RLS)
 * This is a fallback method when RLS policies are causing issues
 */
export async function createOrderBypassRLS(orderData: CompleteOrderData): Promise<OrderCompletionResult> {
  try {


    if (!supabaseService) {
      throw new Error('Service role key not configured. Please set VITE_SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
    }

    // Create main order record using service role
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .insert({
        customer_id: orderData.customerId,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        total_amount: orderData.totalAmount,
        status: orderData.paymentMethod === 'cod' ? 'pending' : 'completed',
        payment_method: orderData.paymentMethod,
        payment_id: orderData.paymentId,
        notes: orderData.notes,
        shipping_address: orderData.shippingAddress
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Failed to create order with service role:', orderError);
      return { success: false, error: `Failed to create order: ${orderError.message}` };
    }

    // Create order items using service role
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_title: item.productTitle,
      product_image: item.productImage,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      selected_product_type: item.selectedProductType || 'digital',
      selected_poster_size: item.selectedPosterSize || null,
      options: item.options || null
    }));

    const { error: itemsError } = await supabaseService
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Failed to create order items with service role:', itemsError);
      return { success: false, error: `Failed to create order items: ${itemsError.message}` };
    }


    
    return {
      success: true,
      orderId: order.id,
      downloadLinks: [], // You can add download link generation here
      emailSent: false // You can add email sending here
    };

  } catch (error) {
    console.error('❌ Service role order creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Check if service role is available
 */
export function isServiceRoleAvailable(): boolean {
  return !!supabaseService;
}
