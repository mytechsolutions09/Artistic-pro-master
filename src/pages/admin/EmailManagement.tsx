import React, { useState, useEffect } from 'react';
import { Send, Users, Clock, CheckCircle, AlertCircle, CheckCircle2, TestTube, Download, UserPlus, Mail } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { EmailService, EmailRecipient } from '../../services/emailService';
import { EmailTestUtils } from '../../utils/emailTestUtils';
import { RealUserService, RealUser } from '../../services/realUserService';
import EmailSecondaryNav from '../../components/admin/EmailSecondaryNav';

const EmailManagement: React.FC = () => {
  const [emailContent, setEmailContent] = useState({
    subject: '',
    message: '',
    recipient: 'all'
  });
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<Array<{ id: string; name: string; sent: string; date: string }>>([]);
  const [emailStats, setEmailStats] = useState({
    sentToday: 0,
    sentThisHour: 0,
    rateLimitRemaining: { hourly: 100, daily: 1000 }
  });
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ test: string; result: { success: boolean; message: string } }> | null>(null);
  const [users, setUsers] = useState<RealUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');

  const emailTemplates = [
    { id: '1', name: 'New Artwork Notification', subject: 'Fresh Art Just Added!', type: 'marketing' },
    { id: '2', name: 'Order Confirmation', subject: 'Your Order is Confirmed', type: 'transactional' },
    { id: '3', name: 'Welcome Email', subject: 'Welcome to ArtGallery', type: 'onboarding' },
    { id: '4', name: 'Newsletter', subject: 'Weekly Art Update', type: 'marketing' },
    { id: '5', name: 'Password Reset', subject: 'Reset Your Password', type: 'security' }
  ];

  useEffect(() => {
    const loadEmailStats = () => {
      const stats = EmailService.getEmailStats();
      setEmailStats(stats);
    };
    
    const loadSubscribers = async () => {
      try {
        // Load real users from database
        const realUsers = await RealUserService.getAllUsers();
        setUsers(realUsers);
        setTotalSubscribers(realUsers.length);
      } catch (error) {
        console.error('Failed to load subscribers:', error);
        setTotalSubscribers(0);
        setUsers([]);
      }
    };
    
    loadEmailStats();
    loadSubscribers();
    
    // Refresh stats every minute
    const interval = setInterval(loadEmailStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailContent.subject || !emailContent.message) {
      setSendResult({ success: false, message: 'Please fill in all fields' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      // Get recipients based on selection
      let recipients: EmailRecipient[] = [];
      
      if (emailContent.recipient === 'selected' && selectedUsers.length > 0) {
        recipients = getSelectedUserEmails();
      } else if (emailContent.recipient === 'all' && users.length > 0) {
        recipients = users.map(user => ({
          email: user.email,
          name: user.raw_user_meta_data?.name || user.email.split('@')[0]
        }));
      } else {
        // Fallback to test recipient
        recipients = [{ email: 'test@example.com', name: 'Test User' }];
      }

      const result = await EmailService.sendEmail({
        to: recipients,
        subject: emailContent.subject,
        html: emailContent.message.replace(/\n/g, '<br>'),
        text: emailContent.message
      });

      if (result.success) {
        setSendResult({ success: true, message: 'Email sent successfully!' });
        setEmailContent({ subject: '', message: '', recipient: 'all' });
        // Refresh stats
        const stats = EmailService.getEmailStats();
        setEmailStats(stats);
        // Add to recent campaigns
        setRecentCampaigns(prev => [{
          id: Date.now().toString(),
          name: emailContent.subject,
          sent: recipients.length.toString(),
          date: new Date().toISOString()
        }, ...prev.slice(0, 4)]);
      } else {
        setSendResult({ success: false, message: result.error || 'Failed to send email' });
      }
    } catch (error) {
      setSendResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setEmailContent({
      ...emailContent,
      subject: template.subject,
      message: `Hello,\n\n${template.name} content goes here...\n\nBest regards,\nArtGallery Team`
    });
  };

  // Test all email functionality
  const handleTestEmails = async () => {
    setIsTesting(true);
    setTestResults(null);
    
    try {
      const results = await EmailTestUtils.runAllTests();
      setTestResults(results.results);
    } catch (error) {
      console.error('Testing failed:', error);
      setTestResults([{
        test: 'Test Suite',
        result: { success: false, message: 'Testing failed' }
      }]);
    } finally {
      setIsTesting(false);
    }
  };

  // Test email configuration
  const handleTestConfiguration = () => {
    const configTest = EmailTestUtils.testEmailConfiguration();
    setSendResult({
      success: configTest.success,
      message: configTest.message
    });
  };

  // Load users from database
  const handleLoadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const realUsers = await RealUserService.getAllUsers();
      setUsers(realUsers);
      setTotalSubscribers(realUsers.length);
      setSendResult({
        success: true,
        message: `Loaded ${realUsers.length} users from database`
      });
    } catch (error) {
      console.error('Failed to load users:', error);
      setSendResult({
        success: false,
        message: 'Failed to load users from database'
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Handle user selection
  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  // Get selected user emails
  const getSelectedUserEmails = (): EmailRecipient[] => {
    return users
      .filter(user => selectedUsers.includes(user.id))
      .map(user => ({
        email: user.email,
        name: user.raw_user_meta_data?.name || user.email.split('@')[0]
      }));
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Auto-show user list when users tab is selected
    if (tabId === 'users') {
      setShowUserList(true);
    }
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'compose':
        return renderComposeTab();
      case 'users':
        return renderUsersTab();
      case 'templates':
        return renderTemplatesTab();
      case 'campaigns':
        return renderCampaignsTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'testing':
        return renderTestingTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderComposeTab();
    }
  };

  const renderComposeTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Compose Email */}
        <div className="lg:col-span-2">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Compose Email</h2>
          <form onSubmit={handleSendEmail} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                <select
                  value={emailContent.recipient}
                  onChange={(e) => setEmailContent({ ...emailContent, recipient: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value="all">All Users ({users.length})</option>
                  <option value="selected">Selected Users ({selectedUsers.length})</option>
                  <option value="customers">Customers Only</option>
                  <option value="artists">Artists Only</option>
                  <option value="test">Test Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                  placeholder="Enter email subject"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={emailContent.message}
                  onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                placeholder="Enter your email message..."
                rows={5}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            {/* Send Result */}
            {sendResult && (
              <div className={`flex items-center space-x-2 p-3 rounded-md text-sm ${
                sendResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {sendResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{sendResult.message}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                disabled={isSending}
                className="flex items-center space-x-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending...' : 'Send'}</span>
              </button>
              <button
                type="button"
                onClick={handleLoadUsers}
                disabled={isLoadingUsers}
                className="flex items-center space-x-2 px-3 py-2 border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{isLoadingUsers ? 'Loading...' : 'Load Users'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUserList(!showUserList)}
                className="flex items-center space-x-2 px-3 py-2 border border-purple-200 text-purple-600 hover:bg-purple-50 text-sm rounded-md transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Users ({users.length})</span>
              </button>
              <button
                type="button"
                onClick={handleTestConfiguration}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm rounded-md transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Test</span>
                </button>
                <button
                  type="button"
                onClick={handleTestEmails}
                disabled={isTesting}
                className="flex items-center space-x-2 px-3 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm rounded-md transition-colors"
              >
                <TestTube className="w-4 h-4" />
                <span>{isTesting ? 'Testing...' : 'Test All'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* User List */}
        {showUserList && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold text-gray-800">User List</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors"
                >
                  {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-xs text-gray-500">
                  {selectedUsers.length} of {users.length} selected
                </span>
              </div>
            </div>
            
            {users.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-2 border border-gray-100 rounded-md hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-pink-700">
                              {(user.raw_user_meta_data?.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.raw_user_meta_data?.name || user.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.role || 'customer'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-400 mb-1">
                  <Users className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-gray-500 text-xs">No users loaded</p>
                <p className="text-gray-400 text-xs mt-1">Click "Load Users" to import from database</p>
              </div>
            )}
          </div>
        )}

        {/* Test Results */}
        {testResults && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50 mb-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((test, index) => (
                <div key={index} className={`flex items-center space-x-2 p-2 rounded-md text-sm ${
                  test.result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {test.result.success ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="font-medium">{test.test}</span>
                  <span>{test.result.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Statistics */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Email Statistics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-pink-500" />
                <span className="text-sm text-gray-600">Total Users</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">{totalSubscribers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Sent Today</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">{emailStats.sentToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">This Hour</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">{emailStats.sentThisHour}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Hourly Limit</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">{emailStats.rateLimitRemaining.hourly}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Daily Limit</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">{emailStats.rateLimitRemaining.daily}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">User Management</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLoadUsers}
              disabled={isLoadingUsers}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isLoadingUsers ? 'Loading...' : 'Load Users'}</span>
            </button>
            <span className="text-sm text-gray-600">
              {users.length} users loaded, {selectedUsers.length} selected
            </span>
          </div>
          <button
            onClick={handleSelectAll}
            className="text-sm px-3 py-1 bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition-colors"
          >
            {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
          </button>
          </div>

        {users.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-pink-700">
                      {(user.raw_user_meta_data?.name || user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.raw_user_meta_data?.name || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400">{user.role || 'customer'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No users loaded</p>
            <p className="text-gray-400 text-sm">Click "Load Users" to import from database</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emailTemplates.map((template) => (
            <div 
              key={template.id} 
              onClick={() => handleTemplateSelect(template)}
              className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors cursor-pointer"
            >
              <h4 className="font-medium text-gray-800 mb-2">{template.name}</h4>
              <p className="text-sm text-gray-500 mb-3">{template.subject}</p>
              <span className="inline-block px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">
                {template.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCampaignsTab = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Campaigns</h2>
        {recentCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-pink-25 border-b border-pink-100">
                  <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Sent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {recentCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-pink-25 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{campaign.name}</td>
                      <td className="px-4 py-3 text-gray-600">{campaign.sent}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(campaign.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        ) : (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No campaigns sent yet</p>
            <p className="text-gray-400 text-sm">Send your first email to see it here</p>
          </div>
        )}
          </div>
        </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-pink-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalSubscribers.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Send className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Sent Today</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{emailStats.sentToday}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">This Hour</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{emailStats.sentThisHour}</p>
                </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Hourly Limit</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{emailStats.rateLimitRemaining.hourly}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTestingTab = () => (
            <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Testing</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={handleTestConfiguration}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Test Configuration</span>
          </button>
          <button
            onClick={handleTestEmails}
            disabled={isTesting}
            className="flex items-center space-x-2 px-4 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <TestTube className="w-4 h-4" />
            <span>{isTesting ? 'Testing...' : 'Test All'}</span>
          </button>
        </div>
        
        {testResults && (
          <div className="space-y-2">
            {testResults.map((test, index) => (
              <div key={index} className={`p-3 rounded-md border text-sm ${
                test.result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {test.result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium text-gray-800">{test.test}</span>
                </div>
                <p className={`text-xs mt-1 ${
                  test.result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {test.result.message}
                </p>
              </div>
            ))}
          </div>
        )}
                </div>
              </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Settings</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">SMTP Configuration</h3>
            <p className="text-sm text-gray-600">Configure your Hostinger SMTP settings</p>
            <button
              onClick={handleTestConfiguration}
              className="mt-2 px-3 py-1 bg-pink-100 text-pink-700 rounded text-sm hover:bg-pink-200 transition-colors"
            >
              Test Configuration
            </button>
                </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Rate Limits</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Hourly Limit:</span>
                <span className="ml-2 font-medium">{emailStats.rateLimitRemaining.hourly}/100</span>
              </div>
              <div>
                <span className="text-gray-600">Daily Limit:</span>
                <span className="ml-2 font-medium">{emailStats.rateLimitRemaining.daily}/1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Email Management" noHeader={true}>
      {/* Secondary Navigation - Vertical Sidebar */}
      <EmailSecondaryNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        emailStats={{
          sentToday: emailStats.sentToday,
          sentThisHour: emailStats.sentThisHour,
          totalUsers: users.length,
          selectedUsers: selectedUsers.length
        }}
      />
      
      {/* Main Content with left margin for sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden ml-24">
        <div className="p-6">
          {/* Compact Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Email Management</h2>
            <p className="text-sm text-gray-600">Manage your email campaigns and communications</p>
          </div>
          
          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmailManagement;