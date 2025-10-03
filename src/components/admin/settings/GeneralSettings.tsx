import React, { useState } from 'react';
import { Save, Globe, Building, Mail } from 'lucide-react';

const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'ARVEXA',
    siteDescription: 'Premium digital art marketplace',
    siteUrl: 'https://arvexa.com',
    contactEmail: 'contact@arvexa.com',
    supportEmail: 'support@arvexa.com',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Art Street, Creative City, CC 12345',
    companyName: 'ARVEXA Inc.',
    timezone: 'America/New_York',
    language: 'en',
    maintenanceMode: false,
    registrationEnabled: true,
    termsUrl: 'https://arvexa.com/terms',
    privacyUrl: 'https://arvexa.com/privacy'
  });

  const handleSave = () => {

    // Add save logic here
  };

  return (
    <div className="space-y-2">
      {/* Site Information */}
      <div className="bg-white p-2 rounded border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Globe className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-semibold text-gray-800">Site Information</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
              placeholder="Enter site name"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Site URL</label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
              placeholder="https://yoursite.com"
            />
          </div>
          
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
              placeholder="Describe your platform"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white p-2 rounded border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Mail className="w-4 h-4 text-green-500" />
          <h2 className="text-sm font-semibold text-gray-800">Contact Information</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={settings.phoneNumber}
              onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
            />
          </div>
          
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={2}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
            />
          </div>
        </div>
      </div>

      {/* Localization */}
      <div className="bg-white p-2 rounded border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Globe className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-semibold text-gray-800">Localization</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </select>
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-white p-2 rounded border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Building className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-gray-800">Platform Settings</h2>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Maintenance Mode</h3>
              <p className="text-xs text-gray-500">Temporarily disable access to the platform</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="sr-only"
              />
              <div className={`relative w-9 h-5 rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-pink-500' : 'bg-gray-200'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.maintenanceMode ? 'translate-x-4' : ''
                }`} />
              </div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-800">User Registration</h3>
              <p className="text-xs text-gray-500">Allow new users to register accounts</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.registrationEnabled}
                onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
                className="sr-only"
              />
              <div className={`relative w-9 h-5 rounded-full transition-colors ${
                settings.registrationEnabled ? 'bg-pink-500' : 'bg-gray-200'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.registrationEnabled ? 'translate-x-4' : ''
                }`} />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Legal Pages */}
      <div className="bg-white p-2 rounded border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Building className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-800">Legal Pages</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Terms of Service URL</label>
            <input
              type="url"
              value={settings.termsUrl}
              onChange={(e) => setSettings({ ...settings, termsUrl: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
              placeholder="https://yoursite.com/terms"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Privacy Policy URL</label>
            <input
              type="url"
              value={settings.privacyUrl}
              onChange={(e) => setSettings({ ...settings, privacyUrl: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
              placeholder="https://yoursite.com/privacy"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;
