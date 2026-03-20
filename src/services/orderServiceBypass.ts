'use client'

// Alternative order service that bypasses RLS for order creation
// This uses a service role key to bypass RLS policies entirely

import { createClient } from '@supabase/supabase-js';

// Create a service role client that bypasses RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';

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
  paymentMethod: 'card' | 'paypal' | 'bank_transfer' | 'razorpay' | 'cod' | 'store_credit';
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

    // Determine order status based on payment method and product types
    let orderStatus: 'pending' | 'processing' | 'completed' = 'completed';
    
    // Check if order has physical products (posters or clothing)
    const hasPhysicalProducts = orderData.items.some(item => 
      item.selectedProductType === 'poster' || item.selectedProductType === 'clothing'
    );
    
    if (orderData.paymentMethod === 'cod') {
      orderStatus = 'pending'; // COD orders are pending until payment received
    } else if (hasPhysicalProducts) {
      orderStatus = 'processing'; // Physical products start as processing
    }

    // Create main order record using service role
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .insert({
        customer_id: orderData.customerId,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        total_amount: orderData.totalAmount,
        status: orderStatus,
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


    
    const downloadLinks = await generateSecureDownloadLinks(order.id, orderData.items);

    if (downloadLinks.length > 0) {
      await supabaseService
        .from('orders')
        .update({ download_links: downloadLinks })
        .eq('id', order.id);
    }

    const emailResult = await sendOrderConfirmationEmail(orderData, order.id, downloadLinks);

    return {
      success: true,
      orderId: order.id,
      downloadLinks,
      emailSent: emailResult.success
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

async function sendOrderConfirmationEmail(
  orderData: CompleteOrderData,
  orderId: string,
  downloadLinks: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const items = await getProductDetailsForEmail(orderData.items);
    const { EmailService } = await import('./emailService');

    const result = await EmailService.sendOrderConfirmation(
      orderData.customerEmail,
      orderData.customerName,
      {
        orderId,
        orderDate: new Date().toISOString(),
        totalAmount: orderData.totalAmount,
        items,
        downloadLinks
      }
    );

    return { success: result.success, error: result.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send order email'
    };
  }
}

async function getProductDetailsForEmail(items: CompleteOrderData['items']) {
  if (!supabaseService) return [];

  const productIds = items.map(item => item.productId);
  const { data: products } = await supabaseService
    .from('products')
    .select('id, title, main_image, pdf_url, product_type')
    .in('id', productIds);

  const productMap = new Map((products || []).map(product => [product.id, product]));

  return items.map(item => {
    const product = productMap.get(item.productId);
    const isDigital = product?.product_type === 'digital';

    return {
      title: product?.title || item.productTitle,
      quantity: item.quantity,
      price: item.unitPrice,
      mainImage: isDigital ? product?.main_image : undefined,
      pdfUrl: isDigital ? product?.pdf_url : undefined
    };
  });
}

async function generateSecureDownloadLinks(
  orderId: string,
  items: CompleteOrderData['items']
): Promise<string[]> {
  if (!supabaseService) return [];

  const downloadLinks: string[] = [];

  for (const item of items) {
    const { data: product } = await supabaseService
      .from('products')
      .select('pdf_url')
      .eq('id', item.productId)
      .single();

    if (product?.pdf_url) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const token = `${orderId}_${item.productId}_${timestamp}_${random}`;
      downloadLinks.push(`${window.location.origin}/download/${item.productId}?token=${token}&order=${orderId}`);
    }
  }

  return downloadLinks;
}




