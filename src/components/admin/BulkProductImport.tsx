import React, { useState, useRef } from 'react';
import { 
  Upload, Download, FileText, CheckCircle, AlertCircle, 
  X, Trash2, Eye, AlertTriangle, Info, Loader2, Settings,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Zap, Shield, Database
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ProductImportData {
  title: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  description: string;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  images: string[]; // Changed from single image to array of images
  itemDetails?: {
    material: string;
    size: string;
    frame: string;
    style: string;
    origin: string;
  };
  delivery?: {
    standardDelivery: string;
    expressDelivery: string;
    sameDayDelivery: string;
    additionalInfo: string;
  };
  didYouKnow?: {
    artistStory: string;
    ecoFriendly: string;
    uniqueFeatures: string;
  };
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ImportSettings {
  skipDuplicates: boolean;
  updateExisting: boolean;
  defaultStatus: 'active' | 'inactive' | 'draft';
  defaultFeatured: boolean;
  validateImages: boolean;
  autoGenerateIds: boolean;
}

interface BulkProductImportProps {
  onImport: (products: ProductImportData[]) => void;
  onClose: () => void;
}

const BulkProductImport: React.FC<BulkProductImportProps> = ({ onImport, onClose }) => {
  const { currentCurrency, getCurrencySymbol } = useCurrency();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProductImportData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'settings' | 'validate' | 'review' | 'importing' | 'complete'>('upload');
  const [importProgress, setImportProgress] = useState(0);
  const [currentImportingProduct, setCurrentImportingProduct] = useState<string>('');
  const [importSettings, setImportSettings] = useState<ImportSettings>({
    skipDuplicates: true,
    updateExisting: false,
    defaultStatus: 'active',
    defaultFeatured: false,
    validateImages: true,
    autoGenerateIds: true
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [duplicateProducts, setDuplicateProducts] = useState<ProductImportData[]>([]);
  const [importResults, setImportResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

    const downloadTemplate = () => {
    const csvContent = `title,price,originalPrice,discountPercentage,category,description,tags,status,featured,images,material,size,frame,style,origin,standardDelivery,expressDelivery,sameDayDelivery,additionalInfo,artistStory,ecoFriendly,uniqueFeatures
 "Ethereal Dreams",29.99,39.99,25,"Abstract","A mesmerizing abstract piece that captures the essence of dreams and imagination","digital,abstract,colorful",active,true,"https://example.com/image1.jpg;https://example.com/image1_detail.jpg;https://example.com/image1_angle.jpg","Premium canvas","24\" x 36\" (61cm x 91cm)","Solid wood, natural finish","Contemporary landscape","Handcrafted in India","Free Standard Delivery\n5-7 business days","Express Delivery\n2-3 business days • ₹150","Same Day Delivery\nAvailable in select cities • ₹300","📦 All orders include tracking and insurance. Returns accepted within 30 days.","This piece was inspired by the artist's journey through the Himalayas, capturing the first light of dawn breaking over snow-capped peaks.","Made with sustainable materials and eco-friendly paints. Each piece helps support local artisan communities.","Every artwork is one-of-a-kind with subtle variations that make it truly unique. Perfect for art collectors and interior designers."
 "Majestic Wolf",34.99,,"Animals","A powerful wildlife portrait that captures the spirit of the wilderness","wildlife,nature,portrait",active,false,"https://example.com/image2.jpg;https://example.com/image2_detail.jpg","Premium canvas","30\" x 40\" (76cm x 102cm)","Solid wood, natural finish","Wildlife realism","Handcrafted in India","Free Standard Delivery\n5-7 business days","Express Delivery\n2-3 business days • ₹150","Same Day Delivery\nAvailable in select cities • ₹300","📦 All orders include tracking and insurance. Returns accepted within 30 days.","This piece was inspired by the artist's encounter with a majestic wolf in the wilderness, capturing the raw beauty and power of nature.","Made with sustainable materials and eco-friendly paints. Each piece helps support local artisan communities.","Every artwork is one-of-a-kind with subtle variations that make it truly unique. Perfect for art collectors and interior designers."
 "Vintage Sports Car",39.99,49.99,20,"Cars","A stunning vintage automobile that celebrates automotive history","vintage,automotive,classic",draft,false,"https://example.com/image3.jpg;https://example.com/image3_detail.jpg;https://example.com/image3_angle.jpg","Premium canvas","28\" x 42\" (71cm x 107cm)","Solid wood, natural finish","Vintage automotive","Handcrafted in India","Free Standard Delivery\n5-7 business days","Express Delivery\n2-3 business days • ₹150","Same Day Delivery\nAvailable in select cities • ₹300","📦 All orders include tracking and insurance. Returns accepted within 30 days.","This piece was inspired by the artist's passion for classic automobiles, capturing the elegance and craftsmanship of vintage sports cars.","Made with sustainable materials and eco-friendly paints. Each piece helps support local artisan communities.","Every artwork is one-of-a-kind with subtle variations that make it truly unique. Perfect for art collectors and interior designers."`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data: ProductImportData[] = [];
      const errors: ValidationError[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const rowData: any = {};
          
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });

          // Validate and transform data
          const validationResult = validateRow(rowData, i + 1);
          if (validationResult.errors.length > 0) {
            errors.push(...validationResult.errors);
          } else {
            data.push(validationResult.data);
          }
        }
      }

      setParsedData(data);
      setValidationErrors(errors);
      
      // Detect duplicates
      const duplicates = detectDuplicates(data);
      setDuplicateProducts(duplicates);
      
      setCurrentStep('validate');
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateRow = (rowData: any, rowNumber: number): { data: ProductImportData; errors: ValidationError[] } => {
    const errors: ValidationError[] = [];
    const data: ProductImportData = {
      title: rowData.title || '',
      price: 0,
      category: rowData.category || '',
      description: rowData.description || '',
      tags: rowData.tags ? rowData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
      status: 'active',
      featured: false,
              images: rowData.images ? rowData.images.split(';').map((img: string) => img.trim()).filter(Boolean) : [], // Parse multiple images separated by semicolons
      itemDetails: {
        material: rowData.material || 'Premium canvas',
        size: rowData.size || '24" x 36" (61cm x 91cm)',
        frame: rowData.frame || 'Solid wood, natural finish',
        style: rowData.style || 'Contemporary landscape',
        origin: rowData.origin || 'Handcrafted in India'
      },
      delivery: {
        standardDelivery: rowData.standardDelivery || 'Free Standard Delivery\n5-7 business days',
        expressDelivery: rowData.expressDelivery || 'Express Delivery\n2-3 business days • ₹150',
        sameDayDelivery: rowData.sameDayDelivery || 'Same Day Delivery\nAvailable in select cities • ₹300',
        additionalInfo: rowData.additionalInfo || '📦 All orders include tracking and insurance. Returns accepted within 30 days.'
      },
      didYouKnow: {
        artistStory: rowData.artistStory || 'This piece was inspired by the artist\'s journey through the Himalayas, capturing the first light of dawn breaking over snow-capped peaks.',
        ecoFriendly: rowData.ecoFriendly || 'Made with sustainable materials and eco-friendly paints. Each piece helps support local artisan communities.',
        uniqueFeatures: rowData.uniqueFeatures || 'Every artwork is one-of-a-kind with subtle variations that make it truly unique. Perfect for art collectors and interior designers.'
      }
    };

    // Validate required fields
    if (!data.title.trim()) {
      errors.push({ row: rowNumber, field: 'title', message: 'Title is required', severity: 'error' });
    }
    if (!data.category.trim()) {
      errors.push({ row: rowNumber, field: 'category', message: 'Category is required', severity: 'error' });
    }

    // Validate price
    const price = parseFloat(rowData.price);
    if (isNaN(price) || price < 0) {
      errors.push({ row: rowNumber, field: 'price', message: 'Valid price is required', severity: 'error' });
    } else {
      data.price = price;
    }

    // Validate status
    if (rowData.status && !['active', 'inactive', 'draft'].includes(rowData.status)) {
      errors.push({ row: rowNumber, field: 'status', message: 'Status must be active, inactive, or draft', severity: 'error' });
    } else if (rowData.status) {
      data.status = rowData.status as 'active' | 'inactive' | 'draft';
    }

    // Validate featured
    if (rowData.featured !== undefined) {
      data.featured = rowData.featured === 'true' || rowData.featured === '1';
    }

    // Add warnings for optional fields
    if (!data.description.trim()) {
      errors.push({ row: rowNumber, field: 'description', message: 'Description is empty - consider adding product details', severity: 'warning' });
    }

    if (data.tags.length === 0) {
      errors.push({ row: rowNumber, field: 'tags', message: 'No tags provided - this may affect product discoverability', severity: 'warning' });
    }

    if (data.images.length === 0) {
      errors.push({ row: rowNumber, field: 'images', message: 'No image URLs provided - product will have no visual representation', severity: 'warning' });
    }

    // Price warnings
    if (data.price < 5) {
      errors.push({ row: rowNumber, field: 'price', message: 'Price seems very low - please verify', severity: 'warning' });
    }

    if (data.price > 1000) {
      errors.push({ row: rowNumber, field: 'price', message: 'Price seems very high - please verify', severity: 'warning' });
    }

    // Additional field warnings
    if (!rowData.material && !rowData.size && !rowData.frame) {
      errors.push({ row: rowNumber, field: 'itemDetails', message: 'No item details provided - consider adding material, size, and frame information', severity: 'warning' });
    }

    if (!rowData.standardDelivery && !rowData.expressDelivery) {
      errors.push({ row: rowNumber, field: 'delivery', message: 'No delivery information provided - consider adding delivery options', severity: 'warning' });
    }

    if (!rowData.artistStory && !rowData.ecoFriendly && !rowData.uniqueFeatures) {
      errors.push({ row: rowNumber, field: 'didYouKnow', message: 'No additional information provided - consider adding artist story, eco-friendly details, or unique features', severity: 'warning' });
    }

    return { data, errors };
  };

  const handleImport = async () => {
    if (validationErrors.filter(error => error.severity === 'error').length > 0) {
      alert('Please fix critical errors before importing');
      return;
    }

    setCurrentStep('importing');
    setImportProgress(0);

    try {
      // Import products using ProductService
      const { ProductService } = await import('../../services/supabaseService');
      
      // Update progress as we process
      setImportProgress(25);
      
      const results = await ProductService.bulkImportProducts(parsedData, {
        skipDuplicates: importSettings.skipDuplicates,
        updateExisting: importSettings.updateExisting,
        defaultStatus: importSettings.defaultStatus,
        defaultFeatured: importSettings.defaultFeatured
      });

      setImportProgress(100);

      // Success notification
      const successMessage = `Import completed! ${results.imported} imported, ${results.updated} updated, ${results.skipped} skipped.`;

      
      if (results.errors.length > 0) {
        console.warn('Some products had errors:', results.errors);
      }
      
      onImport(parsedData);
      setImportResults(results);
      setCurrentStep('complete');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
      setCurrentStep('review');
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetImport = () => {
    setUploadedFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setDuplicateProducts([]);
    setImportResults(null);
    setCurrentStep('upload');
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const detectDuplicates = (products: ProductImportData[]) => {
    const duplicates: ProductImportData[] = [];
    const seen = new Set<string>();
    
    products.forEach(product => {
      const normalizedTitle = product.title.toLowerCase().trim();
      if (seen.has(normalizedTitle)) {
        duplicates.push(product);
      } else {
        seen.add(normalizedTitle);
      }
    });
    
    return duplicates;
  };

  const getStepStatus = (step: string) => {
    if (step === 'upload') return currentStep === 'upload' ? 'current' : 'completed';
    if (step === 'settings') return currentStep === 'settings' ? 'current' : currentStep === 'validate' || currentStep === 'review' || currentStep === 'importing' || currentStep === 'complete' ? 'completed' : 'upcoming';
    if (step === 'validate') return currentStep === 'validate' ? 'current' : currentStep === 'review' || currentStep === 'importing' || currentStep === 'complete' ? 'completed' : 'upcoming';
    if (step === 'review') return currentStep === 'review' ? 'current' : currentStep === 'importing' || currentStep === 'complete' ? 'completed' : 'upcoming';
    if (step === 'importing') return currentStep === 'importing' ? 'current' : currentStep === 'complete' ? 'completed' : 'upcoming';
    if (step === 'complete') return currentStep === 'complete' ? 'current' : 'upcoming';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Bulk Product Import</h3>
            <p className="text-gray-600 mt-1">Import multiple products from a CSV file</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStep('settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
              title="Import Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {['upload', 'settings', 'validate', 'review', 'importing', 'complete'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  getStepStatus(step) === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  getStepStatus(step) === 'current' ? 'bg-pink-500 border-pink-500 text-white' :
                  'border-gray-300 text-gray-400'
                }`}>
                  {getStepStatus(step) === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  getStepStatus(step) === 'current' ? 'text-pink-600' :
                  getStepStatus(step) === 'completed' ? 'text-green-600' :
                  'text-gray-400'
                }`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                                 {index < 5 && (
                   <div className={`w-16 h-0.5 mx-4 ${
                     getStepStatus(step) === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                   }`} />
                 )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'upload' && (
            <div className="space-y-6">
              {/* Template Download */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">Download Template</h4>
                    <p className="text-blue-700 mb-4">
                      Use our CSV template to ensure your data is formatted correctly. 
                      The template includes sample data and all required fields.
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Template</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-800">Upload CSV File</h4>
                  {uploadedFile && (
                    <button
                      onClick={resetImport}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Start Over
                    </button>
                  )}
                </div>
                
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragging 
                      ? 'border-pink-400 bg-pink-50' 
                      : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-3">
                        <FileText className="w-12 h-12 text-green-500" />
                        <div className="text-left">
                          <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={removeFile}
                          className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentStep('settings')}
                          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                        >
                          Process File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto w-16 h-16 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Drop your CSV file here, or{' '}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-pink-600 hover:text-pink-500 font-medium"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Supports CSV files up to 10MB
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'settings' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Import Settings</h4>
                <p className="text-gray-600">
                  Configure how your products will be imported and handle any conflicts.
                </p>
              </div>

              {/* Basic Settings */}
              <div className="space-y-4">
                <h5 className="text-lg font-medium text-gray-800">Basic Settings</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={importSettings.skipDuplicates}
                        onChange={(e) => setImportSettings(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Skip duplicate products</span>
                    </label>
                    <p className="text-xs text-gray-500 ml-7">Automatically skip products with matching titles</p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={importSettings.updateExisting}
                        onChange={(e) => setImportSettings(prev => ({ ...prev, updateExisting: e.target.checked }))}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Update existing products</span>
                    </label>
                    <p className="text-xs text-gray-500 ml-7">Update products with matching titles instead of skipping</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Status</label>
                    <select
                      value={importSettings.defaultStatus}
                      onChange={(e) => setImportSettings(prev => ({ ...prev, defaultStatus: e.target.value as 'active' | 'inactive' | 'draft' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Featured</label>
                    <select
                      value={importSettings.defaultFeatured ? 'true' : 'false'}
                      onChange={(e) => setImportSettings(prev => ({ ...prev, defaultFeatured: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
                >
                  <span className="text-sm font-medium">Advanced Settings</span>
                  {showAdvancedSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvancedSettings && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={importSettings.validateImages}
                          onChange={(e) => setImportSettings(prev => ({ ...prev, validateImages: e.target.checked }))}
                          className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Validate image URLs</span>
                      </label>
                      <p className="text-xs text-gray-500 ml-7">Check if image URLs are accessible before import</p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={importSettings.autoGenerateIds}
                          onChange={(e) => setImportSettings(prev => ({ ...prev, autoGenerateIds: e.target.checked }))}
                          className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Auto-generate IDs</span>
                      </label>
                      <p className="text-xs text-gray-500 ml-7">Automatically generate unique IDs for new products</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('validate')}
                  className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                >
                  Continue to Validation
                </button>
              </div>
            </div>
          )}

          {currentStep === 'validate' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">Validation Results</h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {parsedData.length} products ready to import
                  </span>
                  {validationErrors.length > 0 && (
                    <span className="text-sm text-red-600">
                      {validationErrors.length} validation errors
                    </span>
                  )}
                </div>
              </div>

              {/* Duplicate Warning */}
              {duplicateProducts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h5 className="font-medium text-yellow-800">Duplicate Products Detected</h5>
                  </div>
                  <div className="text-sm text-yellow-700">
                    <p className="mb-2">
                      {duplicateProducts.length} duplicate product titles found in your CSV file. 
                      {importSettings.skipDuplicates ? ' These will be automatically skipped during import.' : ' Consider enabling duplicate skipping in settings.'}
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      {duplicateProducts.slice(0, 5).map((product, index) => (
                        <div key={index} className="text-yellow-800">
                          • {product.title}
                        </div>
                      ))}
                      {duplicateProducts.length > 5 && (
                        <div className="text-yellow-600 text-xs mt-1">
                          +{duplicateProducts.length - 5} more duplicates
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h5 className="font-medium text-red-800">Critical Errors</h5>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {validationErrors.filter(error => error.severity === 'error').map((error, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <span className="font-medium">Row {error.row}:</span> {error.field} - {error.message}
                        </div>
                      ))}
                    </div>
                  </div>

                  {validationErrors.filter(error => error.severity === 'warning').length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h5 className="font-medium text-yellow-800">Warnings</h5>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {validationErrors.filter(error => error.severity === 'warning').map((error, index) => (
                          <div key={index} className="text-sm text-yellow-700">
                            <span className="font-medium">Row {error.row}:</span> {error.field} - {error.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-medium text-gray-800 mb-3">Preview (First 3 products)</h5>
                <div className="space-y-3">
                  {parsedData.slice(0, 3).map((product, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                             <div className="flex items-center justify-between">
                         <div className="flex-1">
                           <p className="font-medium text-gray-800">{product.title}</p>
                                                       <p className="text-sm text-gray-500">{product.category} • {getCurrencySymbol(currentCurrency)}{product.price}</p>
                         </div>
                        <div className="flex items-center space-x-2">
                          {product.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Featured
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {parsedData.length > 3 && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    +{parsedData.length - 3} more products
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back
                </button>
                <div className="flex items-center space-x-3">
                  {validationErrors.length > 0 && (
                    <button
                      onClick={() => setCurrentStep('upload')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Fix Errors
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentStep('review')}
                    disabled={validationErrors.filter(error => error.severity === 'error').length > 0}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      validationErrors.filter(error => error.severity === 'error').length > 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-pink-500 hover:bg-pink-600 text-white'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Ready to Import</h4>
                <p className="text-gray-600">
                  {parsedData.length} products are ready to be imported to your catalog.
                </p>
              </div>

              {/* Import Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <h5 className="font-medium text-green-800 mb-4">Import Summary</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{parsedData.length}</p>
                    <p className="text-sm text-green-700">Total Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {parsedData.filter(p => p.status === 'active').length}
                    </p>
                    <p className="text-sm text-blue-700">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {parsedData.filter(p => p.featured).length}
                    </p>
                    <p className="text-sm text-purple-700">Featured</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {getCurrencySymbol(currentCurrency)}{parsedData.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-orange-700">Total Value</p>
                  </div>
                </div>
              </div>

              {/* Import Settings */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h5 className="font-medium text-blue-800 mb-4">Import Settings</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Duplicate Handling:</span>
                    <p className="text-blue-600">
                      {importSettings.skipDuplicates ? 'Skip duplicates' : 'Allow duplicates'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Update Existing:</span>
                    <p className="text-blue-600">
                      {importSettings.updateExisting ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Default Status:</span>
                    <p className="text-blue-600 capitalize">
                      {importSettings.defaultStatus}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Default Featured:</span>
                    <p className="text-blue-600">
                      {importSettings.defaultFeatured ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentStep('validate')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Import Products
                </button>
              </div>
            </div>
          )}

          {currentStep === 'importing' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Importing Products</h4>
                <p className="text-gray-600 mb-4">
                  Please wait while we import your products. This may take a few moments.
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{importProgress}% Complete</p>
                <p className="text-xs text-gray-500 mt-2">
                  Processing {parsedData.length} products...
                </p>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Import Complete!</h4>
                <p className="text-gray-600 mb-6">
                  Your products have been successfully imported. You can now view them in your product catalog.
                </p>
                
                {/* Import Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                  <h5 className="font-medium text-green-800 mb-4">Import Summary</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{importResults?.imported || 0}</p>
                      <p className="text-sm text-green-700">Imported</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {importResults?.updated || 0}
                      </p>
                      <p className="text-sm text-blue-700">Updated</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {importResults?.skipped || 0}
                      </p>
                      <p className="text-sm text-purple-700">Skipped</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {importResults?.errors?.length || 0}
                      </p>
                      <p className="text-sm text-orange-700">Errors</p>
                    </div>
                  </div>
                </div>

                {importResults?.errors && importResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <h5 className="font-medium text-red-800 mb-3">Import Errors</h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {importResults.errors.map((error: any, index: number) => (
                        <div key={index} className="text-sm text-red-700">
                          <span className="font-medium">{error.product}:</span> {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={resetImport}
                    className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Import More
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkProductImport;
