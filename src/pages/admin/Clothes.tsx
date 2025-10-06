import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ClothesSecondaryNav from '../../components/admin/ClothesSecondaryNav';
import { useProducts } from '../../contexts/ProductContext';
import { Product } from '../../types';
import { Shirt, Plus, Package, TrendingUp, Upload, X, Edit, Trash2, Save, Copy } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { ProductService } from '../../services/supabaseService';
import { NotificationManager } from '../../components/Notification';

const Clothes: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { adminProducts, loading } = useProducts();
  const [clothingProducts, setClothingProducts] = useState<Product[]>([]);
  const [menProducts, setMenProducts] = useState<Product[]>([]);
  const [womenProducts, setWomenProducts] = useState<Product[]>([]);
  
  // Form state for creating new clothing product
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    description: '',
    details: '',
    washCare: '',
    shipping: '',
    price: '',
    originalPrice: '',
    discountPercentage: '',
    categories: ['Men'],
    productType: 'poster' as 'digital' | 'poster',
    status: 'active' as 'active' | 'inactive',
    tags: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    clothingType: '',
    material: '',
    brand: '',
    // Inventory fields
    stockQuantity: '100',
    lowStockThreshold: '10'
  });
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  
  // Edit and Delete state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Filter products that are clothing items
    // Check both gender field (new) and categories (old/backward compatibility)
    const clothes = adminProducts.filter(product => {
      // Check new gender field
      if (product.gender && (product.gender === 'Men' || product.gender === 'Women' || product.gender === 'Unisex')) {
        return true;
      }
      // Backward compatibility: check categories array
      if (product.categories && product.categories.some(cat => 
        cat.toLowerCase().includes('clothing') ||
        cat.toLowerCase().includes('men') ||
        cat.toLowerCase().includes('women') ||
        cat.toLowerCase().includes('unisex') ||
        cat.toLowerCase().includes('apparel')
      )) {
        return true;
      }
      return false;
    });
    setClothingProducts(clothes);

    // Filter men's products
    const men = clothes.filter(product => {
      if (product.gender === 'Men') return true;
      if (product.categories && product.categories.some(cat => cat.toLowerCase().includes('men'))) return true;
      return false;
    });
    setMenProducts(men);

    // Filter women's products
    const women = clothes.filter(product => {
      if (product.gender === 'Women') return true;
      if (product.categories && product.categories.some(cat => cat.toLowerCase().includes('women'))) return true;
      return false;
    });
    setWomenProducts(women);
  }, [adminProducts]);

  const clothesCounts = {
    total: clothingProducts.length,
    men: menProducts.length,
    women: womenProducts.length,
    featured: clothingProducts.filter(p => p.featured).length
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return renderAllClothes();
      case 'men':
        return renderMenClothes();
      case 'women':
        return renderWomenClothes();
      case 'create':
        return renderCreateProduct();
      case 'import':
        return renderBulkImport();
      case 'export':
        return renderExport();
      case 'categories':
        return renderCategories();
      case 'featured':
        return renderFeatured();
      case 'analytics':
        return renderAnalytics();
      case 'inventory':
        return renderInventory();
      case 'settings':
        return renderSettings();
      default:
        return renderAllClothes();
    }
  };

  const renderAllClothes = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Clothing Products</h2>
        <p className="text-gray-600">Manage all your clothing inventory</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{clothesCounts.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Men's Items</h3>
              <Shirt className="w-5 h-5" style={{ color: '#ff6e00' }} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{clothesCounts.men}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Women's Items</h3>
              <Shirt className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{clothesCounts.women}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: '#ff6e00' }}></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : clothingProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No clothing products found</h3>
          <p className="text-gray-500 mb-4">Start by creating your first clothing product</p>
          <button
            onClick={() => setActiveTab('create')}
            className="px-6 py-3 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#ff6e00' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e56300'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff6e00'}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Create Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clothingProducts.map(product => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDuplicateProduct(product)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-green-50 transition-colors"
                  title="Duplicate product"
                >
                  <Copy className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => handleEditProduct(product)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                  title="Edit product"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMenClothes = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Men's Clothing</h2>
        <p className="text-gray-600">Manage men's clothing products</p>
      </div>

      {menProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No men's products found</h3>
          <p className="text-gray-500">Add products with 'Men' category to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menProducts.map(product => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDuplicateProduct(product)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-green-50 transition-colors"
                  title="Duplicate product"
                >
                  <Copy className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => handleEditProduct(product)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                  title="Edit product"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWomenClothes = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Women's Clothing</h2>
        <p className="text-gray-600">Manage women's clothing products</p>
      </div>

      {womenProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No women's products found</h3>
          <p className="text-gray-500">Add products with 'Women' category to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {womenProducts.map(product => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDuplicateProduct(product)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-green-50 transition-colors"
                  title="Duplicate product"
                >
                  <Copy className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => handleEditProduct(product)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                  title="Edit product"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-calculate current price when original price or discount changes
    if (name === 'originalPrice' || name === 'discountPercentage') {
      const originalPriceValue = name === 'originalPrice' ? value : formData.originalPrice;
      const discountPercentageValue = name === 'discountPercentage' ? value : formData.discountPercentage;
      
      // Only auto-calculate if BOTH fields have actual values (not empty strings)
      if (originalPriceValue && originalPriceValue.trim() !== '' && 
          discountPercentageValue && discountPercentageValue.trim() !== '') {
        const originalPrice = parseFloat(originalPriceValue);
        const discountPercentage = parseFloat(discountPercentageValue);
        
        if (!isNaN(originalPrice) && originalPrice > 0 && !isNaN(discountPercentage) && discountPercentage > 0) {
          const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);
          setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            price: Math.round(discountedPrice).toString()
          }));
          return;
        }
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorToggle = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setImages(prev => [...prev, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress('Uploading images...');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`${file.name} is not a valid image format`);
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds 10MB size limit`);
        }

        // Generate temporary product ID for upload
        const tempProductId = `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        
        // Upload to Supabase storage (clothes-images bucket)
        const imageUrl = await ProductService.uploadClothingImage(file, tempProductId);
        return imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
      
      NotificationManager.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
      
      // Reset file input
      e.target.value = '';
    } catch (error: any) {
      console.error('Error uploading images:', error);
      NotificationManager.error(error.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateProduct = async () => {
    // Validation
    if (!formData.productId.trim()) {
      NotificationManager.error('Please enter a SKU');
      return;
    }
    
    // Check for duplicate SKU
    const isDuplicate = adminProducts.some(p => 
      (p as any).productId && 
      (p as any).productId.toLowerCase() === formData.productId.toLowerCase()
    );
    
    if (isDuplicate) {
      NotificationManager.error(`SKU "${formData.productId}" already exists. Please use a unique SKU.`);
      return;
    }
    
    if (!formData.title.trim()) {
      NotificationManager.error('Please enter a product title');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      NotificationManager.error('Please enter a valid price');
      return;
    }
    if (images.length === 0) {
      NotificationManager.error('Please add at least one image');
      return;
    }
    if (formData.categories.length === 0) {
      NotificationManager.error('Please select a gender');
      return;
    }

    setCreating(true);
    try {
      // Combine all tags
      const allTags = [
        ...formData.tags,
        ...formData.sizes,
        ...formData.colors,
        formData.clothingType,
        formData.material,
        formData.brand
      ].filter(Boolean);

      const newProduct: Partial<Product> = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        categories: formData.categories,
        gender: formData.categories[0], // Set gender from categories selection
        images: images,
        main_image: images[0],
        productType: formData.productType,
        status: formData.status,
        tags: allTags,
        featured: false,
        downloads: 0,
        rating: 0,
        reviews: [],
        createdDate: new Date().toISOString(),
        productId: formData.productId.trim(),
        details: formData.details,
        washCare: formData.washCare,
        shipping: formData.shipping,
        clothingType: formData.clothingType,
        material: formData.material,
        brand: formData.brand,
        // Inventory fields (always track inventory for clothing)
        trackInventory: true,
        stockQuantity: parseInt(formData.stockQuantity) || 100,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        ...(formData.originalPrice && formData.originalPrice.trim() !== '' && parseFloat(formData.originalPrice) > 0 && { originalPrice: parseFloat(formData.originalPrice) }),
        ...(formData.discountPercentage && formData.discountPercentage.trim() !== '' && parseFloat(formData.discountPercentage) > 0 && { discountPercentage: parseFloat(formData.discountPercentage) })
      } as any;

      await ProductService.createProduct(newProduct as Product);
      
      NotificationManager.success('Clothing product created successfully!');
      
      // Reset form
      setFormData({
        productId: '',
        title: '',
        description: '',
        details: '',
        washCare: '',
        shipping: '',
        price: '',
        originalPrice: '',
        discountPercentage: '',
        categories: ['Men'],
        productType: 'poster',
        status: 'active',
        tags: [],
        sizes: [],
        colors: [],
        clothingType: '',
        material: '',
        brand: '',
        stockQuantity: '100',
        lowStockThreshold: '10'
      });
      setImages([]);
      
      // Switch to all products tab
      setActiveTab('all');
    } catch (error) {
      console.error('Error creating product:', error);
      NotificationManager.error('Failed to create product. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Edit Product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    
    // Pre-fill form with existing product data
    // Extract sizes and colors separately, and remove them from the tags array to avoid duplication
    const extractedSizes = product.tags?.filter(t => availableSizes.includes(t)) || [];
    const extractedColors = product.tags?.filter(t => availableColors.includes(t)) || [];
    const extractedClothingType = product.clothingType || product.tags?.find(t => clothingTypes.map(ct => ct.toLowerCase()).includes(t.toLowerCase())) || '';
    
    // Keep only tags that are not sizes, colors, clothingType, material, or brand
    const filteredTags = product.tags?.filter(t => 
      !availableSizes.includes(t) && 
      !availableColors.includes(t) &&
      t !== extractedClothingType &&
      t !== product.material &&
      t !== product.brand
    ) || [];
    
    setFormData({
      productId: product.productId || '',
      title: product.title,
      description: product.description || '',
      details: product.details || '',
      washCare: product.washCare || '',
      shipping: product.shipping || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      discountPercentage: product.discountPercentage?.toString() || '',
      categories: product.gender ? [product.gender] : (product.categories || ['Men']),
      productType: product.productType || 'poster',
      status: product.status || 'active',
      tags: filteredTags,
      sizes: extractedSizes,
      colors: extractedColors,
      clothingType: extractedClothingType,
      material: product.material || '',
      brand: product.brand || '',
      stockQuantity: product.stockQuantity?.toString() || '100',
      lowStockThreshold: product.lowStockThreshold?.toString() || '10'
    });
    
    setImages(product.images || []);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    // Validation
    if (!formData.productId.trim()) {
      NotificationManager.error('Please enter a SKU');
      return;
    }
    
    // Check for duplicate SKU (excluding current product)
    const isDuplicate = adminProducts.some(p => 
      p.id !== editingProduct.id &&
      (p as any).productId && 
      (p as any).productId.toLowerCase() === formData.productId.toLowerCase()
    );
    
    if (isDuplicate) {
      NotificationManager.error(`SKU "${formData.productId}" already exists. Please use a unique SKU.`);
      return;
    }
    
    if (!formData.title.trim()) {
      NotificationManager.error('Please enter a product title');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      NotificationManager.error('Please enter a valid price');
      return;
    }
    if (images.length === 0) {
      NotificationManager.error('Please add at least one image');
      return;
    }

    setUpdating(true);
    try {
      const allTags = [
        ...formData.tags,
        ...formData.sizes,
        ...formData.colors,
        formData.clothingType,
        formData.material,
        formData.brand
      ].filter(Boolean);

      const updatedProduct: Partial<Product> = {
        id: editingProduct.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        categories: formData.categories,
        gender: formData.categories[0], // Set gender from categories selection
        images: images,
        main_image: images[0],
        productType: formData.productType,
        status: formData.status,
        tags: allTags,
        productId: formData.productId.trim(),
        // Inventory fields
        trackInventory: true,
        stockQuantity: parseInt(formData.stockQuantity) || 100,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        details: formData.details,
        washCare: formData.washCare,
        shipping: formData.shipping,
        clothingType: formData.clothingType,
        material: formData.material,
        brand: formData.brand,
        ...(formData.originalPrice && formData.originalPrice.trim() !== '' && parseFloat(formData.originalPrice) > 0 && { originalPrice: parseFloat(formData.originalPrice) }),
        ...(formData.discountPercentage && formData.discountPercentage.trim() !== '' && parseFloat(formData.discountPercentage) > 0 && { discountPercentage: parseFloat(formData.discountPercentage) })
      } as any;

      await ProductService.updateProduct(editingProduct.id, updatedProduct);
      
      NotificationManager.success('Product updated successfully!');
      
      setShowEditModal(false);
      setEditingProduct(null);
      setFormData({
        productId: '',
        title: '',
        description: '',
        details: '',
        washCare: '',
        shipping: '',
        price: '',
        originalPrice: '',
        discountPercentage: '',
        categories: ['Men'],
        productType: 'poster',
        status: 'active',
        tags: [],
        sizes: [],
        colors: [],
        clothingType: '',
        material: '',
        brand: ''
      });
      setImages([]);
    } catch (error) {
      console.error('Error updating product:', error);
      NotificationManager.error('Failed to update product. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string) => {
    setDeleting(true);
    try {
      await ProductService.deleteProduct(productId);
      NotificationManager.success('Product deleted successfully!');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      NotificationManager.error('Failed to delete product. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = (product: Product) => {
    // Generate new SKU with -COPY suffix
    const baseSku = product.productId || product.title.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
    const newSku = `${baseSku}-COPY-${Date.now().toString().slice(-4)}`;
    
    // Extract sizes and colors separately, and remove them from the tags array to avoid duplication
    const extractedSizes = product.tags?.filter(t => availableSizes.includes(t)) || [];
    const extractedColors = product.tags?.filter(t => availableColors.includes(t)) || [];
    const extractedClothingType = product.clothingType || product.tags?.find(t => clothingTypes.map(ct => ct.toLowerCase()).includes(t.toLowerCase())) || '';
    
    // Keep only tags that are not sizes, colors, clothingType, material, or brand
    const filteredTags = product.tags?.filter(t => 
      !availableSizes.includes(t) && 
      !availableColors.includes(t) &&
      t !== extractedClothingType &&
      t !== product.material &&
      t !== product.brand
    ) || [];
    
    // Pre-fill form with duplicated product data
    setFormData({
      productId: newSku,
      title: `${product.title} (Copy)`,
      description: product.description || '',
      details: product.details || '',
      washCare: product.washCare || '',
      shipping: product.shipping || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      discountPercentage: product.discountPercentage?.toString() || '',
      categories: product.gender ? [product.gender] : (product.categories || ['Men']),
      productType: product.productType || 'poster',
      status: 'active',
      tags: filteredTags,
      sizes: extractedSizes,
      colors: extractedColors,
      clothingType: extractedClothingType,
      material: product.material || '',
      brand: product.brand || '',
      stockQuantity: product.stockQuantity?.toString() || '100',
      lowStockThreshold: product.lowStockThreshold?.toString() || '10'
    });
    
    // Copy images
    setImages(product.images || []);
    
    // Switch to create tab
    setActiveTab('create');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    NotificationManager.success(`Product duplicated! Edit details and click Create to save.`);
  };

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const availableColors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Grey', 'Navy', 'Brown', 'Pink', 'Violet', 'Beige', 'Yellow', 'Orange', 'Mauve', 'Slate Blue', 'Olive Green', 'Ivory Cream'];
  const clothingTypes = ['Oversized Hoodies', 'Extra Oversized Hoodies', 'Oversized T-Shirt', 'Regular Sized Sweatshirt'];

  const renderCreateProduct = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Create Clothing Product</h2>
        <p className="text-gray-600 mt-1">Add a new clothing item to your inventory</p>
      </div>

      <div className="p-6 space-y-6">
        {/* SKU */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            SKU (Stock Keeping Unit) * 
            <span className="text-xs font-normal text-gray-600 ml-2">(Unique identifier for inventory tracking)</span>
          </label>
          <input
            type="text"
            name="productId"
            value={formData.productId}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            placeholder="e.g. HOODIE-001, TSHIRT-BLK-M"
            maxLength={50}
          />
          <p className="text-xs text-gray-600 mt-2">
            💡 Use a unique SKU code for inventory management. Each product must have a unique SKU.
          </p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g. Men's Classic T-Shirt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Price * 
              {formData.originalPrice && formData.discountPercentage && (
                <span className="text-xs font-normal text-orange-600 ml-2">(Auto-calculated)</span>
              )}
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={formData.originalPrice && formData.discountPercentage ? "Auto-calculated from discount" : "Enter price or set discount"}
              step="0.01"
              min="0"
              readOnly={!!(formData.originalPrice && formData.discountPercentage)}
              style={formData.originalPrice && formData.discountPercentage ? { backgroundColor: '#fff5f0', cursor: 'not-allowed' } : {}}
            />
            {formData.originalPrice && formData.discountPercentage && (
              <p className="text-xs text-gray-500 mt-1">
                Calculated from original price minus {formData.discountPercentage}% discount
              </p>
            )}
          </div>
        </div>

        {/* Discount Information */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded">DISCOUNT</span>
            Pricing Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (Before Discount)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                placeholder="e.g. 2000"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Will show as strikethrough price</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                placeholder="e.g. 20 for 20% off"
                step="0.01"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">Displayed as discount badge</p>
            </div>
          </div>
          {formData.originalPrice && formData.discountPercentage && (
            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Preview:</span>{' '}
                <span className="line-through text-gray-500">₹{Math.round(parseFloat(formData.originalPrice))}</span>{' '}
                <span className="text-orange-600 font-bold">₹{formData.price}</span>{' '}
                <span className="text-orange-600">({formData.discountPercentage}% OFF)</span>
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">DESCRIPTION</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="THE TEST IS THE PERFECT BLEND OF COMFORT AND STYLE..."
          />
        </div>

        {/* Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">DETAILS</label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="100% BRUSHED COTTON FLEECE&#10;WEIGHT - 450 GSM&#10;EMBROIDERY FRONT AND BACK"
          />
        </div>

        {/* Wash Care */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WASH CARE</label>
          <textarea
            name="washCare"
            value={formData.washCare}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="USE COLD WATER TO PROTECT AGAINST FADING & SHRINKING.&#10;AVOID HARSHER DETERGENTS & TURN THEM INSIDE OUT FOR THE WASH."
          />
        </div>

        {/* Shipping */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SHIPPING</label>
          <textarea
            name="shipping"
            value={formData.shipping}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="SHIPPED WITHIN 24 HOURS.&#10;FREE DELIVERY PAN-INDIA.&#10;DISPATCHES NEXT DAY."
          />
        </div>

         {/* Gender */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
           <div className="flex flex-wrap gap-2">
             {['Men', 'Women', 'Unisex'].map(category => (
               <button
                 key={category}
                 onClick={() => handleCategoryToggle(category)}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                   formData.categories.includes(category)
                     ? 'bg-orange-500 text-white'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 style={formData.categories.includes(category) ? { backgroundColor: '#ff6e00' } : {}}
               >
                 {category}
               </button>
             ))}
           </div>
         </div>

        {/* Clothing Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clothing Type</label>
            <select
              name="clothingType"
              value={formData.clothingType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select type...</option>
              {clothingTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g. Cotton, Polyester"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Brand name"
            />
          </div>
        </div>

        {/* Inventory Management */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Inventory Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="e.g. 100"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Available stock quantity for this product</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="e.g. 10"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this number</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-white rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">📦 Stock Status:</span>{' '}
              {parseInt(formData.stockQuantity) <= 0 ? (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              ) : parseInt(formData.stockQuantity) <= parseInt(formData.lowStockThreshold) ? (
                <span className="text-orange-600 font-semibold">Low Stock ({formData.stockQuantity} units)</span>
              ) : (
                <span className="text-green-600 font-semibold">In Stock ({formData.stockQuantity} units)</span>
              )}
            </p>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.sizes.includes(size)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={formData.sizes.includes(size) ? { backgroundColor: '#ff6e00' } : {}}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(color => (
              <button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.colors.includes(color)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={formData.colors.includes(color) ? { backgroundColor: '#ff6e00' } : {}}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
          <div className="space-y-3">
            {/* File Upload */}
            <div>
              <label 
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors"
                style={uploading ? { opacity: 0.6, pointerEvents: 'none' } : {}}
              >
                <div className="text-center">
                  <Upload className="w-10 h-10 mx-auto mb-2" style={{ color: '#ff6e00' }} />
                  <p className="text-sm font-medium text-gray-700">
                    {uploading ? uploadProgress : 'Click to upload images'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WEBP up to 10MB (Multiple files allowed)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* URL Input (Alternative) */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">Or add image URL</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addImage()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
                disabled={uploading}
              />
              <button
                onClick={addImage}
                disabled={uploading}
                className="px-6 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: uploading ? '#ccc' : '#ff6e00' }}
                onMouseEnter={(e) => !uploading && (e.currentTarget.style.backgroundColor = '#e56300')}
                onMouseLeave={(e) => !uploading && (e.currentTarget.style.backgroundColor = '#ff6e00')}
              >
                Add URL
              </button>
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
        <button
          onClick={() => setActiveTab('all')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          disabled={creating}
        >
          Cancel
        </button>
        <button
          onClick={handleCreateProduct}
          disabled={creating}
          className="px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
          style={{ backgroundColor: '#ff6e00' }}
          onMouseEnter={(e) => !creating && (e.currentTarget.style.backgroundColor = '#e56300')}
          onMouseLeave={(e) => !creating && (e.currentTarget.style.backgroundColor = '#ff6e00')}
        >
          {creating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Product
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderBulkImport = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Bulk Import Clothing</h2>
      <p className="text-gray-600 mb-6">
        Import multiple clothing items at once using CSV file format.
      </p>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Make sure your CSV file includes: title, price, categories (including 'Men' or 'Women'), images, sizes, colors, and other clothing-specific fields.
          </p>
        </div>
        <button className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
          Upload CSV
        </button>
      </div>
    </div>
  );

  const renderExport = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Clothing Data</h2>
      <p className="text-gray-600 mb-6">
        Export your clothing products to CSV format for backup or analysis.
      </p>
      <button className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
        Export to CSV
      </button>
    </div>
  );

  const renderCategories = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Clothing Categories</h2>
      <p className="text-gray-600 mb-6">
        Manage clothing categories and subcategories.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Men's Categories</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• T-Shirts</li>
            <li>• Shirts</li>
            <li>• Jeans</li>
            <li>• Jackets</li>
            <li>• Hoodies</li>
          </ul>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Women's Categories</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Dresses</li>
            <li>• Tops</li>
            <li>• Jeans</li>
            <li>• Jackets</li>
            <li>• Skirts</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderFeatured = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Clothing</h2>
        <p className="text-gray-600">Manage featured clothing items</p>
      </div>

      {clothingProducts.filter(p => p.featured).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No featured products</h3>
          <p className="text-gray-500">Mark clothing products as featured to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clothingProducts.filter(p => p.featured).map(product => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDuplicateProduct(product)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-green-50 transition-colors"
                  title="Duplicate product"
                >
                  <Copy className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => handleEditProduct(product)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                  title="Edit product"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Clothing Analytics</h2>
      <p className="text-gray-600 mb-6">
        View sales performance and insights for clothing products.
      </p>
      <div className="text-center py-12 text-gray-500">
        Analytics feature coming soon...
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h2>
      <p className="text-gray-600 mb-6">
        Manage stock levels, sizes, and colors for clothing products.
      </p>
      <div className="text-center py-12 text-gray-500">
        Inventory management feature coming soon...
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Clothing Settings</h2>
      <p className="text-gray-600 mb-6">
        Configure clothing management preferences and options.
      </p>
      <div className="space-y-6">
        <div>
          <label className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#ff6e00' }} />
            <span className="text-gray-700">Show size chart on product pages</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#ff6e00' }} />
            <span className="text-gray-700">Enable color variants</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#ff6e00' }} />
            <span className="text-gray-700">Show stock availability</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout title="" noHeader>
      <div className="flex h-screen bg-gray-50 -m-4 overflow-hidden">
        {/* Fixed Secondary Nav */}
        <ClothesSecondaryNav 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clothesCounts={clothesCounts}
        />
        
        {/* Main Content Area with left margin to account for fixed sidebars */}
        <div className="flex-1 flex flex-col ml-24 min-h-0 overflow-hidden">
          {/* Content */}
          <div className="flex-1 bg-gray-50 pt-6 pb-6 pr-6 pl-6 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Clothing Product</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                    setImageInput('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* SKU */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  SKU (Stock Keeping Unit) * 
                  <span className="text-xs font-normal text-gray-600 ml-2">(Unique identifier)</span>
                </label>
                <input
                  type="text"
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  placeholder="e.g. HOODIE-001"
                  maxLength={50}
                />
              </div>

              {/* Same form fields as create product */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Price *
                    {formData.originalPrice && formData.discountPercentage && (
                      <span className="text-xs font-normal text-orange-600 ml-2">(Auto-calculated)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    step="0.01"
                    readOnly={!!(formData.originalPrice && formData.discountPercentage)}
                    style={formData.originalPrice && formData.discountPercentage ? { backgroundColor: '#fff5f0', cursor: 'not-allowed' } : {}}
                  />
                </div>
              </div>

              {/* Discount Information */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded">DISCOUNT</span>
                  Pricing Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      placeholder="e.g. 2000"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      placeholder="e.g. 20"
                      step="0.01"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DESCRIPTION</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="THE TEST IS THE PERFECT BLEND OF COMFORT AND STYLE..."
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DETAILS</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="100% BRUSHED COTTON FLEECE&#10;WEIGHT - 450 GSM&#10;EMBROIDERY FRONT AND BACK"
                />
              </div>

              {/* Wash Care */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WASH CARE</label>
                <textarea
                  name="washCare"
                  value={formData.washCare}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="USE COLD WATER TO PROTECT AGAINST FADING & SHRINKING.&#10;AVOID HARSHER DETERGENTS & TURN THEM INSIDE OUT FOR THE WASH."
                />
              </div>

              {/* Shipping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SHIPPING</label>
                <textarea
                  name="shipping"
                  value={formData.shipping}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="SHIPPED WITHIN 24 HOURS.&#10;FREE DELIVERY PAN-INDIA.&#10;DISPATCHES NEXT DAY."
                />
              </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                 <div className="flex flex-wrap gap-2">
                   {['Men', 'Women', 'Unisex'].map(category => (
                     <button
                       key={category}
                       onClick={() => handleCategoryToggle(category)}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                         formData.categories.includes(category)
                           ? 'text-white'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                       }`}
                       style={formData.categories.includes(category) ? { backgroundColor: '#ff6e00' } : {}}
                     >
                       {category}
                     </button>
                   ))}
                 </div>
               </div>

              {/* Clothing Type, Material, Brand */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clothing Type</label>
                  <select
                    name="clothingType"
                    value={formData.clothingType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select type...</option>
                    {clothingTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g. Cotton, Polyester"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Brand name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.sizes.includes(size)
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={formData.sizes.includes(size) ? { backgroundColor: '#ff6e00' } : {}}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.colors.includes(color)
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={formData.colors.includes(color) ? { backgroundColor: '#ff6e00' } : {}}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inventory Management */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Inventory Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="e.g. 100"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Available stock quantity for this product</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="e.g. 10"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this number</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">📦 Stock Status:</span>{' '}
                    {parseInt(formData.stockQuantity) <= 0 ? (
                      <span className="text-red-600 font-semibold">Out of Stock</span>
                    ) : parseInt(formData.stockQuantity) <= parseInt(formData.lowStockThreshold) ? (
                      <span className="text-orange-600 font-semibold">Low Stock ({formData.stockQuantity} units)</span>
                    ) : (
                      <span className="text-green-600 font-semibold">In Stock ({formData.stockQuantity} units)</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
                <div className="space-y-3">
                  {/* File Upload */}
                  <div>
                    <label 
                      htmlFor="edit-file-upload"
                      className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors"
                      style={uploading ? { opacity: 0.6, pointerEvents: 'none' } : {}}
                    >
                      <div className="text-center">
                        <Upload className="w-10 h-10 mx-auto mb-2" style={{ color: '#ff6e00' }} />
                        <p className="text-sm font-medium text-gray-700">
                          {uploading ? uploadProgress : 'Click to upload images'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF, WEBP up to 10MB (Multiple files allowed)
                        </p>
                      </div>
                      <input
                        id="edit-file-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        multiple
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* URL Input (Alternative) */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">Or add image URL</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addImage()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                      disabled={uploading}
                    />
                    <button
                      onClick={addImage}
                      disabled={uploading}
                      className="px-6 py-2 text-white rounded-lg transition-colors"
                      style={{ backgroundColor: uploading ? '#ccc' : '#ff6e00' }}
                      onMouseEnter={(e) => !uploading && (e.currentTarget.style.backgroundColor = '#e56300')}
                      onMouseLeave={(e) => !uploading && (e.currentTarget.style.backgroundColor = '#ff6e00')}
                    >
                      Add URL
                    </button>
                  </div>
                  
                  {/* Current Images */}
                  {images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Images ({images.length})</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs rounded">
                                Main
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  setImageInput('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                disabled={updating}
                className="px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
                style={{ backgroundColor: '#ff6e00' }}
                onMouseEnter={(e) => !updating && (e.currentTarget.style.backgroundColor = '#e56300')}
                onMouseLeave={(e) => !updating && (e.currentTarget.style.backgroundColor = '#ff6e00')}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this clothing product? All product data will be permanently removed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
                disabled={deleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Clothes;

