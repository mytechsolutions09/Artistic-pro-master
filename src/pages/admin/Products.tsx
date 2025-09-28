import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, Search, Grid, List, Star, 
  Download, TrendingUp, Package, DollarSign, RefreshCw, CheckSquare, Image as ImageIcon,
  X, FileText, File, Copy, Heart
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductsSecondaryNav from '../../components/admin/ProductsSecondaryNav';
import TemplatesManagement from '../../components/admin/TemplatesManagement';
import ProductExport from '../../components/admin/ProductExport';
import BackToTop from '../../components/BackToTop';
import { ProductService, OrderService } from '../../services/supabaseService';
import { useCurrency } from '../../contexts/CurrencyContext';
import { ImageUploadService } from '../../services/imageUploadService';
import { templateService, ProductTemplate } from '../../services/templateService';
import { generateTagsFromCategories } from '../../services/tagGenerationService';

// ProductModal Component
interface ProductModalProps {
  title: string;
  product?: any;
  categories: any[];
  onSubmit: (productData: any) => void;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ title, product, categories, onSubmit, onClose }) => {
  const { currentCurrency, convertAmount } = useCurrency();
  
  // Using centralized tag generation service
  
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
        }
      });
    }
  };
  
  // Remove a poster size
  const removePosterSize = (size: string) => {
    const { [size]: removed, ...remainingPricing } = formData.posterPricing;
    setFormData({
      ...formData,
      posterPricing: remainingPricing,
      // If removing the default size, set to the first available size
      posterSize: formData.posterSize === size ? Object.keys(remainingPricing)[0] || 'A4' : formData.posterSize
    });
  };
  
  // Add a custom poster size
  const addCustomSize = () => {
    if (customSize && customSizePrice > 0) {
      setFormData({
        ...formData,
        posterPricing: {
          ...formData.posterPricing,
          [customSize]: customSizePrice
        }
      });
      // Clear the custom size inputs
      setCustomSize('');
      setCustomSizePrice(0);
    }
  };
  
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || product?.price || '',
    discountPercentage: product?.discountPercentage || 0,
    categories: product?.categories || (product?.category ? [product.category] : []),
    category: product?.category || '',
    tags: product?.tags?.join(', ') || '',
    status: product?.status || 'active',
    featured: product?.featured || false,
    productType: product?.product_type || 'digital',
    posterSize: product?.poster_size || 'A4',
    posterPricing: product?.poster_pricing || {},
    itemDetails: product?.item_details || (product?.product_type === 'poster' ? {
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
    delivery: product?.delivery || (product?.product_type === 'poster' ? {
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
    didYouKnow: product?.did_you_know || (product?.product_type === 'poster' ? {
      artistStory: 'This piece was inspired by the artist\'s journey through the Himalayas, capturing the first light of dawn breaking over snow-capped peaks.',
      ecoFriendly: 'Made with sustainable materials and eco-friendly paints. Each piece helps support local artisan communities.',
      uniqueFeatures: 'Every artwork is one-of-a-kind with subtle variations that make it truly unique. Perfect for art collectors and interior designers.'
    } : {
      artistStory: 'This digital artwork was created using advanced digital techniques, inspired by the artist\'s vision of modern digital art.',
      ecoFriendly: 'Digital format means zero environmental impact. No printing, shipping, or physical materials required.',
      uniqueFeatures: 'High-resolution digital file perfect for printing at any size. Compatible with all modern devices and printing services.'
    }),
    images: product?.images || [],
    mainImage: product?.main_image || '',
    pdfUrl: product?.pdf_url || ''
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for existing files
  const [existingImages, setExistingImages] = useState<string[]>(product?.images || []);
  const [existingMainImage, setExistingMainImage] = useState<string>(product?.main_image || '');
  const [existingPdf, setExistingPdf] = useState<string>(product?.pdf_url || '');
  const [existingVideo, setExistingVideo] = useState<string>((product as any)?.video_url || '');
  const [customSize, setCustomSize] = useState('');
  const [customSizePrice, setCustomSizePrice] = useState<number>(0);
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(true);
  const [hasDiscount, setHasDiscount] = useState<boolean>(Boolean(product?.originalPrice && product?.discountPercentage));

  // Load templates when component mounts
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const templatesData = await templateService.getAllTemplates();
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error loading templates:', error);
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // Initialize poster pricing when component mounts or currency changes
  useEffect(() => {
    if (!product?.posterPricing && formData.productType === 'poster') {
      const defaultPricing = getDefaultPosterPricing();
      setFormData(prev => ({
        ...prev,
        posterPricing: defaultPricing
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'price' && hasDiscount && Number(formData.originalPrice) > 0) {
      // Recalculate discount percentage when discounted price changes
      const newPrice = Number(value) || 0;
      const newDiscountPercentage = ((Number(formData.originalPrice) - newPrice) / Number(formData.originalPrice)) * 100;
      setFormData(prev => ({
        ...prev,
        [name]: value,
        discountPercentage: Math.max(0, newDiscountPercentage)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        const templateData = template.data;
        const newCategories = templateData.category ? [templateData.category] : formData.categories;
        
        setFormData(prev => ({
          ...prev,
          title: templateData.title || prev.title,
          description: templateData.description || prev.description,
          price: templateData.price || prev.price,
          categories: newCategories,
          tags: templateData.tags || generateTagsFromCategories(newCategories),
          productType: templateData.productType || prev.productType,
          posterSize: templateData.posterSize || prev.posterSize,
          itemDetails: templateData.itemDetails || prev.itemDetails,
          delivery: templateData.delivery || prev.delivery,
          didYouKnow: templateData.didYouKnow || prev.didYouKnow
        }));
      }
    }
  };

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
      
      setImagePreviews([...imagePreviews, ...urls]);
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
    const newPreviews = [...imagePreviews];
    const newFiles = [...imageFiles];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
    setFormData({ ...formData, images: newImages });
  };

  // Remove existing main image
  const removeExistingMainImage = () => {
    setExistingMainImage('');
    setFormData({ ...formData, mainImage: '' });
  };

  // Remove existing PDF
  const removeExistingPdf = () => {
    setExistingPdf('');
    setFormData({ ...formData, pdfUrl: '' });
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
    if (!formData.categories || formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    const productData = {
      ...formData,
      id: product?.id,
      price: parseFloat(formData.price.toString()),
      tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      images: formData.images,
      imageFiles: imageFiles,
      mainImageFile: mainImageFile,
      pdfFile: pdfFile,
      videoFile: videoFile,
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
    <div className="fixed inset-0 bg-white z-50">
      <div className="h-full overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 text-center flex-1">{title}</h2>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                className="px-6 py-2 text-sm bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
              >
                {product ? 'Update Product' : 'Create Product'}
              </button>
            </div>
        </div>
        
          <form id="product-form" onSubmit={handleSubmit} className="space-y-4 text-center">
            {/* Categories Section - Full Width */}
            <div className="w-full">
              <label className="block text-xs font-medium text-gray-700 mb-2 text-center">
                <span>Categories *</span>
                <span className="block text-xs text-gray-500 font-normal mt-1">
                  {formData.categories.length} of {categories.length} selected
                </span>
              </label>
              <div className="w-full border border-gray-200 rounded-lg p-3">
                {categories.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-500">
                    No categories available
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center space-x-1 p-2 hover:bg-gray-50 cursor-pointer rounded border border-gray-100 hover:border-pink-200 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category.name)}
                          onChange={(e) => {
                            let newCategories: string[];
                            if (e.target.checked) {
                              newCategories = [...formData.categories, category.name];
                            } else {
                              newCategories = formData.categories.filter((c: string) => c !== category.name);
                            }
                            
                            // Auto-fill tags based on selected categories
                            const autoGeneratedTags = generateTagsFromCategories(newCategories);
                            console.log('Selected categories:', newCategories);
                            console.log('Generated tags:', autoGeneratedTags);
                            
                            setFormData({
                              ...formData,
                              categories: newCategories,
                              tags: autoGeneratedTags
                            });
                          }}
                          className="h-3 w-3 text-pink-600 focus:ring-pink-500 border-gray-300 rounded flex-shrink-0"
                        />
                        <span className="text-xs text-gray-700 truncate" title={category.name}>
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 text-center">Basic Information</h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Use Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  disabled={templatesLoading}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">
                    {templatesLoading ? 'Loading templates...' : 'Select a template (optional)'}
                  </option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.icon} {template.name}
                    </option>
                  ))}
                </select>
                {selectedTemplate && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Template applied! You can still modify the fields below.
                  </p>
                )}
                {!templatesLoading && templates.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    No templates available. Create templates in the Templates tab.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

                <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">{hasDiscount ? 'Discounted Price' : 'Price'} *</label>
                  <input
                    type="number"
                  name="price"
                    value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
              </div>


                 {/* Discount Section */}
         <div className="border-t border-gray-200 pt-3">
           <div className="flex items-center mb-2">
             <input
               type="checkbox"
               id="hasDiscount"
               checked={hasDiscount}
               onChange={(e) => {
                 if (e.target.checked) {
                   setHasDiscount(true);
                   // When enabling discount, set original price higher than current price
                   const currentPrice = Number(formData.price) || 0;
                   const suggestedOriginalPrice = currentPrice > 0 ? Math.round(currentPrice * 1.25) : 0; // 25% higher
                   setFormData({
                     ...formData,
                     originalPrice: suggestedOriginalPrice,
                     discountPercentage: suggestedOriginalPrice > 0 ? 20 : 0 // Default 20% discount
                   });
                 } else {
                   setHasDiscount(false);
                   setFormData({
                     ...formData,
                     originalPrice: 0,
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

                      {hasDiscount && (
             <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Original Price ({currentCurrency})
                </label>
                                 <input
                   type="number"
                   step="1"
                   value={Math.round(parseFloat(formData.originalPrice.toString()) || 0)}
                   onChange={(e) => {
                     const newOriginalPrice = Math.round(parseFloat(e.target.value) || 0);
                     if (Number(formData.discountPercentage) > 0) {
                       // Recalculate discounted price when original price changes
                       const newDiscountedPrice = Math.round(newOriginalPrice * (1 - Number(formData.discountPercentage) / 100));
                       setFormData({ 
                         ...formData, 
                         originalPrice: newOriginalPrice,
                         price: newDiscountedPrice
                       });
                     } else {
                       setFormData({ 
                         ...formData, 
                         originalPrice: newOriginalPrice
                       });
                     }
                   }}
                   className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                   placeholder="0"
                 />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                                 <input
                   type="number"
                   min="0"
                   max="100"
                   step="1"
                   value={Math.round(parseFloat(formData.discountPercentage.toString()) || 0)}
                   onChange={(e) => {
                     const discount = Math.round(parseFloat(e.target.value) || 0);
                     const originalPrice = Math.round(parseFloat(formData.originalPrice.toString()) || 0);
                     
                     if (originalPrice > 0) {
                       const discountedPrice = Math.round(originalPrice * (1 - discount / 100));
                       
                       setFormData({
                         ...formData,
                         discountPercentage: discount,
                         price: discountedPrice
                       });
                     } else {
                       setFormData({
                         ...formData,
                         discountPercentage: discount
                       });
                     }
                   }}
                   className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                   placeholder="0"
                 />
               </div>
             </div>
           )}
           {hasDiscount && Number(formData.discountPercentage) > 0 && Number(formData.originalPrice) > 0 && (
             <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
               <p className="text-xs text-green-700">
                 <strong>Final Price:</strong> {Math.round(Number(formData.originalPrice) * (1 - Number(formData.discountPercentage) / 100))} {currentCurrency} • <strong>Save:</strong> {Math.round(Number(formData.originalPrice) - Number(formData.price))} {currentCurrency}
               </p>
             </div>
           )}
        </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              </div>

            {/* Product Settings */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 text-center">Product Settings</h3>
              
                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Status</label>
                    <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                    </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-xs text-gray-700 text-center">Featured Product</label>
                  </div>
                  
                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Product Type</label>
                        <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="digital">Digital</option>
                  <option value="poster">Poster</option>
                </select>
              </div>
                    
              {formData.productType === 'poster' && (
                <>
              <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Poster Size</label>
                              <input
                                type="text"
                      name="posterSize"
                      value={formData.posterSize}
                      onChange={handleInputChange}
                      placeholder="e.g., A4, A3, 12x16"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                            </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Poster Pricing</label>
                    <div className="space-y-2">
                      {Object.entries(formData.posterPricing || {}).map(([size, price]) => (
                        <div key={size} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={size}
                            onChange={(e) => {
                              const newSize = e.target.value;
                              if (newSize !== size) {
                                const { [size]: oldPrice, ...remainingPricing } = formData.posterPricing;
                                setFormData(prev => ({
                                  ...prev,
                                posterPricing: {
                                    ...remainingPricing,
                                    [newSize]: oldPrice
                                  },
                                  posterSize: prev.posterSize === size ? newSize : prev.posterSize
                                }));
                              }
                            }}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Size"
                          />
                          <span className="text-sm text-gray-500">:</span>
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type="number"
                              value={price as number}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                  posterPricing: {
                                  ...prev.posterPricing,
                                  [size]: parseFloat(e.target.value) || 0
                                }
                              }))}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Price"
                            />
                            {hasDiscount && Number(formData.discountPercentage) > 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                {Math.round((price as number) * (1 - Number(formData.discountPercentage) / 100))}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removePosterSize(size)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(availablePosterSizes).map(size => (
                            !formData.posterPricing[size] && (
                      <button
                                key={size}
                        type="button"
                                onClick={() => addPosterSize(size)}
                                className="text-sm text-pink-600 hover:text-pink-700 border border-pink-200 px-2 py-1 rounded"
                              >
                                + {size}
                      </button>
                            )
                          ))}
                    </div>
                        
                        {/* Add Custom Size */}
                        <div className="border-t border-gray-200 pt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-2 text-center">Add Custom Size</label>
                          <div className="flex space-x-2">
                <input
                  type="text"
                              placeholder="e.g., 20x30"
                              value={customSize}
                              onChange={(e) => setCustomSize(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                <input
                              type="number"
                              placeholder="Price"
                              value={customSizePrice}
                              onChange={(e) => setCustomSizePrice(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            type="button"
                              onClick={addCustomSize}
                              disabled={!customSize || customSizePrice <= 0}
                              className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                              Add
                          </button>
                        </div>
                    </div>
                      </div>
                    </div>
                    </div>
                </>
                  )}
                </div>
              </div>

          {/* Item Details */}
                    <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-800 text-center">Item Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Material</label>
                    <input
                      type="text"
                  name="itemDetails.material"
                  value={formData.itemDetails.material || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    itemDetails: { ...prev.itemDetails, material: e.target.value }
                  }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Size</label>
                    <input
                      type="text"
                  name="itemDetails.size"
                  value={formData.itemDetails.size || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    itemDetails: { ...prev.itemDetails, size: e.target.value }
                  }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Frame</label>
                    <input
                      type="text"
                  name="itemDetails.frame"
                  value={formData.itemDetails.frame || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    itemDetails: { ...prev.itemDetails, frame: e.target.value }
                  }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Style</label>
                    <input
                      type="text"
                  name="itemDetails.style"
                  value={formData.itemDetails.style || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    itemDetails: { ...prev.itemDetails, style: e.target.value }
                  }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Origin</label>
                    <input
                      type="text"
                  name="itemDetails.origin"
                  value={formData.itemDetails.origin || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    itemDetails: { ...prev.itemDetails, origin: e.target.value }
                  }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

          {/* Delivery Information */}
                <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-800 text-center">Delivery Information</h3>
            
            <div className="space-y-4">
                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Standard Delivery</label>
                    <textarea
                  name="delivery.standardDelivery"
                  value={formData.delivery.standardDelivery || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, standardDelivery: e.target.value }
                  }))}
                      rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Express Delivery</label>
                    <textarea
                  name="delivery.expressDelivery"
                  value={formData.delivery.expressDelivery || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, expressDelivery: e.target.value }
                  }))}
                      rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Same Day Delivery</label>
                    <textarea
                  name="delivery.sameDayDelivery"
                  value={formData.delivery.sameDayDelivery || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, sameDayDelivery: e.target.value }
                  }))}
                      rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Additional Info</label>
                    <textarea
                  name="delivery.additionalInfo"
                  value={formData.delivery.additionalInfo || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, additionalInfo: e.target.value }
                  }))}
                      rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

          {/* Did You Know */}
                <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-800 text-center">Did You Know</h3>
            
            <div className="space-y-4">
                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Artist Story</label>
                    <textarea
                  name="didYouKnow.artistStory"
                  value={formData.didYouKnow.artistStory || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    didYouKnow: { ...prev.didYouKnow, artistStory: e.target.value }
                  }))}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Eco Friendly</label>
                    <textarea
                  name="didYouKnow.ecoFriendly"
                  value={formData.didYouKnow.ecoFriendly || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    didYouKnow: { ...prev.didYouKnow, ecoFriendly: e.target.value }
                  }))}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Unique Features</label>
                    <textarea
                  name="didYouKnow.uniqueFeatures"
                  value={formData.didYouKnow.uniqueFeatures || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    didYouKnow: { ...prev.didYouKnow, uniqueFeatures: e.target.value }
                  }))}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

          {/* File Uploads */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-800 text-center">File Uploads</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Additional Images</label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-600 mb-1 text-center">Current Images:</h4>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((image, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img src={image} alt={`Existing ${index + 1}`} className="w-20 h-20 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
            </div>
                    ))}
          </div>
                </div>
              )}

              {/* Upload New Images */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
                />
                {isUploading && (
                  <div className="mt-2 text-sm text-gray-600">Uploading images...</div>
                )}
                {imagePreviews.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-xs font-medium text-gray-600 mb-1 text-center">New Images:</h4>
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img src={preview} alt={`New Preview ${index}`} className="w-20 h-20 object-cover rounded border-2 border-pink-200" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Main Image</label>
              
              {/* Existing Main Image */}
              {existingMainImage && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-600 mb-1 text-center">Current Main Image:</h4>
                  <div className="relative inline-block">
                    <img src={existingMainImage} alt="Current Main Image" className="w-32 h-32 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={removeExistingMainImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload New Main Image */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Check file size (100MB = 100 * 1024 * 1024 bytes)
                      const maxSize = 100 * 1024 * 1024; // 100MB
                      if (file.size > maxSize) {
                        alert(`File size too large. Maximum allowed size is 100MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
                        e.target.value = ''; // Clear the input
                        return;
                      }
                      setMainImageFile(file);
                      // Clear existing main image when new one is selected
                      setExistingMainImage('');
                      setFormData({ ...formData, mainImage: '' });
                    } else {
                      setMainImageFile(null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                {mainImageFile && (
                  <div className="mt-2">
                    <h4 className="text-xs font-medium text-gray-600 mb-1">New Main Image:</h4>
                    <div className="relative inline-block">
                      <img src={URL.createObjectURL(mainImageFile)} alt="New Main Image Preview" className="w-32 h-32 object-cover rounded border-2 border-pink-200" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 text-center">PDF File</label>
              
              {/* Existing PDF */}
              {existingPdf && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-600 mb-1 text-center">Current PDF:</h4>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                    <FileText className="w-8 h-8 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Product PDF</p>
                      <p className="text-xs text-gray-500">Click to view/download</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={existingPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        onClick={removeExistingPdf}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload New PDF */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                {pdfFile && (
                  <div className="mt-2">
                    <h4 className="text-xs font-medium text-gray-600 mb-1">New PDF:</h4>
                    <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg border-2 border-pink-200">
                      <File className="w-8 h-8 text-pink-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                        <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video File */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 text-center">Product Video</label>
              {/* Existing Video */}
              {existingVideo && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-600 mb-1 text-center">Current Video:</h4>
                  <video src={existingVideo} controls className="w-full rounded-lg border" />
                </div>
              )}
              {/* Upload New Video */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                {videoFile && (
                  <div className="mt-2">
                    <h4 className="text-xs font-medium text-gray-600 mb-1">New Video:</h4>
                    <div className="bg-pink-50 rounded-lg border-2 border-pink-200 p-2 text-xs text-gray-700">
                      {videoFile.name} • {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </form>
        </div>
        
        {/* Back to Top Button */}
        <BackToTop threshold={200} />
      </div>
    </div>
  );
};

const Products: React.FC = () => {
  const { formatCurrency, currencySettings } = useCurrency();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingCategoryCounts, setRefreshingCategoryCounts] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Load products and revenue
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getAllProducts();
      setProducts(data || []);
      
      // Load revenue from orders
      const orderStats = await OrderService.getOrderStats();
      setTotalRevenue(orderStats?.totalRevenue || 0);
      } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh products
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  // Refresh category counts
  const handleRefreshCategoryCounts = async () => {
    setRefreshingCategoryCounts(true);
    try {
      const { CategoryService } = await import('../../services/supabaseService');
      await CategoryService.refreshCategoryCounts();
      console.log('Category counts refreshed manually');
      
      // Also trigger a refresh in the CategoryContext if available
      window.dispatchEvent(new CustomEvent('categoryCountsUpdated'));
      
      alert('Category counts refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing category counts:', error);
      alert('Error refreshing category counts. Please try again.');
    } finally {
      setRefreshingCategoryCounts(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await ProductService.deleteProduct(productId);
        await loadProducts();
        
      // Refresh category counts to reflect the deleted product
      try {
        const { CategoryService } = await import('../../services/supabaseService');
        await CategoryService.refreshCategoryCounts();
        console.log('Category counts refreshed after product deletion');
        
        // Also trigger a refresh in the CategoryContext if available
        // Note: We can't use hooks here, but we can dispatch a custom event
        window.dispatchEvent(new CustomEvent('categoryCountsUpdated'));
      } catch (error) {
        console.error('Error refreshing category counts:', error);
      }
    } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Bulk delete products
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        await Promise.all(selectedProducts.map(id => ProductService.deleteProduct(id)));
      setSelectedProducts([]);
        await loadProducts();
        
        // Refresh category counts to reflect the deleted products
        try {
          const { CategoryService } = await import('../../services/supabaseService');
          await CategoryService.refreshCategoryCounts();
          console.log('Category counts refreshed after bulk product deletion');
        } catch (error) {
          console.error('Error refreshing category counts:', error);
        }
    } catch (error) {
        console.error('Error deleting products:', error);
      }
    }
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'export') {
      setShowExportModal(true);
    }
  };

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { CategoryService } = await import('../../services/supabaseService');
        const data = await CategoryService.getAllCategories();
        setCategories(data || []);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
  };
    loadCategories();
  }, []);

  // Handle edit product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // Handle duplicate product
  const handleDuplicateProduct = async (product: any) => {
    try {
      // Create a copy of the product with modified title and clear ID
      const duplicatedProductData = {
        title: `${product.title} (Copy)`,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage,
        categories: product.categories || (product.category ? [product.category] : []),
        tags: product.tags,
        status: product.status,
        featured: product.featured,
        productType: product.productType,
        posterSize: product.posterSize,
        posterPricing: product.posterPricing,
        images: [], // Clear all images for duplicate
        main_image: '', // Clear main image for duplicate
        pdf_url: '', // Clear PDF for duplicate
        itemDetails: product.itemDetails,
        delivery: product.delivery,
        didYouKnow: product.didYouKnow
      };

      // Create the duplicate product
      const newProduct = await ProductService.createProduct(duplicatedProductData);
      
      if (newProduct) {
        // Refresh the products list to show the new duplicate
        await loadProducts();
        alert('Product duplicated successfully!');
      }
    } catch (error) {
      console.error('Error duplicating product:', error);
      alert('Failed to duplicate product. Please try again.');
    }
  };

  // Create product function
  const createProduct = async (productData: any) => {
    try {
      console.log('Creating product with data:', productData);
      
      // Create the product first to get an ID
      const newProduct = await ProductService.createProduct({
        title: productData.title,
        description: productData.description,
        price: productData.price,
        originalPrice: productData.originalPrice,
        discountPercentage: productData.discountPercentage,
        categories: productData.categories,
        tags: productData.tags,
        status: productData.status,
        featured: productData.featured,
        productType: productData.productType,
        posterSize: productData.posterSize,
        posterPricing: productData.posterPricing,
        images: productData.images || [],
        itemDetails: productData.itemDetails,
        delivery: productData.delivery,
        didYouKnow: productData.didYouKnow
      });
      
      if (!newProduct || !newProduct.id) {
        throw new Error('Failed to create product');
      }
      
      let uploadedImages: string[] = [];
      
      // Upload new images if there are any new files
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        const imageOnlyFiles = productData.imageFiles.filter((f: File) => f && f.type && f.type.startsWith('image/'));
        if (imageOnlyFiles.length > 0) {
          uploadedImages = await ProductService.uploadProductImages(imageOnlyFiles, newProduct.id);
        }
      }

      // Handle main image upload
      let mainImageUrl = '';
      if (productData.mainImageFile) {
        const mainImageResult = await ImageUploadService.uploadMainImage(
          productData.mainImageFile,
          newProduct.id
        );
        if (mainImageResult.success && mainImageResult.url) {
          mainImageUrl = mainImageResult.url;
        }
      }

      // Handle PDF upload
      let pdfUrl = '';
      if (productData.pdfFile) {
        const pdfResult = await ImageUploadService.uploadPdf(
          productData.pdfFile,
          newProduct.id
        );
        if (pdfResult.success && pdfResult.url) {
          pdfUrl = pdfResult.url;
        }
      }

      // Handle Video upload
      let videoUrl = '';
      if (productData.videoFile) {
        const videoResult = await ImageUploadService.uploadVideo(
          productData.videoFile,
          newProduct.id
        );
        if (videoResult.success && videoResult.url) {
          videoUrl = videoResult.url;
        }
      }

      // Update the product with uploaded files
      const updatedProduct = {
        images: uploadedImages,
        main_image: mainImageUrl,
        pdf_url: pdfUrl,
        video_url: videoUrl
      };

      await ProductService.updateProduct(newProduct.id, updatedProduct);
      
      await loadProducts();
      
      // Refresh category counts to reflect the new product
      try {
        const { CategoryService } = await import('../../services/supabaseService');
        await CategoryService.refreshCategoryCounts();
        console.log('Category counts refreshed after product creation');
        
        // Also trigger a refresh in the CategoryContext if available
        // Note: We can't use hooks here, but we can dispatch a custom event
        window.dispatchEvent(new CustomEvent('categoryCountsUpdated'));
      } catch (error) {
        console.error('Error refreshing category counts:', error);
      }
      
      setShowCreateModal(false);
      alert('Product created successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Error creating product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Edit product function
  const editProduct = async (productData: any) => {
    try {
      console.log('Editing product with data:', productData);
      
      if (!productData.id) {
        throw new Error('Product ID is required for editing');
      }
      
      // Check if the product exists
      const existingProduct = await ProductService.getProductById(productData.id);
      if (!existingProduct) {
        throw new Error(`Product with ID ${productData.id} not found`);
      }
      
      let uploadedImages: string[] = [];
      
      // Upload new images if there are any new files
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        const imageOnlyFiles = productData.imageFiles.filter((f: File) => f && f.type && f.type.startsWith('image/'));
        if (imageOnlyFiles.length > 0) {
          uploadedImages = await ProductService.uploadProductImages(imageOnlyFiles, productData.id);
        } else {
          uploadedImages = [];
        }
      } else {
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

      // Handle Video upload
      let videoUrl = (existingProduct as any).video_url || '';
      if (productData.videoFile) {
        const videoResult = await ImageUploadService.uploadVideo(
          productData.videoFile,
          productData.id
        );
        if (videoResult.success && videoResult.url) {
          videoUrl = videoResult.url;
        }
      }

      const updatedProduct = {
        ...productData,
        images: uploadedImages,
        main_image: mainImageUrl,
        pdf_url: pdfUrl,
        video_url: videoUrl,
        updated_at: new Date().toISOString()
      };

      const result = await ProductService.updateProduct(productData.id, updatedProduct);
      
      if (result) {
        await loadProducts();
        
      // Refresh category counts to reflect the updated product
      try {
        const { CategoryService } = await import('../../services/supabaseService');
        await CategoryService.refreshCategoryCounts();
        console.log('Category counts refreshed after product update');
        
        // Also trigger a refresh in the CategoryContext if available
        // Note: We can't use hooks here, but we can dispatch a custom event
        window.dispatchEvent(new CustomEvent('categoryCountsUpdated'));
      } catch (error) {
        console.error('Error refreshing category counts:', error);
      }
        
        setShowEditModal(false);
        setEditingProduct(null);
        alert('Product updated successfully!');
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error editing product:', error);
      alert(`Error editing product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Clear selection
  const clearSelection = () => {
      setSelectedProducts([]);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

  // Get unique categories
  const uniqueCategories = [...new Set(products.map(p => p.category))];

  // Get product stats
  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    inactive: products.filter(p => p.status === 'inactive').length,
    featured: products.filter(p => p.featured).length,
    totalDownloads: products.reduce((sum, p) => sum + (p.downloads || 0), 0),
    totalFavorites: products.reduce((sum, p) => sum + (p.favoritesCount || 0), 0),
    totalRevenue: totalRevenue
  };

  return (
    <AdminLayout title="Products" noHeader={true}>
      {/* Secondary Navigation - Vertical Sidebar */}
      <ProductsSecondaryNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        productCounts={{
          total: stats.total,
          featured: stats.featured,
          trending: products.filter(p => p.rating >= 4.5).length
        }}
      />
      
      {/* Main Content with left margin for sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden ml-24">
        {activeTab === 'templates' ? (
          <TemplatesManagement onClose={() => {}} />
        ) : (
          <div className="p-6 space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Product Management</h2>
            <p className="text-sm text-gray-600">Manage your art gallery products</p>
            </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleRefreshCategoryCounts}
              disabled={refreshingCategoryCounts}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              title="Refresh category artwork counts"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingCategoryCounts ? 'animate-spin' : ''}`} />
              <span>Refresh Category Counts</span>
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-600" />
            <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-green-600" />
            <div>
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-lg font-bold text-gray-900">{stats.active}</p>
            </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-600" />
            <div>
                <p className="text-xs text-gray-500">Featured</p>
                <p className="text-lg font-bold text-gray-900">{stats.featured}</p>
            </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-purple-600" />
            <div>
                <p className="text-xs text-gray-500">Downloads</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalDownloads}</p>
            </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-pink-600" />
            <div>
                <p className="text-xs text-gray-500">Favorites</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalFavorites}</p>
            </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
            <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue, currencySettings.defaultCurrency)}</p>
            </div>
            </div>
            </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-pink-600" />
              <div>
                <p className="text-xs text-gray-500">Avg Rating</p>
                <p className="text-lg font-bold text-gray-900">{products.length > 0 ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1) : '0.0'}</p>
              </div>
              </div>
            </div>
          </div>

        {/* Compact Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm w-64"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
              <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            >
              <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
              <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            >
              <option value="created_date-desc">Newest First</option>
              <option value="created_date-asc">Oldest First</option>
              <option value="title-asc">Name A-Z</option>
              <option value="title-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="downloads-desc">Most Downloaded</option>
              </select>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
                <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>
            
        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-pink-800">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
              <button
                  onClick={clearSelection}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  Clear
              </button>
            <button
                  onClick={handleBulkDelete}
                  className="text-sm text-red-600 hover:text-red-700"
            >
                  Delete Selected
            </button>
        </div>
      </div>
          </div>
        )}

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading products...</span>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2'
          }>
                {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'p-4 flex items-center space-x-4' : 'p-4'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.main_image ? (
                            <img 
                              src={product.main_image} 
                            alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        </div>
                      <div className="flex items-center space-x-1">
                        {product.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status}
                      </span>
                      </div>
                            </div>
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                    <div className="mb-2">
                        {product.categories && product.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.categories.map((category: string, index: number) => (
                            <span 
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {category}
                      </span>
                          ))}
                      </div>
                      ) : product.category ? (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {product.category}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">No categories</span>
                        )}
                      </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{formatCurrency(product.price, currencySettings.defaultCurrency)}</span>
                      <div className="flex items-center space-x-3 text-gray-500">
                        <span>{product.downloads || 0} downloads</span>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{product.favoritesCount || 0}</span>
                        </div>
                      </div>
                      </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{product.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProduct(product)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
          </div>
                  </>
                ) : (
                  <>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.main_image ? (
                        <img 
                          src={product.main_image} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                        {product.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                    {product.status}
                  </span>
                </div>
                      <div className="mt-1">
                    {product.categories && product.categories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.categories.map((category: string, index: number) => (
                              <span 
                                key={index}
                                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                              >
                          {category}
                  </span>
                            ))}
                          </div>
                        ) : product.category ? (
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {product.category}
                      </span>
                        ) : (
                          <span className="text-sm text-gray-400">No categories</span>
                    )}
                  </div>
                </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(product.price, currencySettings.defaultCurrency)}</p>
                      <div className="flex items-center justify-end space-x-3 text-sm text-gray-500">
                        <span>{product.downloads || 0} downloads</span>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{product.favoritesCount || 0}</span>
                        </div>
                      </div>
                        </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                  </button>
                  <button
                        onClick={() => handleEditProduct(product)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                  >
                        <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                        onClick={() => handleDuplicateProduct(product)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Duplicate Product"
                  >
                        <Copy className="w-4 h-4" />
                  </button>
                  <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                  </>
          )}
            </div>
          ))}
            </div>
          )}

        {/* Pagination */}
        {filteredProducts.length > itemsPerPage && (
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === pageNum
                            ? 'bg-pink-600 text-white border-pink-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
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

        {/* Create Product Modal */}
        {showCreateModal && (
          <ProductModal
            title="Create Product"
            product={null}
            categories={categories}
            onSubmit={createProduct}
            onClose={() => {
              setShowCreateModal(false);
            }}
          />
        )}

        {/* Export Products Modal */}
        {showExportModal && (
          <ProductExport
            products={products}
            onClose={() => {
              setShowExportModal(false);
              setActiveTab('all');
            }}
          />
        )}
                    </div>
                    )}
                  </div>
    </AdminLayout>
  );
};

export default Products;
