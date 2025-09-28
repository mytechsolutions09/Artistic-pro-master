/**
 * Utility functions for handling sample images when products don't have images
 */

// Sample placeholder images using reliable sources
export const SAMPLE_IMAGES = [
  'https://picsum.photos/800/800?random=1',
  'https://picsum.photos/800/800?random=2', 
  'https://picsum.photos/800/800?random=3',
  'https://picsum.photos/800/800?random=4',
  'https://picsum.photos/800/800?random=5',
  'https://picsum.photos/800/800?random=6',
  'https://picsum.photos/800/800?random=7',
  'https://picsum.photos/800/800?random=8',
  'https://picsum.photos/800/800?random=9',
  'https://picsum.photos/800/800?random=10'
];

/**
 * Get a sample image URL based on product title or ID
 * This ensures consistent images for the same product
 */
export function getSampleImage(productId: string, productTitle?: string): string {
  // Use product ID to generate a consistent index
  const hash = productId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hash) % SAMPLE_IMAGES.length;
  return SAMPLE_IMAGES[index];
}

/**
 * Get multiple sample images for a product
 */
export function getSampleImages(productId: string, count: number = 3): string[] {
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate different images by modifying the product ID
    const modifiedId = `${productId}_${i}`;
    images.push(getSampleImage(modifiedId));
  }
  return images;
}

/**
 * Check if a product needs sample images
 */
export function needsSampleImages(product: any): boolean {
  return (
    !product.images || 
    product.images.length === 0 || 
    !product.main_image ||
    product.main_image === null ||
    product.main_image === 'None'
  );
}

/**
 * Enhance a product with sample images if needed
 */
export function enhanceProductWithSampleImages(product: any): any {
  if (needsSampleImages(product)) {
    const sampleImages = getSampleImages(product.id, 3);
    return {
      ...product,
      images: sampleImages,
      main_image: sampleImages[0]
    };
  }
  return product;
}

/**
 * Enhance multiple products with sample images
 */
export function enhanceProductsWithSampleImages(products: any[]): any[] {
  return products.map(enhanceProductWithSampleImages);
}
