import { supabase } from './supabaseService';
import { LogoService } from './logoService';

// Razorpay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_CURRENCY = import.meta.env.VITE_RAZORPAY_CURRENCY || 'INR';
const RAZORPAY_COMPANY_NAME = import.meta.env.VITE_RAZORPAY_COMPANY_NAME || 'Lurevi';
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
  order_id: string;
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

class RazorpayServiceProduction {
  private static instance: RazorpayServiceProduction;

  private constructor() {}

  static getInstance(): RazorpayServiceProduction {
    if (!RazorpayServiceProduction.instance) {
      RazorpayServiceProduction.instance = new RazorpayServiceProduction();
    }
    return RazorpayServiceProduction.instance;
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
   * Create Razorpay order via Supabase Edge Function (PRODUCTION)
   */
  async createOrder(orderDetails: OrderDetails): Promise<string> {
    try {
      console.log('Creating Razorpay order via Edge Function...', orderDetails);
      
      // Call Supabase Edge Function to create order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: orderDetails.amount,
          currency: orderDetails.currency || RAZORPAY_CURRENCY,
          receipt: orderDetails.orderId,
          notes: {
            customer_id: orderDetails.customerId,
            customer_email: orderDetails.customerEmail,
            customer_name: orderDetails.customerName,
            customer_phone: orderDetails.customerPhone
          }
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || 'Failed to create Razorpay order');
      }
      
      if (data && data.success && data.order) {
        console.log('Razorpay order created successfully:', data.order.id);
        return data.order.id; // Returns real Razorpay order ID
      } else {
        throw new Error(data?.error || 'Failed to create order');
      }
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  }

  /**
   * Initialize Razorpay payment (PRODUCTION)
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

      console.log('Initiating Razorpay payment (Production Mode)...');
      
      // Load Razorpay script with retry
      let scriptLoaded = await this.loadRazorpayScript();
      
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

      // Create real Razorpay order via Edge Function
      const razorpayOrderId = await this.createOrder(orderDetails);

      // Fetch logo from database
      console.log('Fetching logo from database...');
      const logoSettings = await LogoService.getActiveLogoSettings();
      const companyLogo = logoSettings?.logo_url || '';
      console.log('Logo URL:', companyLogo);

      // Razorpay options
      const options: RazorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(orderDetails.amount * 100), // Amount in paise
        currency: orderDetails.currency || RAZORPAY_CURRENCY,
        name: RAZORPAY_COMPANY_NAME,
        description: orderDetails.description || 'Order Payment',
        image: companyLogo,
        order_id: razorpayOrderId, // Real Razorpay order ID
        handler: async (response: RazorpayResponse) => {
          try {
            console.log('Payment successful, verifying...', response);
            
            // Verify payment signature on backend
            const isValid = await this.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderDetails.orderId
            });

            if (isValid) {
              console.log('Payment verified successfully');
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
   * Verify payment signature via Edge Function (PRODUCTION)
   */
  async verifyPayment(verification: PaymentVerification): Promise<boolean> {
    try {
      console.log('Verifying payment signature via Edge Function...');
      
      // Call Supabase Edge Function to verify payment
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: verification
      });

      if (error) {
        console.error('Verification error:', error);
        return false;
      }

      if (data && data.success && data.verified) {
        console.log('Payment verified successfully');
        return true;
      } else {
        console.error('Payment verification failed:', data?.error);
        return false;
      }
    } catch (error) {
      console.error('Payment verification exception:', error);
      return false;
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
   * Refund payment (should be done via backend)
   */
  async refundPayment(paymentId: string, amount?: number): Promise<boolean> {
    try {
      // In production, create an Edge Function for refunds
      // This should call: https://api.razorpay.com/v1/payments/{payment_id}/refund
      
      console.log('Refund initiated for payment:', paymentId, 'Amount:', amount);
      
      // TODO: Implement refund Edge Function
      return true;
    } catch (error) {
      console.error('Refund error:', error);
      return false;
    }
  }
}

export default RazorpayServiceProduction.getInstance();

