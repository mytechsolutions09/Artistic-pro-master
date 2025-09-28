import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Product, ArtWork } from '../types';
import { ProductService } from '../services/supabaseService';
import { MemoryEfficientArray } from '../utils/memoryUtils';
import { logMemoryUsage } from '../utils/memoryUtils';
import { enhanceProductWithSampleImages } from '../utils/sampleImageUtils';

interface ProductContextType {
  // All products (admin + featured)
  allProducts: (Product | ArtWork)[];
  // Admin products only
  adminProducts: Product[];
  // Featured artworks only
  featuredArtworks: ArtWork[];
  // Loading state
  loading: boolean;
  // Error state
  error: string | null;
  // Add new product
  addProduct: (product: Omit<Product, 'id' | 'createdDate' | 'downloads' | 'rating' | 'reviews'>) => Promise<void>;
  // Update existing product
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  // Delete product
  deleteProduct: (id: string) => Promise<void>;
  // Toggle product status
  toggleProductStatus: (id: string) => Promise<void>;
  // Toggle featured status
  toggleFeatured: (id: string) => Promise<void>;
  // Get product by ID
  getProductById: (id: string) => (Product | ArtWork) | undefined;
  // Get products by category
  getProductsByCategory: (category: string) => (Product | ArtWork)[];
  // Get related products
  getRelatedProducts: (productId: string, category: string, limit?: number) => (Product | ArtWork)[];
  // Refresh products from database
  refreshProducts: () => Promise<void>;
  // Clear localStorage and reset products
  clearLocalStorageAndReset: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  // Initialize state with empty arrays for production
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [featuredArtworks, setFeaturedArtworks] = useState<ArtWork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use memory-efficient arrays for large datasets
  const adminProductsArray = useMemo(() => new MemoryEfficientArray<Product>(500), []);

  // Memoized combined products to avoid recreating array on every render
  const allProducts = useMemo(() => {
    const combined = [...adminProducts, ...featuredArtworks];
    logMemoryUsage('ProductContext - All Products');
    return combined;
  }, [adminProducts, featuredArtworks]);

  // Load products from database on mount
  useEffect(() => {
    refreshProducts();
  }, []);

  // Helper function to map database fields to Product interface
  const mapDatabaseProduct = (dbProduct: any): Product => {
    const baseProduct = {
      id: dbProduct.id,
      title: dbProduct.title,
      price: dbProduct.price,
      originalPrice: dbProduct.original_price || dbProduct.originalPrice,
      discountPercentage: dbProduct.discount_percentage || dbProduct.discountPercentage,
      categories: dbProduct.categories || (dbProduct.category ? [dbProduct.category] : []),
      images: dbProduct.images || [],
      main_image: dbProduct.main_image, // Add main_image field
      pdf_url: dbProduct.pdf_url, // Add pdf_url field
      video_url: dbProduct.video_url, // Add video_url field
      featured: dbProduct.featured || false,
      downloads: dbProduct.downloads || 0,
      rating: dbProduct.rating || 0,
      tags: dbProduct.tags || [],
      status: dbProduct.status || 'active',
      createdDate: dbProduct.created_date || new Date().toISOString().split('T')[0],
      description: dbProduct.description || '',
      reviews: dbProduct.reviews || [],
      itemDetails: dbProduct.item_details || {},
      delivery: dbProduct.delivery_info || {},
      didYouKnow: dbProduct.did_you_know || {},
      productType: dbProduct.product_type || dbProduct.productType || 'digital',
      posterSize: dbProduct.poster_size || dbProduct.posterSize,
      posterPricing: dbProduct.poster_pricing || dbProduct.posterPricing || {}
    };

    // Enhance with sample images if needed
    return enhanceProductWithSampleImages(baseProduct);
  };

  // Refresh products from database
  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Refreshing products from database...');
      
      // Fetch all products and featured products
      const [allProductsData, featuredProductsData] = await Promise.all([
        ProductService.getAllProducts(),
        ProductService.getFeaturedProducts()
      ]);

      console.log('📦 Raw products data from database:', allProductsData);
      console.log('⭐ Featured products data from database:', featuredProductsData);

