import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import MemoryMonitorComponent from '../MemoryMonitor';
import NotificationContainer from '../Notification';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  noHeader?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, noHeader = false }) => {
  const { signOut } = useAuth();
  const sidebarCollapsed = true; // Always collapsed

  const handleMenuItemClick = () => {
    // No-op since sidebar is always collapsed
  };

  const handleToggle = () => {
    // No-op since sidebar is always collapsed
  };

  const handleExpand = () => {
    // No-op since sidebar is always collapsed
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={handleToggle}
        onMenuItemClick={handleMenuItemClick}
        onExpand={handleExpand}
        onLogout={handleLogout}
      />
      <div className={`flex-1 overflow-auto transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        <div className={noHeader ? "p-0" : "p-4"}>
          {title && !noHeader && (
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </div>
      {/* Memory Monitor for Admin */}
      <MemoryMonitorComponent showDetails={true} threshold={75} />
      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
};

export default AdminLayout;
