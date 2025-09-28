import React, { useState } from 'react';
import { Download, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ProductExportProps {
  products: any[];
  onClose: () => void;
}

const ProductExport: React.FC<ProductExportProps> = ({ products, onClose }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [includeImages, setIncludeImages] = useState(false);
  const [includePricing, setIncludePricing] = useState(true);
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportProductsToCSV = () => {
    const csvContent = [
      ['title', 'price', 'category', 'description', 'tags', 'status', 'featured', 'images', 'material', 'size', 'frame', 'style', 'origin', 'standardDelivery', 'expressDelivery', 'sameDayDelivery', 'additionalInfo', 'artistStory', 'ecoFriendly', 'uniqueFeatures'],
      ...products.map(product => [
        `"${product.title}"`,
        product.price?.toString() || '',
        `"${(product.categories || []).join(',')}"`,
        `"${product.description || ''}"`,
        `"${(product.tags || []).join(',')}"`,
        product.status || 'active',
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

  const exportProductsToJSON = () => {
    const exportData = products.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      categories: product.categories,
      description: product.description,
      tags: product.tags,
      status: product.status,
      featured: product.featured,
      images: includeImages ? product.images : [],
      itemDetails: includeDetails ? product.itemDetails : undefined,
      delivery: includeDetails ? product.delivery : undefined,
      didYouKnow: includeDetails ? product.didYouKnow : undefined,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    
    try {
      if (exportFormat === 'csv') {
        exportProductsToCSV();
      } else {
        exportProductsToJSON();
      }
      
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Download className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Export Products</h2>
              <p className="text-sm text-gray-600">Export your products to a file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExportFormat('csv')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  exportFormat === 'csv'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5" />
                  <div>
                    <div className="font-medium">CSV</div>
                    <div className="text-sm text-gray-500">Spreadsheet format</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setExportFormat('json')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  exportFormat === 'json'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5" />
                  <div>
                    <div className="font-medium">JSON</div>
                    <div className="text-sm text-gray-500">Structured data format</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Include product images</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includePricing}
                  onChange={(e) => setIncludePricing(e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Include pricing information</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeCategories}
                  onChange={(e) => setIncludeCategories(e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Include categories</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeTags}
                  onChange={(e) => setIncludeTags(e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Include tags</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Include detailed information</span>
              </label>
            </div>
          </div>

          {/* Product Count */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Products to export:</span>
              <span className="text-sm text-gray-600">{products.length} products</span>
            </div>
          </div>

          {/* Success Message */}
          {exportSuccess && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">Export completed successfully!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Products</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductExport;
