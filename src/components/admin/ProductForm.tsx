import React, { useState, useEffect } from 'react';
import { 
  Save, X, Upload, Image as ImageIcon, Trash2,
  Package, Truck, Info, Heart, Leaf, Sparkles, FileText, Zap,
  Minus, Edit3, Check
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { templateService } from '../../services/templateService';
import { categoryService } from '../../services/categoryService';
import { ImageUploadService } from '../../services/imageUploadService';
import { generateTagsFromCategories } from '../../services/tagGenerationService';

interface ProductFormProps {
  product?: any;
  onSubmit: (product: any) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, mode }) => {
  const { currentCurrency, formatAdminPrice, getCurrency, convertAmount } = useCurrency();
  
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

  // Convert existing prices to new currency (if currency changes)
  const convertPricesToCurrency = (prices: Record<string, number>, fromCurrency: string, toCurrency: string) => {
    const convertedPrices: Record<string, number> = {};
    Object.entries(prices).forEach(([size, price]) => {
      convertedPrices[size] = Math.round(convertAmount(price, fromCurrency, toCurrency));
    });
    return convertedPrices;
  };

  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [editingSizeId, setEditingSizeId] = useState<string | null>(null);
  const [editingSizeName, setEditingSizeName] = useState<string>('');
  
  // Available poster sizes with their labels
  const availablePosterSizes: Record<string, string> = {
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

  // Load templates from database
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const data = await templateService.getAllTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };
    
    loadTemplates();
  }, []);

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
    images: string[];
    mainImage: string;
    pdfUrl: string;
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
    categories: product?.categories || (product?.category ? [product.category] : []),
    description: product?.description || '',
    tags: product?.tags?.join(', ') || '',
    status: (product?.status as 'active' | 'inactive' | 'draft') || 'active',
    featured: product?.featured || false,
    productType: product?.productType || 'digital',
    posterSize: product?.posterSize || 'A4',
    posterPricing: product?.posterPricing || {},
    originalPosterPricing: product?.posterPricing || {},
    images: product?.images || [],
    mainImage: product?.main_image || '',
    pdfUrl: product?.pdf_url || '',
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

  // Debug logging for categories (can be removed in production)
  // console.log('🔍 ProductForm Debug:', {
  //   mode,
  //   productTitle: product?.title,
  //   productCategory: product?.category, // Old single category field
  //   productCategories: product?.categories, // New categories array field
  //   productCategoriesType: typeof product?.categories,
  //   productCategoriesIsArray: Array.isArray(product?.categories),
  //   formDataCategories: formData.categories,
  //   resolvedCategories: product?.categories || (product?.category ? [product.category] : [])
  // });

  const [hasDiscount, setHasDiscount] = useState<boolean>(Boolean(product?.originalPrice && product?.discountPercentage));

  const [imagePreview, setImagePreview] = useState<string[]>(product?.images || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // Main image and PDF upload states
  const [mainImagePreview, setMainImagePreview] = useState<string>(product?.main_image || '');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string>(product?.pdf_url || '');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls: string[] = [];
      const newFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Upload to product-images bucket
          const result = await ImageUploadService.uploadFile(file, 'product-images', 'product-images');
          if (result.success && result.url) {
            urls.push(result.url);
            newFiles.push(file);
            console.log('Product image uploaded successfully:', result.url);
          } else {
            console.error('Failed to upload product image:', result.error);
            // Fallback to local preview
            const url = URL.createObjectURL(file);
            urls.push(url);
            newFiles.push(file);
          }
        } catch (error) {
          console.error('Error uploading product image:', error);
          // Fallback to local preview
          const url = URL.createObjectURL(file);
          urls.push(url);
          newFiles.push(file);
        }
      }
      
      setImagePreview([...imagePreview, ...urls]);
      setImageFiles([...imageFiles, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImagePreview(newPreviews);
    setImageFiles(newFiles);
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (100MB = 100 * 1024 * 1024 bytes)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        alert(`File size too large. Maximum allowed size is 100MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
        e.target.value = ''; // Clear the input
        return;
      }

      try {
        // Upload to main-images bucket with product-specific folder
        const result = await ImageUploadService.uploadMainImage(file, 'main-images');
        if (result.success && result.url) {
          setMainImagePreview(result.url);
          setMainImageFile(file);
          // Update form data to reflect the new main image
          setFormData({ ...formData, mainImage: result.url });
          console.log('Main image uploaded successfully:', result.url);
        } else {
          console.error('Failed to upload main image:', result.error);
          // Fallback to local preview
          const url = URL.createObjectURL(file);
          setMainImagePreview(url);
          setMainImageFile(file);
          // Update form data with local preview URL
          setFormData({ ...formData, mainImage: url });
        }
      } catch (error) {
        console.error('Error uploading main image:', error);
        // Fallback to local preview
        const url = URL.createObjectURL(file);
        setMainImagePreview(url);
        setMainImageFile(file);
        // Update form data with local preview URL
        setFormData({ ...formData, mainImage: url });
      }
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Upload to product-pdfs bucket
        const result = await ImageUploadService.uploadPdf(file, 'product-pdfs');
        if (result.success && result.url) {
          setPdfPreview(result.url);
          setPdfFile(file);
          console.log('PDF uploaded successfully:', result.url);
        } else {
          console.error('Failed to upload PDF:', result.error);
          // Fallback to local preview
          setPdfPreview(file.name);
          setPdfFile(file);
        }
      } catch (error) {
        console.error('Error uploading PDF:', error);
        // Fallback to local preview
        setPdfPreview(file.name);
        setPdfFile(file);
      }
    }
  };

  const removeMainImage = () => {
    setMainImagePreview('');
    setMainImageFile(null);
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfPreview('');
  };

     const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     // Validate required fields
     if (!formData.productType) {
       alert('Product type is required');
       return;
     }
     if (formData.categories.length === 0) {
       alert('Please select at least one category');
       return;
     }
     if (formData.productType === 'poster' && !formData.posterSize) {
       alert('Poster size is required for poster products');
       return;
     }
     
     const productData = {
       ...formData,
       images: imagePreview,
       imageFiles,
       mainImage: mainImagePreview,
       mainImageFile,
       pdfUrl: pdfPreview,
       pdfFile,
       productType: formData.productType,
       posterSize: formData.productType === 'poster' ? formData.posterSize : undefined,
       posterPricing: formData.productType === 'poster' ? formData.posterPricing : undefined,
       price: Math.round(parseFloat(formData.price.toString()) || 0),
       originalPrice: formData.originalPrice ? Math.round(parseFloat(formData.originalPrice.toString()) || 0) : undefined,
       discountPercentage: formData.discountPercentage ? Math.round(parseFloat(formData.discountPercentage.toString()) || 0) : undefined,
       tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
     };
     
     if (mode === 'edit' && product?.id) {
       (productData as any).id = product.id;
     }
     
     onSubmit(productData);
   };

  // Get all categories from the category service
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoryData = await categoryService.getAllCategories();
        const categoryNames = categoryData.map((cat: { name: string }) => cat.name);
        console.log('🔍 ProductForm Categories Loaded:', {
          categoryData: categoryData.length,
          categoryNames,
          firstCategory: categoryData[0]
        });
        setCategories(categoryNames);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories if service fails
        setCategories([
          'Digital Art', 'Abstract', 'Nature', 'Portraits', 'Minimalist', 'Vintage/Retro',
          'Animals', 'Cars', 'Super-Heroes', 'Floral', 'Forest', 'Futuristic', 'City Maps',
          'Multi-Planetary', 'Music', 'Paintings', 'Scenic', 'Technology', 'World Cities',
          'Watercolor', 'Oil Painting Style', 'Sketch & Line Art', 'Pop Art', 'Surreal',
          'Geometric', 'Grunge', 'Photorealistic'
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);

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

    // Product templates for quick creation
  const productTemplates = templates;

  return (
         <div className="bg-white rounded-xl shadow-sm border border-pink-50 p-4">
       {/* Header */}
       <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'create' ? 'Create New Product' : 'Edit Product'}
          </h2>
          <p className="text-gray-600 mt-1">
            {mode === 'create' ? 'Add a new product to your catalog' : 'Update product information'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{mode === 'create' ? 'Create Product' : 'Update Product'}</span>
          </button>
        </div>
             </div>

               {/* Template Selection */}
        {mode === 'create' ? (
          <div className="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">Product Templates</h3>
                <span className="ml-2 text-xs text-gray-500">(Click to apply)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: '',
                    price: '',
                    originalPrice: '',
                    discountPercentage: 0,
                    categories: [],
                    description: '',
                    tags: '',
                    status: 'active',
                    featured: false,
                    productType: 'digital',
                    posterSize: 'A4',
                    posterPricing: getDefaultPosterPricing(),
                    originalPosterPricing: getDefaultPosterPricing(),
                    images: [],
                    mainImage: '',
                    pdfUrl: '',
                    itemDetails: {
                      material: 'Premium canvas',
                      size: '24" x 36" (61cm x 91cm)',
                      frame: 'Solid wood, natural finish',
                      style: 'Contemporary landscape',
                      origin: 'Handcrafted in India'
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
                  });
                  setHasDiscount(false);
                  setImagePreview([]);
                  setImageFiles([]);
                  setMainImagePreview('');
                  setMainImageFile(null);
                  setPdfFile(null);
                  setPdfPreview('');
                }}
                className="flex items-center px-3 py-1.5 text-xs border border-pink-200 text-pink-600 hover:bg-pink-100 rounded-md transition-colors"
              >
                <FileText className="w-3 h-3 mr-1" />
                <span>Clear</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {loadingTemplates ? (
                <div className="col-span-full text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-xs">Loading...</p>
                </div>
              ) : productTemplates.length === 0 ? (
                <div className="col-span-full text-center py-4">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-xs">No templates available</p>
                </div>
              ) : (
                productTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    const newCategories = [template.data.category];
                    setFormData({
                      ...formData,
                      title: template.data.title,
                      categories: newCategories,
                      price: template.data.price,
                      description: template.data.description,
                      tags: template.data.tags || generateTagsFromCategories(newCategories),
                      itemDetails: template.data.itemDetails,
                      delivery: template.data.delivery,
                      didYouKnow: template.data.didYouKnow
                    });
                  }}
                  className="p-3 bg-white border border-dashed border-pink-200 rounded-lg hover:border-pink-400 hover:bg-pink-50 hover:shadow-sm transition-all duration-200 text-center group"
                  title={`${template.name} - ${template.description}`}
                >
                  <div className="text-2xl mb-1">{template.icon}</div>
                  <h4 className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors text-xs mb-1 leading-tight">
                    {template.name.replace(' Template', '')}
                  </h4>
                  <div className="text-xs text-gray-500">
                    <div className="font-medium">{template.data.category}</div>
                    <div className="text-pink-600">{formatAdminPrice(template.data.price)}</div>
                  </div>
                </button>
                ))
              )}
            </div>
            
            <div className="mt-3 p-2 bg-pink-100 rounded-md">
              <p className="text-xs text-pink-800 text-center">
                💡 <strong>Pro Tip:</strong> Click any template to auto-fill all fields, then customize as needed!
              </p>
            </div>
          </div>
       ) : (
         /* Show available templates info for edit mode */
         <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
           <div className="flex items-center">
             <FileText className="w-5 h-5 mr-2 text-blue-600" />
             <div>
               <h3 className="text-sm font-medium text-blue-800">Product Templates Available</h3>
               <p className="text-xs text-blue-600 mt-1">
                 Switch to "Create Product" mode to use our curated templates for quick product creation
               </p>
             </div>
           </div>
         </div>
       )}
 
              <form onSubmit={handleSubmit} className="space-y-6">
         {/* Basic Information */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Enter product title"
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
              <span>Categories *</span>
              {!loadingCategories && categories.length > 0 && (
                <span className="text-xs text-gray-500 font-normal">
                  {formData.categories.length} of {categories.length} selected
                </span>
              )}
            </label>
            {loadingCategories ? (
              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Loading categories from database...</p>
              </div>
            ) : (
              <div className="w-full border border-gray-200 rounded-lg p-3">
                {categories.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No categories available
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center space-x-1 p-2 hover:bg-gray-50 cursor-pointer rounded border border-gray-100 hover:border-pink-200 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={(e) => {
                            let newCategories: string[];
                            if (e.target.checked) {
                              newCategories = [...formData.categories, category];
                            } else {
                              newCategories = formData.categories.filter(c => c !== category);
                            }
                            
                            // Auto-fill tags based on selected categories
                            const autoGeneratedTags = generateTagsFromCategories(newCategories);
                            console.log('Selected categories:', newCategories);
                            console.log('Generated tags:', autoGeneratedTags);
                            console.log('Current formData.tags before update:', formData.tags);
                            
                            const newFormData = {
                              ...formData,
                              categories: newCategories,
                              tags: autoGeneratedTags
                            };
                            console.log('New formData.tags after update:', newFormData.tags);
                            
                            setFormData(newFormData);
                          }}
                          className="h-3 w-3 text-pink-600 focus:ring-pink-500 border-gray-300 rounded flex-shrink-0"
                        />
                        <span className="text-xs text-gray-700 truncate" title={category}>
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                      
                      <div className="flex items-center space-x-2">
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
                        {hasDiscount && Number(formData.discountPercentage) > 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            {Math.round(price * (1 - Number(formData.discountPercentage) / 100))}
                          </div>
                        )}
                      </div>
                      
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {hasDiscount ? 'Discounted Price' : 'Price'} ({getCurrency(currentCurrency)?.symbol || '$'}) *
            </label>
                         <p className="text-xs text-gray-500 mb-1">Enter price in {currentCurrency}</p>
                             <input
                   type="number"
                   step="1"
                   value={Math.round(parseFloat(formData.price.toString()) || 0)}
                   onChange={(e) => {
                     const newPrice = Math.round(parseFloat(e.target.value) || 0);
                     if (hasDiscount && Number(formData.originalPrice) > 0) {
                       // Recalculate discount percentage when discounted price changes
                       const newDiscountPercentage = ((Number(formData.originalPrice) - newPrice) / Number(formData.originalPrice)) * 100;
                       setFormData({ 
                         ...formData, 
                         price: newPrice,
                         discountPercentage: Math.max(0, newDiscountPercentage)
                       });
                     } else {
                       setFormData({ ...formData, price: newPrice });
                     }
                   }}
                   className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                   placeholder="0"
                   required
                 />
                 {formData.price && parseFloat(formData.price.toString()) > 0 && (
                   <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                     <p className="text-xs text-blue-800">
                                               <strong>Preview in {currentCurrency}:</strong> {formatAdminPrice(parseFloat(formData.price.toString()))}
                     </p>
                     {hasDiscount && Number(formData.originalPrice) > 0 && (
                       <p className="text-xs text-orange-600 mt-1">
                         <strong>Note:</strong> This is the discounted price. Original price: {formatAdminPrice(Number(formData.originalPrice))}
                       </p>
                     )}
                   </div>
                 )}
          </div>

                 {/* Discount Section */}
         <div className="border-t border-gray-200 pt-4">
           <div className="flex items-center mb-3">
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
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price ({getCurrency(currentCurrency)?.symbol || '$'})
                </label>
                <p className="text-xs text-gray-500 mb-1">Enter in {currentCurrency}</p>
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
                   className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                   placeholder="0"
                 />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage (%)
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
                         price: discountedPrice,
                         posterPricing: updatedPosterPricing
                       });
                     } else {
                       setFormData({
                         ...formData,
                         discountPercentage: discount
                       });
                     }
                   }}
                   className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                   placeholder="0"
                 />
                 {Number(formData.discountPercentage) > 0 && Number(formData.originalPrice) > 0 && (
                   <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                     <p className="text-xs text-green-700">
                       <strong>Calculated Discounted Price:</strong> {formatAdminPrice(Math.round(Number(formData.originalPrice) * (1 - Number(formData.discountPercentage) / 100)))}
                     </p>
                     <p className="text-xs text-green-600 mt-1">
                       You save: {formatAdminPrice(Math.round(Number(formData.originalPrice) - Number(formData.price)))}
                     </p>
                   </div>
                 )}
               </div>
             </div>
           )}
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
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

                 {/* Description and Tags */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
                         <textarea
               value={formData.description}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               rows={3}
               className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
               placeholder="Enter product description"
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>
        </div>

                 {/* Images Section */}
         <div className="border-t border-gray-200 pt-4">
           <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-800">Product Images</h3>
            <label className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Upload Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {imagePreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreview.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {imagePreview.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No images uploaded yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload product images to showcase your artwork</p>
            </div>
          )}
        </div>

                 {/* Main Image & PDF Section */}
         <div className="border-t border-gray-200 pt-4">
           <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
             <Package className="w-5 h-5 mr-2" />
             Main Image & PDF (For Email & Profile)
           </h3>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Main Image Upload */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Main Product Image *
               </label>
               <p className="text-xs text-gray-500 mb-3">
                 This image will be used in order emails and customer profiles
               </p>
               
               {mainImagePreview ? (
                 <div className="relative group">
                   <img
                     src={mainImagePreview}
                     alt="Main product preview"
                     className="w-full h-48 object-cover rounded-lg border border-gray-200"
                   />
                   <button
                     type="button"
                     onClick={removeMainImage}
                     className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               ) : (
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                   <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                   <p className="text-gray-500 text-sm mb-3">No main image selected</p>
                   <label className="flex items-center justify-center space-x-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg cursor-pointer transition-colors">
                     <Upload className="w-4 h-4" />
                     <span>Upload Main Image</span>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handleMainImageUpload}
                       className="hidden"
                     />
                   </label>
                 </div>
               )}
             </div>

             {/* PDF Upload */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Product PDF *
               </label>
               <p className="text-xs text-gray-500 mb-3">
                 This PDF will be sent via email and available in customer profiles
               </p>
               
               {pdfPreview ? (
                 <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                         <FileText className="w-5 h-5 text-red-600" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-gray-800">{pdfPreview}</p>
                         <p className="text-xs text-gray-500">PDF Document</p>
                       </div>
                     </div>
                     <button
                       type="button"
                       onClick={removePdf}
                       className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                   <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                   <p className="text-gray-500 text-sm mb-3">No PDF uploaded</p>
                   <label className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors">
                     <Upload className="w-4 h-4" />
                     <span>Upload PDF</span>
                     <input
                       type="file"
                       accept=".pdf"
                       onChange={handlePdfUpload}
                       className="hidden"
                     />
                   </label>
                 </div>
               )}
             </div>
           </div>
           
           <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
             <div className="flex items-start space-x-2">
               <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
               <div className="text-sm text-blue-800">
                 <p className="font-medium mb-1">Important:</p>
                 <ul className="text-xs space-y-1">
                   <li>• Main image is used in order confirmation emails</li>
                   <li>• PDF is automatically sent to customers after purchase</li>
                   <li>• Both files are accessible in customer order history</li>
                 </ul>
               </div>
             </div>
           </div>
         </div>

                 {/* Item Details */}
         <div className="border-t border-gray-200 pt-4">
           <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
             <Package className="w-5 h-5 mr-2" />
             Item Details
           </h3>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
              <input
                type="text"
                value={formData.itemDetails.material}
                onChange={(e) => setFormData({
                  ...formData,
                  itemDetails: { ...formData.itemDetails, material: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="e.g., Premium canvas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <input
                type="text"
                value={formData.itemDetails.size}
                onChange={(e) => setFormData({
                  ...formData,
                  itemDetails: { ...formData.itemDetails, size: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="e.g., 24&quot; x 36&quot;"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frame</label>
              <input
                type="text"
                value={formData.itemDetails.frame}
                onChange={(e) => setFormData({
                  ...formData,
                  itemDetails: { ...formData.itemDetails, frame: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="e.g., Solid wood"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
              <input
                type="text"
                value={formData.itemDetails.style}
                onChange={(e) => setFormData({
                  ...formData,
                  itemDetails: { ...formData.itemDetails, style: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="e.g., Contemporary"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
              <input
                type="text"
                value={formData.itemDetails.origin}
                onChange={(e) => setFormData({
                  ...formData,
                  itemDetails: { ...formData.itemDetails, origin: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="e.g., Handcrafted in India"
              />
            </div>
          </div>
        </div>

                 {/* Delivery Information */}
         <div className="border-t border-gray-200 pt-4">
           <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
             <Truck className="w-5 h-5 mr-2" />
             Delivery Information
           </h3>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Standard Delivery</label>
                             <textarea
                 value={formData.delivery.standardDelivery}
                 onChange={(e) => setFormData({
                   ...formData,
                   delivery: { ...formData.delivery, standardDelivery: e.target.value }
                 })}
                 rows={2}
                 className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                 placeholder="Standard delivery details"
               />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Express Delivery</label>
                             <textarea
                 value={formData.delivery.expressDelivery}
                 onChange={(e) => setFormData({
                   ...formData,
                   delivery: { ...formData.delivery, expressDelivery: e.target.value }
                 })}
                 rows={2}
                 className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                 placeholder="Express delivery details"
               />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Same Day Delivery</label>
                             <textarea
                 value={formData.delivery.sameDayDelivery}
                 onChange={(e) => setFormData({
                   ...formData,
                   delivery: { ...formData.delivery, sameDayDelivery: e.target.value }
                 })}
                 rows={2}
                 className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                 placeholder="Same day delivery details"
               />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Info</label>
              <textarea
                value={formData.delivery.additionalInfo}
                onChange={(e) => setFormData({
                  ...formData,
                  delivery: { ...formData.delivery, additionalInfo: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="Additional delivery information"
              />
            </div>
          </div>
        </div>

                 {/* Did You Know Section */}
         <div className="border-t border-gray-200 pt-4">
           <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
             <Info className="w-5 h-5 mr-2" />
             Did You Know
           </h3>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Artist Story
              </label>
              <textarea
                value={formData.didYouKnow.artistStory}
                onChange={(e) => setFormData({
                  ...formData,
                  didYouKnow: { ...formData.didYouKnow, artistStory: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="Tell the story behind this artwork"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Leaf className="w-4 h-4 mr-2" />
                Eco-Friendly Features
              </label>
              <textarea
                value={formData.didYouKnow.ecoFriendly}
                onChange={(e) => setFormData({
                  ...formData,
                  didYouKnow: { ...formData.didYouKnow, ecoFriendly: e.target.value }
                })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="Describe eco-friendly aspects"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Unique Features
              </label>
              <textarea
                value={formData.didYouKnow.uniqueFeatures}
                onChange={(e) => setFormData({
                  ...formData,
                  didYouKnow: { ...formData.didYouKnow, uniqueFeatures: e.target.value }
                })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="Highlight unique features of this artwork"
              />
            </div>
          </div>
        </div>

                 {/* Additional Options */}
         <div className="border-t border-gray-200 pt-4">
           <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>

                 {/* Action Buttons */}
         <div className="border-t border-gray-200 pt-4 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
          >
            {mode === 'create' ? 'Create Product' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
