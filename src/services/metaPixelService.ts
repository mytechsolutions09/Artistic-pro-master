// Meta (Facebook) Pixel Tracking Service
// Pixel ID: 1165585550249911

declare global {
  interface Window {
    fbq: any;
  }
}

export class MetaPixelService {
  private static pixelId = '1165585550249911';

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
      console.log('Meta Pixel: PageView tracked');
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
      console.log('Meta Pixel: ViewContent tracked', params);
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
      console.log('Meta Pixel: Search tracked', searchQuery);
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
      console.log('Meta Pixel: AddToCart tracked', params);
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
      console.log('Meta Pixel: InitiateCheckout tracked', params);
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
      console.log('Meta Pixel: AddPaymentInfo tracked', params);
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
      console.log('Meta Pixel: Purchase tracked', params);
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
      console.log('Meta Pixel: Lead tracked', params);
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
      console.log('Meta Pixel: CompleteRegistration tracked', params);
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
      console.log('Meta Pixel: AddToWishlist tracked', params);
    }
  }

  /**
   * Track custom event
   */
  static trackCustomEvent(eventName: string, params?: any): void {
    if (this.isLoaded()) {
      window.fbq('trackCustom', eventName, params || {});
      console.log('Meta Pixel: Custom event tracked', eventName, params);
    }
  }

  /**
   * Track contact (for contact forms)
   */
  static trackContact(): void {
    if (this.isLoaded()) {
      window.fbq('track', 'Contact');
      console.log('Meta Pixel: Contact tracked');
    }
  }

  /**
   * Track find location (for store locators)
   */
  static trackFindLocation(): void {
    if (this.isLoaded()) {
      window.fbq('track', 'FindLocation');
      console.log('Meta Pixel: FindLocation tracked');
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

