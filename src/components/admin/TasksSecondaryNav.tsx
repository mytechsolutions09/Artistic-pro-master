'use client';

import React from 'react';
import { usePreserveNavScroll } from '@/src/hooks/usePreserveNavScroll';
import { LayoutGrid, List, Plus, RefreshCw, Filter, CheckSquare } from 'lucide-react';

export interface TasksTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const TASKS_TABS: TasksTab[] = [
  {
    id: 'board',
    label: 'Board',
    icon: <LayoutGrid className="h-4 w-4" />,
    description: 'Column board view',
  },
  {
    id: 'list',
    label: 'List',
    icon: <List className="h-4 w-4" />,
    description: 'All tasks in a list',
  },
  {
    id: 'new',
    label: 'New task',
    icon: <Plus className="h-4 w-4" />,
    description: 'Create a task',
  },
  {
    id: 'refresh',
    label: 'Refresh',
    icon: <RefreshCw className="h-4 w-4" />,
    description: 'Reload tasks from server',
  },
  {
    id: 'filters',
    label: 'Filters',
    icon: <Filter className="h-4 w-4" />,
    description: 'Filter by status, priority, assignee',
  },
];

interface TasksSecondaryNavProps {
  activeTab: 'board' | 'list';
  onTabChange: (tabId: string) => void;
  filtersActive?: boolean;
  taskCount?: number;
  className?: string;
}

const TasksSecondaryNav: React.FC<TasksSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  filtersActive = false,
  taskCount,
  className = '',
}) => {
  const { navRef, onNavScroll } = usePreserveNavScroll([activeTab, filtersActive]);

  return (
    <div
      className={`fixed left-20 top-0 z-30 flex h-screen w-20 flex-col border-r border-gray-200 bg-white ${className}`}
    >
      <div className="shrink-0 border-b border-gray-200 p-4">
        <div className="flex items-center justify-center">
          <div className="rounded-lg bg-gray-100 p-1.5">
            <CheckSquare className="h-5 w-5 text-gray-700" />
          </div>
        </div>
      </div>

      <div ref={navRef} onScroll={onNavScroll} className="min-h-0 flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2.5">
          {TASKS_TABS.map((tab) => {
            const isViewTab = tab.id === 'board' || tab.id === 'list';
            const isActive =
              (isViewTab && activeTab === tab.id) ||
              (tab.id === 'filters' && filtersActive);

            let badge: string | number | undefined;
            if (tab.id === 'board' && taskCount != null && taskCount > 0) {
              badge = taskCount;
            }

            return (
              <button
                key={tab.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onTabChange(tab.id)}
                className={`group relative flex w-full items-center justify-center rounded-lg p-2.5 transition-all duration-200 ${
                  isActive ? 'bg-gray-50 text-black' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={tab.label}
              >
                {isActive && (
                  <div className="absolute bottom-0 left-0 top-0 w-1 rounded-r-full bg-black" />
                )}

                <span
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? 'text-black' : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                </span>

                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 transform whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="flex items-center space-x-2">
                    <span>{tab.label}</span>
                    {badge != null && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-300">{tab.description}</div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 transform border-4 border-transparent border-r-gray-900" />
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default TasksSecondaryNav;