      // Map database fields to Product interface
      const mappedProducts = allProductsData.map(mapDatabaseProduct);
      const mappedFeatured = featuredProductsData.map(mapDatabaseProduct);

      console.log('🔄 Mapped admin products:', mappedProducts);
      console.log('🔄 Mapped featured products:', mappedFeatured);

      setAdminProducts(mappedProducts);
      setFeaturedArtworks(mappedFeatured as ArtWork[]);
      
      console.log('✅ Products state updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('❌ Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new product
  const addProduct = async (productData: Omit<Product, 'id' | 'createdDate' | 'downloads' | 'rating' | 'reviews'> & {
    itemDetails?: any;
    delivery?: any;
    didYouKnow?: any;
  }) => {
    try {
      setError(null);
      console.log('➕ Creating new product with data:', productData);
      
      const newProduct = await ProductService.createProduct(productData);
      console.log('✅ Product created in database:', newProduct);
      
      const mappedProduct = mapDatabaseProduct(newProduct);
      console.log('🔄 Mapped product for state:', mappedProduct);
      
      setAdminProducts(prev => {
        const updated = [...prev, mappedProduct];
        console.log('📦 Updated admin products state:', updated);
        return updated;
      });
      
      console.log('✅ Product added to state successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      console.error('❌ Error adding product:', err);
      throw err;
    }
  };

  // Update existing product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      setError(null);
      const updatedProduct = await ProductService.updateProduct(id, updates);
      const mappedProduct = mapDatabaseProduct(updatedProduct);
      setAdminProducts(prev => 
        prev.map(product => 
          product.id === id ? mappedProduct : product
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      await ProductService.deleteProduct(id);
      setAdminProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  // Toggle product status
  const toggleProductStatus = async (id: string) => {
    try {
      setError(null);
      const product = adminProducts.find(p => p.id === id);
      if (!product) return;

      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await ProductService.updateProduct(id, { status: newStatus });
      
      setAdminProducts(prev => 
        prev.map(p => 
          p.id === id ? { ...p, status: newStatus } : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle product status');
      throw err;
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id: string) => {
    try {
      setError(null);
      const product = adminProducts.find(p => p.id === id);
      if (!product) return;

      const newFeatured = !product.featured;
      await ProductService.updateProduct(id, { featured: newFeatured });
      
      setAdminProducts(prev => 
        prev.map(p => 
          p.id === id ? { ...p, featured: newFeatured } : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle featured status');
      throw err;
    }
  };

  // Get product by ID
  const getProductById = (id: string): (Product | ArtWork) | undefined => {
    return allProducts.find(product => product.id === id);
  };

  // Memoized product filtering functions to avoid recreating on every call
  const getProductsByCategory = useCallback((category: string): (Product | ArtWork)[] => {
    const cacheKey = `category-${category}`;
    return adminProductsArray.get(product => {
      // Handle both old single category and new categories array
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories.includes(category);
      }
      // Fallback for old data structure
      return (product as any).category === category;
    }, cacheKey);
  }, [adminProductsArray]);

  const getRelatedProducts = useCallback((productId: string, category: string, limit: number = 4): (Product | ArtWork)[] => {
    const cacheKey = `related-${productId}-${category}-${limit}`;
    return adminProductsArray.get(product => {
      // Handle both old single category and new categories array
      const hasCategory = product.categories && Array.isArray(product.categories) 
        ? product.categories.includes(category)
        : (product as any).category === category;
      return hasCategory && product.id !== productId;
    }, cacheKey).slice(0, limit);
  }, [adminProductsArray]);

  // Clear localStorage and reset products
  const clearLocalStorageAndReset = () => {
    localStorage.removeItem('adminProducts');
    setAdminProducts([]);
    setFeaturedArtworks([]);
    setError(null);
    console.log('Local storage cleared and products reset for production.');
  };

  const value: ProductContextType = {
    allProducts,
    adminProducts,
    featuredArtworks,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    toggleFeatured,
    getProductById,
    getProductsByCategory,
    getRelatedProducts,
    refreshProducts,
    clearLocalStorageAndReset
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
