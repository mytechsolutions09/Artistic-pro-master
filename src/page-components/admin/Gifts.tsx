'use client'

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Gift, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { ProductService } from '../../services/supabaseService';
import { ImageUploadService } from '../../services/imageUploadService';
import { NotificationManager } from '../../components/Notification';
import { Product } from '../../types';
import { useCurrency } from '../../contexts/CurrencyContext';
import GiftsSecondaryNav from '../../components/admin/GiftsSecondaryNav';

type GiftStatus = 'active' | 'inactive' | 'draft';

const defaultPosterPricing: Record<string, number> = {
  A4: 25,
  A3: 35,
  A2: 45,
  A1: 65,
  A0: 85,
  '12x18': 30,
  '16x20': 40,
  '18x24': 50,
  '24x36': 70,
  '11x14': 28,
  '8x10': 20,
  '5x7': 12,
  A5: 15
};

const Gifts: React.FC = () => {
  const { formatAdminPrice } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [gifts, setGifts] = useState<Product[]>([]);

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'create' | 'amazon'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [amazonCountry, setAmazonCountry] = useState('India');
  const [amazonCategory, setAmazonCategory] = useState('Home Decor');
  const [amazonCount, setAmazonCount] = useState(5);
  const [amazonPrice, setAmazonPrice] = useState('999');

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    price: string;
    originalPrice: string;
    discountPercentage: number;
    status: GiftStatus;
    featured: boolean;
    tagsInput: string;
    imageFiles: File[];
    mainImageFile: File | null;
  }>({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    discountPercentage: 0,
    status: 'active',
    featured: false,
    tagsInput: '',
    imageFiles: [],
    mainImageFile: null
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      discountPercentage: 0,
      status: 'active',
      featured: false,
      tagsInput: '',
      imageFiles: [],
      mainImageFile: null
    });
  };

  const isGiftProduct = (p: Product) => {
    const categories = Array.isArray(p.categories) ? p.categories : [];
    const fromCategories = categories.some((c) => (c || '').toLowerCase() === 'gifts');
    const legacyCategory = (p as any)?.category?.toLowerCase?.() === 'gifts';
    return fromCategories || legacyCategory;
  };

  const loadGifts = async () => {
    setLoading(true);
    try {
      const all = await ProductService.getAllProducts();
      setGifts(all.filter(isGiftProduct));
    } catch (error) {
      console.error('Error loading gifts:', error);
      // NotificationContainer seems not wired in many admin pages; also keep alert fallback.
      NotificationManager?.error?.('Failed to load gifts');
      alert('Failed to load gifts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsedTags = useMemo(() => {
    const tags = formData.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    return Array.from(new Set(tags));
  }, [formData.tagsInput]);

  const canSubmit = formData.title.trim().length > 0 && Number(formData.price) > 0;

  const handleCreateGift = async () => {
    if (!canSubmit) {
      alert('Title and valid price are required');
      return;
    }

    setUploading(true);
    try {
      const title = formData.title.trim();
      const description = formData.description.trim();
      const price = Number(formData.price);
      const originalPrice =
        formData.originalPrice.trim().length > 0 ? Number(formData.originalPrice) : undefined;
      const discountPercentage = Number(formData.discountPercentage || 0);

      const imageOnlyFiles = formData.imageFiles.filter(
        (f) => f && f.type && f.type.startsWith('image/')
      );

      // 1) Create the product row first to get an id for storage uploads
      const newProduct = await ProductService.createProduct({
        title,
        description,
        price,
        originalPrice,
        discountPercentage,
        categories: ['Gifts'],
        tags: parsedTags,
        status: formData.status,
        featured: formData.featured,
        productType: 'digital',
        posterSize: 'A4',
        posterPricing: {
          ...defaultPosterPricing,
          A4: price
        },
        images: [],
        main_image: null as any,
        itemDetails: {},
        delivery: {},
        didYouKnow: {}
      });

      if (!newProduct?.id) {
        throw new Error('Failed to create gift product');
      }

      // 2) Upload gallery images
      let uploadedImages: string[] = [];
      if (imageOnlyFiles.length > 0) {
        uploadedImages = await ProductService.uploadProductImages(imageOnlyFiles, newProduct.id);
      }

      // 3) Upload main image (optional); otherwise fall back to first gallery image
      let mainImageUrl = uploadedImages[0] || '';
      if (formData.mainImageFile) {
        const mainImageResult = await ImageUploadService.uploadMainImage(
          formData.mainImageFile,
          newProduct.id
        );
        if (mainImageResult.success && mainImageResult.url) {
          mainImageUrl = mainImageResult.url;
        }
      }

      // 4) Update product with uploaded file URLs
      await ProductService.updateProduct(newProduct.id, {
        images: uploadedImages,
        main_image: mainImageUrl
      });

      setShowCreateModal(false);
      setActiveSubTab('all');
      resetForm();
      await loadGifts();
      NotificationManager?.success?.('Gift added successfully');
      alert('Gift added successfully');
    } catch (error: any) {
      console.error('Error creating gift:', error);
      NotificationManager?.error?.(error?.message || 'Failed to add gift');
      alert(error?.message || 'Failed to add gift');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGift = async (id: string) => {
    const ok = window.confirm('Delete this gift product?');
    if (!ok) return;
    try {
      await ProductService.deleteProduct(id);
      await loadGifts();
      NotificationManager?.success?.('Gift deleted');
      alert('Gift deleted');
    } catch (error) {
      console.error('Error deleting gift:', error);
      NotificationManager?.error?.('Failed to delete gift');
      alert('Failed to delete gift');
    }
  };

  const handleSubTabChange = (tabId: string) => {
    if (tabId === 'create') {
      setActiveSubTab('create');
      resetForm();
      setShowCreateModal(true);
      return;
    }
    if (tabId === 'amazon') {
      setActiveSubTab('amazon');
      setShowCreateModal(false);
      return;
    }
    setActiveSubTab('all');
  };

  const handleAmazonImport = async () => {
    const count = Math.max(1, Math.floor(Number(amazonCount)));
    const price = Number(amazonPrice);
    if (!amazonCountry.trim() || !amazonCategory.trim()) {
      alert('Amazon country and category are required');
      return;
    }
    if (!price || price <= 0) {
      alert('Valid price is required');
      return;
    }
    if (count > 50) {
      alert('Please import 50 products or fewer at a time');
      return;
    }

    setUploading(true);
    try {
      // NOTE: No live Amazon integration exists in this repo yet.
      // This creates placeholder gift products using the existing product service.
      const batchId = Date.now().toString();
      for (let i = 0; i < count; i++) {
        const title = `Amazon Gift - ${amazonCategory.trim()} (${amazonCountry.trim()}) #${i + 1} - ${batchId}`;
        const description = `Imported from Amazon (${amazonCountry.trim()}) in category: ${amazonCategory.trim()}. (Placeholder entry)`;

        await ProductService.createProduct({
          title,
          description,
          price,
          originalPrice: undefined,
          discountPercentage: 0,
          categories: ['Gifts'],
          tags: [amazonCategory.trim(), amazonCountry.trim(), 'amazon-import'],
          status: 'active',
          featured: false,
          productType: 'digital',
          posterSize: 'A4',
          posterPricing: {
            ...defaultPosterPricing,
            A4: price
          },
          images: [],
          main_image: null as any,
          itemDetails: {},
          delivery: {},
          didYouKnow: {}
        });
      }

      await loadGifts();
      setActiveSubTab('all');
      NotificationManager?.success?.(`Imported ${count} products into Gifts`);
      alert(`Imported ${count} products into Gifts`);
    } catch (error: any) {
      console.error('Error importing from Amazon:', error);
      NotificationManager?.error?.(error?.message || 'Failed to import from Amazon');
      alert(error?.message || 'Failed to import from Amazon');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout title="Gifts" noHeader={true}>
      <div className="flex-1 flex flex-col overflow-hidden ml-24">
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <div className="p-2 bg-black text-white rounded-lg">
              <Gift className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900">Gifts</h2>
              <p className="mt-1 text-[11px] text-gray-600">Create and manage gift products.</p>
            </div>
          </div>

          {activeSubTab === 'amazon' && (
            <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Amazon Import</div>
                  <div className="text-[11px] text-gray-600">Country, category, and number of products</div>
                </div>
                <div className="text-[11px] text-gray-500">
                  {uploading ? 'Importing...' : 'Placeholder importer'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-gray-600">Country</label>
                  <input
                    value={amazonCountry}
                    onChange={(e) => setAmazonCountry(e.target.value)}
                    className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-gray-600">Category</label>
                  <input
                    value={amazonCategory}
                    onChange={(e) => setAmazonCategory(e.target.value)}
                    className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-gray-600">Count *</label>
                  <input
                    type="number"
                    value={amazonCount}
                    onChange={(e) => setAmazonCount(e.target.value as any)}
                    min={1}
                    max={50}
                    className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-gray-600">Price (INR) *</label>
                  <input
                    type="number"
                    value={amazonPrice}
                    onChange={(e) => setAmazonPrice(e.target.value)}
                    min={1}
                    className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-black/20 bg-white px-3 text-sm font-medium text-black hover:bg-black/5 disabled:opacity-50"
                  disabled={uploading}
                  onClick={() => setActiveSubTab('all')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-black px-3 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
                  disabled={uploading}
                  onClick={handleAmazonImport}
                >
                  {uploading ? 'Importing...' : `Import ${amazonCount || 0} Gifts`}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-gray-500">Loading gifts...</span>
            </div>
          ) : gifts.length === 0 ? (
            <div className="rounded-lg border border-black/10 bg-white p-8 text-center">
              <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <div className="text-sm font-medium text-gray-900">No gifts found</div>
              <div className="mt-1 text-[11px] text-gray-500">Add one to get started.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {gifts.map((gift) => {
                const img =
                  gift.main_image || (gift.images && gift.images.length > 0 ? gift.images[0] : '');
                const status = gift.status;
                const badgeCls =
                  status === 'active'
                    ? 'bg-black text-white border border-black'
                    : 'bg-white text-black border border-black';

                return (
                  <div key={gift.id} className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="h-28 w-full rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img} alt={gift.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          <div className="mt-3">
                            <div className="text-sm font-semibold text-gray-900 truncate">{gift.title}</div>
                            <div className="mt-1 text-xs text-gray-600 line-clamp-2">{gift.description || ''}</div>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatAdminPrice(gift.price, undefined)}
                              </div>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeCls}`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteGift(gift.id)}
                          className="p-2 rounded-lg border border-black text-black hover:bg-black hover:text-white transition-colors"
                          title="Delete"
                          disabled={uploading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
              <div className="w-full max-w-2xl overflow-y-auto rounded-lg border border-black/10 bg-white shadow-lg">
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 p-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Add Gift Product</div>
                    <div className="text-[11px] text-gray-500">Category is fixed to `Gifts`</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setActiveSubTab('all');
                    }}
                    className="rounded p-1 text-gray-400 hover:bg-black/5 hover:text-black"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <label className="block mb-1 text-[11px] font-medium text-gray-600">Title *</label>
                    <input
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Gift product title"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] font-medium text-gray-600">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Short description for the product"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-gray-600">Price * (INR)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                        className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-gray-600">Original (INR)</label>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData((p) => ({ ...p, originalPrice: e.target.value }))}
                        className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-gray-600">Discount %</label>
                      <input
                        type="number"
                        value={formData.discountPercentage}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, discountPercentage: Number(e.target.value) }))
                        }
                        className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        placeholder="0"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-gray-600">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as GiftStatus }))}
                        className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-gray-600">Featured</label>
                      <select
                        value={formData.featured ? 'yes' : 'no'}
                        onChange={(e) => setFormData((p) => ({ ...p, featured: e.target.value === 'yes' }))}
                        className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] font-medium text-gray-600">
                        Tags (comma-separated)
                      </label>
                      <input
                        value={formData.tagsInput}
                        onChange={(e) => setFormData((p) => ({ ...p, tagsInput: e.target.value }))}
                        className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        placeholder="tag1, tag2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-medium text-gray-600">Gallery images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = e.target.files ? Array.from(e.target.files) : [];
                        setFormData((p) => ({ ...p, imageFiles: files }));
                      }}
                      disabled={uploading}
                      className="w-full text-sm text-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-medium text-gray-600">Main image (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setFormData((p) => ({ ...p, mainImageFile: file }));
                      }}
                      disabled={uploading}
                      className="w-full text-sm text-gray-600"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setActiveSubTab('all');
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-black bg-white px-3 text-sm font-medium text-black hover:bg-black/5 disabled:opacity-50"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateGift}
                      disabled={!canSubmit || uploading}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-black px-3 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
                    >
                      {uploading ? 'Adding...' : 'Add Gift'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <GiftsSecondaryNav activeTab={activeSubTab} onTabChange={handleSubTabChange} />
      </div>
    </AdminLayout>
  );
};

export default Gifts;

