'use client';

import React from 'react';
import { usePreserveNavScroll } from '@/src/hooks/usePreserveNavScroll';
import { Pencil, ClipboardList, CalendarDays, BarChart3, Share2 } from 'lucide-react';

export type SocialPostingTabId = 'compose' | 'queue' | 'calendar' | 'analytics';

interface SocialPostingSecondaryNavProps {
  activeTab: SocialPostingTabId;
  onTabChange: (tabId: SocialPostingTabId) => void;
  queueCount: number;
  className?: string;
}

const TABS: {
  id: SocialPostingTabId;
  label: string;
  Icon: typeof Pencil;
  description: string;
  badge?: boolean;
}[] = [
  { id: 'compose', label: 'Compose', Icon: Pencil, description: 'Write and copy posts' },
  {
    id: 'queue',
    label: 'Scheduled',
    Icon: ClipboardList,
    description: 'Posts queued for publishing',
    badge: true,
  },
  { id: 'calendar', label: 'Calendar', Icon: CalendarDays, description: 'Posts by date' },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3, description: 'Activity summary' },
];

const SocialPostingSecondaryNav: React.FC<SocialPostingSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  queueCount,
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
            <Share2 className="h-5 w-5 text-gray-700" />
          </div>
        </div>
      </div>

      <div ref={navRef} onScroll={onNavScroll} className="min-h-0 flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2.5">
          {TABS.map(({ id, label, Icon, description, badge }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onTabChange(id)}
                title={label}
                className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gray-50 text-black'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-black rounded-r-full" />
                )}
                <span
                  className={`relative w-5 h-5 flex items-center justify-center ${
                    isActive ? 'text-black' : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {badge && (
                    <span
                      className={`absolute -top-1 -right-2 min-w-[1rem] h-4 px-1 inline-flex items-center justify-center rounded-full text-[10px] font-semibold leading-none ${
                        queueCount > 0
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {queueCount > 99 ? '99+' : queueCount}
                    </span>
                  )}
                </span>

                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  <div>{label}</div>
                  <div className="text-xs text-gray-300 mt-1">{tabDescriptionWithCount(description, badge, queueCount)}</div>
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

function tabDescriptionWithCount(
  description: string,
  badge: boolean | undefined,
  queueCount: number
): string {
  if (badge) {
    return `${description} (${queueCount} in queue)`;
  }
  return description;
}

export default SocialPostingSecondaryNav;
