'use client'

import React from 'react';
import { TrendingUp, Search, CheckCircle, LineChart } from 'lucide-react';

export interface MarketingTab {
  id: 'tracking' | 'seo' | 'keyword_tracking' | 'seo_daily';
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface MarketingSecondaryNavProps {
  activeTab: 'tracking' | 'seo' | 'keyword_tracking' | 'seo_daily';
  onTabChange: (tabId: 'tracking' | 'seo' | 'keyword_tracking' | 'seo_daily') => void;
  className?: string;
}

const MARKETING_TABS: MarketingTab[] = [
  {
    id: 'tracking',
    label: 'Tracking',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Meta Pixel and analytics tracking',
  },
  {
    id: 'seo',
    label: 'SEO',
    icon: <Search className="w-4 h-4" />,
    description: 'Metadata, internal links, workflow & tools',
  },
  {
    id: 'keyword_tracking',
    label: 'Keywords',
    icon: <LineChart className="w-4 h-4" />,
    description: 'Track 3-5 priority keyword movement',
  },
  {
    id: 'seo_daily',
    label: 'SEO Daily',
    icon: <CheckCircle className="w-4 h-4" />,
    description: 'Daily SEO checklist and routine',
  },
];

const MarketingSecondaryNav: React.FC<MarketingSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`bg-white border-r border-gray-200 w-20 h-screen fixed top-0 left-20 z-30 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="p-1.5 bg-pink-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-pink-600" />
          </div>
        </div>
      </div>

      <div className="py-4">
        <nav className="space-y-1 px-2.5">
          {MARKETING_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 group relative ${
                activeTab === tab.id
                  ? 'bg-pink-50 text-pink-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={tab.label}
            >
              {activeTab === tab.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 rounded-r-full" />
              )}

              <span className={activeTab === tab.id ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-700'}>
                {tab.icon}
              </span>

              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                <div>{tab.label}</div>
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

export default MarketingSecondaryNav;




