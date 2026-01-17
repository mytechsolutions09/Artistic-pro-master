import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import NormalSecondaryNav, { NORMAL_TABS } from '../../components/admin/NormalSecondaryNav';
import { NotificationManager } from '../../components/Notification';
import NormalItemsService, { NormalItem } from '../../services/normalItemsService';
import { ImageUploadService } from '../../services/imageUploadService';
import { ProductService } from '../../services/supabaseService';
import { 
  Plus, Edit2, Trash2, Eye, X, Upload, Image as ImageIcon,
  Save, Search, RefreshCw
} from 'lucide-react';

const Normal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [items, setItems] = useState<NormalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NormalItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    discount_percentage: '',
    status: 'active' as 'active' | 'inactive' | 'draft',
    images: [] as string[],
    main_image: '',
    tags: [] as string[],
    item_details: {} as Record<string, any>,
    delivery_info: {} as Record<string, any>,
    did_you_know: {} as Record<string, any>
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load items
  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await NormalItemsService.getAllItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading normal items:', error);
      NotificationManager.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Handle file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const tempId = `normal_${Date.now()}_${Math.random().toString(36).substring(2)}`;
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

  // Handle main image upload
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const tempId = `normal_main_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const url = await ProductService.uploadProductImage(file, tempId);
      setFormData(prev => ({ ...prev, main_image: url }));
      NotificationManager.success('Main image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading main image:', error);
      NotificationManager.error(error.message || 'Failed to upload main image');
    } finally {
      setUploading(false);
    }
  };

  // Create item
  const handleCreateItem = async () => {
    if (!formData.title.trim()) {
      NotificationManager.error('Title is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      NotificationManager.error('Valid price is required');
      return;
    }

    try {
      const slug = NormalItemsService.generateSlug(formData.title);
      
      const itemData: Omit<NormalItem, 'id' | 'created_at' | 'updated_at'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        original_price: formData.original_price ? parseInt(formData.original_price) : undefined,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : undefined,
        slug,
        status: formData.status,
        images: formData.images,
        main_image: formData.main_image || formData.images[0],
        tags: formData.tags,
        item_details: formData.item_details,
        delivery_info: formData.delivery_info,
        did_you_know: formData.did_you_know
      };

      const newItem = await NormalItemsService.createItem(itemData);
      if (newItem) {
        NotificationManager.success('Item created successfully');
        setShowCreateModal(false);
        resetForm();
        await loadItems();
      }
    } catch (error: any) {
      console.error('Error creating item:', error);
      NotificationManager.error(error.message || 'Failed to create item');
    }
  };

  // Update item
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
      const updateData: Partial<NormalItem> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        original_price: formData.original_price ? parseInt(formData.original_price) : undefined,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : undefined,
        status: formData.status,
        images: formData.images,
        main_image: formData.main_image || formData.images[0],
        tags: formData.tags,
        item_details: formData.item_details,
        delivery_info: formData.delivery_info,
        did_you_know: formData.did_you_know
      };

      const updatedItem = await NormalItemsService.updateItem(editingItem.id, updateData);
      if (updatedItem) {
        NotificationManager.success('Item updated successfully');
        setShowEditModal(false);
        setEditingItem(null);
        resetForm();
        await loadItems();
      }
    } catch (error: any) {
      console.error('Error updating item:', error);
      NotificationManager.error(error.message || 'Failed to update item');
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await NormalItemsService.deleteItem(id);
      NotificationManager.success('Item deleted successfully');
      await loadItems();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      NotificationManager.error(error.message || 'Failed to delete item');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      original_price: '',
      discount_percentage: '',
      status: 'active',
      images: [],
      main_image: '',
      tags: [],
      item_details: {},
      delivery_info: {},
      did_you_know: {}
    });
    setImageFiles([]);
    setMainImageFile(null);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (item: NormalItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      price: item.price.toString(),
      original_price: item.original_price?.toString() || '',
      discount_percentage: item.discount_percentage?.toString() || '',
      status: item.status,
      images: item.images || [],
      main_image: item.main_image || '',
      tags: item.tags || [],
      item_details: item.item_details || {},
      delivery_info: item.delivery_info || {},
      did_you_know: item.did_you_know || {}
    });
    setShowEditModal(true);
  };

  // Filter items
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    total: items.length,
    active: items.filter(i => i.status === 'active').length,
    inactive: items.filter(i => i.status === 'inactive').length,
    draft: items.filter(i => i.status === 'draft').length
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Total Items</h3>
                <p className="text-3xl font-bold text-pink-600">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Active Items</h3>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Inactive Items</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.inactive}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Draft Items</h3>
                <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Normal Items</h2>
                  <button
                    onClick={openCreateModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Items Table */}
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No items found. Click "Add Item" to create your first item.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={item.main_image || item.images[0] || '/placeholder.png'}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">{item.slug}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₹{item.price}</div>
                            {item.original_price && item.discount_percentage && (
                              <div className="text-xs text-gray-500 line-through">₹{item.original_price}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.status === 'active' ? 'bg-green-100 text-green-800' :
                              item.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <a
                                href={`/normal/${item.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => openEditModal(item)}
                                className="text-pink-600 hover:text-pink-900"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </div>
        );
      
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {NORMAL_TABS.find(tab => tab.id === activeTab)?.label || 'Page'}
            </h2>
            <p className="text-gray-600">
              {NORMAL_TABS.find(tab => tab.id === activeTab)?.description || 'Content coming soon.'}
            </p>
          </div>
        );
    }
  };

  return (
    <AdminLayout title="Normal" noHeader>
      <div className="flex h-[calc(100vh-2rem)]">
        {/* Sub Left Sidebar */}
        <NormalSecondaryNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 ml-20 overflow-y-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {NORMAL_TABS.find(tab => tab.id === activeTab)?.label || 'Normal'}
              </h1>
              <p className="text-gray-600 mt-1">
                {NORMAL_TABS.find(tab => tab.id === activeTab)?.description || ''}
              </p>
            </div>
            
            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {showEditModal ? 'Edit Item' : 'Create New Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter item title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter item description"
                />
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'draft' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                {formData.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} alt={`Image ${idx + 1}`} className="w-full h-24 object-cover rounded" />
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
                            className="absolute bottom-1 left-1 bg-pink-500 text-white text-xs px-2 py-1 rounded"
                          >
                            Set Main
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                {formData.main_image && (
                  <div className="mt-2">
                    <img src={formData.main_image} alt="Main" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    setFormData(prev => ({ ...prev, tags }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditModal ? handleUpdateItem : handleCreateItem}
                  disabled={uploading}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

export default Normal;
