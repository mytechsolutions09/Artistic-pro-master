// Product Catalog Export Service
// Exports products to CSV format for Facebook/Instagram catalog integration

import { supabase } from './supabaseService';

export interface ProductExportData {
  product_id: string;
  title: string;
  description: string;
  price: number;
  link: string;
  image_link: string;
  availability: string;
  brand: string;
  condition?: string;
  google_product_category?: string;
  product_type?: string;
  additional_image_link?: string;
}

export class ProductCatalogExportService {
  private static baseUrl = window.location.origin;

  /**
   * Fetch all products for export
   */
  static async fetchProducts(): Promise<ProductExportData[]> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) throw error;

      // Filter out inactive products if they have an active field
      const activeProducts = products.filter(p => p.active !== false);

      return activeProducts.map(product => this.formatProduct(product));
    } catch (error) {
      console.error('Error fetching products for export:', error);
      throw error;
    }
  }

  /**
   * Format product for export
   */
  private static formatProduct(product: any): ProductExportData {
    const productUrl = `${this.baseUrl}/clothes/${product.slug || product.id}`;
    const imageUrl = product.main_image || product.images?.[0] || '';
    
    // Handle different stock quantity field names
    // If NULL/undefined, treat as "in stock" (no inventory tracking)
    const stockQty = product.stock_quantity || product.stockQuantity || product.quantity || product.stock;
    const isInStock = stockQty === null || stockQty === undefined || stockQty > 0;
    
    return {
      product_id: product.id,
      title: product.title || 'Untitled Product',
      description: this.cleanDescription(product.description || product.title || ''),
      price: product.price || 0,
      link: productUrl,
      image_link: imageUrl,
      availability: isInStock ? 'in stock' : 'out of stock',
      brand: product.brand || 'Lurevi',
      condition: 'new',
      google_product_category: this.getProductCategory(product),
      product_type: product.product_type || 'Clothing',
      additional_image_link: product.images?.[1] || ''
    };
  }

  /**
   * Clean description for export (remove HTML, limit length)
   */
  private static cleanDescription(description: string): string {
    // Remove HTML tags
    let clean = description.replace(/<[^>]*>/g, '');
    // Remove extra whitespace
    clean = clean.replace(/\s+/g, ' ').trim();
    // Limit to 5000 characters (Facebook limit)
    return clean.substring(0, 5000);
  }

  /**
   * Get product category for Google taxonomy
   */
  private static getProductCategory(product: any): string {
    const type = product.product_type?.toLowerCase() || '';
    
    if (type.includes('shirt') || type.includes('t-shirt')) {
      return 'Apparel & Accessories > Clothing > Shirts & Tops';
    } else if (type.includes('pant') || type.includes('trouser')) {
      return 'Apparel & Accessories > Clothing > Pants';
    } else if (type.includes('dress')) {
      return 'Apparel & Accessories > Clothing > Dresses';
    } else if (type.includes('jacket') || type.includes('coat')) {
      return 'Apparel & Accessories > Clothing > Outerwear';
    } else if (type.includes('shoe')) {
      return 'Apparel & Accessories > Shoes';
    } else {
      return 'Apparel & Accessories > Clothing';
    }
  }

  /**
   * Convert products to CSV format
   */
  static convertToCSV(products: ProductExportData[]): string {
    if (!products || products.length === 0) {
      return 'No products to export';
    }

    // CSV Headers (Facebook/Instagram format)
    const headers = [
      'id',
      'title',
      'description',
      'price',
      'link',
      'image_link',
      'availability',
      'brand',
      'condition',
      'google_product_category',
      'product_type',
      'additional_image_link'
    ];

    // Create CSV rows
    const rows = products.map(product => {
      return [
        this.escapeCSV(product.product_id),
        this.escapeCSV(product.title),
        this.escapeCSV(product.description),
        product.price,
        this.escapeCSV(product.link),
        this.escapeCSV(product.image_link),
        this.escapeCSV(product.availability),
        this.escapeCSV(product.brand),
        this.escapeCSV(product.condition || 'new'),
        this.escapeCSV(product.google_product_category || ''),
        this.escapeCSV(product.product_type || ''),
        this.escapeCSV(product.additional_image_link || '')
      ].join(',');
    });

    // Combine headers and rows
    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Escape CSV values
   */
  private static escapeCSV(value: string | number): string {
    if (typeof value === 'number') return value.toString();
    if (!value) return '';
    
    // Escape double quotes and wrap in quotes if contains comma, quote, or newline
    const stringValue = value.toString();
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  /**
   * Download CSV file
   */
  static downloadCSV(csv: string, filename: string = 'product-catalog.csv'): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Export products to CSV and download
   * @param productIds - Optional array of product IDs to export. If not provided, exports all products.
   */
  static async exportToCSV(productIds?: string[]): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      // Fetch products
      let products = await this.fetchProducts();
      
      // Filter by selected IDs if provided
      if (productIds && productIds.length > 0) {
        products = products.filter(p => productIds.includes(p.product_id));
      }
      
      if (products.length === 0) {
        return {
          success: false,
          message: 'No products found to export'
        };
      }

      // Convert to CSV
      const csv = this.convertToCSV(products);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `lurevi-products-${timestamp}.csv`;
      
      // Download
      this.downloadCSV(csv, filename);
      
      return {
        success: true,
        message: `Successfully exported ${products.length} products`,
        count: products.length
      };
    } catch (error: any) {
      console.error('Export error:', error);
      return {
        success: false,
        message: error.message || 'Failed to export products'
      };
    }
  }

  /**
   * Get export preview (first 5 products)
   */
  static async getPreview(): Promise<ProductExportData[]> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .limit(5);

      if (error) throw error;

      // Filter out inactive products if they have an active field
      const activeProducts = products.filter(p => p.active !== false);

      return activeProducts.map(product => this.formatProduct(product));
    } catch (error) {
      console.error('Error fetching preview:', error);
      return [];
    }
  }

  /**
   * Validate product data for export
   */
  static validateProduct(product: ProductExportData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.product_id) errors.push('Missing product ID');
    if (!product.title) errors.push('Missing title');
    if (!product.link) errors.push('Missing product link');
    if (!product.image_link) errors.push('Missing image link');
    if (product.price <= 0) errors.push('Invalid price');
    if (!product.availability) errors.push('Missing availability');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get export statistics
   */
  static async getExportStats(): Promise<{
    total: number;
    inStock: number;
    outOfStock: number;
    withImages: number;
    withoutImages: number;
  }> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      // Filter out inactive products if they have an active field
      const activeProducts = products.filter(p => p.active !== false);

      // Helper to get stock quantity from different possible field names
      // If all are null/undefined, treat as "in stock" (no inventory tracking)
      const getStockQty = (p: any) => {
        const qty = p.stock_quantity || p.stockQuantity || p.quantity || p.stock;
        return qty !== null && qty !== undefined ? qty : 999; // Treat NULL as "available"
      };

      const stats = {
        total: activeProducts.length,
        inStock: activeProducts.filter(p => getStockQty(p) > 0).length,
        outOfStock: activeProducts.filter(p => getStockQty(p) === 0).length,
        withImages: activeProducts.filter(p => p.main_image || (p.images && p.images.length > 0)).length,
        withoutImages: activeProducts.filter(p => !p.main_image && (!p.images || p.images.length === 0)).length
      };

      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        total: 0,
        inStock: 0,
        outOfStock: 0,
        withImages: 0,
        withoutImages: 0
      };
    }
  }
}

export default ProductCatalogExportService;

