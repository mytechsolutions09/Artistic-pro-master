import React, { useState, useEffect } from 'react';
import { ImageUpload } from './ImageUpload';
import { ImageUploadService, UploadResult } from '../../services/imageUploadService';
import { Category } from '../../services/categoryService';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (categoryData: Partial<Category>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  onImageUploadingChange?: (isUploading: boolean) => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onImageUploadingChange
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image: category?.image || '',
    status: category?.status || 'active',
    featured: category?.featured || false,
    tags: category?.tags || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePath, setImagePath] = useState<string | null>(category?.image_path || null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Initialize form data when category changes (for editing)
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        status: category.status || 'active',
        featured: category.featured || false,
        tags: category.tags || []
      });
      setImagePath(category.image_path || null);
      setErrors({});
    }
  }, [category]);

  // Generate slug from name
  useEffect(() => {
    if (formData.name && !category) {
      const slug = generateSlug(formData.name);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, category]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle tags input
  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  // Handle image upload
  const handleImageUpload = async (result: UploadResult) => {
    if (result.success && result.url && result.path) {
      setFormData(prev => ({ ...prev, image: result.url }));
      setImagePath(result.path);
      setIsImageUploading(false);
      onImageUploadingChange?.(false); // Notify parent component
      // Clear any previous image errors
      setErrors(prev => ({ ...prev, image: '' }));
      console.log('✅ Image uploaded successfully:', result);
    } else {
      const errorMessage = result.error || 'Image upload failed';
      setErrors(prev => ({ ...prev, image: errorMessage }));
      setIsImageUploading(false);
      onImageUploadingChange?.(false); // Notify parent component
      console.error('❌ Image upload failed:', errorMessage);
    }
  };

  // Handle image removal
  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImagePath(null);
    setErrors(prev => ({ ...prev, image: '' }));
    console.log('🗑️ Image removed');
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Category slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Category description is required';
    }

    // Image is optional for now - users can add it later
    // if (!formData.image) {
    //   newErrors.image = 'Category image is required';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure slug is generated before validation
    const finalFormData = {
      ...formData,
      slug: formData.slug || generateSlug(formData.name),
      image: formData.image,
      image_path: imagePath || undefined // Store the storage path for future reference
    };
    
    // Update form data with generated slug
    setFormData(finalFormData);
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Submitting category form with data:', finalFormData);
      await onSubmit(finalFormData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Digital Art"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.slug ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., digital-art"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe this category..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Image</h3>
        
        <ImageUpload
          currentImageUrl={formData.image}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          onUploadStart={() => {
            setIsImageUploading(true);
            onImageUploadingChange?.(true);
          }}
          maxWidth={400}
          maxHeight={300}
          showPreview={true}
          showThumbnail={true}
          disabled={isSubmitting}
        />
        
        {/* Image Path Display (for debugging) */}
        {imagePath && (
          <div className="mt-2 p-2 bg-gray-50 rounded border text-xs text-gray-600">
            <strong>Storage Path:</strong> {imagePath}
            <br />
            <span className="text-blue-600">
              Note: This path is stored locally but not in the database
            </span>
          </div>
        )}
        
        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 p-2 bg-blue-50 rounded border text-xs text-blue-600">
            <strong>Debug Info:</strong>
            <div>Image URL: {formData.image || 'None'}</div>
            <div>Image Path: {imagePath || 'None'}</div>
            <div>Category ID: {category?.id || 'New'}</div>
          </div>
        )}
        
        {errors.image && (
          <p className="mt-2 text-sm text-red-600">{errors.image}</p>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
        
        <div className="space-y-4">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Featured */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              Featured Category
            </label>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., digital, modern, illustration"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate tags with commas
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isImageUploading}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
};
