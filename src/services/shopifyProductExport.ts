'use client';

/**
 * Export products to Shopify product CSV (import format) with image URLs.
 * @see https://help.shopify.com/en/manual/products/import-export/using-csv
 *
 * - First row per product: full variant + first image.
 * - Extra rows: same Handle + additional Image Src (Shopify pattern).
 * - Image URLs must be publicly reachable (e.g. Supabase public storage).
 * - PDF: `pdf_url` in **PDF URL** column (merchant fulfillment). Body states PDF ships after order — no public link.
 * - Images: CSV **Image Src** = listing/preview; **Main image URL (full)** when present for post-purchase fulfillment.
 */

import { supabase } from './supabaseService';

/** Shopify CSV + Lurevi fulfillment columns */
const SHOPIFY_HEADERS = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Type',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Variant SKU',
  'Variant Grams',
  'Variant Inventory Tracker',
  'Variant Inventory Qty',
  'Variant Inventory Policy',
  'Variant Fulfillment Service',
  'Variant Price',
  'Variant Compare At Price',
  'Variant Requires Shipping',
  'Variant Taxable',
  'Variant Barcode',
  'Image Src',
  'Image Position',
  'Image Alt Text',
  'Gift Card',
  'SEO Title',
  'SEO Description',
  'PDF URL',
  'Main image URL (full file)',
  'Fulfillment note',
] as const;

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://lurevi.in';
}

function sanitizeHandle(slug: string, id: string): string {
  const raw = (slug || id || 'product').toString().toLowerCase();
  const cleaned = raw.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return cleaned || `product-${id.slice(0, 8)}`;
}

