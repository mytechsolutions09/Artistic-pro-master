'use client'

import React from 'react';
import { usePreserveNavScroll } from '@/src/hooks/usePreserveNavScroll';
import { Send, Users, TestTube, Mail, BarChart3, Settings, FileText } from 'lucide-react';

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
    icon: <Send className="h-4 w-4" />,
    description: 'Create and send emails'
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="h-4 w-4" />,
    description: 'Manage user list and selection'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: <FileText className="h-4 w-4" />,
    description: 'Email templates and presets'
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: <Mail className="h-4 w-4" />,
    description: 'Recent email campaigns'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Email performance metrics'
  },
  {
    id: 'testing',
    label: 'Testing',
    icon: <TestTube className="h-4 w-4" />,
    description: 'Test email functionality'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    description: 'Email configuration'
  }
];

const EmailSecondaryNav: React.FC<EmailSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = '',
  emailStats
}) => {
  const { navRef, onNavScroll } = usePreserveNavScroll([activeTab]);

  return (
    <div
      className={`fixed left-20 top-0 z-30 flex h-screen w-[4.25rem] flex-col border-r border-gray-200 bg-white ${className}`}
    >
      <div className="shrink-0 border-b border-gray-100 px-2 py-2">
        <div className="flex justify-center">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
            <Mail className="h-4 w-4 text-gray-800" />
          </div>
        </div>
      </div>

      <div ref={navRef} onScroll={onNavScroll} className="min-h-0 flex-1 overflow-y-auto py-1.5">
        <nav className="space-y-0.5 px-1.5">
          {EMAIL_TABS.map((tab) => {
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
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onTabChange(tab.id)}
                className={`group relative flex w-full items-center justify-center rounded-md p-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={tab.label}
              >
                {activeTab === tab.id && (
                  <div className="absolute bottom-1 left-0 top-1 w-0.5 rounded-full bg-gray-900" />
                )}

                <span
                  className={`shrink-0 ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}
                >
                  {tab.icon}
                </span>

                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-1.5 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-[11px] text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{tab.label}</span>
                    {badge !== undefined && badge !== '' && (
                      <span className="rounded-full bg-white/15 px-1.5 py-px text-[10px] font-semibold tabular-nums">
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] font-normal text-gray-400">{tab.description}</div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900" />
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




