'use client'

import React from 'react';
import { TrendingUp, Search, CheckCircle, LineChart, Mail } from 'lucide-react';
import { usePreserveNavScroll } from '@/src/hooks/usePreserveNavScroll';

export interface MarketingTab {
  id: 'tracking' | 'seo' | 'keyword_tracking' | 'seo_daily' | 'email';
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface MarketingSecondaryNavProps {
  activeTab: 'tracking' | 'seo' | 'keyword_tracking' | 'seo_daily' | 'email';
  onTabChange: (tabId: 'tracking' | 'seo' | 'keyword_tracking' | 'seo_daily' | 'email') => void;
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
  {
    id: 'email',
    label: 'Email',
    icon: <Mail className="w-4 h-4" />,
    description: 'Cold email campaign sender/recipient controls',
  },
];

const MarketingSecondaryNav: React.FC<MarketingSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = '',
}) => {
  const { navRef, onNavScroll } = usePreserveNavScroll([activeTab]);

  return (
    <div
      className={`fixed left-20 top-0 z-30 flex h-screen w-[4.25rem] flex-col border-r border-gray-200 bg-white ${className}`}
    >
      <div className="shrink-0 border-b border-gray-200 p-2">
        <div className="flex items-center justify-center">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-1">
            <TrendingUp className="h-4 w-4 text-gray-800" />
          </div>
        </div>
      </div>

      <nav
        ref={navRef}
        onScroll={onNavScroll}
        className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1.5 py-2"
      >
          {MARKETING_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onTabChange(tab.id)}
              className={`group relative flex w-full items-center justify-center rounded-md p-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
              title={tab.label}
            >
              {activeTab === tab.id && (
                <div className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-gray-900" />
              )}

              <span className={activeTab === tab.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}>
                {React.cloneElement(tab.icon as React.ReactElement, { className: 'h-3.5 w-3.5' })}
              </span>

              <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-1.5 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                <div className="font-medium">{tab.label}</div>
                <div className="mt-0.5 text-[10px] text-gray-300">{tab.description}</div>
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            </button>
          ))}
      </nav>
    </div>
  );
};

export default MarketingSecondaryNav;




