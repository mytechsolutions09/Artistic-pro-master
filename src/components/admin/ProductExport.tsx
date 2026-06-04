'use client'

import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import ProductCatalogExportService from '../../services/productCatalogExport';
import ShopifyProductExportService from '../../services/shopifyProductExport';

const ProductExport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingShopify, setExportingShopify] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    withImages: 0,
    withoutImages: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await ProductCatalogExportService.getExportStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setMessage(null);
      
      const result = await ProductCatalogExportService.exportToCSV();
      
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

  const handleShopifyExport = async () => {
    try {
      setExportingShopify(true);
      setMessage(null);
      const result = await ShopifyProductExportService.exportToShopifyCsv();
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message,
        });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to export Shopify CSV',
      });
    } finally {
      setExportingShopify(false);
    }
  };

  const getExportCount = () => {
    return stats.total;
  };

  const getExportButtonText = () => {
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
            <p className="text-blue-100">CSV for Meta catalog or Shopify import (with images)</p>
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
            <p className="text-sm text-gray-500">Export full product catalog in one click</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadStats}
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

          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h3 className="font-semibold text-emerald-900 mb-1">Shopify import (CSV + images)</h3>
            <p className="text-sm text-emerald-800 mb-3">
              Shopify CSV: <strong>Body (HTML)</strong> explains that gallery images are previews and that the{' '}
              <strong>full main image + PDF</strong> are delivered <strong>after order completion</strong>. Technical
              URLs: <strong>PDF URL</strong>, <strong>Main image URL (full file)</strong> (uses{' '}
              <code className="text-xs bg-white/80 px-1 rounded">main_image_full_url</code> if set, else{' '}
              <code className="text-xs bg-white/80 px-1 rounded">main_image</code>), and <strong>Fulfillment note</strong>{' '}
              for your team. Shopify may ignore extra columns — keep the file for fulfillment mapping.
            </p>
            <button
              type="button"
              onClick={() => void handleShopifyExport()}
              disabled={exportingShopify || stats.total === 0}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingShopify ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Building Shopify CSV…</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Export Shopify CSV (with images)</span>
                </>
              )}
            </button>
            <a
              href="https://help.shopify.com/en/manual/products/import-export/using-csv"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-800 underline hover:text-emerald-950"
            >
              <ExternalLink className="w-4 h-4" />
              Shopify CSV import guide
            </a>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white p-12 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">Loading export data...</p>
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




