import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, RefreshCw, Eye, EyeOff, Star, X,
  Palette, Package, TrendingUp, Grid, List, Image as ImageIcon, Upload
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
// import { useCurrency } from '../../contexts/CurrencyContext';
import categoryService, { Category } from '../../services/categoryService';
import { ImageUploadService } from '../../services/imageUploadService';

const Categories: React.FC = () => {
  // const { formatCurrency, currencySettings } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh categories
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  // Create category
  const handleCreateCategory = async (categoryData: any) => {
    try {

      const result = await categoryService.createCategory(categoryData);
      
      if (result) {

        await loadCategories();
        setShowCreateModal(false);
      } else {
        console.error('Category creation returned null');
        alert('Failed to create category. Please try again.');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category: ' + (error as Error).message);
    }
  };

  // Update category
  const handleUpdateCategory = async (categoryData: any) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory({ id: editingCategory.id, ...categoryData });
        await loadCategories();
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(categoryId);
        await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      }
    }
  };

  // Toggle category featured status
  const handleToggleFeatured = async (categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        await categoryService.updateCategory({ id: categoryId, featured: !category.featured });
        await loadCategories();
      }
    } catch (error) {
      console.error('Error toggling category featured status:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Category];
      let bValue: any = b[sortBy as keyof Category];
      
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get category stats
  const stats = {
    total: categories.length,
    featured: categories.filter(c => c.featured).length,
    withImages: categories.filter(c => c.image).length,
    totalProducts: categories.reduce((sum, c) => sum + (c.count || 0), 0)
  };

  return (
    <AdminLayout title="Categories" noHeader={true}>
      <div className="p-6 space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
            <div>
            <h2 className="text-xl font-bold text-gray-800">Category Management</h2>
            <p className="text-sm text-gray-600">Organize your Lurevi categories</p>
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
                onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
              >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
              </button>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
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
              <ImageIcon className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">With Images</p>
                <p className="text-lg font-bold text-gray-900">{stats.withImages}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Total Products</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalProducts}</p>
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
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm w-64"
                />
              </div>
              <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="sort-dropdown"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="count-desc">Most Products</option>
              <option value="count-asc">Least Products</option>
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
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

        {/* Categories Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500">Try adjusting your search or create a new category</p>
        </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2'
          }>
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className={`bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'p-4 flex items-center space-x-4' : 'p-0 overflow-hidden'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Image Background */}
                    <div className="relative h-32 bg-gradient-to-br from-pink-400 to-pink-600">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                          className="w-full h-full object-cover"
                    />
                  ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Palette className="w-12 h-12 text-white" />
                        </div>
                      )}
                      
                      {/* Overlay with actions */}
                      <div className="absolute top-2 right-2 flex items-center space-x-1">
                        {category.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        <button
                          onClick={() => handleToggleFeatured(category.id)}
                          className={`p-1 rounded bg-white bg-opacity-20 backdrop-blur-sm ${
                            category.featured 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-white hover:bg-white hover:bg-opacity-30'
                          }`}
                        >
                          {category.featured ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{category.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{category.count || 0} products</span>
                        <span className="text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">Active</span>
                  </div>
                        <div className="flex items-center space-x-1">
                      <button
                            onClick={() => setEditingCategory(category)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                      >
                            <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center overflow-hidden">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Palette className="w-8 h-8 text-white" />
                          )}
                    </div>
                    <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">{category.name}</h3>
                        {category.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        <button
                          onClick={() => handleToggleFeatured(category.id)}
                          className={`p-1 rounded ${
                            category.featured 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {category.featured ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                            </div>
                      <p className="text-sm text-gray-500">{category.description}</p>
                      <p className="text-xs text-gray-400">
                        {category.count || 0} products • Created {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                            </div>
                    <div className="flex items-center space-x-1">
                          <button
                        onClick={() => setEditingCategory(category)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => handleDeleteCategory(category.id)}
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

        {/* Create/Edit Category Modal */}
        {(showCreateModal || editingCategory) && (
          <CategoryModal
            title={editingCategory ? 'Edit Category' : 'Create Category'}
            category={editingCategory || undefined}
            onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
            onClose={() => {
              setShowCreateModal(false);
              setEditingCategory(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Category Modal Component
interface CategoryModalProps {
  title: string;
  category?: Category;
  onSubmit: (category: any) => void;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ title, category, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    featured: category?.featured || false,
    image: category?.image || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUploading(true);
      let imageUrl = formData.image;

      // Upload new image if selected
      if (imageFile) {
        const uploadedImage = await ImageUploadService.uploadImage(imageFile, 'categories');
        imageUrl = uploadedImage.url || '';
      }

      const categoryData = {
        ...formData,
        image: imageUrl
      };

      onSubmit(categoryData);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={3}
            />
          </div>
          
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
            
            {/* Current Image Display */}
            {(formData.image || imagePreview) && (
              <div className="mb-3">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview || formData.image} 
                    alt="Category preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Image Upload Input */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="category-image-upload"
              />
              <label
                htmlFor="category-image-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {imageFile ? 'Change Image' : 'Upload Image'}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PNG, JPG up to 2MB
                </span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <label htmlFor="featured" className="ml-2 text-sm text-gray-700">Featured Category</label>
          </div>
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  {category ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                category ? 'Update Category' : 'Create Category'
              )}
            </button>
              <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
        </form>
          </div>
        </div>
  );
};

export default Categories;
