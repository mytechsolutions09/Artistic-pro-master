import React, { useState } from 'react';
import { Save, Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: {
      newOrders: true,
      newUsers: true,
      paymentReceived: true,
      lowStock: false,
      systemUpdates: true,
      marketingEmails: false,
      weeklyReports: true,
      monthlyReports: true
    },
    pushNotifications: {
      newOrders: true,
      newUsers: false,
      paymentReceived: true,
      systemAlerts: true,
      maintenanceMode: true
    },
    smsNotifications: {
      criticalAlerts: false,
      paymentIssues: false,
      systemDown: false
    },
    notificationFrequency: {
      orderDigest: 'immediate',
      userDigest: 'daily',
      reportsDigest: 'weekly'
    },
    emailSettings: {
      fromName: 'Lurevi',
      fromEmail: 'noreply@lurevi.com',
      replyToEmail: 'support@lurevi.com'
    }
  });

  const handleSave = () => {

    // Add save logic here
  };

  const toggleEmailNotification = (key: string) => {
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        [key]: !settings.emailNotifications[key as keyof typeof settings.emailNotifications]
      }
    });
  };

  const togglePushNotification = (key: string) => {
    setSettings({
      ...settings,
      pushNotifications: {
        ...settings.pushNotifications,
        [key]: !settings.pushNotifications[key as keyof typeof settings.pushNotifications]
      }
    });
  };

  const toggleSmsNotification = (key: string) => {
    setSettings({
      ...settings,
      smsNotifications: {
        ...settings.smsNotifications,
        [key]: !settings.smsNotifications[key as keyof typeof settings.smsNotifications]
      }
    });
  };

  const NotificationToggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        onChange={onChange}
        className="sr-only"
      />
      <div className={`relative w-10 h-6 rounded-full transition-colors ${
        enabled ? 'bg-pink-500' : 'bg-gray-200'
      }`}>
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-4' : ''
        }`} />
      </div>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Email Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">New Orders</h3>
              <p className="text-sm text-gray-500">Get notified when new orders are placed</p>
            </div>
            <NotificationToggle 
              enabled={settings.emailNotifications.newOrders} 
              onChange={() => toggleEmailNotification('newOrders')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">New User Registrations</h3>
              <p className="text-sm text-gray-500">Get notified when new users register</p>
            </div>
            <NotificationToggle 
              enabled={settings.emailNotifications.newUsers} 
              onChange={() => toggleEmailNotification('newUsers')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Payment Received</h3>
              <p className="text-sm text-gray-500">Get notified when payments are processed</p>
            </div>
            <NotificationToggle 
              enabled={settings.emailNotifications.paymentReceived} 
              onChange={() => toggleEmailNotification('paymentReceived')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Low Stock Alerts</h3>
              <p className="text-sm text-gray-500">Get notified when product stock is low</p>
            </div>
            <NotificationToggle 
              enabled={settings.emailNotifications.lowStock} 
              onChange={() => toggleEmailNotification('lowStock')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">System Updates</h3>
              <p className="text-sm text-gray-500">Get notified about system updates and maintenance</p>
            </div>
            <NotificationToggle 
              enabled={settings.emailNotifications.systemUpdates} 
              onChange={() => toggleEmailNotification('systemUpdates')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Marketing Emails</h3>
              <p className="text-sm text-gray-500">Receive promotional and marketing emails</p>
            </div>
            <NotificationToggle 
              enabled={settings.emailNotifications.marketingEmails} 
              onChange={() => toggleEmailNotification('marketingEmails')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Weekly Reports</h3>
              <p className="text-sm text-gray-500">Receive weekly performance reports</p>
            </div>
            <NotificationToggle 
              enabled={settings.emailNotifications.weeklyReports} 
              onChange={() => toggleEmailNotification('weeklyReports')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Monthly Reports</h3>
              <p className="text-sm text-gray-500">Receive monthly analytics reports</p>
            </div>
            <NotificationToggle 
              enabled={settings.emailNotifications.monthlyReports} 
              onChange={() => toggleEmailNotification('monthlyReports')} 
            />
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Smartphone className="w-6 h-6 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">Push Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">New Orders</h3>
              <p className="text-sm text-gray-500">Instant push notifications for new orders</p>
            </div>
            <NotificationToggle 
              enabled={settings.pushNotifications.newOrders} 
              onChange={() => togglePushNotification('newOrders')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">New Users</h3>
              <p className="text-sm text-gray-500">Push notifications for new user registrations</p>
            </div>
            <NotificationToggle 
              enabled={settings.pushNotifications.newUsers} 
              onChange={() => togglePushNotification('newUsers')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Payment Received</h3>
              <p className="text-sm text-gray-500">Push notifications for successful payments</p>
            </div>
            <NotificationToggle 
              enabled={settings.pushNotifications.paymentReceived} 
              onChange={() => togglePushNotification('paymentReceived')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">System Alerts</h3>
              <p className="text-sm text-gray-500">Critical system alerts and warnings</p>
            </div>
            <NotificationToggle 
              enabled={settings.pushNotifications.systemAlerts} 
              onChange={() => togglePushNotification('systemAlerts')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Maintenance Mode</h3>
              <p className="text-sm text-gray-500">Notifications when maintenance mode is activated</p>
            </div>
            <NotificationToggle 
              enabled={settings.pushNotifications.maintenanceMode} 
              onChange={() => togglePushNotification('maintenanceMode')} 
            />
          </div>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <MessageSquare className="w-6 h-6 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-800">SMS Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> SMS notifications are available for critical alerts only. 
              Standard messaging rates may apply.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Critical Alerts</h3>
              <p className="text-sm text-gray-500">Critical system failures and urgent issues</p>
            </div>
            <NotificationToggle 
              enabled={settings.smsNotifications.criticalAlerts} 
              onChange={() => toggleSmsNotification('criticalAlerts')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Payment Issues</h3>
              <p className="text-sm text-gray-500">Failed payments and billing issues</p>
            </div>
            <NotificationToggle 
              enabled={settings.smsNotifications.paymentIssues} 
              onChange={() => toggleSmsNotification('paymentIssues')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">System Down</h3>
              <p className="text-sm text-gray-500">System outages and downtime alerts</p>
            </div>
            <NotificationToggle 
              enabled={settings.smsNotifications.systemDown} 
              onChange={() => toggleSmsNotification('systemDown')} 
            />
          </div>
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-800">Notification Frequency</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Notifications</label>
            <select
              value={settings.notificationFrequency.orderDigest}
              onChange={(e) => setSettings({
                ...settings,
                notificationFrequency: {
                  ...settings.notificationFrequency,
                  orderDigest: e.target.value
                }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="immediate">Immediate</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="never">Never</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Activity</label>
            <select
              value={settings.notificationFrequency.userDigest}
              onChange={(e) => setSettings({
                ...settings,
                notificationFrequency: {
                  ...settings.notificationFrequency,
                  userDigest: e.target.value
                }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reports</label>
            <select
              value={settings.notificationFrequency.reportsDigest}
              onChange={(e) => setSettings({
                ...settings,
                notificationFrequency: {
                  ...settings.notificationFrequency,
                  reportsDigest: e.target.value
                }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="w-6 h-6 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-800">Email Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
            <input
              type="text"
              value={settings.emailSettings.fromName}
              onChange={(e) => setSettings({
                ...settings,
                emailSettings: {
                  ...settings.emailSettings,
                  fromName: e.target.value
                }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Your Platform Name"
            />
            <p className="text-xs text-gray-500 mt-1">Name displayed in email from field</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
            <input
              type="email"
              value={settings.emailSettings.fromEmail}
              onChange={(e) => setSettings({
                ...settings,
                emailSettings: {
                  ...settings.emailSettings,
                  fromEmail: e.target.value
                }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="noreply@yoursite.com"
            />
            <p className="text-xs text-gray-500 mt-1">Email address for outgoing notifications</p>
          </div>
          
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reply-To Email</label>
            <input
              type="email"
              value={settings.emailSettings.replyToEmail}
              onChange={(e) => setSettings({
                ...settings,
                emailSettings: {
                  ...settings.emailSettings,
                  replyToEmail: e.target.value
                }
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="support@yoursite.com"
            />
            <p className="text-xs text-gray-500 mt-1">Email address for user replies</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="flex items-center space-x-2 px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          <Save className="w-5 h-5" />
          <span>Save Notification Settings</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
