import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Eye, Filter, Search, Grid, List, Star, 
  Download, TrendingUp, Package, DollarSign, RefreshCw, CheckSquare, Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ProductService } from '../../services/supabaseService';
import { useCurrency } from '../../contexts/CurrencyContext';

const Products: React.FC = () => {
  const { formatCurrency, currencySettings } = useCurrency();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getAllProducts();
      setProducts(data || []);
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

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await ProductService.deleteProduct(productId);
        await loadProducts();
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
      } catch (error) {
        console.error('Error deleting products:', error);
      }
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

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Get product stats
  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    inactive: products.filter(p => p.status === 'inactive').length,
    featured: products.filter(p => p.featured).length,
    totalDownloads: products.reduce((sum, p) => sum + (p.downloads || 0), 0),
    totalRevenue: products.reduce((sum, p) => sum + (p.price * (p.downloads || 0)), 0)
  };

  return (
    <AdminLayout title="Products" noHeader={true}>
      <div className="p-6 space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Product Management</h2>
            <p className="text-sm text-gray-600">Manage your Lurevi products</p>
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
            <button className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm">
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
              {categories.map(category => (
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
        ) : filteredProducts.length === 0 ? (
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
            {filteredProducts.map((product) => (
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
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
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
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{formatCurrency(product.price, currencySettings.defaultCurrency)}</span>
                      <span className="text-gray-500">{product.downloads || 0} downloads</span>
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
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit2 className="w-4 h-4" />
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
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
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
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(product.price, currencySettings.defaultCurrency)}</p>
                      <p className="text-sm text-gray-500">{product.downloads || 0} downloads</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit2 className="w-4 h-4" />
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
      </div>
    </AdminLayout>
  );
};

export default Products;
