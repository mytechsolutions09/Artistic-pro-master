import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, FileText, 
  Sparkles, Package, Truck, Info, Heart, Leaf,
  RefreshCw, Search, Filter
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { templateService, ProductTemplate, CreateTemplateData } from '../../services/templateService';

interface TemplatesManagementProps {
  onClose: () => void;
}

const TemplatesManagement: React.FC<TemplatesManagementProps> = ({ onClose }) => {
  const { formatAdminPrice, getCurrency, currentCurrency } = useCurrency();
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProductTemplate | null>(null);
  const [formData, setFormData] = useState<Omit<ProductTemplate, 'id'>>({
    name: '',
    icon: '🎨',
    description: '',
    data: {
      title: '',
      category: '',
      price: 0,
      description: '',
      tags: '',
      itemDetails: {
        material: '',
        size: '',
        frame: '',
        style: '',
        origin: ''
      },
      delivery: {
        standardDelivery: '',
        expressDelivery: '',
        sameDayDelivery: '',
        additionalInfo: ''
      },
      didYouKnow: {
        artistStory: '',
        ecoFriendly: '',
        uniqueFeatures: ''
      }
    }
  });

  const categories = [
    'Digital Art', 'Abstract', 'Nature', 'Landscape', 'Portrait', 'Still Life',
    'Modern', 'Vintage', 'Minimalist', 'Expressionist', 'Impressionist', 'Surrealist'
  ];

  const iconOptions = ['🎨', '🌿', '✨', '👤', '🏞️', '🎭', '🖼️', '💎', '⚪', '🕰️'];

  // Load templates from database
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      icon: '🎨',
      description: '',
      data: {
        title: '',
        category: '',
        price: 0,
        description: '',
        tags: '',
        itemDetails: {
          material: '',
          size: '',
          frame: '',
          style: '',
          origin: ''
        },
        delivery: {
          standardDelivery: '',
          expressDelivery: '',
          sameDayDelivery: '',
          additionalInfo: ''
        },
        didYouKnow: {
          artistStory: '',
          ecoFriendly: '',
          uniqueFeatures: ''
        }
      }
    });
    setShowForm(true);
  };

  const handleEditTemplate = (template: ProductTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      icon: template.icon,
      description: template.description,
      data: { ...template.data }
    });
    setShowForm(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templateService.deleteTemplate(id);
        setTemplates(templates.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        // Update existing template
        const updatedTemplate = await templateService.updateTemplate(editingTemplate.id, formData);
        setTemplates(templates.map(t => 
          t.id === editingTemplate.id ? updatedTemplate : t
        ));
      } else {
        // Add new template
        const newTemplate = await templateService.createTemplate(formData as CreateTemplateData);
        setTemplates([...templates, newTemplate]);
      }
      
      setShowForm(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-pink-600" />
            Product Templates
          </h2>
          <p className="text-gray-600 mt-1">
            Manage product templates for quick product creation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadTemplates}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh templates"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleAddTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Template</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="">All Categories</option>
            {Array.from(new Set(templates.map(t => t.data.category))).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {showForm ? (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {editingTemplate ? 'Edit Template' : 'Add New Template'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Template Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="e.g., Digital Art Template"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Brief description of the template"
                />
              </div>
            </div>

            {/* Template Data */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">Template Data</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.data.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { ...formData.data, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Product title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.data.category}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { ...formData.data, category: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ({getCurrency(currentCurrency)?.symbol || '$'})
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.data.price}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { ...formData.data, price: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.data.tags}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { ...formData.data, tags: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="comma separated tags"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.data.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    data: { ...formData.data, description: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Product description"
                />
              </div>
            </div>

            {/* Item Details */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Item Details
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <input
                    type="text"
                    value={formData.data.itemDetails.material}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        itemDetails: { ...formData.data.itemDetails, material: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="e.g., Premium canvas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <input
                    type="text"
                    value={formData.data.itemDetails.size}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        itemDetails: { ...formData.data.itemDetails, size: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="e.g., 24&quot; x 36&quot;"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frame</label>
                  <input
                    type="text"
                    value={formData.data.itemDetails.frame}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        itemDetails: { ...formData.data.itemDetails, frame: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="e.g., Solid wood"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                  <input
                    type="text"
                    value={formData.data.itemDetails.style}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        itemDetails: { ...formData.data.itemDetails, style: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="e.g., Contemporary"
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                  <input
                    type="text"
                    value={formData.data.itemDetails.origin}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        itemDetails: { ...formData.data.itemDetails, origin: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="e.g., Handcrafted in India"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Delivery Information
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Standard Delivery</label>
                  <textarea
                    value={formData.data.delivery.standardDelivery}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        delivery: { ...formData.data.delivery, standardDelivery: e.target.value }
                      }
                    })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Standard delivery details"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Express Delivery</label>
                  <textarea
                    value={formData.data.delivery.expressDelivery}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        delivery: { ...formData.data.delivery, expressDelivery: e.target.value }
                      }
                    })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Express delivery details"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Same Day Delivery</label>
                  <textarea
                    value={formData.data.delivery.sameDayDelivery}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        delivery: { ...formData.data.delivery, sameDayDelivery: e.target.value }
                      }
                    })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Same day delivery details"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Info</label>
                  <textarea
                    value={formData.data.delivery.additionalInfo}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        delivery: { ...formData.data.delivery, additionalInfo: e.target.value }
                      }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Additional delivery information"
                  />
                </div>
              </div>
            </div>

            {/* Did You Know Section */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Did You Know
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Artist Story
                  </label>
                  <textarea
                    value={formData.data.didYouKnow.artistStory}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        didYouKnow: { ...formData.data.didYouKnow, artistStory: e.target.value }
                      }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Tell the story behind this artwork"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Leaf className="w-4 h-4 mr-2" />
                    Eco-Friendly Features
                  </label>
                  <textarea
                    value={formData.data.didYouKnow.ecoFriendly}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        didYouKnow: { ...formData.data.didYouKnow, ecoFriendly: e.target.value }
                      }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Describe eco-friendly aspects"
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Unique Features
                  </label>
                  <textarea
                    value={formData.data.didYouKnow.uniqueFeatures}
                    onChange={(e) => setFormData({
                      ...formData,
                      data: { 
                        ...formData.data, 
                        didYouKnow: { ...formData.data.didYouKnow, uniqueFeatures: e.target.value }
                      }
                    })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Highlight unique features of this artwork"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
             ) : (
         <>
           {loading ? (
             <div className="text-center py-12">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
               <p className="text-gray-600">Loading templates...</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {templates
                 .filter(template => 
                   (selectedCategory === '' || template.data.category === selectedCategory) &&
                   (searchTerm === '' || 
                     template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     template.data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     template.data.category.toLowerCase().includes(searchTerm.toLowerCase())
                   )
                 )
                 .map((template) => (
                   <div
                     key={template.id}
                     className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                   >
                     <div className="flex items-start justify-between mb-3">
                       <div className="text-3xl">{template.icon}</div>
                       <div className="flex items-center space-x-2">
                         <button
                           onClick={() => handleEditTemplate(template)}
                           className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                           title="Edit template"
                         >
                           <Edit className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => handleDeleteTemplate(template.id)}
                           className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                           title="Delete template"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                     
                     <h3 className="font-medium text-gray-800 mb-2">{template.name}</h3>
                     <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                     
                     <div className="space-y-2 text-xs text-gray-500">
                       <div><span className="font-medium">Title:</span> {template.data.title}</div>
                       <div><span className="font-medium">Category:</span> {template.data.category}</div>
                       <div><span className="font-medium">Price:</span> {formatAdminPrice(template.data.price)}</div>
                       <div><span className="font-medium">Material:</span> {template.data.itemDetails.material}</div>
                       <div><span className="font-medium">Size:</span> {template.data.itemDetails.size}</div>
                     </div>
                   </div>
                 ))}
             </div>
           )}
         </>
       )}
    </div>
  );
};

export default TemplatesManagement;
