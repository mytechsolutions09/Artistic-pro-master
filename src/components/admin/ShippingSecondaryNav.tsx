'use client'

import React from 'react';
import { usePreserveNavScroll } from '@/src/hooks/usePreserveNavScroll';
import { Truck, MapPin, Clock, Package, Search, Plus, Filter, Download } from 'lucide-react';

export interface ShippingTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string | number;
}

interface ShippingSecondaryNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const SHIPPING_TABS: ShippingTab[] = [
  {
    id: 'shipments',
    label: 'Shipments',
    icon: <Truck className="h-4 w-4" />,
    description: 'View and manage all shipments'
  },
  {
    id: 'pincheck',
    label: 'Pin Code Check',
    icon: <MapPin className="h-4 w-4" />,
    description: 'Check serviceability for pin codes'
  },
  {
    id: 'rates',
    label: 'Rate Calculator',
    icon: <Search className="h-4 w-4" />,
    description: 'Calculate shipping rates'
  },
  {
    id: 'create',
    label: 'Create Shipment',
    icon: <Plus className="h-4 w-4" />,
    description: 'Create new shipments'
  },
  {
    id: 'warehouse',
    label: 'Warehouse',
    icon: <Package className="h-4 w-4" />,
    description: 'Manage warehouse details'
  },
  {
    id: 'advanced',
    label: 'Advanced Shipment',
    icon: <Filter className="h-4 w-4" />,
    description: 'Create advanced shipments with custom QC'
  },
  {
    id: 'waybills',
    label: 'Generate Waybills',
    icon: <Download className="h-4 w-4" />,
    description: 'Generate waybill numbers'
  },
  {
    id: 'tat',
    label: 'Expected TAT',
    icon: <Clock className="h-4 w-4" />,
    description: 'Calculate expected delivery time'
  },
  {
    id: 'pickup',
    label: 'Request Pickup',
    icon: <Truck className="h-4 w-4" />,
    description: 'Schedule pickup requests'
  }
];

const ShippingSecondaryNav: React.FC<ShippingSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  const { navRef, onNavScroll } = usePreserveNavScroll([activeTab]);

  return (
    <div
      className={`fixed left-20 top-0 z-30 flex h-screen w-[4.25rem] flex-col border-r border-gray-200 bg-white ${className}`}
    >
      <div className="shrink-0 border-b border-gray-100 px-2 py-2">
        <div className="flex justify-center">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
            <Truck className="h-4 w-4 text-gray-800" />
          </div>
        </div>
      </div>

      <div ref={navRef} onScroll={onNavScroll} className="min-h-0 flex-1 overflow-y-auto py-1.5">
        <nav className="space-y-0.5 px-1.5">
          {SHIPPING_TABS.map((tab) => (
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
                  {tab.badge !== undefined && tab.badge !== '' && (
                    <span className="rounded-full bg-white/15 px-1.5 py-px text-[10px] font-semibold tabular-nums">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[10px] font-normal text-gray-400">{tab.description}</div>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900" />
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ShippingSecondaryNav;




