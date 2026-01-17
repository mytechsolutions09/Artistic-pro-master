import React from 'react';
import { 
  Home,
  Settings,
  FileText,
  BarChart3,
  Users,
  Package,
  ShoppingBag,
  Bell,
  Shield,
  Zap
} from 'lucide-react';

export interface NormalTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string | number;
}

interface NormalSecondaryNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const NORMAL_TABS: NormalTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <Home className="w-5 h-5" />,
    description: 'View overview and summary'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    description: 'Manage settings and preferences'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: <FileText className="w-5 h-5" />,
    description: 'View and manage documents'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'View analytics and reports'
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="w-5 h-5" />,
    description: 'Manage users and permissions'
  },
  {
    id: 'products',
    label: 'Products',
    icon: <Package className="w-5 h-5" />,
    description: 'Manage products and inventory'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: <ShoppingBag className="w-5 h-5" />,
    description: 'View and manage orders'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    description: 'Manage notifications'
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Shield className="w-5 h-5" />,
    description: 'Security settings and controls'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <Zap className="w-5 h-5" />,
    description: 'Third-party integrations'
  }
];

const NormalSecondaryNav: React.FC<NormalSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`bg-white border-r border-gray-200 w-20 h-screen fixed top-0 left-20 z-30 ${className}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Home className="w-6 h-6 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="py-4 overflow-y-auto h-[calc(100vh-80px)]">
        <nav className="space-y-1 px-3">
          {NORMAL_TABS.map((tab) => (
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
                  {tab.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-700 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-300 mt-1">{tab.description}</div>
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NormalSecondaryNav;
