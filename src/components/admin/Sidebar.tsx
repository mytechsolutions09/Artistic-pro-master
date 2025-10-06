import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  MessageSquare
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
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    // Load custom logo from localStorage
    const savedLogo = localStorage.getItem('customLogo');
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }
    
    // Listen for logo updates
    const handleLogoUpdate = (event: CustomEvent) => {
      setCustomLogo(event.detail.logoUrl);
    };
    
    window.addEventListener('logoUpdated', handleLogoUpdate as EventListener);
    
    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate as EventListener);
    };
  }, []);
  
  const menuItems = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/admin/tasks' },
    { id: 'activities', label: 'Activities', icon: Activity, path: '/admin/activities' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
    { id: 'clothes', label: 'Clothes', icon: Table, path: '/admin/clothes' },
    { id: 'shipping', label: 'Shipping', icon: Truck, path: '/admin/shipping' },
    { id: 'categories', label: 'Categories', icon: Palette, path: '/admin/categories' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'customer-care', label: 'Customer Care', icon: MessageSquare, path: '/admin/customer-care' },
    { id: 'email', label: 'Email Management', icon: Mail, path: '/admin/email' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/admin/analytics' },
    { id: 'homepage', label: 'Homepage', icon: Home, path: '/admin/homepage' },
    { id: 'database', label: 'Database', icon: Database, path: '/admin/database' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    { id: 'skeleton-test', label: 'Skeleton Test', icon: Palette, path: '/skeleton-test' },
    // Additional items to test scrolling
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { id: 'inventory', label: 'Inventory', icon: Package, path: '/admin/inventory' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/admin/customers' },
    { id: 'marketing', label: 'Marketing', icon: Mail, path: '/admin/marketing' },
    { id: 'integrations', label: 'Integrations', icon: Settings, path: '/admin/integrations' },
    { id: 'backup', label: 'Backup', icon: Database, path: '/admin/backup' },
    { id: 'logs', label: 'Logs', icon: Activity, path: '/admin/logs' },
    { id: 'maintenance', label: 'Maintenance', icon: Settings, path: '/admin/maintenance' }
  ];

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-white h-screen shadow-lg border-r border-pink-100 fixed left-0 top-0 z-40 transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-pink-100 flex-shrink-0">
        <Link to="/" className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          {customLogo ? (
            <img 
              src={customLogo} 
              alt="Lurevi" 
              className={`${collapsed ? 'h-8 w-auto' : 'h-10 w-auto'}`}
              onError={(e) => {
                console.error('Error loading custom logo:', e);
                e.currentTarget.src = '/lurevi-logo.svg';
              }}
            />
          ) : (
            <img 
              src="/lurevi-logo.svg" 
              alt="Lurevi" 
              className={`${collapsed ? 'h-8 w-auto' : 'h-10 w-auto'}`}
            />
          )}
          {!collapsed && (
            <div>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation with invisible scrollbar */}
      <nav className="p-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-invisible sidebar-scroll min-h-0 relative">
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
                    className={`flex items-center ${collapsed ? 'justify-center px-3 py-2' : 'space-x-3 px-4 py-2'} rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-pink-100 text-pink-700 border-l-4 border-pink-500'
                        : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <Icon className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5'} ${isActive ? 'text-pink-600' : 'text-gray-500 group-hover:text-pink-500'}`} />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                  
                  {/* Tooltip for collapsed state - positioned below */}
                  {collapsed && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                      {item.label}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section - Logout Button */}
      <div className="p-2 border-t border-pink-100 flex-shrink-0">
        {collapsed ? (
          <div className="relative group">
            <button 
              onClick={onLogout}
              className="flex items-center justify-center w-full py-2 px-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
            </button>
            
            {/* Tooltip for collapsed state - positioned below */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
              Logout
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
            </div>
          </div>
        ) : (
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
