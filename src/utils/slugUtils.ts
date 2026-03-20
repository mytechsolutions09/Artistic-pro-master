/**
 * Utility functions for generating and handling URL slugs
 */

/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug string
 */
export function generateSlug(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates a product URL path from category and product title
 * @param category - The category name
 * @param productTitle - The product title
 * @returns A URL path string
 */
export function generateProductUrl(category: string | undefined | null, productTitle: string | undefined | null): string {
  const categorySlug = generateSlug(category);
  const productSlug = generateSlug(productTitle);
  return `/${categorySlug}/${productSlug}`;
}

/**
 * Generates a category URL path from category name
 * @param category - The category name
 * @returns A URL path string
 */
export function generateCategoryUrl(category: string): string {
  const categorySlug = generateSlug(category);
  return `/${categorySlug}`;
}

/**
 * Extracts category and product information from a URL path
 * @param pathname - The URL pathname
 * @returns Object with categorySlug and productSlug, or null if invalid
 */
export function parseProductUrl(pathname: string): { categorySlug: string; productSlug: string } | null {
  // Remove leading slash and split by slashes
  const pathParts = pathname.replace(/^\//, '').split('/');
  
  // Check if we have exactly 2 parts (category/product)
  if (pathParts.length === 2) {
    return {
      categorySlug: pathParts[0],
      productSlug: pathParts[1]
    };
  }
  
  return null;
}

/**
 * Finds a product by category slug and product slug
 * @param products - Array of products to search
 * @param categorySlug - The category slug from URL
 * @param productSlug - The product slug from URL (optional for F&B direct URLs)
 * @returns The found product or null
 */
export function findProductBySlugs(
  products: any[],
  categorySlug: string,
  productSlug: string
): any | null {
  // For F&B direct URLs (/:slug), productSlug will be empty and categorySlug contains the product slug
  const hasProductSlug = productSlug && productSlug.length > 0;
  const slugToMatch = hasProductSlug ? productSlug : categorySlug;
  
  return products.find(product => {
    const productTitleSlug = generateSlug(product.title);
    
    // If title doesn't match the slug we're looking for, skip
    if (productTitleSlug !== slugToMatch) return false;
    
    // If no productSlug provided (direct URL like /product-name), check if it's an F&B product
    if (!hasProductSlug) {
      const categories = (product.categories || []).map((c: string) => c.toLowerCase()).join(' ');
      const isFB = categories.includes('food & beverage') || 
                   categories.includes('f&b') || 
                   categories.includes('food-beverage') ||
                   categories.includes('dry fruit') || 
                   categories.includes('dried fruit') || 
                   categories.includes('spice');
      return isFB;
    }
    
    // Special handling for /fb/ routes - match F&B products by title only
    if (categorySlug === 'fb') {
      const categories = (product.categories || []).map((c: string) => c.toLowerCase()).join(' ');
      const isFB = categories.includes('food & beverage') || 
                   categories.includes('f&b') || 
                   categories.includes('food-beverage') ||
                   categories.includes('dry fruit') || 
                   categories.includes('dried fruit') || 
                   categories.includes('spice');
      return isFB;
    }
    
    // Handle both old single category and new categories array
    let productCategorySlug = '';
    if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
      // Use the first category for URL matching
      productCategorySlug = generateSlug(product.categories[0]);
    } else if ((product as any).category) {
      // Fallback for old data structure
      productCategorySlug = generateSlug((product as any).category);
    }
    
    return productCategorySlug === categorySlug;
  });
}

/**
 * Generates a category slug from category name
 * @param category - The category name
 * @returns A URL-friendly category slug
 */
export function generateCategorySlug(category: string): string {
  return generateSlug(category);
}



