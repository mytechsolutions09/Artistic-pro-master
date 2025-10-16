import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle, AlertCircle, RefreshCw, ExternalLink, CheckSquare, Square } from 'lucide-react';
import ProductCatalogExportService, { ProductExportData } from '../../services/productCatalogExport';

const ProductExport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    withImages: 0,
    withoutImages: 0
  });
  const [preview, setPreview] = useState<ProductExportData[]>([]);
  const [allProducts, setAllProducts] = useState<ProductExportData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStats();
    loadAllProducts();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await ProductCatalogExportService.getExportStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      const products = await ProductCatalogExportService.fetchProducts();
      setAllProducts(products);
      setPreview(products); // Show all products in scrollable table
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === allProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allProducts.map(p => p.product_id)));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedIds(newSelected);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setMessage(null);
      
      const productIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;
      const result = await ProductCatalogExportService.exportToCSV(productIds);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message
        });
        // Refresh stats
        await loadStats();
      } else {
        setMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to export products'
      });
    } finally {
      setExporting(false);
    }
  };

  const getExportCount = () => {
    return selectedIds.size > 0 ? selectedIds.size : stats.total;
  };

  const getExportButtonText = () => {
    if (selectedIds.size > 0) {
      return `Export ${selectedIds.size} Selected Product${selectedIds.size !== 1 ? 's' : ''}`;
    }
    return `Export All ${stats.total} Products`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Download className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Product Catalog Export</h1>
            <p className="text-blue-100">Export products to CSV for Facebook/Instagram catalog</p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Products</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">In Stock</div>
          <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">With Images</div>
          <div className="text-2xl font-bold text-blue-600">{stats.withImages}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Without Images</div>
          <div className="text-2xl font-bold text-orange-600">{stats.withoutImages}</div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Export to CSV</h2>
            <p className="text-sm text-gray-500">
              {selectedIds.size > 0 
                ? `${selectedIds.size} product${selectedIds.size !== 1 ? 's' : ''} selected`
                : 'Select products below or export all'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                Clear Selection
              </button>
            )}
            <button
              onClick={loadAllProducts}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* CSV Format Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">CSV Format Includes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>product_id</strong> - Unique product identifier</li>
              <li>• <strong>title</strong> - Product name</li>
              <li>• <strong>description</strong> - Product description (clean text)</li>
              <li>• <strong>price</strong> - Product price in INR</li>
              <li>• <strong>link</strong> - Direct link to product page</li>
              <li>• <strong>image_link</strong> - Main product image URL</li>
              <li>• <strong>availability</strong> - in stock / out of stock</li>
              <li>• <strong>brand</strong> - Product brand (Lurevi)</li>
              <li>• <strong>condition</strong> - Product condition (new)</li>
              <li>• <strong>google_product_category</strong> - Product category</li>
              <li>• <strong>product_type</strong> - Type of product</li>
              <li>• <strong>additional_image_link</strong> - Additional product image</li>
            </ul>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting || stats.total === 0}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>{getExportButtonText()}</span>
              </>
            )}
          </button>

          {stats.total === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No products available to export. Add products first.
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white p-12 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">Loading products...</p>
          </div>
        </div>
      )}

      {/* Product Selection Table */}
      {!loading && preview.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Select Products to Export</h2>
              <span className="text-sm text-gray-500">
                ({preview.length} shown{allProducts.length > preview.length ? ` of ${allProducts.length}` : ''})
              </span>
            </div>
            <button
              onClick={toggleSelectAll}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {selectedIds.size === allProducts.length ? (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  <span>Select All</span>
                </>
              )}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-700 w-12 bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === allProducts.length && allProducts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="text-left p-3 font-medium text-gray-700 bg-gray-50">ID</th>
                    <th className="text-left p-3 font-medium text-gray-700 bg-gray-50">Title</th>
                    <th className="text-left p-3 font-medium text-gray-700 bg-gray-50">Price</th>
                    <th className="text-left p-3 font-medium text-gray-700 bg-gray-50">Availability</th>
                    <th className="text-left p-3 font-medium text-gray-700 bg-gray-50">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((product, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                        selectedIds.has(product.product_id) ? 'bg-blue-50' : 'bg-white'
                      }`}
                      onClick={() => toggleSelectProduct(product.product_id)}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.product_id)}
                          onChange={() => toggleSelectProduct(product.product_id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-3 text-gray-600 font-mono text-xs">{product.product_id.substring(0, 8)}...</td>
                      <td className="p-3 text-gray-900">{product.title}</td>
                      <td className="p-3 text-gray-900">₹{product.price}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.availability === 'in stock'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.availability}
                        </span>
                      </td>
                      <td className="p-3">
                        <a
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {allProducts.length > preview.length && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 text-center">
              Showing {preview.length} of {allProducts.length} products. Select specific products or export all.
            </div>
          )}
        </div>
      )}

      {/* No Products State */}
      {!loading && preview.length === 0 && stats.total > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Unable to load products for preview</p>
            <button
              onClick={loadAllProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Loading Products</span>
            </button>
          </div>
        </div>
      )}

      {/* Facebook Catalog Integration Info */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">How to Use with Facebook/Instagram</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-gray-900">1. Export CSV</strong>
            <p className="text-gray-600">Click "Export to CSV" button above to download your product catalog</p>
          </div>
          <div>
            <strong className="text-gray-900">2. Upload to Facebook</strong>
            <p className="text-gray-600">Go to Commerce Manager → Catalog → Data Sources → Upload</p>
          </div>
          <div>
            <strong className="text-gray-900">3. Map Columns</strong>
            <p className="text-gray-600">Facebook will automatically match CSV columns to product fields</p>
          </div>
          <div>
            <strong className="text-gray-900">4. Review & Publish</strong>
            <p className="text-gray-600">Review products and publish to enable Instagram Shopping</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href="https://www.facebook.com/business/help/120325381656392"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Facebook Catalog Upload Guide</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductExport;
