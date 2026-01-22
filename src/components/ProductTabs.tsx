import React from 'react';
import { FileText, Truck, Info } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface ProductTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-teal-800 text-white border-b-2 border-teal-800'
                : 'text-gray-600 hover:text-teal-800 hover:bg-teal-50'
            }`}
          >
            <span className="w-3 h-3">{tab.icon}</span>
            <span className="font-sans font-normal">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-2 min-h-[150px]">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default ProductTabs;
