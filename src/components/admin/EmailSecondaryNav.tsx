import React from 'react';
import { 
  Send, Users, Clock, CheckCircle, AlertCircle, TestTube, 
  Download, UserPlus, Mail, BarChart3, Settings, FileText
} from 'lucide-react';

export interface EmailTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string | number;
}

interface EmailSecondaryNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  emailStats?: {
    sentToday?: number;
    sentThisHour?: number;
    totalUsers?: number;
    selectedUsers?: number;
  };
}

export const EMAIL_TABS: EmailTab[] = [
  {
    id: 'compose',
    label: 'Compose',
    icon: <Send className="w-5 h-5" />,
    description: 'Create and send emails'
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="w-5 h-5" />,
    description: 'Manage user list and selection'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: <FileText className="w-5 h-5" />,
    description: 'Email templates and presets'
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: <Mail className="w-5 h-5" />,
    description: 'Recent email campaigns'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Email performance metrics'
  },
  {
    id: 'testing',
    label: 'Testing',
    icon: <TestTube className="w-5 h-5" />,
    description: 'Test email functionality'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    description: 'Email configuration'
  }
];

const EmailSecondaryNav: React.FC<EmailSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = '',
  emailStats
}) => {
  return (
    <div className={`bg-white border-r border-gray-200 w-20 h-screen fixed top-0 left-20 z-30 ${className}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Mail className="w-6 h-6 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="py-4">
        <nav className="space-y-1 px-3">
          {EMAIL_TABS.map((tab) => {
            // Add badges for specific tabs
            let badge = tab.badge;
            if (tab.id === 'users' && emailStats?.totalUsers) {
              badge = emailStats.totalUsers;
            } else if (tab.id === 'campaigns' && emailStats?.sentToday) {
              badge = emailStats.sentToday;
            } else if (tab.id === 'analytics' && emailStats?.sentThisHour) {
              badge = emailStats.sentThisHour;
            }

            return (
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
                  <div className="flex items-center space-x-2">
                    <span>{tab.label}</span>
                    {badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-700 rounded-full">
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">{tab.description}</div>
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default EmailSecondaryNav;
