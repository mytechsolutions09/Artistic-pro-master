'use client'

import React from 'react';
import { usePreserveNavScroll } from '@/src/hooks/usePreserveNavScroll';
import {
  Home,
  Settings,
  FileText,
  BarChart3,
  Users,
  Package,
  ShoppingBag,
  Bell,
  Shield,
  Zap,
} from 'lucide-react';

export interface NormalTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string | number;
}

interface NormalSecondaryNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const NORMAL_TABS: NormalTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <Home className="w-4 h-4" />,
    description: 'View overview and summary',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    description: 'Manage settings and preferences',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: <FileText className="w-4 h-4" />,
    description: 'View and manage documents',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'View analytics and reports',
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="w-4 h-4" />,
    description: 'Manage users and permissions',
  },
  {
    id: 'products',
    label: 'Products',
    icon: <Package className="w-4 h-4" />,
    description: 'Manage products and inventory',
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: <ShoppingBag className="w-4 h-4" />,
    description: 'View and manage orders',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="w-4 h-4" />,
    description: 'Manage notifications',
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Shield className="w-4 h-4" />,
    description: 'Security settings and controls',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <Zap className="w-4 h-4" />,
    description: 'Third-party integrations',
  },
];

const NormalSecondaryNav: React.FC<NormalSecondaryNavProps> = ({ activeTab, onTabChange, className = '' }) => {
  const { navRef, onNavScroll } = usePreserveNavScroll([activeTab]);

  return (
    <div
      className={`fixed left-20 top-0 z-30 flex h-screen w-[4.25rem] flex-col border-r border-gray-200 bg-white ${className}`}
    >
      <div className="shrink-0 border-b border-gray-200 p-2">
        <div className="flex items-center justify-center">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-1">
            <Home className="h-4 w-4 text-gray-800" />
          </div>
        </div>
      </div>

      <nav
        ref={navRef}
        onScroll={onNavScroll}
        className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2"
      >
        <div className="flex flex-col gap-0.5">
          {NORMAL_TABS.map((tab) => (
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
                {React.isValidElement(tab.icon)
                  ? React.cloneElement(tab.icon as React.ReactElement, { className: 'h-3.5 w-3.5' })
                  : tab.icon}
              </span>

              <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-1.5 max-w-[14rem] -translate-y-1/2 rounded-md bg-gray-900 px-2 py-1.5 text-left text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span>{tab.label}</span>
                  {tab.badge != null && tab.badge !== '' && (
                    <span className="rounded-full bg-gray-700 px-1.5 py-0 text-[10px]">{tab.badge}</span>
                  )}
                </div>
                <div className="mt-0.5 text-[10px] text-gray-300">{tab.description}</div>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default NormalSecondaryNav;
