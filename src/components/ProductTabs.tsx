'use client'

import React from 'react';
import { ChevronDown } from 'lucide-react';

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
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {tabs.map((tab) => {
          const isOpen = tab.id === activeTab;
          return (
            <div key={tab.id}>
              <button
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors ${
                  isOpen ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0">{tab.icon}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">{tab.label}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    isOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                  aria-hidden
                />
              </button>

              {isOpen && <div className="px-3 pb-3">{tab.content}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductTabs;




