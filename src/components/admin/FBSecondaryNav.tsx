import React from 'react';
import { 
  UtensilsCrossed, Plus, Package, Star, FileText, Download, 
  ShoppingCart, TrendingUp, Settings, BarChart3
} from 'lucide-react';

export interface FBTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string | number;
}

interface FBSecondaryNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  itemCounts?: {
    total?: number;
    featured?: number;
    trending?: number;
  };
}

export const FB_TABS: FBTab[] = [
  {
    id: 'all',
    label: 'All Items',
    icon: <Package className="w-5 h-5" />,
    description: 'View and manage all F & B items'
  },
  {
    id: 'create',
    label: 'Create Item',
    icon: <Plus className="w-5 h-5" />,
    description: 'Add new F & B items'
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: <FileText className="w-5 h-5" />,
    description: 'Manage F & B categories'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: <ShoppingCart className="w-5 h-5" />,
    description: 'View F & B orders'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'View F & B analytics'
  },
  {
    id: 'trending',
    label: 'Trending',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'View trending items'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    description: 'F & B settings'
  }
];

const FBSecondaryNav: React.FC<FBSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = '',
  itemCounts
}) => {
  return (
    <div className={`bg-white border-r border-gray-200 w-20 h-screen fixed top-0 left-20 z-30 ${className}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="p-2 bg-pink-100 rounded-lg">
            <UtensilsCrossed className="w-6 h-6 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="py-4 overflow-y-auto h-[calc(100vh-80px)]">
        <nav className="space-y-1 px-3">
          {FB_TABS.map((tab) => {
            // Add badges for specific tabs
            let badge = tab.badge;
            if (tab.id === 'all' && itemCounts?.total) {
              badge = itemCounts.total;
            } else if (tab.id === 'trending' && itemCounts?.trending) {
              badge = itemCounts.trending;
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative ${
                  activeTab === tab.id
                    ? 'bg-gray-50 text-black'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={tab.label}
              >
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-black rounded-r-full" />
                )}
                
                <span className={`flex-shrink-0 transition-colors ${
                  activeTab === tab.id ? 'text-black' : 'text-gray-500 group-hover:text-gray-700'
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

export default FBSecondaryNav;
