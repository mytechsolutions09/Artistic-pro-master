// Meta (Facebook) Pixel Tracking Service
// Supports dynamic Pixel ID from database or environment

declare global {
  interface Window {
    fbq: any;
  }
}

export class MetaPixelService {
  private static pixelId = import.meta.env.VITE_META_PIXEL_ID || '1905415970060955';

  /**
   * Set pixel ID dynamically (e.g., from database)
   */
  static setPixelId(pixelId: string): void {
    this.pixelId = pixelId;
  }

  /**
   * Check if Meta Pixel is loaded
   */
  static isLoaded(): boolean {
    return typeof window !== 'undefined' && typeof window.fbq === 'function';
  }

  /**
   * Track page view
   */
  static trackPageView(): void {
    if (this.isLoaded()) {
      window.fbq('track', 'PageView');
      // PageView tracked
    }
  }

  /**
   * Track view content (product view)
   */
  static trackViewContent(params: {
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    value?: number;
    currency?: string;
  }): void {
    if (this.isLoaded()) {
      window.fbq('track', 'ViewContent', {
        content_name: params.content_name,
        content_category: params.content_category,
        content_ids: params.content_ids || [],
        content_type: params.content_type || 'product',
        value: params.value || 0,
        currency: params.currency || 'INR'
      });
      // ViewContent tracked
    }
  }

  /**
   * Track search
   */
  static trackSearch(searchQuery: string): void {
    if (this.isLoaded()) {
      window.fbq('track', 'Search', {
        search_string: searchQuery
      });
      // Search tracked
    }
  }

  /**
   * Track add to cart
   */
  static trackAddToCart(params: {
    content_name: string;
    content_ids: string[];
    content_type?: string;
    value: number;
    currency?: string;
  }): void {
    if (this.isLoaded()) {
      window.fbq('track', 'AddToCart', {
        content_name: params.content_name,
        content_ids: params.content_ids,
        content_type: params.content_type || 'product',
        value: params.value,
        currency: params.currency || 'INR'
      });
      // AddToCart tracked
    }
  }

  /**
   * Track initiate checkout
   */
  static trackInitiateCheckout(params: {
    content_ids: string[];
    content_category?: string;
    num_items: number;
    value: number;
    currency?: string;
  }): void {
    if (this.isLoaded()) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: params.content_ids,
        content_category: params.content_category,
        num_items: params.num_items,
        value: params.value,
        currency: params.currency || 'INR'
      });
      // InitiateCheckout tracked
    }
  }

  /**
   * Track add payment info
   */
  static trackAddPaymentInfo(params: {
    content_ids: string[];
    value: number;
    currency?: string;
  }): void {
    if (this.isLoaded()) {
      window.fbq('track', 'AddPaymentInfo', {
        content_ids: params.content_ids,
        value: params.value,
        currency: params.currency || 'INR'
      });
      // AddPaymentInfo tracked
    }
  }

  /**
   * Track purchase (conversion)
   */
  static trackPurchase(params: {
    content_ids: string[];
    content_type?: string;
    value: number;
    currency?: string;
    num_items?: number;
  }): void {
    if (this.isLoaded()) {
      window.fbq('track', 'Purchase', {
        content_ids: params.content_ids,
        content_type: params.content_type || 'product',
        value: params.value,
        currency: params.currency || 'INR',
        num_items: params.num_items || 1
      });
      // Purchase tracked
    }
  }

  /**
   * Track lead (sign up, contact form, etc.)
   */
  static trackLead(params?: {
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
  }): void {
    if (this.isLoaded()) {
      window.fbq('track', 'Lead', params || {});
      // Lead tracked
    }
  }

  /**
   * Track complete registration
   */
  static trackCompleteRegistration(params?: {
    content_name?: string;
    value?: number;
    currency?: string;
    status?: string;
  }): void {
    if (this.isLoaded()) {
      window.fbq('track', 'CompleteRegistration', params || {});
      // CompleteRegistration tracked
    }
  }

  /**
   * Track add to wishlist
   */
  static trackAddToWishlist(params: {
    content_name: string;
    content_ids: string[];
    value: number;
    currency?: string;
  }): void {
    if (this.isLoaded()) {
      window.fbq('track', 'AddToWishlist', {
        content_name: params.content_name,
        content_ids: params.content_ids,
        value: params.value,
        currency: params.currency || 'INR'
      });
      // AddToWishlist tracked
    }
  }

  /**
   * Track custom event
   */
  static trackCustomEvent(eventName: string, params?: any): void {
    if (this.isLoaded()) {
      window.fbq('trackCustom', eventName, params || {});
      // Custom event tracked
    }
  }

  /**
   * Track contact (for contact forms)
   */
  static trackContact(): void {
    if (this.isLoaded()) {
      window.fbq('track', 'Contact');
      // Contact tracked
    }
  }

  /**
   * Track find location (for store locators)
   */
  static trackFindLocation(): void {
    if (this.isLoaded()) {
      window.fbq('track', 'FindLocation');
      // FindLocation tracked
    }
  }

  /**
   * Get Pixel ID
   */
  static getPixelId(): string {
    return this.pixelId;
  }
}

export default MetaPixelService;

