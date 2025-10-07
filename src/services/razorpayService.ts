import { supabase } from './supabaseService';

// Razorpay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = import.meta.env.VITE_RAZORPAY_KEY_SECRET;
const RAZORPAY_CURRENCY = import.meta.env.VITE_RAZORPAY_CURRENCY || 'INR';
const RAZORPAY_COMPANY_NAME = import.meta.env.VITE_RAZORPAY_COMPANY_NAME || 'Lurevi';
const RAZORPAY_COMPANY_LOGO = import.meta.env.VITE_RAZORPAY_COMPANY_LOGO || '';
const RAZORPAY_THEME_COLOR = import.meta.env.VITE_RAZORPAY_THEME_COLOR || '#0d9488';

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    order_id: string;
    customer_id: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface OrderDetails {
  orderId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId: string;
  description?: string;
}

interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

class RazorpayService {
  private static instance: RazorpayService;

  private constructor() {}

  static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  /**
   * Load Razorpay script dynamically
   */
  async loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        console.log('Razorpay already loaded');
        resolve(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="razorpay"]');
      if (existingScript) {
        console.log('Razorpay script already exists, waiting for load...');
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      console.log('Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        // Wait a bit for Razorpay to initialize
        setTimeout(() => {
          if (window.Razorpay) {
            resolve(true);
          } else {
            console.error('Razorpay object not available after script load');
            resolve(false);
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script:', error);
        resolve(false);
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Create Razorpay order
   */
  async createOrder(orderDetails: OrderDetails): Promise<string> {
    try {
      // In a real implementation, you would call your backend API to create a Razorpay order
      // For now, we'll create a mock order ID
      // Backend should call: https://api.razorpay.com/v1/orders
      
      const amountInPaise = Math.round(orderDetails.amount * 100); // Convert to paise
      
      // This should be done on your backend for security
      // Example backend call:
      // const response = await fetch('/api/razorpay/create-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: amountInPaise,
      //     currency: orderDetails.currency || RAZORPAY_CURRENCY,
      //     receipt: orderDetails.orderId,
      //   })
      // });
      
      // For development, generate a mock order ID
      const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store order details in Supabase
      await this.storeOrderInDatabase(orderDetails, razorpayOrderId, amountInPaise);
      
      return razorpayOrderId;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Store order details in database
   */
  private async storeOrderInDatabase(
    orderDetails: OrderDetails,
    razorpayOrderId: string,
    amountInPaise: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('razorpay_orders')
        .insert({
          order_id: orderDetails.orderId,
          razorpay_order_id: razorpayOrderId,
          amount: amountInPaise,
          currency: orderDetails.currency || RAZORPAY_CURRENCY,
          customer_id: orderDetails.customerId,
          customer_email: orderDetails.customerEmail,
          status: 'created',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing order in database:', error);
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  }

  /**
   * Initialize Razorpay payment
   */
  async initiatePayment(
    orderDetails: OrderDetails,
    onSuccess: (response: RazorpayResponse) => void,
    onFailure: (error: any) => void
  ): Promise<void> {
    try {
      // Check if Razorpay Key is configured
      if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'your-razorpay-key-id') {
        throw new Error('Razorpay API key not configured. Please add VITE_RAZORPAY_KEY_ID to your .env file');
      }

      console.log('Initiating Razorpay payment...');
      
      // Load Razorpay script with retry
      let scriptLoaded = await this.loadRazorpayScript();
      
      // Retry once if failed
      if (!scriptLoaded) {
        console.log('Retrying Razorpay script load...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        scriptLoaded = await this.loadRazorpayScript();
      }
      
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection and try again.');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay is not available. Please refresh the page and try again.');
      }

      // Create Razorpay order
      const razorpayOrderId = await this.createOrder(orderDetails);

      // Razorpay options
      const options: RazorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(orderDetails.amount * 100), // Amount in paise
        currency: orderDetails.currency || RAZORPAY_CURRENCY,
        name: RAZORPAY_COMPANY_NAME,
        description: orderDetails.description || 'Order Payment',
        image: RAZORPAY_COMPANY_LOGO,
        order_id: razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment signature
            const isValid = await this.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (isValid) {
              // Update payment status in database
              await this.updatePaymentStatus(
                orderDetails.orderId,
                response.razorpay_payment_id,
                'success'
              );
              onSuccess(response);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment handler error:', error);
            onFailure(error);
          }
        },
        prefill: {
          name: orderDetails.customerName,
          email: orderDetails.customerEmail,
          contact: orderDetails.customerPhone
        },
        notes: {
          order_id: orderDetails.orderId,
          customer_id: orderDetails.customerId
        },
        theme: {
          color: RAZORPAY_THEME_COLOR
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed');
            onFailure(new Error('Payment cancelled by user'));
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      onFailure(error);
    }
  }

  /**
   * Verify payment signature
   * This should be done on the backend for security
   */
  async verifyPayment(verification: PaymentVerification): Promise<boolean> {
    try {
      // In production, this MUST be done on the backend
      // Backend should verify using crypto.createHmac
      // const generatedSignature = crypto
      //   .createHmac('sha256', RAZORPAY_KEY_SECRET)
      //   .update(verification.razorpay_order_id + '|' + verification.razorpay_payment_id)
      //   .digest('hex');
      // return generatedSignature === verification.razorpay_signature;

      // For development, we'll assume verification passes
      console.log('Payment verification (development mode):', verification);
      return true;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  /**
   * Update payment status in database
   */
  async updatePaymentStatus(
    orderId: string,
    paymentId: string,
    status: 'success' | 'failed'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('razorpay_orders')
        .update({
          razorpay_payment_id: paymentId,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (error) {
        console.error('Error updating payment status:', error);
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(orderId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('razorpay_orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        console.error('Error fetching payment details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<boolean> {
    try {
      // In production, call your backend API to process refund
      // Backend should call: https://api.razorpay.com/v1/payments/{payment_id}/refund
      
      console.log('Refund initiated for payment:', paymentId, 'Amount:', amount);
      
      // Mock refund success
      return true;
    } catch (error) {
      console.error('Refund error:', error);
      return false;
    }
  }
}

export default RazorpayService.getInstance();