function normalizeImageUrl(url: string, base: string): string {
  const u = (url || '').trim();
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${base.replace(/\/$/, '')}${u}`;
  return u;
}

function collectImageUrls(product: any, base: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const push = (u: string) => {
    const n = normalizeImageUrl(u, base);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  };

  if (product.main_image) push(product.main_image);
  const imgs = product.images;
  if (Array.isArray(imgs)) {
    for (const im of imgs) {
      if (typeof im === 'string') push(im);
    }
  }

  return out;
}

function getPdfUrl(product: any, base: string): string {
  const raw = (product.pdf_url || product.pdfUrl || '').toString().trim();
  if (!raw) return '';
  return normalizeImageUrl(raw, base);
}

/** Full-resolution main file URL if stored separately; else same as first image used for listing */
function getMainImageFullUrl(product: any, base: string, fallbackFirstImage: string): string {
  const raw = (product.main_image_full_url || product.main_image_full || product.full_resolution_image || '').toString().trim();
  if (raw) return normalizeImageUrl(raw, base);
  return product.main_image ? normalizeImageUrl(product.main_image, base) : fallbackFirstImage || '';
}

const FULFILLMENT_NOTE =
  'Full-resolution main image and PDF (if applicable) are delivered after order completion — not via public links on this listing.';

function buildShopifyBody(html: string, title: string, pdfUrl: string, hasListingImages: boolean): string {
  const trimmed = (html || '').trim();
  const core = !trimmed ? `<p>${escapeHtml(title)}</p>` : trimmed;

  const parts: string[] = [];

  parts.push(`<section data-lurevi-fulfillment="1">
<p><strong>How you receive your files</strong></p>
<p>The images shown in this product listing are for preview. Your <strong>full-resolution main image</strong> and any <strong>PDF</strong> are provided <strong>after your order is completed</strong> (order page, confirmation email, or your download area — per your Lurevi store setup).</p>
${hasListingImages ? '<p>Preview images are shown in the gallery above; the high-resolution file follows the same order after purchase.</p>' : ''}
${pdfUrl ? '<p><strong>PDF:</strong> The download is not attached here — it will be available after order completion.</p>' : ''}
</section>`);

  parts.push(core);

  return parts.join('\n');
}

function cleanBody(html: string, title: string): string {
  const raw = (html || '').trim();
  if (!raw) return `<p>${escapeHtml(title)}</p>`;
  return raw;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeCsv(value: string | number | boolean | undefined | null): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function emptyRow(): string[] {
  return SHOPIFY_HEADERS.map(() => '');
}

function formatPrice(price: number | null | undefined): string {
  const n = typeof price === 'number' && !Number.isNaN(price) ? price : 0;
  return n.toFixed(2);
}

function getInventoryQty(product: any): number {
  const q =
    product.stock_quantity ?? product.stockQuantity ?? product.quantity ?? product.stock;
  if (q === null || q === undefined) return 999;
  const n = Number(q);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function isPublished(product: any): boolean {
  if (product.active === false) return false;
  const st = (product.status || 'active').toString().toLowerCase();
  return st === 'active' || st === 'published';
}

function buildProductRows(product: any, baseUrl: string): string[][] {
  const handle = sanitizeHandle(product.slug, product.id);
  const title = (product.title || 'Untitled').trim();
  const pdfUrl = getPdfUrl(product, baseUrl);
  const images = collectImageUrls(product, baseUrl);
  const hasListingImages = images.length > 0;
  const mainImageFullUrl = getMainImageFullUrl(product, baseUrl, images[0] || '');
  const body = buildShopifyBody(cleanBody(product.description || '', title), title, pdfUrl, hasListingImages);
  const vendor = (product.brand || 'Lurevi').trim();
  const type = (product.product_type || product.productType || 'Art & Wall Decor').trim();
  const tagsArr = Array.isArray(product.tags) ? product.tags : [];
  const catArr = Array.isArray(product.categories) ? product.categories : [];
  const tagExtras = [
    ...(pdfUrl ? ['pdf', 'digital-pdf'] : []),
    'post-purchase-delivery',
    'full-asset-after-order',
  ];
  const tags = [...new Set([...tagsArr.map(String), ...catArr.map(String), ...tagExtras])]
    .filter(Boolean)
    .join(', ');
  const published = isPublished(product) ? 'TRUE' : 'FALSE';
  const sku = (product.productId || product.productid || product.id || handle).toString().slice(0, 64);
  const qty = getInventoryQty(product);
  const invPolicy = qty > 0 ? 'deny' : 'deny';
  const price = formatPrice(product.price);
  const compareAt =
    product.original_price != null
      ? formatPrice(product.original_price)
      : product.originalPrice != null
        ? formatPrice(product.originalPrice)
        : '';
  const isDigital =
    product.product_type === 'digital' ||
    product.productType === 'digital' ||
    Boolean(pdfUrl);
  const requiresShipping = isDigital ? 'FALSE' : 'TRUE';
  const taxable = 'TRUE';
  const seoTitle = (product.meta_title || title).slice(0, 70);
  let plainDesc = (product.meta_description || product.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 130);
  if (plainDesc.length > 0) {
    plainDesc = `${plainDesc} Full image & PDF after purchase where applicable.`.slice(0, 160);
  } else {
    plainDesc = 'Full-resolution image and PDF delivered after order completion. Lurevi premium art.';
  }

  const row = emptyRow();

  const set = (key: (typeof SHOPIFY_HEADERS)[number], val: string) => {
    const i = SHOPIFY_HEADERS.indexOf(key);
    if (i >= 0) row[i] = val;
  };

  set('Handle', handle);
  set('Title', title);
  set('Body (HTML)', body);
  set('Vendor', vendor);
  set('Type', type);
  set('Tags', tags);
  set('Published', published);
  set('Option1 Name', 'Title');
  set('Option1 Value', 'Default Title');
  set('Variant SKU', sku);
  set('Variant Grams', '0');
  set('Variant Inventory Tracker', 'shopify');
  set('Variant Inventory Qty', String(qty));
  set('Variant Inventory Policy', invPolicy);
  set('Variant Fulfillment Service', 'manual');
  set('Variant Price', price);
  set('Variant Compare At Price', compareAt);
  set('Variant Requires Shipping', requiresShipping);
  set('Variant Taxable', taxable);
  set('Variant Barcode', '');
  set('Gift Card', 'FALSE');
  set('SEO Title', seoTitle);
  set('SEO Description', plainDesc);
  set('PDF URL', pdfUrl);
  set('Main image URL (full file)', mainImageFullUrl);
  set('Fulfillment note', FULFILLMENT_NOTE);

  const rows: string[][] = [];

  if (images.length === 0) {
    set('Image Src', '');
    set('Image Position', '');
    set('Image Alt Text', title);
    rows.push(row);
    return rows;
  }

  set('Image Src', images[0]);
  set('Image Position', '1');
  set('Image Alt Text', title);
  rows.push(row);

  for (let i = 1; i < images.length; i += 1) {
    const imgRow = emptyRow();
    imgRow[SHOPIFY_HEADERS.indexOf('Handle')] = handle;
    imgRow[SHOPIFY_HEADERS.indexOf('Image Src')] = images[i];
    imgRow[SHOPIFY_HEADERS.indexOf('Image Position')] = String(i + 1);
    imgRow[SHOPIFY_HEADERS.indexOf('Image Alt Text')] = `${title} — image ${i + 1}`;
    rows.push(imgRow);
  }

  return rows;
}

function rowsToCsv(rows: string[][]): string {
  const lines = [SHOPIFY_HEADERS.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))];
  return `\uFEFF${lines.join('\r\n')}`;
}

export class ShopifyProductExportService {
  static async fetchActiveProducts(): Promise<any[]> {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return (products || []).filter((p) => p.active !== false);
  }

  /**
   * Build all CSV rows (one product may produce multiple rows for extra images).
   */
  static buildAllRows(products: any[]): string[][] {
    const base = getBaseUrl();
    const out: string[][] = [];
    for (const p of products) {
      out.push(...buildProductRows(p, base));
    }
    return out;
  }

  static convertToCSV(rows: string[][]): string {
    return rowsToCsv(rows);
  }

  static downloadCSV(csv: string, filename = 'shopify-products-import.csv'): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async exportToShopifyCsv(productIds?: string[]): Promise<{ success: boolean; message: string; count?: number; rowCount?: number }> {
    try {
      let products = await this.fetchActiveProducts();
      if (productIds?.length) {
        products = products.filter((p) => productIds.includes(p.id));
      }
      if (products.length === 0) {
        return { success: false, message: 'No products to export.' };
      }
      const rows = this.buildAllRows(products);
      const csv = this.convertToCSV(rows);
      const date = new Date().toISOString().slice(0, 10);
      this.downloadCSV(csv, `lurevi-shopify-import-${date}.csv`);
      return {
        success: true,
        message: `Exported ${products.length} products (${rows.length} rows). Listing images + post-purchase PDF URL & full main image URL columns for fulfillment.`,
        count: products.length,
        rowCount: rows.length,
      };
    } catch (e: any) {
      console.error('Shopify export error:', e);
      return { success: false, message: e?.message || 'Shopify export failed.' };
    }
  }
}

export default ShopifyProductExportService;
export { SHOPIFY_HEADERS };
