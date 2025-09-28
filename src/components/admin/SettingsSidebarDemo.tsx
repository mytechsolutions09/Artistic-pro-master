import React, { useState } from 'react';
import { Monitor, DollarSign, Bell } from 'lucide-react';

const SettingsSidebarDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('sidebar');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Settings Sidebar Navigation Demo
          </h1>
          <p className="text-gray-600">
            Vertical sidebar navigation matching your requested layout
          </p>
        </div>

        {/* Demo Layout Showcase */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200">
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Monitor className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
                    <p className="text-sm text-gray-600">Manage your platform</p>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="py-4">
                <nav className="space-y-1 px-3">
                  {[
                    { id: 'general', label: 'General', desc: 'Site information and basic configuration', active: false },
                    { id: 'currency', label: 'Currency', desc: 'Currency management and exchange rates', active: true },
                    { id: 'payment', label: 'Payment', desc: 'Payment methods and financial settings', active: false },
                    { id: 'notifications', label: 'Notifications', desc: 'Email alerts and system notifications', active: false },
                    { id: 'appearance', label: 'Appearance', desc: 'Theme, branding, and visual customization', active: false },
                    { id: 'users', label: 'Users & Roles', desc: 'User management and permission settings', active: false },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className={`w-full flex items-center px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        item.active
                          ? 'bg-pink-50 text-pink-700 border-r-2 border-pink-500'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`flex-shrink-0 ${
                        item.active ? 'text-pink-600' : 'text-gray-500'
                      }`}>
                        {item.id === 'currency' ? <DollarSign className="w-5 h-5" /> : 
                         item.id === 'notifications' ? <Bell className="w-5 h-5" /> :
                         <Monitor className="w-5 h-5" />}
                      </span>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{item.label}</span>
                        </div>
                        <p className={`text-xs mt-1 truncate ${
                          item.active ? 'text-pink-600' : 'text-gray-500'
                        }`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 w-80 p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>Currency</span>
                    <span>•</span>
                    <span>2 of 10</span>
                  </div>
                  <Monitor className="w-4 h-4 hover:text-gray-700 cursor-help" />
                </div>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Content Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-pink-600">
                      <DollarSign className="w-5 h-5" />
                    </span>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-800">Currency</h1>
                      <p className="text-sm text-gray-600">Currency management and exchange rates</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">2 of 10</div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-6">
                  {/* Currency Overview */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-800">Currency Overview</h2>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
                        Update Rates
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-xs font-medium text-blue-600">Total Currencies</p>
                        <p className="text-2xl font-bold text-blue-800">15</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-xs font-medium text-green-600">Active</p>
                        <p className="text-2xl font-bold text-green-800">6</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-xs font-medium text-red-600">Inactive</p>
                        <p className="text-2xl font-bold text-red-800">9</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-xs font-medium text-purple-600">Default</p>
                        <p className="text-xl font-bold text-purple-800">USD</p>
                      </div>
                    </div>
                  </div>

                  {/* Currency Configuration */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Currency Configuration</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                          <option>🇺🇸 USD - US Dollar</option>
                          <option>🇪🇺 EUR - Euro</option>
                          <option>🇬🇧 GBP - British Pound</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Base Currency</label>
                        <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                          USD - Used for calculations
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Update</label>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                          <span>Enabled</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Sidebar Navigation</h3>
            <p className="text-sm text-gray-600">
              Vertical sidebar with clear hierarchy, active states, and descriptions for each setting category.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Content Header</h3>
            <p className="text-sm text-gray-600">
              Dynamic header showing current tab icon, title, description, and progress indicator.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Responsive Layout</h3>
            <p className="text-sm text-gray-600">
              Fixed sidebar width with flexible content area that adapts to different screen sizes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebarDemo;
