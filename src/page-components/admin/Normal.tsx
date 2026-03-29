'use client'

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import NormalSecondaryNav, { NORMAL_TABS } from '../../components/admin/NormalSecondaryNav';
import { NotificationManager } from '../../components/Notification';
import NormalItemsService, { NormalItem } from '../../services/normalItemsService';
import { ProductService } from '../../services/supabaseService';
import { generateSlug } from '../../utils/slugUtils';
import { Plus, Edit2, Trash2, Eye, X, Save, Search } from 'lucide-react';

const inputCls =
  'h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
const textareaCls =
  'w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
const labelCls = 'mb-1 block text-[11px] font-medium text-gray-600';
const cardCls = 'rounded-lg border border-gray-200 bg-white shadow-sm';
const btnPrimary =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50';
const btnOutline =
  'inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50';
const iconBtn = 'rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900';

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
      // Regenerate slug if title changed
      const newSlug = formData.title.trim() !== editingItem.title 
        ? NormalItemsService.generateSlug(formData.title.trim())
        : editingItem.slug;

      const updateData: Partial<NormalItem> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseInt(formData.price),
        original_price: formData.original_price ? parseInt(formData.original_price) : undefined,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : undefined,
        status: formData.status,
        slug: newSlug,
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
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { k: 'Total', v: stats.total, hint: 'all' },
                { k: 'Active', v: stats.active, hint: 'live' },
                { k: 'Inactive', v: stats.inactive, hint: 'off' },
                { k: 'Draft', v: stats.draft, hint: 'wip' },
              ].map(({ k, v, hint }) => (
                <div
                  key={k}
                  className="inline-flex min-w-[5.5rem] flex-1 items-baseline gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 sm:min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-gray-500">{k}</div>
                    <div className="text-sm font-semibold tabular-nums text-gray-900">{v}</div>
                    <div className="text-[10px] text-gray-400">{hint}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={cardCls}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
                <h2 className="text-xs font-semibold text-gray-900">Normal items</h2>
                <button type="button" onClick={openCreateModal} className={btnPrimary}>
                  <Plus className="h-3.5 w-3.5" />
                  Add item
                </button>
              </div>

              <div className="border-b border-gray-100 px-3 py-2">
                <div className="relative max-w-md">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
                  <span className="text-[11px] text-gray-500">Loading items…</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="px-3 py-8 text-center text-[11px] text-gray-500">No items match. Add one to get started.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                          Img
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                          Title
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                          Price
                        </th>
                        <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                          Status
                        </th>
                        <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/80">
                          <td className="whitespace-nowrap px-3 py-2">
                            <img
                              src={item.main_image || item.images[0] || '/placeholder.png'}
                              alt={item.title || 'Item image'}
                              className="h-10 w-10 rounded border border-gray-100 object-cover"
                            />
                          </td>
                          <td className="max-w-[200px] px-3 py-2">
                            <div className="truncate text-xs font-medium text-gray-900">{item.title}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2">
                            <div className="text-xs font-medium tabular-nums text-gray-900">₹{item.price}</div>
                            {item.original_price != null && item.discount_percentage != null && (
                              <div className="text-[10px] text-gray-400 line-through">₹{item.original_price}</div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                item.status === 'active'
                                  ? 'bg-green-50 text-green-800'
                                  : item.status === 'inactive'
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right">
                            <div className="inline-flex items-center gap-0.5">
                              <a
                                href={`/${generateSlug(item.title)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={iconBtn}
                                title={`View ${item.title}`}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </a>
                              <button type="button" onClick={() => openEditModal(item)} className={iconBtn} title="Edit">
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                className={`${iconBtn} hover:text-red-700`}
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
          <div className={`${cardCls} p-3`}>
            <h2 className="text-xs font-semibold text-gray-900">
              {NORMAL_TABS.find((tab) => tab.id === activeTab)?.label || 'Page'}
            </h2>
            <p className="mt-1 text-[11px] text-gray-600">
              {NORMAL_TABS.find((tab) => tab.id === activeTab)?.description || 'Content coming soon.'}
            </p>
          </div>
        );
    }
  };

  return (
    <AdminLayout title="Normal" noHeader>
      <div className="flex w-full">
        <NormalSecondaryNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="min-w-0 flex-1 pl-[4.25rem]">
          <div className="space-y-3 px-3 py-4 sm:px-5">
            <div className={`${cardCls} p-3`}>
              <h1 className="text-base font-semibold text-gray-900">
                {NORMAL_TABS.find((tab) => tab.id === activeTab)?.label || 'Normal'}
              </h1>
              <p className="mt-0.5 text-[11px] text-gray-500">
                {NORMAL_TABS.find((tab) => tab.id === activeTab)?.description || ''}
              </p>
            </div>

            {renderTabContent()}
          </div>
        </div>
      </div>

      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
          <div
            className={`${cardCls} max-h-[90vh] w-full max-w-3xl overflow-y-auto`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
              <h2 className="text-sm font-semibold text-gray-900">
                {showEditModal ? 'Edit item' : 'New item'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-3">
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className={inputCls}
                  placeholder="Title"
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={textareaCls}
                  placeholder="Description"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    className={inputCls}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={labelCls}>Original (₹)</label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, original_price: e.target.value }))}
                    className={inputCls}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={labelCls}>Discount %</label>
                  <input
                    type="number"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount_percentage: e.target.value }))}
                    className={inputCls}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as 'active' | 'inactive' | 'draft',
                    }))
                  }
                  className={inputCls}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Gallery images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className={`${inputCls} py-1.5 file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-0.5 file:text-[10px]`}
                />
                {formData.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`Gallery image ${idx + 1}${formData.title ? ` for ${formData.title}` : ''}`}
                          className="h-16 w-full rounded border border-gray-100 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== idx);
                            setFormData((prev) => ({ ...prev, images: newImages }));
                          }}
                          className="absolute right-0.5 top-0.5 rounded bg-gray-900/80 p-0.5 text-white hover:bg-gray-900"
                          aria-label="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {idx === 0 && !formData.main_image && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, main_image: img }))}
                            className="absolute bottom-0.5 left-0.5 rounded bg-gray-900 px-1 py-0.5 text-[9px] text-white"
                          >
                            Main
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Main image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  disabled={uploading}
                  className={`${inputCls} py-1.5 file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-0.5 file:text-[10px]`}
                />
                {formData.main_image && (
                  <div className="mt-2">
                    <img
                      src={formData.main_image}
                      alt={`Main image${formData.title ? ` for ${formData.title}` : ''}`}
                      className="h-24 w-24 rounded border border-gray-100 object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);
                    setFormData((prev) => ({ ...prev, tags }));
                  }}
                  className={inputCls}
                  placeholder="tag1, tag2"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className={btnOutline}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={showEditModal ? handleUpdateItem : handleCreateItem}
                  disabled={uploading}
                  className={btnPrimary}
                >
                  <Save className="h-3.5 w-3.5" />
                  {showEditModal ? 'Update' : 'Create'}
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




