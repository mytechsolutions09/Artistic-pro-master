import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, Filter, Search, Grid, List, Star, 
  Download, TrendingUp, Package, DollarSign, X,
  Upload, AlertCircle,
  SortAsc, SortDesc, CheckSquare, Image as ImageIcon, Info,
  MessageSquare, BarChart3, Settings, Minus, Edit3, Check, Copy, RefreshCw
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ProductService } from '../../services/supabaseService';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ProductModalProps {
  title: string;
  product?: any;
  categories: any[];
  onSubmit: (product: any) => void;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ title, product, categories, onSubmit, onClose }) => {
  const { currentCurrency, formatAdminPrice, getCurrency, convertAmount } = useCurrency();
  
  // Generate default poster prices in current currency
  const getDefaultPosterPricing = () => {
    const usdPrices = {
      'A4': 25,
      'A3': 35,
      'A2': 45,
      'A1': 65,
      'A0': 85,
      '12x18': 30,
      '16x20': 40,
      '18x24': 50,
      '24x36': 70
    };
    
    const convertedPrices: Record<string, number> = {};
    Object.entries(usdPrices).forEach(([size, usdPrice]) => {
      convertedPrices[size] = Math.round(convertAmount(usdPrice, 'USD', currentCurrency));
    });
    
    return convertedPrices;
  };

  // Convert existing prices to new currency (if currency changes)
  const convertPricesToCurrency = (prices: Record<string, number>, fromCurrency: string, toCurrency: string) => {
    const convertedPrices: Record<string, number> = {};
    Object.entries(prices).forEach(([size, price]) => {
      convertedPrices[size] = Math.round(convertAmount(price, fromCurrency, toCurrency));
    });
    return convertedPrices;
  };
  
  // Available poster sizes with their labels
  const availablePosterSizes = {
    'A4': 'A4 (21 × 29.7 cm)',
    'A3': 'A3 (29.7 × 42 cm)', 
    'A2': 'A2 (42 × 59.4 cm)',
    'A1': 'A1 (59.4 × 84.1 cm)',
    'A0': 'A0 (84.1 × 118.9 cm)',
    '12x18': '12" × 18" (30.5 × 45.7 cm)',
    '16x20': '16" × 20" (40.6 × 50.8 cm)',
    '18x24': '18" × 24" (45.7 × 61 cm)',
    '24x36': '24" × 36" (61 × 91.4 cm)',
    '11x14': '11" × 14" (28 × 35.6 cm)',
    '8x10': '8" × 10" (20.3 × 25.4 cm)',
    '5x7': '5" × 7" (12.7 × 17.8 cm)',
    'A5': 'A5 (14.8 × 21 cm)'
  };
  
  // Add a new poster size
  const addPosterSize = (size: string) => {
    if (!formData.posterPricing[size]) {
      const defaultPrice = Math.round(convertAmount(25, 'USD', currentCurrency)); // Default to converted $25
      setFormData({
        ...formData,
        posterPricing: {
          ...formData.posterPricing,
          [size]: defaultPrice
        },
        originalPosterPricing: {
          ...formData.originalPosterPricing,
          [size]: defaultPrice
        }
      });
    }
  };
  
  // Remove a poster size
  const removePosterSize = (size: string) => {
    const { [size]: removed, ...remainingPricing } = formData.posterPricing;
    const { [size]: removedOriginal, ...remainingOriginalPricing } = formData.originalPosterPricing;
    setFormData({
      ...formData,
      posterPricing: remainingPricing,
      originalPosterPricing: remainingOriginalPricing,
      // If removing the default size, set to the first available size
      posterSize: formData.posterSize === size ? Object.keys(remainingPricing)[0] || 'A4' : formData.posterSize
    });
  };
  
  const [editingSizeId, setEditingSizeId] = useState<string | null>(null);
  const [editingSizeName, setEditingSizeName] = useState<string>('');

  // Start editing a size name
  const startEditingSize = (sizeId: string) => {
    const currentLabel = availablePosterSizes[sizeId] || sizeId;
    setEditingSizeId(sizeId);
    setEditingSizeName(currentLabel);
  };

  // Save edited size name
  const saveEditedSize = () => {
    if (!editingSizeId || !editingSizeName.trim()) return;

    // Create new size ID from the name (remove special characters and spaces)
    const newSizeId = editingSizeName.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || editingSizeId;
    
    // If the size ID changed, we need to update the pricing object
    if (newSizeId !== editingSizeId) {
      const oldPrice = formData.posterPricing[editingSizeId];
      const oldOriginalPrice = formData.originalPosterPricing[editingSizeId];
      const { [editingSizeId]: removed, ...otherPricing } = formData.posterPricing;
      const { [editingSizeId]: removedOriginal, ...otherOriginalPricing } = formData.originalPosterPricing;
      
      setFormData({
        ...formData,
        posterPricing: {
          ...otherPricing,
          [newSizeId]: oldPrice
        },
        originalPosterPricing: {
          ...otherOriginalPricing,
          [newSizeId]: oldOriginalPrice
        },
        posterSize: formData.posterSize === editingSizeId ? newSizeId : formData.posterSize
      });
    }

    // Update the available sizes with the new label
    availablePosterSizes[newSizeId] = editingSizeName.trim();
    
    setEditingSizeId(null);
    setEditingSizeName('');
  };

  // Cancel editing size name
  const cancelEditingSize = () => {
    setEditingSizeId(null);
    setEditingSizeName('');
  };

  const [formData, setFormData] = useState<{
    title: string;
    price: string | number;
    originalPrice: string | number;
    discountPercentage: string | number;
    categories: string[];
    description: string;
    tags: string;
    status: 'active' | 'inactive' | 'draft';
    featured: boolean;
    productType: 'digital' | 'poster';
    posterSize: string;
    posterPricing: Record<string, number>;
    originalPosterPricing: Record<string, number>;
    images: string[]; // Changed from single image to array of images
    itemDetails: {
      material: string;
      size: string;
      frame: string;
      style: string;
      origin: string;
    };
    delivery: {
      standardDelivery: string;
      expressDelivery: string;
      sameDayDelivery: string;
      additionalInfo: string;
    };
    didYouKnow: {
      artistStory: string;
      ecoFriendly: string;
      uniqueFeatures: string;
    };
  }>({
    title: product?.title || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || product?.price || '',
    discountPercentage: product?.discountPercentage || 0,
    categories: product?.categories || [],
    description: product?.description || '',
    tags: product?.tags?.join(', ') || '',
    status: (product?.status as 'active' | 'inactive' | 'draft') || 'active',
    featured: product?.featured || false,
    productType: product?.productType || 'digital',
    posterSize: product?.posterSize || 'A4',
    posterPricing: product?.posterPricing || {},
    originalPosterPricing: product?.posterPricing || {},
    images: product?.images || [], // Changed from single image to array of images
    itemDetails: product?.itemDetails || (product?.productType === 'poster' ? {
      material: 'Premium matte paper',
      size: 'A4 (21cm x 29.7cm)',
      frame: 'No frame included',
      style: 'High-quality print',
      origin: 'Printed in India'
    } : {
      material: 'Digital file',
      size: 'High resolution (300 DPI), 3000px X 4500px',
      frame: 'No frame needed',
      style: 'Digital artwork',
      origin: 'Created digitally'
    }),
    delivery: product?.delivery || (product?.productType === 'poster' ? {
      standardDelivery: 'Free Standard Delivery\n5-7 business days',
      expressDelivery: 'Express Delivery\n2-3 business days • ₹150',
      sameDayDelivery: 'Same Day Delivery\nAvailable in select cities • ₹300',
      additionalInfo: '📦 All orders include tracking and insurance. Returns accepted within 30 days.'
    } : {
      standardDelivery: 'Instant Digital Download\nAvailable immediately after purchase',
      expressDelivery: 'Email Delivery\nPDF and high-res image sent to your email',
      sameDayDelivery: 'Dashboard Access\nDownload from your user dashboard',
      additionalInfo: '📱 Digital files are available for download immediately. No shipping required.'
    }),
    didYouKnow: product?.didYouKnow || (product?.productType === 'poster' ? {
      artistStory: 'This piece was inspired by the artist\'s journey through the Himalayas, capturing the first light of dawn breaking over snow-capped peaks.',
      ecoFriendly: 'Made with sustainable materials and eco-friendly paints. Each piece helps support local artisan communities.',
      uniqueFeatures: 'Every artwork is one-of-a-kind with subtle variations that make it truly unique. Perfect for art collectors and interior designers.'
    } : {
      artistStory: 'This digital artwork was created using advanced digital techniques, inspired by the artist\'s vision of modern digital art.',
      ecoFriendly: 'Digital format means zero environmental impact. No printing, shipping, or physical materials required.',
      uniqueFeatures: 'High-resolution digital file perfect for printing at any size. Compatible with all modern devices and printing services.'
    })
  });

  // Initialize poster pricing when component mounts or currency changes
  useEffect(() => {
    if (!product?.posterPricing && formData.productType === 'poster') {
      const defaultPricing = getDefaultPosterPricing();
      setFormData(prev => ({
        ...prev,
        posterPricing: defaultPricing,
        originalPosterPricing: defaultPricing
      }));
    }
  }, [currentCurrency, product?.posterPricing, formData.productType]);

  // Update content based on product type
  useEffect(() => {
    if (formData.productType === 'poster') {
      setFormData(prev => ({
        ...prev,
        itemDetails: {
          material: 'Premium matte paper',
          size: 'A4 (21cm x 29.7cm)',
          frame: 'No frame included',
          style: 'High-quality print',
          origin: 'Printed in India'
        },
        delivery: {
      standardDelivery: 'Free Standard Delivery\n5-7 business days',
      expressDelivery: 'Express Delivery\n2-3 business days • ₹150',
      sameDayDelivery: 'Same Day Delivery\nAvailable in select cities • ₹300',
      additionalInfo: '📦 All orders include tracking and insurance. Returns accepted within 30 days.'
    },
        didYouKnow: {
      artistStory: 'This piece was inspired by the artist\'s journey through the Himalayas, capturing the first light of dawn breaking over snow-capped peaks.',
      ecoFriendly: 'Made with sustainable materials and eco-friendly paints. Each piece helps support local artisan communities.',
      uniqueFeatures: 'Every artwork is one-of-a-kind with subtle variations that make it truly unique. Perfect for art collectors and interior designers.'
    }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        itemDetails: {
          material: 'Digital file',
          size: 'High resolution (300 DPI), 3000px X 4500px',
          frame: 'No frame needed',
          style: 'Digital artwork',
          origin: 'Created digitally'
        },
        delivery: {
          standardDelivery: 'Instant Digital Download\nAvailable immediately after purchase',
          expressDelivery: 'Email Delivery\nPDF and high-res image sent to your email',
          sameDayDelivery: 'Dashboard Access\nDownload from your user dashboard',
          additionalInfo: '📱 Digital files are available for download immediately. No shipping required.'
        },
        didYouKnow: {
          artistStory: 'This digital artwork was created using advanced digital techniques, inspired by the artist\'s vision of modern digital art.',
          ecoFriendly: 'Digital format means zero environmental impact. No printing, shipping, or physical materials required.',
          uniqueFeatures: 'High-resolution digital file perfect for printing at any size. Compatible with all modern devices and printing services.'
        }
      }));
    }
  }, [formData.productType]);

  const [imagePreview, setImagePreview] = useState<string[]>(product?.images || []); // Changed to array
  const [isUploading, setIsUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Store actual File objects

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsUploading(true);
      const urls: string[] = [];
      const newFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);
        urls.push(url);
        newFiles.push(file);
      }
      
      setImagePreview([...imagePreview, ...urls]);
      setFormData({ ...formData, images: [...formData.images, ...urls] });
      setImageFiles([...imageFiles, ...newFiles]);
      
      // Simulate upload delay
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    const newPreviews = [...imagePreview];
    const newFiles = [...imageFiles];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    
    setFormData({ ...formData, images: newImages });
    setImagePreview(newPreviews);
    setImageFiles(newFiles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Product title is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price.toString()) <= 0) {
      alert('Valid price is required');
      return;
    }
    if (formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    if (!formData.productType) {
      alert('Product type is required');
      return;
    }
    if (formData.productType === 'poster' && !formData.posterSize) {
      alert('Poster size is required for poster products');
      return;
    }
    
    const productData = {
      ...formData,
      id: product?.id, // Include the product ID when editing
      price: parseFloat(formData.price.toString()),
      tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      images: formData.images, // Use images array
      imageFiles: imageFiles, // Pass actual File objects for upload
      productType: formData.productType,
      posterSize: formData.productType === 'poster' ? formData.posterSize : undefined,
      posterPricing: formData.productType === 'poster' ? formData.posterPricing : undefined,
      itemDetails: formData.itemDetails,
      delivery: formData.delivery,
      didYouKnow: formData.didYouKnow
    };
    
    onSubmit(productData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Enter product title"
                  required
                />
              </div>



              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ({getCurrency(currentCurrency)?.symbol || '$'}) *</label>
                                      <p className="text-xs text-gray-500 mb-1">Enter price in {currentCurrency}</p>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="0.00"
                    required
                  />
                  {formData.price && parseFloat(formData.price.toString()) > 0 && (
                    <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Preview in {currentCurrency}:</strong> {formatAdminPrice(parseFloat(formData.price.toString()))}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'draft' })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Discount Fields */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="hasDiscount"
                  checked={Boolean(formData.originalPrice && parseFloat(formData.originalPrice.toString()) > parseFloat(formData.price.toString()))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ 
                        ...formData, 
                        originalPrice: formData.price,
                        discountPercentage: 0 
                      });
                    } else {
                      setFormData({ 
                        ...formData, 
                        originalPrice: formData.price,
                        discountPercentage: 0 
                      });
                    }
                  }}
                  className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="hasDiscount" className="ml-2 text-sm font-medium text-gray-700">
                  Enable Discount
                </label>
              </div>
              
              {formData.originalPrice && formData.originalPrice > formData.price && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ({getCurrency(currentCurrency)?.symbol || '$'})</label>
                    <p className="text-xs text-gray-500 mb-1">Enter in {currentCurrency}</p>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discountPercentage}
                      onChange={(e) => {
                        const discount = parseFloat(e.target.value) || 0;
                        const original = parseFloat(formData.originalPrice.toString()) || parseFloat(formData.price.toString());
                        const discountedPrice = original * (1 - discount / 100);
                        
                        // Apply discount to all poster sizes using original prices
                        let updatedPosterPricing = { ...formData.posterPricing };
                        if (formData.productType === 'poster' && Object.keys(formData.originalPosterPricing).length > 0) {
                          Object.keys(formData.originalPosterPricing).forEach(size => {
                            const originalPosterPrice = formData.originalPosterPricing[size];
                            updatedPosterPricing[size] = Math.round(originalPosterPrice * (1 - discount / 100));
                          });
                        }
                        
                        setFormData({ 
                          ...formData, 
                          discountPercentage: discount,
                          price: discountedPrice.toFixed(2),
                          posterPricing: updatedPosterPricing
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span>Categories *</span>
                  <span className="text-xs text-gray-500 font-normal">
                    {formData.categories.length} of {categories.length} selected
                  </span>
                </label>
                <div className="w-full border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {categories.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No categories available
                    </div>
                  ) : (
                    categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                categories: [...formData.categories, category.name]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                categories: formData.categories.filter(c => c !== category.name)
                              });
                            }
                          }}
                          className="mr-3 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                      </label>
                    ))
                  )}
                </div>
                {formData.categories.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Please select at least one category</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Type *</label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value as 'digital' | 'poster' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  required
                >
                  <option value="digital">Digital Download</option>
                  <option value="poster">Physical Poster</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Digital: PDF + main image sent via email and available in dashboard
                  <br />
                  Poster: Physical product, no digital files sent
                </p>
              </div>

              {formData.productType === 'poster' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Poster Size *</label>
                    <select
                      value={formData.posterSize}
                      onChange={(e) => setFormData({ ...formData, posterSize: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      required
                    >
                      <option value="A4">A4 (21 × 29.7 cm)</option>
                      <option value="A3">A3 (29.7 × 42 cm)</option>
                      <option value="A2">A2 (42 × 59.4 cm)</option>
                      <option value="A1">A1 (59.4 × 84.1 cm)</option>
                      <option value="A0">A0 (84.1 × 118.9 cm)</option>
                      <option value="12x18">12" × 18" (30.5 × 45.7 cm)</option>
                      <option value="16x20">16" × 20" (40.6 × 50.8 cm)</option>
                      <option value="18x24">18" × 24" (45.7 × 61 cm)</option>
                      <option value="24x36">24" × 36" (61 × 91.4 cm)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">This will be the default size shown to customers</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Poster Size Pricing ({getCurrency(currentCurrency)?.symbol || '$'}) *
                      </label>
                      <div className="flex items-center space-x-2">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              addPosterSize(e.target.value);
                              e.target.value = ''; // Reset select
                            }
                          }}
                          className="text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-300"
                        >
                          <option value="">Add Size</option>
                          {Object.entries(availablePosterSizes)
                            .filter(([size]) => !formData.posterPricing[size])
                            .map(([size, label]) => (
                              <option key={size} value={size}>{label}</option>
                  ))}
                </select>
                      </div>
              </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(formData.posterPricing).map(([size, price]) => (
                        <div key={size} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg group">
                          {editingSizeId === size ? (
                            // Editing mode
                            <div className="flex-1 flex items-center space-x-2">
                              <input
                                type="text"
                                value={editingSizeName}
                                onChange={(e) => setEditingSizeName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditedSize();
                                  if (e.key === 'Escape') cancelEditingSize();
                                }}
                                className="flex-1 px-2 py-1 text-sm border border-pink-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
                                placeholder="Enter size name"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={saveEditedSize}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                title="Save changes"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingSize}
                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
                                title="Cancel editing"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            // Display mode
                            <div className="flex-1 flex items-center space-x-2">
                              <label className="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
                                {availablePosterSizes[size] || size}
                              </label>
                              <button
                                type="button"
                                onClick={() => startEditingSize(size)}
                                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit size name"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          
                          <input
                            type="number"
                            step="1"
                            value={Math.round(price)}
                            onChange={(e) => {
                              const newPrice = Math.round(parseFloat(e.target.value) || 0);
                              setFormData({
                                ...formData,
                                posterPricing: {
                                  ...formData.posterPricing,
                                  [size]: newPrice
                                },
                                originalPosterPricing: {
                                  ...formData.originalPosterPricing,
                                  [size]: newPrice
                                }
                              });
                            }}
                            className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-300 text-right"
                            placeholder="0"
                            required
                            disabled={editingSizeId === size}
                          />
                          
                          <button
                            type="button"
                            onClick={() => removePosterSize(size)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove this size"
                            disabled={Object.keys(formData.posterPricing).length <= 1 || editingSizeId === size}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">Set individual prices for each poster size in {currentCurrency}</p>
                      <button
                        type="button"
                        onClick={() => {
                          // Convert current prices to match the current currency (assuming they were in USD)
                          const convertedPrices = convertPricesToCurrency(formData.posterPricing, 'USD', currentCurrency);
                          setFormData({
                            ...formData,
                            posterPricing: convertedPrices
                          });
                        }}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        title="Convert prices from USD to current currency"
                      >
                        Convert from USD
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas (e.g., digital, abstract, colorful)</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                  Featured Product
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                  {imagePreview.length > 0 ? (
                    <div className="space-y-3">
                      {imagePreview.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-pink-600 hover:text-pink-500">Upload images</span>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB (Multiple images supported)</p>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                      <div className="text-pink-600">Uploading...</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs (Alternative)</label>
                <textarea
                  value={formData.images.join('\n')}
                  onChange={(e) => {
                    const urls = e.target.value.split('\n').map(url => url.trim()).filter(Boolean);
                    setFormData({ ...formData, images: urls });
                    setImagePreview(urls);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Enter one URL per line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Enter product description"
                />
              </div>

              {/* Item Details Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Item Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                    <input
                      type="text"
                      value={formData.itemDetails.material}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        itemDetails: { ...formData.itemDetails, material: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="e.g., Premium canvas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <input
                      type="text"
                      value={formData.itemDetails.size}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        itemDetails: { ...formData.itemDetails, size: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="e.g., 24 x 36 inches"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frame</label>
                    <input
                      type="text"
                      value={formData.itemDetails.frame}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        itemDetails: { ...formData.itemDetails, frame: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="e.g., Solid wood, natural finish"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                    <input
                      type="text"
                      value={formData.itemDetails.style}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        itemDetails: { ...formData.itemDetails, style: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="e.g., Contemporary landscape"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                    <input
                      type="text"
                      value={formData.itemDetails.origin}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        itemDetails: { ...formData.itemDetails, origin: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="e.g., Handcrafted in India"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Delivery Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Standard Delivery</label>
                    <textarea
                      rows={2}
                      value={formData.delivery.standardDelivery}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        delivery: { ...formData.delivery, standardDelivery: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Free Standard Delivery\n5-7 business days"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Express Delivery</label>
                    <textarea
                      rows={2}
                      value={formData.delivery.expressDelivery}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        delivery: { ...formData.delivery, expressDelivery: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Express Delivery\n2-3 business days • ₹150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Same Day Delivery</label>
                    <textarea
                      rows={2}
                      value={formData.delivery.sameDayDelivery}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        delivery: { ...formData.delivery, sameDayDelivery: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Same Day Delivery\nAvailable in select cities • ₹300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
                    <textarea
                      rows={2}
                      value={formData.delivery.additionalInfo}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        delivery: { ...formData.delivery, additionalInfo: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="📦 All orders include tracking and insurance. Returns accepted within 30 days."
                    />
                  </div>
                </div>
              </div>

              {/* Did You Know Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Did You Know?</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Artist Story</label>
                    <textarea
                      rows={3}
                      value={formData.didYouKnow.artistStory}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        didYouKnow: { ...formData.didYouKnow, artistStory: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Share the story behind this artwork..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eco-Friendly Features</label>
                    <textarea
                      rows={3}
                      value={formData.didYouKnow.ecoFriendly}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        didYouKnow: { ...formData.didYouKnow, ecoFriendly: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Describe eco-friendly aspects..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unique Features</label>
                    <textarea
                      rows={3}
                      value={formData.didYouKnow.uniqueFeatures}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        didYouKnow: { ...formData.didYouKnow, uniqueFeatures: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Highlight unique characteristics..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Products: React.FC = () => {
  const { formatAdminPrice } = useCurrency();
  const { 
    adminProducts: products, 
    updateProduct, 
    deleteProduct: removeProduct,
    toggleProductStatus,
    toggleFeatured,
    refreshProducts,
    loading,
    error
  } = useProducts();
  
  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]); // Increased to 100,000 range
  const [ratingFilter, setRatingFilter] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  
  // New state for inline form
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formProduct, setFormProduct] = useState<any>(null);
  
  // Templates management state
  const [showTemplatesManagement, setShowTemplatesManagement] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState<any[]>([]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const loadedCategories = await categoryService.getAllCategories();
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Handle both old single category and new categories array for search
      const productCategories = product.categories && Array.isArray(product.categories) 
        ? product.categories 
        : (product as any).category ? [(product as any).category] : [];
      
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           productCategories.some((cat: string) => cat.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || productCategories.includes(categoryFilter);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = product.rating >= ratingFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPrice && matchesRating;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];
      
      // Handle undefined values
      if (aValue === undefined || bValue === undefined) {
        return 0;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchTerm, statusFilter, categoryFilter, priceRange, ratingFilter, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.downloads), 0);
    const totalDownloads = products.reduce((sum, p) => sum + p.downloads, 0);
    const avgRating = products.reduce((sum, p) => sum + p.rating, 0) / products.length;
    
    return {
      totalProducts,
      activeProducts,
      totalRevenue,
      totalDownloads,
      avgRating
    };
  }, [products]);

  // Handle tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Handle specific tab actions
    switch (tabId) {
      case 'create':
        setShowInlineForm(true);
        setFormMode('create');
        setFormProduct(null);
        setShowTemplatesManagement(false);
        break;
      case 'import':
        setShowBulkImportModal(true);
        setShowTemplatesManagement(false);
        break;
      case 'grid':
        setViewMode('grid');
        setShowInlineForm(false);
        setShowTemplatesManagement(false);
        break;
      case 'list':
        setViewMode('list');
        setShowInlineForm(false);
        setShowTemplatesManagement(false);
        break;
      case 'analytics':
        setShowInlineForm(false);
        setShowTemplatesManagement(false);
        // TODO: Implement analytics view
        break;
      case 'categories':
        setShowInlineForm(false);
        setShowTemplatesManagement(false);
        // TODO: Navigate to categories page or show category management
        break;
      case 'templates':
        setShowInlineForm(false);
        setShowTemplatesManagement(true);
        break;
      case 'featured':
        setShowInlineForm(false);
        setShowTemplatesManagement(false);
        // TODO: Filter to show only featured products
        break;
      case 'trending':
        setShowInlineForm(false);
        setShowTemplatesManagement(false);
        // TODO: Filter to show trending products
        break;
      case 'settings':
        setShowInlineForm(false);
        setShowTemplatesManagement(false);
        // TODO: Show product settings
        break;
      default:
        setShowInlineForm(false);
        setShowTemplatesManagement(false);
        break;
    }
  };

  // Sync view mode with active tab
  React.useEffect(() => {
    if (activeTab === 'grid') {
      setViewMode('grid');
    } else if (activeTab === 'list') {
      setViewMode('list');
    }
  }, [activeTab]);

  // Inline form handlers
  const handleInlineFormSubmit = async (productData: any) => {
    if (formMode === 'create') {
      await createProduct(productData);
    } else {
      await editProduct(productData);
    }
    setShowInlineForm(false);
    setActiveTab('all');
  };

  const handleInlineFormCancel = () => {
    setShowInlineForm(false);
    setActiveTab('all');
  };

  // CRUD Operations
  const createProduct = async (productData: any) => {
    console.log('Creating product:', productData);
    
    try {
      // First create the product without images to get the real product ID
      const productWithoutImages = {
        ...productData,
        images: [], // Start with empty images array
        price: Math.round(parseFloat(productData.price.toString()) || 0),
        originalPrice: productData.originalPrice ? Math.round(parseFloat(productData.originalPrice.toString()) || 0) : undefined,
        discountPercentage: productData.discountPercentage ? Math.round(parseFloat(productData.discountPercentage.toString()) || 0) : undefined,
        tags: Array.isArray(productData.tags) ? productData.tags.map((tag: string) => tag.trim()) : productData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        itemDetails: productData.itemDetails,
        delivery: productData.delivery,
        didYouKnow: productData.didYouKnow
      };
      
      // Create the product first to get the real ID
      const createdProduct = await ProductService.createProduct(productWithoutImages);
      
      let uploadedImages: string[] = [];
      
      // Upload images if there are any new files using the real product ID
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        uploadedImages = await ProductService.uploadProductImages(productData.imageFiles, createdProduct.id);
        
        // Update the product with the uploaded image URLs
        await ProductService.updateProduct(createdProduct.id, { images: uploadedImages });
      }

      // Upload main image if provided
      let mainImageUrl = null;
      if (productData.mainImageFile) {
        const mainImageResult = await ImageUploadService.uploadMainImage(
          productData.mainImageFile,
          createdProduct.id
        );
        if (mainImageResult.success && mainImageResult.url) {
          mainImageUrl = mainImageResult.url;
          await ProductService.updateProduct(createdProduct.id, { main_image: mainImageUrl });
        }
      } else if (productData.mainImage) {
        // Use existing main image URL
        mainImageUrl = productData.mainImage;
        await ProductService.updateProduct(createdProduct.id, { main_image: mainImageUrl });
      }

      // Upload PDF if provided
      let pdfUrl = null;
      if (productData.pdfFile) {
        const pdfResult = await ImageUploadService.uploadPdf(
          productData.pdfFile,
          createdProduct.id
        );
        if (pdfResult.success && pdfResult.url) {
          pdfUrl = pdfResult.url;
          await ProductService.updateProduct(createdProduct.id, { pdf_url: pdfUrl });
        }
      } else if (productData.pdfUrl) {
        // Use existing PDF URL
        pdfUrl = productData.pdfUrl;
        await ProductService.updateProduct(createdProduct.id, { pdf_url: pdfUrl });
      }

      // The product is already added to the context via addProduct
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    }
  };



  const editProduct = async (productData: any) => {
    try {
      console.log('Editing product with data:', productData);
      console.log('Product ID:', productData.id);
      
      // Check if the product ID is valid
      if (!productData.id || typeof productData.id !== 'string' || productData.id.length < 10) {
        throw new Error('Invalid product ID. Cannot update product.');
      }
      
      // First check if the product exists in the database
      const existingProduct = await ProductService.getProductById(productData.id);
      if (!existingProduct) {
        throw new Error(`Product with ID ${productData.id} not found in database. Cannot update.`);
      }
      
      let uploadedImages: string[] = [];
      
      // Upload new images if there are any new files
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        uploadedImages = await ProductService.uploadProductImages(productData.imageFiles, productData.id);
      } else {
        // Use existing image URLs if no new files
        uploadedImages = productData.images || [];
      }

      // Handle main image upload
      let mainImageUrl = productData.mainImage || existingProduct.main_image;
      if (productData.mainImageFile) {
        const mainImageResult = await ImageUploadService.uploadMainImage(
          productData.mainImageFile,
          productData.id
        );
        if (mainImageResult.success && mainImageResult.url) {
          mainImageUrl = mainImageResult.url;
        }
      }

      // Handle PDF upload
      let pdfUrl = productData.pdfUrl || existingProduct.pdf_url;
      if (productData.pdfFile) {
        const pdfResult = await ImageUploadService.uploadPdf(
          productData.pdfFile,
          productData.id
        );
        if (pdfResult.success && pdfResult.url) {
          pdfUrl = pdfResult.url;
        }
      }

      const updatedProduct = {
        ...productData,
        images: uploadedImages,
        main_image: mainImageUrl,
        pdf_url: pdfUrl,
        price: Math.round(parseFloat(productData.price.toString()) || 0),
        originalPrice: productData.originalPrice ? Math.round(parseFloat(productData.originalPrice.toString()) || 0) : undefined,
        discountPercentage: productData.discountPercentage ? Math.round(parseFloat(productData.discountPercentage.toString()) || 0) : undefined,
        tags: Array.isArray(productData.tags) ? productData.tags.map((tag: string) => tag.trim()) : productData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        itemDetails: productData.itemDetails,
        delivery: productData.delivery,
        didYouKnow: productData.didYouKnow
      };
      
      console.log('Sending update to database:', updatedProduct);
      
      const updatedProductFromDB = await ProductService.updateProduct(productData.id, updatedProduct);
      
      // Update local state after successful database update
      if (updatedProductFromDB) {
        updateProduct(productData.id, updatedProductFromDB);
        console.log('Product updated successfully in database and local state');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to update product: ${errorMessage}`);
    }
  };

  const deleteProduct = (productId: string) => {
    removeProduct(productId);
    setShowDeleteModal(false);
    setDeletingProduct(null);
    setActiveTab('all');
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
      setActiveTab('all');
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      const newSelection = selectedProducts.filter(id => id !== productId);
      setSelectedProducts(newSelection);
      if (newSelection.length === 0) {
        setActiveTab('all');
      }
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const bulkDelete = () => {
    selectedProducts.forEach(productId => removeProduct(productId));
    setSelectedProducts([]);
    setActiveTab('all');
  };

  const bulkStatusChange = async (status: string) => {
    try {
      for (const productId of selectedProducts) {
        await ProductService.updateProduct(productId, { status: status as 'active' | 'inactive' | 'draft' });
        // Update local state
        updateProduct(productId, { status: status as 'active' | 'inactive' | 'draft' });
      }
      setSelectedProducts([]);
      setActiveTab('all');
    } catch (error) {
      console.error('Error updating product statuses:', error);
      alert('Failed to update some product statuses. Please try again.');
    }
  };

  const handleBulkImport = async (importedProducts: any[]) => {
    console.log('Bulk importing products:', importedProducts);
    
    try {
      for (const product of importedProducts) {
        // Handle image uploads if there are image files - will be processed after product creation

        // Convert the imported product data to match the Product interface
        const newProduct = {
          title: product.title,
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          originalPrice: product.originalPrice ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice) : undefined,
          discountPercentage: product.discountPercentage ? (typeof product.discountPercentage === 'string' ? parseFloat(product.discountPercentage) : product.discountPercentage) : undefined,
          categories: product.categories || (product as any).category ? [(product as any).category] : [],
          productType: product.productType || 'digital',
          description: product.description || '',
          tags: Array.isArray(product.tags) ? product.tags : (product.tags ? product.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []),
          status: (product.status === 'active' || product.status === 'inactive' || product.status === 'draft') ? (product.status as 'active' | 'inactive' | 'draft') : 'active',
          featured: product.featured === 'true' || product.featured === true,
          images: [], // Start with empty images array
          itemDetails: {
            material: product.material || (product.productType === 'poster' ? 'Premium matte paper' : 'Digital file'),
            size: product.size || (product.productType === 'poster' ? 'A4 (21cm x 29.7cm)' : 'High resolution (300 DPI), 3000px X 4500px'),
            frame: product.frame || (product.productType === 'poster' ? 'No frame included' : 'No frame needed'),
            style: product.style || (product.productType === 'poster' ? 'High-quality print' : 'Digital artwork'),
            origin: product.origin || (product.productType === 'poster' ? 'Printed in India' : 'Created digitally')
          },
          delivery: {
            standardDelivery: product.standardDelivery || (product.productType === 'poster' ? 'Free Standard Delivery\n5-7 business days' : 'Instant Digital Download\nAvailable immediately after purchase'),
            expressDelivery: product.expressDelivery || (product.productType === 'poster' ? 'Express Delivery\n2-3 business days • ₹150' : 'Email Delivery\nPDF and high-res image sent to your email'),
            sameDayDelivery: product.sameDayDelivery || (product.productType === 'poster' ? 'Same Day Delivery\nAvailable in select cities • ₹300' : 'Dashboard Access\nDownload from your user dashboard'),
            additionalInfo: product.additionalInfo || (product.productType === 'poster' ? '📦 All orders include tracking and insurance. Returns accepted within 30 days.' : '📱 Digital files are available for download immediately. No shipping required.')
          },
          didYouKnow: {
            artistStory: product.artistStory || (product.productType === 'poster' ? 'This piece was inspired by the artist\'s journey through the Himalayas, capturing the first light of dawn breaking over snow-capped peaks.' : 'This digital artwork was created using advanced digital techniques, inspired by the artist\'s vision of modern digital art.'),
            ecoFriendly: product.ecoFriendly || (product.productType === 'poster' ? 'Made with sustainable materials and eco-friendly paints. Each piece helps support local artisan communities.' : 'Digital format means zero environmental impact. No printing, shipping, or physical materials required.'),
            uniqueFeatures: product.uniqueFeatures || (product.productType === 'poster' ? 'Every artwork is one-of-a-kind with subtle variations that make it truly unique. Perfect for art collectors and interior designers.' : 'High-resolution digital file perfect for printing at any size. Compatible with all modern devices and printing services.')
          }
        };
        
        // Create the product first to get the real ID
        const createdProduct = await ProductService.createProduct(newProduct);
        
        // Upload images if there are any new files using the real product ID
        if (product.imageFiles && product.imageFiles.length > 0) {
          const uploadedImageUrls = await ProductService.uploadProductImages(product.imageFiles, createdProduct.id);
          
          // Update the product with the uploaded image URLs
          await ProductService.updateProduct(createdProduct.id, { images: uploadedImageUrls });
        }
      }
      
      setShowBulkImportModal(false);
      setActiveTab('all');
    } catch (error) {
      console.error('Error during bulk import:', error);
      alert('Failed to import some products. Please check the console for details.');
    }
  };

  const exportProductsToCSV = () => {
    const csvContent = [
      ['title', 'price', 'category', 'description', 'tags', 'status', 'featured', 'images', 'material', 'size', 'frame', 'style', 'origin', 'standardDelivery', 'expressDelivery', 'sameDayDelivery', 'additionalInfo', 'artistStory', 'ecoFriendly', 'uniqueFeatures'],
      ...products.map(product => [
        `"${product.title}"`,
        product.price.toString(),
        `"${(product.categories || []).join(',')}"`,
        `"${product.description || ''}"`,
        `"${(product.tags || []).join(',')}"`,
        product.status,
        product.featured ? 'true' : 'false',
        `"${(product.images || []).join(';')}"`,
        `"${product.itemDetails?.material || ''}"`,
        `"${product.itemDetails?.size || ''}"`,
        `"${product.itemDetails?.frame || ''}"`,
        `"${product.itemDetails?.style || ''}"`,
        `"${product.itemDetails?.origin || ''}"`,
        `"${product.delivery?.standardDelivery || ''}"`,
        `"${product.delivery?.expressDelivery || ''}"`,
        `"${product.delivery?.sameDayDelivery || ''}"`,
        `"${product.delivery?.additionalInfo || ''}"`,
        `"${product.didYouKnow?.artistStory || ''}"`,
        `"${product.didYouKnow?.ecoFriendly || ''}"`,
        `"${product.didYouKnow?.uniqueFeatures || ''}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Modal handlers
  const openEditModal = (product: any) => {
    setFormProduct(product);
    setFormMode('edit');
    setShowInlineForm(true);
    setActiveTab('create');
  };

  const openViewModal = (product: any) => {
    setViewingProduct(product);
    setShowViewModal(true);
    setActiveTab('all');
  };

  const openDeleteModal = (product: any) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
    setActiveTab('all');
  };

  const duplicateProduct = async (product: any) => {
    try {
      // Create a copy of the product with only necessary modifications
      const duplicatedProduct = {
        ...product,
        title: `${product.title} (Copy)`,
        status: 'draft', // Set as draft by default
        featured: false, // Remove featured status
        // Remove only the fields that should not be copied
        id: undefined,
        created_at: undefined,
        updated_at: undefined
        // Keep all other fields including category, categories, productType, etc.
      };

      // Create the new product
      await ProductService.createProduct(duplicatedProduct);
      
      // Refresh the products list
      await refreshProducts();
      
      // Show success message
      alert(`Product "${duplicatedProduct.title}" has been duplicated successfully!`);
      
    } catch (error) {
      console.error('Error duplicating product:', error);
      alert('Failed to duplicate product. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <AdminLayout title="">
      {/* Secondary Navigation - Vertical Sidebar */}
      <ProductsSecondaryNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        productCounts={{
          total: stats.totalProducts,
          featured: products.filter(p => p.featured).length,
          trending: products.filter(p => p.rating >= 4.5).length
        }}
      />
      
      {/* Main Content with left margin for sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden ml-24">
        {/* Tab-specific content */}
      {activeTab === 'analytics' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-pink-50 mb-6">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Product Analytics</h3>
            <p className="text-gray-600 mb-6">Detailed insights and performance metrics for your products</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-500">Analytics dashboard coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-pink-50 mb-6">
          <div className="text-center">
            <Filter className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Category Management</h3>
            <p className="text-gray-600 mb-6">Organize and manage your product categories</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-500">Category management coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'featured' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-pink-50 mb-6">
          <div className="text-center">
            <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Featured Products</h3>
            <p className="text-gray-600 mb-6">Manage your featured product selections</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-500">Featured products management coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trending' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-pink-50 mb-6">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Trending Products</h3>
            <p className="text-gray-600 mb-6">View and manage trending product selections</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-500">Trending products view coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-pink-50 mb-6">
          <div className="text-center">
            <Settings className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Product Settings</h3>
            <p className="text-gray-600 mb-6">Configure product management preferences</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-500">Product settings coming soon...</p>
            </div>
          </div>
        </div>
      )}
      
                    {/* Inline Product Form */}
      {showInlineForm && (
        <ProductForm
          product={formProduct}
          mode={formMode}
          onSubmit={handleInlineFormSubmit}
          onCancel={handleInlineFormCancel}
        />
      )}

      {/* Templates Management */}
      {showTemplatesManagement && (
        <TemplatesManagement
          onClose={() => {
            setShowTemplatesManagement(false);
            setActiveTab('all');
          }}
        />
      )}

        {/* Main Product Content - Only show for relevant tabs */}
        {(activeTab === 'all' || activeTab === 'grid' || activeTab === 'list') && !showInlineForm && (
          <React.Fragment>
            {/* Statistics Cards with Currency Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Product Statistics</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">View in:</span>
                  <CurrencySelector 
                    showFlag={true} 
                    showName={false}
                    variant="compact"
                    className="bg-white border border-gray-200 rounded-lg shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
            <div className="p-2 bg-pink-100 rounded-lg">
              <Package className="w-5 h-5 text-pink-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-blue-600">{formatAdminPrice(stats.totalRevenue)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalDownloads.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-50 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
            <p className="text-gray-600">Manage your digital art collection and inventory</p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Admin Currency:</span>
                <CurrencySelector 
                  showFlag={true} 
                  showName={false}
                  variant="compact"
                  className="bg-white border border-gray-200 rounded-lg shadow-sm"
                />
              </div>
              <div className="text-xs text-gray-400">
                • Prices in selected currency • Live rates • Updates all displays
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {selectedProducts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedProducts.length} selected</span>
                <button
                  onClick={() => bulkStatusChange('active')}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                >
                  Activate
                </button>
                <button
                  onClick={() => bulkStatusChange('inactive')}
                  className="px-4 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                >
                  Deactivate
                </button>
                <button
                  onClick={bulkDelete}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                >
                  Delete
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setShowBulkImportModal(true);
                  setActiveTab('import');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title="Import multiple products from CSV file"
              >
                <Upload className="w-5 h-5" />
                <span>Bulk Import</span>
              </button>
              <button
                onClick={exportProductsToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                title="Export all products to CSV file"
              >
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
              <div className="relative group">
                <div className="w-4 h-4 text-blue-400 cursor-help">
                  <Info className="w-4 h-4" />
                </div>
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <p>Upload a CSV file to import multiple products at once. Download the template to see the required format. You can also export your current products.</p>
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowInlineForm(true);
                setFormMode('create');
                setFormProduct(null);
                setActiveTab('create');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>

          </div>
        </div>
      </div>

      {/* Debug Information */}
      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-4">
        <div className="text-sm text-yellow-800">
          <strong>Debug Info:</strong> 
          Products loaded: {products.length} | 
          Loading: {loading ? 'Yes' : 'No'} | 
          Error: {error || 'None'} | 
          <button 
            onClick={() => refreshProducts()} 
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Force Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-50 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => {
                setViewMode('list');
                setActiveTab('list');
              }}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setViewMode('grid');
                setActiveTab('grid');
              }}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-pink-50 border-pink-200 text-pink-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(statusFilter !== 'all' || categoryFilter !== 'all' || priceRange[0] > 0 || priceRange[1] < 100000 || ratingFilter > 0) && (
              <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value="title">Title</option>
                  <option value="artist">Artist</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="downloads">Downloads</option>
                  <option value="createdDate">Date</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <option value={0}>All Ratings</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.0}>4.0+ Stars</option>
                <option value={3.5}>3.5+ Stars</option>
                <option value={3.0}>3.0+ Stars</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  min="0"
                  step="0.01"
                />
                <span className="text-gray-400 self-center">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value) || 100000])}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatAdminPrice(priceRange[0])}</span>
                <span>{formatAdminPrice(priceRange[1])}</span>
              </div>
              {/* Price Range Slider */}
              <div className="mt-2">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mt-2"
                />
              </div>
            </div>
            </div>
            
            {/* Filter Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-4">
                <span>Price Range: {formatAdminPrice(priceRange[0])} - {formatAdminPrice(priceRange[1])}</span>
                <span>Products in range: {products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]).length}</span>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setPriceRange([0, 100000]);
                  setRatingFilter(0);
                  setSortBy('title');
                  setSortOrder('asc');
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
          <div className="text-sm text-gray-500">
            Showing {filteredProducts.length} of {products.length} products
          </div>
          {filteredProducts.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              {selectedProducts.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-pink-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-25 border-b border-pink-100">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Downloads</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Reviews</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-pink-25 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={product.images && product.images.length > 0 ? product.images[0] : ''}
                            alt={product.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          {product.featured && (
                            <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{product.title}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.categories && product.categories.length > 0 ? (
                          product.categories.map((category: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
                              {category}
                      </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                            No categories
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      <div className="space-y-1">
                        {product.originalPrice && product.originalPrice > product.price ? (
                          <>
                            <div className="text-green-600 font-bold">{formatAdminPrice(product.price)}</div>
                            <div className="text-gray-500 line-through text-xs">{formatAdminPrice(product.originalPrice)}</div>
                            <div className="text-pink-600 text-xs font-medium">
                              {product.discountPercentage ? `${product.discountPercentage}% OFF` : 'Discounted'}
                            </div>
                          </>
                        ) : (
                          <span>{formatAdminPrice(product.price)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleProductStatus(product.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${getStatusColor(product.status)} hover:opacity-80`}
                      >
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.downloads.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1">{product.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span>{product.reviews ? product.reviews.length : 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openViewModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-pink-600 hover:bg-pink-100 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFeatured(product.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.featured 
                              ? 'text-yellow-600 hover:bg-yellow-100' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={product.featured ? 'Remove from Featured' : 'Add to Featured'}
                        >
                          <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Product"
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
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-pink-50 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={product.images && product.images.length > 0 ? product.images[0] : ''}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                  />
                </div>
                <div className="absolute top-3 right-3 flex space-x-1">
                  {product.featured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate">{product.title}</h3>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="space-y-1">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <>
                        <div className="text-green-600 font-bold text-lg">{formatAdminPrice(product.price)}</div>
                        <div className="text-gray-500 line-through text-sm">{formatAdminPrice(product.originalPrice)}</div>
                        <div className="text-pink-600 text-xs font-medium">
                          {product.discountPercentage ? `${product.discountPercentage}% OFF` : 'Discounted'}
                        </div>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-800">{formatAdminPrice(product.price)}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{product.downloads} downloads</span>
                  <div className="flex flex-wrap gap-1">
                    {product.categories && product.categories.length > 0 ? (
                      product.categories.map((category: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">
                          {category}
                  </span>
                      ))
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                        No categories
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openViewModal(product)}
                    className="flex-1 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(product)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      )}
          </React.Fragment>
      )}
        </div>

      {/* Modals */}
      {showCreateModal && (
        <ProductModal
          title="Create New Product"
          categories={categories}
          onSubmit={createProduct}
          onClose={() => {
            setShowCreateModal(false);
            setActiveTab('all');
          }}
        />
      )}

      {showEditModal && editingProduct && (
        <ProductModal
          title="Edit Product"
          product={editingProduct}
          categories={categories}
          onSubmit={editProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {showViewModal && viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Product Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingProduct(null);
                  setActiveTab('all');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={viewingProduct.images && viewingProduct.images.length > 0 ? viewingProduct.images[0] : ''}
                    alt={viewingProduct.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{viewingProduct.title}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      {viewingProduct.originalPrice && viewingProduct.originalPrice > viewingProduct.price ? (
                        <div className="space-y-1">
                          <p className="text-xl font-bold text-green-600">{formatAdminPrice(viewingProduct.price)}</p>
                          <p className="text-sm text-gray-500 line-through">{formatAdminPrice(viewingProduct.originalPrice)}</p>
                          <p className="text-xs text-pink-600 font-medium">
                            {viewingProduct.discountPercentage ? `${viewingProduct.discountPercentage}% OFF` : 'Discounted'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xl font-bold text-gray-800">{formatAdminPrice(viewingProduct.price)}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium text-gray-800">{viewingProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Downloads</p>
                      <p className="font-medium text-gray-800">{viewingProduct.downloads.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 font-medium text-gray-800">{viewingProduct.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingProduct.status)}`}>
                      {viewingProduct.status.charAt(0).toUpperCase() + viewingProduct.status.slice(1)}
                    </span>
                    {viewingProduct.featured && (
                      <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {viewingProduct.tags.map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingProduct.description && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Description</p>
                      <p className="text-gray-700">{viewingProduct.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Delete Product</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{deletingProduct.title}"? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingProduct(null);
                  setActiveTab('all');
                }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProduct(deletingProduct.id)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkProductImport
          onImport={handleBulkImport}
          onClose={() => {
            setShowBulkImportModal(false);
            setActiveTab('all');
          }}
        />
      )}
    </AdminLayout>
  );
};

export default Products;