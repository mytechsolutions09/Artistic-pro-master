'use client'

import React from 'react';
import { usePreserveNavScroll } from '@/src/hooks/usePreserveNavScroll';
import { Gift, Plus, Download } from 'lucide-react';

export interface GiftsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface GiftsSecondaryNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const GIFTS_TABS: GiftsTab[] = [
  {
    id: 'all',
    label: 'All Gifts',
    icon: <Gift className="w-4 h-4" />,
    description: 'View all gift products'
  },
  {
    id: 'create',
    label: 'Add Gift',
    icon: <Plus className="w-4 h-4" />,
    description: 'Create a new gift product'
  },
  {
    id: 'amazon',
    label: 'Amazon Import',
    icon: <Download className="w-4 h-4" />,
    description: 'Import gifts by country/category'
  }
];

const GiftsSecondaryNav: React.FC<GiftsSecondaryNavProps> = ({ activeTab, onTabChange }) => {
  const { navRef, onNavScroll } = usePreserveNavScroll([activeTab]);

  return (
    <div className="fixed left-20 top-0 z-30 flex h-screen w-20 flex-col border-r border-gray-200 bg-white">
      <div className="shrink-0 border-b border-gray-200 p-4">
        <div className="flex items-center justify-center">
          <div className="rounded-lg bg-black p-1.5">
            <Gift className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      <div ref={navRef} onScroll={onNavScroll} className="min-h-0 flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2.5">
          {GIFTS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onTabChange(tab.id)}
              className={`group relative flex w-full items-center justify-center rounded-lg p-2.5 transition-all duration-200 ${
                activeTab === tab.id ? 'bg-black text-white' : 'text-black hover:bg-black/5'
              }`}
              title={tab.label}
            >
              {activeTab === tab.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-black rounded-r-full" />
              )}

              <span className="flex-shrink-0 transition-colors">
                {tab.icon}
              </span>

              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                <div className="flex items-center space-x-2">
                  <span>{tab.label}</span>
                </div>
                <div className="text-xs text-white/70 mt-1">{tab.description}</div>
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-black" />
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default GiftsSecondaryNav;

