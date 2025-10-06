import React, { useState } from 'react';
import { Users, Lock, Monitor, Sliders, Zap } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import SettingsSecondaryNav from '../../components/admin/SettingsSecondaryNav';
import GeneralSettings from '../../components/admin/settings/GeneralSettings';
import CurrencySettings from '../../components/admin/settings/CurrencySettings';
import PaymentSettings from '../../components/admin/settings/PaymentSettings';
import NotificationSettings from '../../components/admin/settings/NotificationSettings';
import PlaceholderSettings from '../../components/admin/settings/PlaceholderSettings';
import CouponSettings from '../../components/admin/settings/CouponSettings';
import AppearanceSettings from '../../components/admin/settings/AppearanceSettings';
import LogoSettings from '../../components/admin/settings/LogoSettings';
import { StorageTest } from '../../components/admin/StorageTest';
import Reviews from './Reviews';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'currency':
        return <CurrencySettings />;
      case 'payment':
        return <PaymentSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'logo':
        return <LogoSettings />;
      case 'users':
        return (
          <PlaceholderSettings
            title="Users & Roles"
            description="Manage user accounts, roles, permissions, and access controls for your platform."
            icon={<Users className="w-8 h-8" />}
            features={[
              'User role management',
              'Permission system',
              'User registration settings',
              'Account verification options',
              'User profile customization',
              'Bulk user operations',
              'User activity tracking',
              'Access control lists'
            ]}
          />
        );
      case 'integrations':
        return (
          <PlaceholderSettings
            title="Integrations & APIs"
            description="Connect with third-party services and manage API integrations to extend your platform's capabilities."
            icon={<Zap className="w-8 h-8" />}
            features={[
              'Third-party API connections',
              'Webhook management',
              'Social media integrations',
              'Analytics integrations',
              'Email service providers',
              'Cloud storage connections',
              'Marketing tool integrations',
              'Custom API endpoints'
            ]}
          />
        );
      case 'security':
        return (
          <PlaceholderSettings
            title="Security & Privacy"
            description="Configure security policies, privacy settings, and data protection measures for your platform."
            icon={<Lock className="w-8 h-8" />}
            features={[
              'Two-factor authentication',
              'Password policies',
              'Session management',
              'IP whitelisting/blacklisting',
              'Data encryption settings',
              'Privacy policy management',
              'GDPR compliance tools',
              'Security audit logs'
            ]}
          />
        );
      case 'storage':
        return <StorageTest />;
      case 'system':
        return (
          <PlaceholderSettings
            title="System Configuration"
            description="Manage system-level settings, performance optimization, and technical configurations."
            icon={<Monitor className="w-8 h-8" />}
            features={[
              'Performance monitoring',
              'Database optimization',
              'Cache management',
              'Backup and restore',
              'System logs and debugging',
              'Server resource monitoring',
              'Maintenance mode controls',
              'System health checks'
            ]}
          />
        );
      case 'advanced':
        return (
          <PlaceholderSettings
            title="Advanced Configuration"
            description="Advanced settings and developer options for fine-tuning your platform's behavior."
            icon={<Sliders className="w-8 h-8" />}
            features={[
              'Developer API settings',
              'Custom code injection',
              'Environment variables',
              'Feature flags',
              'Advanced routing',
              'Custom database queries',
              'Performance profiling',
              'Debug mode controls'
            ]}
          />
        );
      case 'reviews':
        return <Reviews />;
      case 'coupons':
        return <CouponSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <AdminLayout title="">
      {/* Layout with safe spacing so headers are not overlapped */}
      <div className="flex h-full bg-gray-50 -m-4 overflow-hidden">
               {/* Fixed Sidebar Navigation */}
       <SettingsSecondaryNav 
         activeTab={activeTab}
         onTabChange={setActiveTab}
         className="h-full"
       />
       
               {/* Main Content Area with left margin to account for fixed sidebars */}
        <div className="flex-1 flex flex-col ml-24 min-h-0 overflow-hidden">
          {/* Content */}
          <div className="flex-1 bg-gray-50 pt-12 pb-2 pr-2">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
