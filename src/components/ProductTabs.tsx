'use client'

import React, { useState } from 'react';
import { FileText, Truck, Info, Plus, Minus } from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex flex-col bg-white rounded-t-lg overflow-hidden">
        {tabs.map((tab, index) => (
          <div key={tab.id}>
            <button
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-all duration-200 border-b border-gray-200 ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3">{tab.icon}</span>
                <span className="font-sans font-normal">{tab.label}</span>
              </div>
              {tab.id === activeTab && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(!isCollapsed);
                  }}
                  className="text-black hover:text-gray-600"
                >
                  {isCollapsed ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </button>
              )}
            </button>
            
            {/* Tab Content - Show directly under active tab */}
            {tab.id === activeTab && !isCollapsed && (
              <div className="bg-white border-b border-gray-200 p-2 min-h-[150px]">
                {tab.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductTabs;




