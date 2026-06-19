'use client'

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from '@/src/compat/router';
import { usePreserveNavScroll } from '@/src/hooks/usePreserveNavScroll';
import {
  BarChart3,
  ShoppingBag,
  Users,
  Mail,
  TrendingUp,
  Home,
  Palette,
  Settings,
  LogOut,
  Package,
  ChevronRight,
  CheckSquare,
  Activity,
  Database,
  Table,
  Truck,
  MessageSquare,
  RotateCcw,
  Brush,
  Layers,
  UtensilsCrossed,
  Shirt,
  FileText,
  Share2,
  Gift,
  Rss
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMenuItemClick: () => void;
  onExpand: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, onMenuItemClick, onExpand, onLogout }) => {
  const location = useLocation();
  const { navRef, onNavScroll } = usePreserveNavScroll([location.pathname]);
  const [hoveredItem, setHoveredItem] = useState<{ label: string; top: number } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, label: string) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredItem({
      label,
      top: rect.top + rect.height / 2,
    });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      setHoveredItem(null);
    };
    const nav = navRef.current;
    if (nav) {
      nav.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (nav) {
        nav.removeEventListener('scroll', handleScroll);
      }
    };
  }, [collapsed, navRef]);
  
  const menuItems = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/admin/tasks' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin' },
    { id: 'homepage', label: 'Homepage', icon: Home, path: '/admin/homepage' },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { id: 'blog', label: 'Blog', icon: FileText, path: '/admin/blog' },
    { id: 'marketing', label: 'Marketing', icon: TrendingUp, path: '/admin/marketing' },
    { id: 'normal', label: 'Normal', icon: Layers, path: '/admin/normal' },
    { id: 'gifts', label: 'Gifts', icon: Gift, path: '/admin/gifts' },
    { id: 'shipping', label: 'Shipping', icon: Truck, path: '/admin/shipping' },
    { id: 'returns', label: 'Returns', icon: RotateCcw, path: '/admin/returns' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'customer-care', label: 'Customer Care', icon: MessageSquare, path: '/admin/customer-care' },
    { id: 'email', label: 'Email Management', icon: Mail, path: '/admin/email' },
    { id: 'newsletter', label: 'Newsletter', icon: Rss, path: '/admin/newsletter' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/admin/analytics' },
    { id: 'social-posting', label: 'Social posting', icon: Share2, path: '/admin/social-posting' },
    { id: 'database', label: 'Database', icon: Database, path: '/admin/database' },
    { id: 'fb', label: 'F & B', icon: UtensilsCrossed, path: '/admin/fb' },
    { id: 'clothes', label: 'Clothes', icon: Shirt, path: '/admin/clothes' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-white h-screen shadow-lg border-r border-gray-200 fixed left-0 top-0 z-40 transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <Link to="/" className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <img 
            src="/logo.png" 
            alt="Lurevi" 
            className={`${collapsed ? 'h-8 w-auto' : 'h-10 w-auto'}`}
          />
          {!collapsed && (
            <div>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation with invisible scrollbar */}
      <nav
        ref={navRef}
        onScroll={onNavScroll}
        className="sidebar-scroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2 scrollbar-invisible"
      >
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/admin' && location.pathname === '/admin/');
            
            return (
              <li key={item.id}>
                <div className="relative group">
                  <Link
                    to={item.path}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                    onMouseLeave={handleMouseLeave}
                    className={`relative flex items-center ${collapsed ? 'justify-center px-3 py-2' : 'space-x-3 px-4 py-2'} rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-100 text-black'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-black pointer-events-none"
                        aria-hidden
                      />
                    )}
                    <Icon
                      className={`relative z-10 shrink-0 ${collapsed ? 'w-4 h-4' : 'w-4 h-4'} ${isActive ? 'text-gray-800' : 'text-gray-500 group-hover:text-gray-700'}`}
                      strokeWidth={2}
                    />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section - Logout Button */}
      <div className="p-2 border-t border-gray-200 flex-shrink-0">
        {collapsed ? (
          <div className="relative group">
            <button 
              onClick={onLogout}
              onMouseEnter={(e) => handleMouseEnter(e, 'Logout')}
              onMouseLeave={handleMouseLeave}
              className="flex items-center justify-center w-full py-2 px-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
            </button>
          </div>
        ) : (
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        )}
      </div>

      {/* Portal-like Tooltip for collapsed state - avoids overflow-x-hidden clipping */}
      {collapsed && hoveredItem && (
        <div 
          className="fixed bg-gray-900 text-white text-xs rounded px-2.5 py-1.5 whitespace-nowrap z-50 pointer-events-none shadow-md"
          style={{
            top: `${hoveredItem.top}px`,
            left: '88px', // w-20 (80px) + ml-2 (8px)
            transform: 'translateY(-50%)'
          }}
        >
          {hoveredItem.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      )}
    </div>
  );
};

export default Sidebar;




