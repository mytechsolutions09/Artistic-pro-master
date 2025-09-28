import { supabase } from './supabaseService';
import CurrencyService from './currencyService';

export interface CompleteOrderData {
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    productTitle: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    selectedProductType?: 'digital' | 'poster';
    selectedPosterSize?: string;
  }>;
  totalAmount: number;
  paymentMethod: 'card' | 'paypal' | 'bank_transfer';
  paymentId?: string;
  notes?: string;
  shippingAddress?: string;
}

export interface OrderCompletionResult {
  success: boolean;
  orderId?: string;
  downloadLinks?: string[];
  emailSent?: boolean;
  error?: string;
}

export interface EmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  totalAmount: number;
  items: Array<{
    title: string;
    price: number;
    quantity: number;
    mainImage?: string;
    pdfUrl?: string;
  }>;
  downloadLinks: string[];
}

/**
 * Complete Order Service - Handles full order completion with Supabase integration
 */
export class CompleteOrderService {
  
  /**
   * Complete an order with full database integration
   */
  static async completeOrder(orderData: CompleteOrderData): Promise<OrderCompletionResult> {
    try {
      console.log('🛒 Starting order completion process...', orderData);

      // Step 1: Create order in database
      const orderResult = await this.createOrderInDatabase(orderData);
      if (!orderResult.success) {
        return orderResult;
      }

      const orderId = orderResult.orderId!;

      // Step 2: Get product details for email
      const productDetails = await this.getProductDetailsForEmail(orderData.items);
      if (!productDetails.success) {
        return { success: false, error: productDetails.error };
      }

      // Step 3: Generate download links
      const downloadLinks = await this.generateSecureDownloadLinks(orderId, orderData.items);

      // Step 4: Update order with download links
      await this.updateOrderWithDownloadLinks(orderId, downloadLinks);

      // Step 5: Send confirmation email with main images and PDFs
      const emailResult = await this.sendOrderConfirmationEmail({
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        orderId,
        orderDate: new Date().toISOString(),
        totalAmount: orderData.totalAmount,
        items: productDetails.items!,
        downloadLinks
      });

      // Step 6: Update product download counts
      await this.updateProductDownloadCounts(orderData.items);

      console.log('✅ Order completion successful:', {
        orderId,
        emailSent: emailResult.success,
        downloadLinksCount: downloadLinks.length
      });

      return {
        success: true,
        orderId,
        downloadLinks,
        emailSent: emailResult.success
      };

    } catch (error) {
      console.error('❌ Order completion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create order in Supabase database
   */
  private static async createOrderInDatabase(orderData: CompleteOrderData): Promise<OrderCompletionResult> {
    try {
      // Get current currency settings
      const currencySettings = CurrencyService.getCurrencySettings();
      const currentCurrency = currencySettings.defaultCurrency;
      const currency = CurrencyService.getCurrency(currentCurrency);
      const currencyRate = currency?.rate || 1.0;

      // Create main order record with currency information
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: orderData.customerId,
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          total_amount: orderData.totalAmount,
          status: 'completed',
          payment_method: orderData.paymentMethod,
          payment_id: orderData.paymentId,
          notes: orderData.notes,
          shipping_address: orderData.shippingAddress,
          currency_code: currentCurrency,
          currency_rate: currencyRate
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Failed to create order:', orderError);
        return { success: false, error: `Failed to create order: ${orderError.message}` };
      }

      // Create order items with currency information
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
        currency_code: currentCurrency,
        currency_rate: currencyRate
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Failed to create order items:', itemsError);
        return { success: false, error: `Failed to create order items: ${itemsError.message}` };
      }

      console.log('✅ Order created in database:', order.id);
      return { success: true, orderId: order.id };

    } catch (error) {
      console.error('❌ Database error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Database error occurred' 
      };
    }
  }

  /**
   * Get product details including main images and PDFs for email
   */
  private static async getProductDetailsForEmail(items: CompleteOrderData['items']): Promise<{
    success: boolean;
    items?: EmailData['items'];
    error?: string;
  }> {
    try {
      const productIds = items.map(item => item.productId);
      
      const { data: products, error } = await supabase
        .from('products')
        .select('id, title, price, main_image, pdf_url, product_type')
        .in('id', productIds);

      if (error) {
        console.error('❌ Failed to fetch product details:', error);
        return { success: false, error: `Failed to fetch product details: ${error.message}` };
      }

      const productMap = new Map(products.map(p => [p.id, p]));
      
      const emailItems = items.map(item => {
        const product = productMap.get(item.productId);
        const isDigital = product?.product_type === 'digital';
        
        return {
          title: product?.title || item.productTitle,
          price: item.unitPrice,
          quantity: item.quantity,
          // Only include files for digital products
          mainImage: isDigital ? product?.main_image : undefined,
          pdfUrl: isDigital ? product?.pdf_url : undefined
        };
      });

      return { success: true, items: emailItems };

    } catch (err) {
      console.error('❌ Error fetching product details:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error fetching product details' 
      };
    }
  }

  /**
   * Generate secure download links for purchased products
   */
  private static async generateSecureDownloadLinks(orderId: string, items: CompleteOrderData['items']): Promise<string[]> {
    try {
      const downloadLinks: string[] = [];
      
      for (const item of items) {
        // Get product details to access PDF URL
        const { data: product } = await supabase
          .from('products')
          .select('pdf_url')
          .eq('id', item.productId)
          .single();

        if (product?.pdf_url) {
          // Generate secure download link with expiration
          const downloadToken = this.generateDownloadToken(orderId, item.productId);
          const downloadLink = `${window.location.origin}/download/${item.productId}?token=${downloadToken}&order=${orderId}`;
          downloadLinks.push(downloadLink);
        }
      }

      return downloadLinks;

    } catch (error) {
      console.error('❌ Error generating download links:', error);
      return [];
    }
  }

  /**
   * Generate secure download token
   */
  private static generateDownloadToken(orderId: string, productId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${orderId}_${productId}_${timestamp}_${random}`;
  }

  /**
   * Update order with download links
   */
  private static async updateOrderWithDownloadLinks(orderId: string, downloadLinks: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ download_links: downloadLinks })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Failed to update order with download links:', error);
        throw error;
      }

      console.log('✅ Updated order with download links');

    } catch (error) {
      console.error('❌ Error updating order:', error);
      throw error;
    }
  }

  /**
   * Send order confirmation email with main images and PDFs
   */
  private static async sendOrderConfirmationEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 Sending order confirmation email...', emailData.customerEmail);

      // Import EmailService dynamically to avoid circular dependencies
      const { EmailService } = await import('./emailService');

      // Send email using the new EmailService with Hostinger SMTP
      const result = await EmailService.sendOrderConfirmation(
        emailData.customerEmail,
        emailData.customerName,
        {
          orderId: emailData.orderId,
          orderDate: emailData.orderDate,
          totalAmount: emailData.totalAmount,
          items: emailData.items,
          downloadLinks: emailData.downloadLinks
        }
      );

      if (result.success) {
        console.log('✅ Order confirmation email sent successfully via Hostinger SMTP');
        return { success: true };
      } else {
        console.warn('⚠️ Email sending failed:', result.error);
        return { success: false, error: result.error || 'Email sending failed' };
      }

    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email sending error' 
      };
    }
  }

  /**
   * Generate email content with main images and PDFs
   */
  private static generateEmailContent(emailData: EmailData): string {
    const itemsHtml = emailData.items.map(item => `
      <div style="border: 1px solid #e0e0e0; padding: 20px; margin: 10px 0; border-radius: 8px;">
        <h3 style="color: #333; margin: 0 0 10px 0;">${item.title}</h3>
        <p style="margin: 5px 0; color: #666;">Quantity: ${item.quantity}</p>
        <p style="margin: 5px 0; color: #666;">Price: $${item.price}</p>
        ${item.mainImage ? `
          <div style="margin: 10px 0;">
            <img src="${item.mainImage}" alt="${item.title}" style="max-width: 200px; height: auto; border-radius: 4px;" />
          </div>
        ` : ''}
        ${item.pdfUrl ? `
          <div style="margin: 10px 0;">
            <a href="${item.pdfUrl}" style="background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">
              📄 Download PDF
            </a>
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - ${emailData.orderId}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FAC6CF, #F48FB1); padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Order Confirmation</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase!</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 15px 0;">Order Details</h2>
          <p><strong>Order ID:</strong> ${emailData.orderId}</p>
          <p><strong>Date:</strong> ${new Date(emailData.orderDate).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> $${emailData.totalAmount}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 15px 0;">Your Digital Artwork</h2>
          ${itemsHtml}
        </div>

        ${emailData.downloadLinks.length > 0 ? `
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2d5a2d; margin: 0 0 15px 0;">📥 Download Links</h3>
            <p style="margin: 0 0 10px 0; color: #2d5a2d;">Your digital downloads are ready! Click the links below to access your files:</p>
            ${emailData.downloadLinks.map((link, index) => `
              <p style="margin: 5px 0;">
                <a href="${link}" style="color: #007bff; text-decoration: none;">Download File ${index + 1}</a>
              </p>
            `).join('')}
          </div>
        ` : ''}

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">📋 Important Information</h3>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li>Download links are valid for 30 days</li>
            <li>Keep this email for your records</li>
            <li>Contact support if you have any issues</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; margin: 0;">Thank you for choosing our digital art gallery!</p>
          <p style="color: #666; margin: 5px 0 0 0;">If you have any questions, please contact our support team.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Update product download counts
   */
  private static async updateProductDownloadCounts(items: CompleteOrderData['items']): Promise<void> {
    try {
      for (const item of items) {
        // Get current download count and increment
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('downloads')
          .eq('id', item.productId)
          .single();

        if (!fetchError && product) {
          const { error } = await supabase
            .from('products')
            .update({ 
              downloads: (product.downloads || 0) + item.quantity
            })
            .eq('id', item.productId);

          if (error) {
            console.error(`❌ Failed to update download count for product ${item.productId}:`, error);
          }
        }
      }

      console.log('✅ Updated product download counts');

    } catch (error) {
      console.error('❌ Error updating download counts:', error);
      // Don't throw error as this is not critical for order completion
    }
  }

  /**
   * Get order details by ID
   */
  static async getOrderById(orderId: string): Promise<{
    success: boolean;
    order?: any;
    error?: string;
  }> {
    try {
      const { data: order, error } = await supabase
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
        console.error('❌ Failed to fetch order:', error);
        return { success: false, error: `Failed to fetch order: ${error.message}` };
      }

      return { success: true, order };

    } catch (error) {
      console.error('❌ Error fetching order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error fetching order' 
      };
    }
  }

  /**
   * Get user orders
   */
  static async getUserOrders(userId: string): Promise<{
    success: boolean;
    orders?: any[];
    error?: string;
  }> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              title,
              main_image,
              images,
              pdf_url,
              price,
              product_type,
              poster_size,
              poster_pricing
            )
          )
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch user orders:', error);
        return { success: false, error: `Failed to fetch user orders: ${error.message}` };
      }

      return { success: true, orders };

    } catch (error) {
      console.error('❌ Error fetching user orders:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error fetching user orders' 
      };
    }
  }
}
