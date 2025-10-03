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
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-pink-50 text-pink-900 border-b-2 border-pink-500'
                : 'text-gray-600 hover:text-pink-900 hover:bg-pink-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-6 min-h-[300px]">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default ProductTabs;
