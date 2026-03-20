'use client';

import React from 'react';
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
  return (
    <div className={`bg-white border-r border-gray-200 w-20 h-screen fixed top-0 left-20 z-30 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <FileText className="w-5 h-5 text-gray-700" />
          </div>
        </div>
      </div>

      <div className="py-4">
        <nav className="space-y-1 px-2.5">
          {BLOG_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 group relative ${
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={tab.label}
            >
              {activeTab === tab.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-700 rounded-r-full" />
              )}
              <span
                className={`w-5 h-5 flex items-center justify-center ${
                  activeTab === tab.id ? 'text-gray-800' : 'text-gray-500 group-hover:text-gray-700'
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

