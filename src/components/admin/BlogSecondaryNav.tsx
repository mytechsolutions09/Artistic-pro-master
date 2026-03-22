'use client';

import React from 'react';
import { usePreserveNavScroll } from '@/src/hooks/usePreserveNavScroll';
import { FileText, Image as ImageIcon, BookOpen, List } from 'lucide-react';

export type BlogTabId = 'posts' | 'list' | 'media' | 'guide';

interface BlogSecondaryNavProps {
  activeTab: BlogTabId;
  onTabChange: (tabId: BlogTabId) => void;
  className?: string;
}

const BLOG_TABS: Array<{
  id: BlogTabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: 'posts',
    label: 'Posts',
    icon: <FileText className="w-4 h-4" />,
    description: 'Create and manage blog posts',
  },
  {
    id: 'list',
    label: 'List',
    icon: <List className="w-4 h-4" />,
    description: 'View all existing blog posts',
  },
  {
    id: 'media',
    label: 'Media',
    icon: <ImageIcon className="w-4 h-4" />,
    description: 'Upload and attach blog images',
  },
  {
    id: 'guide',
    label: 'Guide',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Publishing workflow and tips',
  },
];

const BlogSecondaryNav: React.FC<BlogSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = '',
}) => {
  const { navRef, onNavScroll } = usePreserveNavScroll([activeTab]);

  return (
    <div
      className={`fixed left-20 top-0 z-30 flex h-screen w-20 flex-col border-r border-gray-200 bg-white ${className}`}
    >
      <div className="shrink-0 border-b border-gray-200 p-4">
        <div className="flex items-center justify-center">
          <div className="rounded-lg bg-gray-100 p-1.5">
            <FileText className="h-5 w-5 text-gray-700" />
          </div>
        </div>
      </div>

      <div ref={navRef} onScroll={onNavScroll} className="min-h-0 flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2.5">
          {BLOG_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 group relative ${
                activeTab === tab.id
                  ? 'bg-gray-50 text-black'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={tab.label}
            >
              {activeTab === tab.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-black rounded-r-full" />
              )}
              <span
                className={`w-5 h-5 flex items-center justify-center ${
                  activeTab === tab.id ? 'text-black' : 'text-gray-500 group-hover:text-gray-700'
                }`}
              >
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

export default BlogSecondaryNav;

