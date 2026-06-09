'use client'

import React from 'react';

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
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 sm:p-3 font-['Inter']">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 mb-4">
        <div 
          className="flex space-x-6 sm:space-x-8 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`pb-3 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap outline-none ${
                  isActive
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-200 text-sm text-gray-700">
        {activeTabContent}
      </div>
    </div>
  );
};

export default ProductTabs;
