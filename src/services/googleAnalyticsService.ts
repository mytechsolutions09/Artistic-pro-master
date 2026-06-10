'use client';

// Google Analytics / Google Ads Tracking Service
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export class GoogleAnalyticsService {
  /**
   * Check if Google Tag / Analytics is loaded
   */
  static isLoaded(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  /**
   * Track Purchase event for Google Tag / Analytics
   */
  static trackPurchase(params: {
    transaction_id: string;
    value: number;
    currency?: string;
    items: Array<{
      item_id: string;
      item_name: string;
      price: number;
      quantity: number;
    }>;
  }): void {
    if (this.isLoaded()) {
      window.gtag!('event', 'purchase', {
        transaction_id: params.transaction_id,
        value: params.value,
        currency: params.currency || 'INR',
        items: params.items.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          price: item.price,
          quantity: item.quantity
        }))
      });
      console.log('[GoogleAnalyticsService] Tracked purchase event:', params.transaction_id);
    } else {
      console.warn('[GoogleAnalyticsService] gtag is not loaded or available.');
    }
  }
}

export default GoogleAnalyticsService;
