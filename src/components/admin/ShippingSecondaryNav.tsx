import React from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Upload
} from 'lucide-react';

export interface ShippingTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string | number;
}

interface ShippingSecondaryNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const SHIPPING_TABS: ShippingTab[] = [
  {
    id: 'shipments',
    label: 'Shipments',
    icon: <Truck className="w-5 h-5" />,
    description: 'View and manage all shipments'
  },
  {
    id: 'pincheck',
    label: 'Pin Code Check',
    icon: <MapPin className="w-5 h-5" />,
    description: 'Check serviceability for pin codes'
  },
  {
    id: 'rates',
    label: 'Rate Calculator',
    icon: <Search className="w-5 h-5" />,
    description: 'Calculate shipping rates'
  },
  {
    id: 'create',
    label: 'Create Shipment',
    icon: <Plus className="w-5 h-5" />,
    description: 'Create new shipments'
  },
  {
    id: 'warehouse',
    label: 'Warehouse',
    icon: <Package className="w-5 h-5" />,
    description: 'Manage warehouse details'
  },
  {
    id: 'advanced',
    label: 'Advanced Shipment',
    icon: <Filter className="w-5 h-5" />,
    description: 'Create advanced shipments with custom QC'
  },
  {
    id: 'waybills',
    label: 'Generate Waybills',
    icon: <Download className="w-5 h-5" />,
    description: 'Generate waybill numbers'
  },
  {
    id: 'tat',
    label: 'Expected TAT',
    icon: <Clock className="w-5 h-5" />,
    description: 'Calculate expected delivery time'
  },
  {
    id: 'pickup',
    label: 'Request Pickup',
    icon: <Truck className="w-5 h-5" />,
    description: 'Schedule pickup requests'
  }
];

const ShippingSecondaryNav: React.FC<ShippingSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`bg-white border-r border-gray-200 w-20 h-screen fixed top-0 left-20 z-30 ${className}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="py-4 overflow-y-auto h-[calc(100vh-80px)]">
        <nav className="space-y-1 px-3">
          {SHIPPING_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={tab.label}
            >
              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
              )}
              
              <span className={`flex-shrink-0 transition-colors ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
              }`}>
                {tab.icon}
              </span>
              
              {/* Tooltip for collapsed state */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                <div className="flex items-center space-x-2">
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
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

export default ShippingSecondaryNav;
