import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Copy, Eye, Search, Grid, List, Star, 
  Package, RefreshCw, X, FileText, TrendingUp, Settings,
  Save, Upload, Image as ImageIcon, Calendar, MapPin, Scale
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import FBSecondaryNav, { FB_TABS } from '../../components/admin/FBSecondaryNav';
import OrderManagement from '../../components/admin/OrderManagement';
import { ProductService } from '../../services/supabaseService';
import { NotificationManager } from '../../components/Notification';
import { useProducts } from '../../contexts/ProductContext';
import { NavigationVisibilityService } from '../../services/navigationVisibilityService';

interface FBItem {
  id?: string;
  title: string;
  category: 'dry-fruits' | 'dried-fruits' | 'spices';
  description: string;
  price: string;
  original_price?: string;
  discount_percentage?: string;
  weight: string;
  weight_unit: 'g' | 'kg';
  stock_quantity: string;
  brand?: string;
  origin?: string;
  expiry_date?: string;
  storage_instructions?: string;
  nutritional_info?: string;
  ingredients?: string;
  images: string[];
  main_image?: string;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
}

const FB: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [items, setItems] = useState<FBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'dry-fruits' | 'dried-fruits' | 'spices'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FBItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isFBNavActive, setIsFBNavActive] = useState(true);
  const { addProduct, updateProduct, deleteProduct, adminProducts } = useProducts();
  const [formData, setFormData] = useState<FBItem>({
    title: '',
    category: 'dry-fruits',
    description: '',
    price: '',
    original_price: '',
    discount_percentage: '',
    weight: '',
    weight_unit: 'g',
    stock_quantity: '',
    brand: '',
    origin: '',
    expiry_date: '',
    storage_instructions: '',
    nutritional_info: '',
    ingredients: '',
    images: [],
    main_image: '',
    status: 'active',
    tags: []
  });

  useEffect(() => {
    if (activeTab === 'all') {
      loadItems();
    }
  }, [activeTab, adminProducts]);

  useEffect(() => {
    const settings = NavigationVisibilityService.getSettings();
    setIsFBNavActive(settings.fbActive);

    const unsubscribe = NavigationVisibilityService.subscribe((nextSettings) => {
      setIsFBNavActive(nextSettings.fbActive);
    });

    return unsubscribe;
  }, []);

  const loadItems = () => {
    setLoading(true);
    try {
      const fbKeywords = [
        'food & beverage',
        'f&b',
        'f & b',
        'dry fruit',
        'dried fruit',
        'spice',
      ];

      const fbProducts = adminProducts.filter((product: any) => {
        const categories = product.categories || [];
        const category = (product as any).category || '';
        const combined = [...categories, category].join(' ').toLowerCase();
        return fbKeywords.some((kw) => combined.includes(kw));
      });

      const mapped: FBItem[] = fbProducts.map((product: any) => {
        const categories = product.categories || [];
        const combined = categories.join(' ').toLowerCase();

        let fbCategory: FBItem['category'] = 'dry-fruits';
        if (combined.includes('dried')) {
          fbCategory = 'dried-fruits';
        } else if (combined.includes('spice')) {
          fbCategory = 'spices';
        }

        const itemDetails = product.itemDetails || product.item_details || {};
        const delivery = product.delivery || product.delivery_info || {};
        const didYouKnow = product.didYouKnow || product.did_you_know || {};
        const sizeStr = (itemDetails.size || '').trim();
        let weight = '';
        let weight_unit: 'g' | 'kg' = 'g';
        if (sizeStr) {
          const match = sizeStr.match(/^([\d.]+)\s*(g|kg)?$/i);
          if (match) {
            weight = match[1];
            weight_unit = (match[2]?.toLowerCase() === 'kg' ? 'kg' : 'g') as 'g' | 'kg';
          }
        }

        return {
          id: product.id,
          title: product.title || '',
          category: fbCategory,
          description: product.description || '',
          price: String(product.price ?? ''),
          original_price:
            product.originalPrice !== undefined && product.originalPrice !== null
              ? String(product.originalPrice)
              : '',
          discount_percentage:
            product.discountPercentage !== undefined && product.discountPercentage !== null
              ? String(product.discountPercentage)
              : '',
          weight,
          weight_unit,
          stock_quantity:
            product.stockQuantity !== undefined && product.stockQuantity !== null
              ? String(product.stockQuantity)
              : '',
          brand: product.brand || itemDetails.material || '',
          origin: itemDetails.origin || '',
          expiry_date: (itemDetails as any).expiryDate || (itemDetails as any).expiry_date || '',
          storage_instructions: delivery.additionalInfo || '',
          nutritional_info: didYouKnow.uniqueFeatures || '',
          ingredients: (itemDetails as any).ingredients || '',
          images: product.images || [],
          main_image: product.main_image || '',
          status: (product.status as FBItem['status']) || 'active',
          tags: product.tags || [],
        };
      });

      setItems(mapped);
    } catch (error) {
      console.error('Error loading F & B items:', error);
      NotificationManager.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'create') {
      resetForm();
      setShowCreateModal(true);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const tempId = `fb_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const uploadPromises = Array.from(files).map(async (file) => {
        return await ProductService.uploadProductImage(file, tempId);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      NotificationManager.success('Images uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading images:', error);
      NotificationManager.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const tempId = `fb_main_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const url = await ProductService.uploadProductImage(file, tempId);
      setFormData(prev => ({
        ...prev,
        main_image: url,
        images: prev.images.includes(url) ? prev.images : [url, ...prev.images]
      }));
      NotificationManager.success('Main image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading main image:', error);
      NotificationManager.error(error.message || 'Failed to upload main image');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'dry-fruits',
      description: '',
      price: '',
      original_price: '',
      discount_percentage: '',
      weight: '',
      weight_unit: 'g',
      stock_quantity: '',
      brand: '',
      origin: '',
      expiry_date: '',
      storage_instructions: '',
      nutritional_info: '',
      ingredients: '',
      images: [],
      main_image: '',
      status: 'active',
      tags: []
    });
  };

  const handleCreateItem = async () => {
    if (!formData.title.trim()) {
      NotificationManager.error('Title is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      NotificationManager.error('Valid price is required');
      return;
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      NotificationManager.error('Valid weight is required');
      return;
    }

    try {
      const price = parseFloat(formData.price);
      const originalPrice = formData.original_price
        ? parseFloat(formData.original_price)
        : undefined;
      const discountPercentage = formData.discount_percentage
        ? parseFloat(formData.discount_percentage)
        : undefined;

      const baseCategoryLabel =
        formData.category === 'dried-fruits'
          ? 'Dried Fruits'
          : formData.category === 'spices'
          ? 'Spices'
          : 'Dry Fruits';

      const categories = ['Food & Beverage', baseCategoryLabel];

      const images: string[] = [...(formData.images || [])];
      if (formData.main_image && !images.includes(formData.main_image)) {
        images.unshift(formData.main_image);
      }

      await addProduct({
        title: formData.title.trim(),
        price,
        originalPrice,
        discountPercentage,
        categories,
        images,
        main_image: formData.main_image || images[0],
        pdf_url: undefined,
        video_url: undefined,
        image_url: undefined,
        // Use 'poster' here because the database `products.product_type` check
        // constraint currently only allows values like 'digital' and 'poster'.
        // Other parts of the app (e.g. clothing) also use 'poster' for
        // physical SKUs, so we follow the same pattern for F&B items.
        productType: 'poster',
        posterSize: undefined,
        posterPricing: {},
        featured: false,
        tags: formData.tags || ['F&B'],
        status: formData.status,
        description: formData.description || '',
        slug: undefined,
        views: 0,
        favoritesCount: 0,
        itemDetails: {
          material: formData.brand || 'Food & Beverage',
          size: `${formData.weight || ''} ${formData.weight_unit || 'g'}`.trim(),
          frame: '',
          style: baseCategoryLabel,
          origin: formData.origin || '',
          ...(formData.ingredients && { ingredients: formData.ingredients }),
          ...(formData.expiry_date && { expiryDate: formData.expiry_date }),
        } as any,
        delivery: {
          standardDelivery: 'Standard shipping',
          expressDelivery: '',
          sameDayDelivery: '',
          additionalInfo: formData.storage_instructions || '',
        },
        didYouKnow: {
          artistStory: '',
          ecoFriendly: '',
          uniqueFeatures: formData.nutritional_info || '',
        },
        stockQuantity: formData.stock_quantity
          ? parseFloat(formData.stock_quantity)
          : undefined,
        lowStockThreshold: undefined,
        trackInventory: true,
      });

      NotificationManager.success('F & B item created successfully');
      setShowCreateModal(false);
      resetForm();
      setActiveTab('all');
    } catch (error: any) {
      console.error('Error creating item:', error);
      NotificationManager.error(error.message || 'Failed to create item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    if (!formData.title.trim()) {
      NotificationManager.error('Title is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      NotificationManager.error('Valid price is required');
      return;
    }

    try {
      if (!editingItem.id) {
        NotificationManager.error('Missing product ID for update');
        return;
      }

      const price = parseFloat(formData.price);
      const originalPrice = formData.original_price
        ? parseFloat(formData.original_price)
        : undefined;
      const discountPercentage = formData.discount_percentage
        ? parseFloat(formData.discount_percentage)
        : undefined;

      const baseCategoryLabel =
        formData.category === 'dried-fruits'
          ? 'Dried Fruits'
          : formData.category === 'spices'
          ? 'Spices'
          : 'Dry Fruits';

      const categories = ['Food & Beverage', baseCategoryLabel];

      const images: string[] = [...(formData.images || [])];
      if (formData.main_image && !images.includes(formData.main_image)) {
        images.unshift(formData.main_image);
      }

      await updateProduct(editingItem.id, {
        title: formData.title.trim(),
        price,
        originalPrice,
        discountPercentage,
        categories,
        images,
        main_image: formData.main_image || images[0],
        featured: false,
        tags: formData.tags || ['F&B'],
        status: formData.status,
        description: formData.description || '',
        itemDetails: {
          material: formData.brand || 'Food & Beverage',
          size: `${formData.weight || ''} ${formData.weight_unit || 'g'}`.trim(),
          frame: '',
          style: baseCategoryLabel,
          origin: formData.origin || '',
          ...(formData.ingredients && { ingredients: formData.ingredients }),
          ...(formData.expiry_date && { expiryDate: formData.expiry_date }),
        } as any,
        delivery: {
          standardDelivery: 'Standard shipping',
          expressDelivery: '',
          sameDayDelivery: '',
          additionalInfo: formData.storage_instructions || '',
        },
        didYouKnow: {
          artistStory: '',
          ecoFriendly: '',
          uniqueFeatures: formData.nutritional_info || '',
        },
        stockQuantity: formData.stock_quantity
          ? parseFloat(formData.stock_quantity)
          : undefined,
        trackInventory: true,
      } as any);

      NotificationManager.success('F & B item updated successfully');
      setShowEditModal(false);
      setEditingItem(null);
      resetForm();
      setActiveTab('all');
    } catch (error: any) {
      console.error('Error updating item:', error);
      NotificationManager.error(error.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteProduct(id);
      NotificationManager.success('F & B item deleted successfully');
    } catch (error: any) {
      console.error('Error deleting item:', error);
      NotificationManager.error(error.message || 'Failed to delete item');
    }
  };

  const handleDuplicateItem = async (item: FBItem) => {
    if (!item.id) return;
    const product = adminProducts.find((p: any) => p.id === item.id);
    if (!product) {
      NotificationManager.error('Product not found');
      return;
    }
    try {
      const p = product as any;
      const categories = Array.isArray(p.categories) ? [...p.categories] : ['Food & Beverage', 'Dry Fruits'];
      const images = Array.isArray(p.images) ? [...p.images] : p.main_image ? [p.main_image] : [];
      await addProduct({
        title: (p.title || item.title) + ' (Copy)',
        price: p.price ?? parseFloat(item.price),
        originalPrice: p.originalPrice ?? (item.original_price ? parseFloat(item.original_price) : undefined),
        discountPercentage: p.discountPercentage ?? (item.discount_percentage ? parseFloat(item.discount_percentage) : undefined),
        categories,
        images,
        main_image: p.main_image || images[0],
        pdf_url: p.pdf_url,
        video_url: p.video_url,
        productType: 'poster',
        posterSize: p.posterSize,
        posterPricing: p.posterPricing || {},
        featured: false,
        tags: p.tags && p.tags.length ? [...p.tags] : ['F&B'],
        status: (p.status as 'active' | 'inactive' | 'draft') || item.status || 'active',
        description: p.description || item.description || '',
        itemDetails: p.itemDetails ? { ...p.itemDetails } : {},
        delivery: p.delivery ? { ...p.delivery } : {},
        didYouKnow: p.didYouKnow ? { ...p.didYouKnow } : {},
        stockQuantity: p.stockQuantity ?? (item.stock_quantity ? parseFloat(item.stock_quantity) : undefined),
        lowStockThreshold: p.lowStockThreshold,
        trackInventory: p.trackInventory !== false,
        brand: p.brand,
        gender: p.gender,
        details: p.details,
        washCare: p.washCare,
        shipping: p.shipping,
        clothingType: p.clothingType,
        material: p.material,
      } as any);
      NotificationManager.success('F & B item duplicated successfully');
    } catch (error: any) {
      console.error('Error duplicating item:', error);
      NotificationManager.error(error.message || 'Failed to duplicate item');
    }
  };

  const openEditModal = (item: FBItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowEditModal(true);
  };

  const handleSetFBNavActive = (isActive: boolean) => {
    NavigationVisibilityService.setSectionActive('fb', isActive);
    NotificationManager.success(`F&B navbar link ${isActive ? 'activated' : 'deactivated'}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'all':
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-sans font-normal">All F & B Items</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage all food and beverage items</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => handleSetFBNavActive(true)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      isFBNavActive
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    type="button"
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleSetFBNavActive(false)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      !isFBNavActive
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    type="button"
                  >
                    Deactivate
                  </button>
                </div>
                {/* Category filter tabs */}
                <div className="hidden md:flex items-center space-x-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'dry-fruits', label: 'Dry Fruits' },
                    { id: 'dried-fruits', label: 'Dried Fruits' },
                    { id: 'spices', label: 'Spices' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id as any)}
                      className={`px-2 py-1 text-xs rounded-full border ${
                        categoryFilter === cat.id
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('create')}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Item</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Items List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No items found</h3>
                <p className="text-sm text-gray-500 mb-3">Get started by creating your first F & B item</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Create Item
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(categoryFilter === 'all'
                      ? items
                      : items.filter((item) => item.category === categoryFilter)
                    ).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <img
                            src={item.main_image || item.images[0] || '/placeholder.png'}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-xs font-medium text-gray-900">{item.title}</div>
                          {item.brand && <div className="text-xs text-gray-500">{item.brand}</div>}
                        </td>
                        <td className="px-4 py-2">
                          <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                            {item.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-900">
                          {item.weight} {item.weight_unit}
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-xs font-medium text-gray-900">₹{item.price}</div>
                          {item.original_price && (
                            <div className="text-xs text-gray-500 line-through">₹{item.original_price}</div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-900">{item.stock_quantity}</td>
                        <td className="px-4 py-2">
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                            item.status === 'active' ? 'bg-green-100 text-green-800' :
                            item.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs font-medium">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="text-pink-600 hover:text-pink-900"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateItem(item)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => item.id && handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'create':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 font-sans font-normal">Create F & B Item</h2>
              <p className="text-gray-500 mt-1">Add a new food or beverage item</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500">Click the "Create Item" button in the "All Items" tab to add a new item</p>
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">F & B Categories</h2>
              <p className="text-gray-500 mt-1">
                Manage food and beverage categories used across F & B items. Click a category to see its items.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
              {[
                { id: 'dry-fruits', label: 'Dry Fruits', description: 'Standard dried nuts and fruits.' },
                { id: 'dried-fruits', label: 'Dried Fruits', description: 'Specialty dried fruits and mixes.' },
                { id: 'spices', label: 'Spices', description: 'Whole and ground spices.' },
              ].map((cat) => {
                const count = items.filter((item) => item.category === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setCategoryFilter(cat.id as any);
                      setActiveTab('all');
                    }}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{cat.label}</h3>
                      <p className="text-xs text-gray-500">{cat.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-600">
                        {count} item{count === 1 ? '' : 's'}
                      </span>
                      <button
                        className="px-2 py-1 text-xs rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        type="button"
                      >
                        View Items
                      </button>
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-400">
                Note: Categories are derived from each product&apos;s categories in the catalog. To change an item&apos;s
                category, edit the item in the &quot;All F & B Items&quot; tab.
              </p>
            </div>
          </div>
        );

      case 'featured':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Items</h2>
              <p className="text-gray-500 mt-1">Manage featured F & B items</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500">Featured items management will be implemented here</p>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <OrderManagement isFBOnly />
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">F & B Analytics</h2>
              <p className="text-gray-500 mt-1">View analytics and reports</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500">Analytics will be implemented here</p>
            </div>
          </div>
        );

      case 'trending':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Trending Items</h2>
              <p className="text-gray-500 mt-1">View trending F & B items</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500">Trending items will be implemented here</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 font-sans font-normal">F & B Settings</h2>
              <p className="text-gray-500 mt-1">Configure F & B settings</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500">Settings will be implemented here</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <p className="text-gray-500">Select a tab to get started</p>
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="flex h-screen">
        {/* Secondary Navigation */}
        <FBSecondaryNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          itemCounts={{
            total: items.length,
            featured: 0,
            trending: 0
          }}
        />

        {/* Main Content */}
        <div className="flex-1 ml-20 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 font-sans font-normal">
                  {showEditModal ? 'Edit F & B Item' : 'Create New F & B Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingItem(null);
                    resetForm();
                    setActiveTab('all');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Basic Information */}
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 font-sans font-normal">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      placeholder="e.g., Premium Almonds"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    >
                      <option value="dry-fruits">Dry Fruits</option>
                      <option value="dried-fruits">Dried Fruits</option>
                      <option value="spices">Spices</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    placeholder="Describe the product..."
                  />
                </div>
              </div>

              {/* Pricing & Weight */}
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 font-sans font-normal">Pricing & Weight</h3>
                
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Weight *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        placeholder="100"
                      />
                      <select
                        value={formData.weight_unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight_unit: e.target.value as 'g' | 'kg' }))}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 font-sans font-normal">Product Details</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      placeholder="Brand name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Origin/Country</label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      placeholder="e.g., India, California"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ingredients</label>
                  <textarea
                    value={formData.ingredients}
                    onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    placeholder="List ingredients (comma-separated)"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nutritional Information</label>
                  <textarea
                    value={formData.nutritional_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, nutritional_info: e.target.value }))}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    placeholder="Nutritional facts per 100g..."
                  />
                </div>
              </div>

              {/* Storage & Inventory */}
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 font-sans font-normal">Storage & Inventory</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Storage Instructions</label>
                  <textarea
                    value={formData.storage_instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, storage_instructions: e.target.value }))}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    placeholder="e.g., Store in a cool, dry place"
                  />
                </div>
              </div>

              {/* Images */}
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 font-sans font-normal">Images</h3>
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Product Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                  {formData.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img src={img} alt={`Image ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                          <button
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== idx);
                              setFormData(prev => ({ ...prev, images: newImages }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {idx === 0 && !formData.main_image && (
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, main_image: img }))}
                              className="absolute bottom-1 left-1 bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded"
                            >
                              Set Main
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Main Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    disabled={uploading}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                  {formData.main_image && (
                    <div className="mt-2">
                      <img src={formData.main_image} alt="Main" className="w-24 h-24 object-cover rounded" />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags & Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3 font-sans font-normal">Additional Information</h3>
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, tags }));
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    placeholder="organic, premium, gluten-free"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingItem(null);
                    resetForm();
                    setActiveTab('all');
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditModal ? handleUpdateItem : handleCreateItem}
                  disabled={uploading}
                  className="px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{showEditModal ? 'Update' : 'Create'} Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default FB;
