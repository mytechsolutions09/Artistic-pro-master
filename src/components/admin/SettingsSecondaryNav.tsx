import React, { useState } from 'react';
import { 
  Globe, Shield, Bell, Palette, DollarSign, Users, 
  Database, Mail, Lock, Zap, Monitor,
  Settings as SettingsIcon, Sliders, MessageSquare, Tag
} from 'lucide-react';

export interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string | number;
}

interface SettingsSecondaryNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const SETTINGS_TABS: SettingsTab[] = [
  {
    id: 'general',
    label: 'General',
    icon: <Globe className="w-5 h-5" />,
    description: 'Site information and basic configuration'
  },
  {
    id: 'currency',
    label: 'Currency',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Currency management and exchange rates'
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: <Shield className="w-5 h-5" />,
    description: 'Payment methods and financial settings'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    description: 'Email alerts and system notifications'
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: <Database className="w-5 h-5" />,
    description: 'File storage and image upload configuration'
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: <Palette className="w-5 h-5" />,
    description: 'Theme, branding, and visual customization'
  },
  {
    id: 'users',
    label: 'Users & Roles',
    icon: <Users className="w-5 h-5" />,
    description: 'User management and permission settings'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <Zap className="w-5 h-5" />,
    description: 'Third-party services and API connections'
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Lock className="w-5 h-5" />,
    description: 'Security policies and access controls'
  },
  {
    id: 'system',
    label: 'System',
    icon: <Monitor className="w-5 h-5" />,
    description: 'System settings and maintenance'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: <Sliders className="w-5 h-5" />,
    description: 'Advanced configuration and developer options'
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Customer review management and moderation'
  },
  {
    id: 'coupons',
    label: 'Coupons',
    icon: <Tag className="w-5 h-5" />,
    description: 'Discount coupons and promotional codes'
  }
];

const SettingsSecondaryNav: React.FC<SettingsSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  const activeTabData = SETTINGS_TABS.find(tab => tab.id === activeTab);

  return (
    <div 
      className={`bg-white border-r border-gray-200 w-20 h-screen fixed top-0 left-20 z-30 flex flex-col ${className}`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="p-2 bg-pink-100 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="py-4 flex-1 overflow-hidden">
        <nav className="space-y-1 px-3 h-full overflow-y-auto scrollbar-hide">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative ${
                activeTab === tab.id
                  ? 'bg-pink-50 text-pink-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={tab.label}
            >
              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 rounded-r-full" />
              )}
              
              <span className={`flex-shrink-0 transition-colors ${
                activeTab === tab.id ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-700'
              }`}>
                {tab.icon}
              </span>
              
              {/* Tooltip for collapsed state */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {tab.label}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            </button>
          ))}
        </nav>
      </div>


    </div>
  );
};

export default SettingsSecondaryNav;
