import React from 'react';
import { 
  Plus, Upload, 
  Package, Star, FileText, Download, Palette
} from 'lucide-react';

export interface ProductsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string | number;
}

interface ProductsSecondaryNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  productCounts?: {
    total?: number;
    featured?: number;
    trending?: number;
  };
}

export const PRODUCTS_TABS: ProductsTab[] = [
  {
    id: 'all',
    label: 'All Products',
    icon: <Package className="w-5 h-5" />,
    description: 'View and manage all products'
  },
  {
    id: 'create',
    label: 'Create Product',
    icon: <Plus className="w-5 h-5" />,
    description: 'Add new products to your catalog'
  },
  {
    id: 'import',
    label: 'Bulk Import',
    icon: <Upload className="w-5 h-5" />,
    description: 'Import multiple products at once'
  },
  {
    id: 'export',
    label: 'Export Products',
    icon: <Download className="w-5 h-5" />,
    description: 'Export products to CSV file'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: <FileText className="w-5 h-5" />,
    description: 'Manage product templates'
  },
  {
    id: 'featured',
    label: 'Featured',
    icon: <Star className="w-5 h-5" />,
    description: 'Manage featured products'
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: <Palette className="w-5 h-5" />,
    description: 'Manage product categories'
  }
];

const ProductsSecondaryNav: React.FC<ProductsSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = '',
  productCounts
}) => {
  return (
    <div className={`bg-white border-r border-gray-200 w-20 h-screen fixed top-0 left-20 z-30 ${className}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Package className="w-6 h-6 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="py-4">
        <nav className="space-y-1 px-3">
          {PRODUCTS_TABS.map((tab) => {
            // Add badges for specific tabs
            let badge = tab.badge;
            if (tab.id === 'all' && productCounts?.total) {
              badge = productCounts.total;
            } else if (tab.id === 'featured' && productCounts?.featured) {
              badge = productCounts.featured;
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative ${
                  activeTab === tab.id
                    ? 'bg-pink-50 text-pink-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={tab.label}
              >
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 rounded-r-full" />
                )}
                
                <span className={`flex-shrink-0 transition-colors ${
                  activeTab === tab.id ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {tab.icon}
                </span>
                
                {/* Tooltip for collapsed state */}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  <div className="flex items-center space-x-2">
                    <span>{tab.label}</span>
                    {badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-700 rounded-full">
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">{tab.description}</div>
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ProductsSecondaryNav;
