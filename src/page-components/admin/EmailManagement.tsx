'use client'

import React, { useState, useEffect } from 'react';
import { Send, Users, Clock, CheckCircle, AlertCircle, CheckCircle2, TestTube, Download, UserPlus, Mail } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { EmailService, EmailRecipient } from '../../services/emailService';
import { EmailTestUtils } from '../../utils/emailTestUtils';
import { RealUserService, RealUser } from '../../services/realUserService';
import EmailSecondaryNav from '../../components/admin/EmailSecondaryNav';

const inputCls =
  'h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const textareaCls =
  'min-h-[5.5rem] w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const cardCls = 'rounded-lg border border-gray-200 bg-white p-2 shadow-sm';

const btnPrimary =
  'inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-gray-900 px-2.5 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

const btnOutline =
  'inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

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
    { id: '3', name: 'Welcome Email', subject: 'Welcome to Lurevi', type: 'onboarding' },
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
      message: `Hello,\n\n${template.name} content goes here...\n\nBest regards,\nLurevi Team`
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

  // Test Hostinger-specific functionality
  const handleTestHostinger = async () => {
    setIsTesting(true);
    setTestResults(null);
    
    try {
      const results = await EmailTestUtils.runHostingerTests();
      setTestResults(results.results);
    } catch (error) {
      console.error('Hostinger testing failed:', error);
      setTestResults([{
        test: 'Hostinger Test Suite',
        result: { success: false, message: 'Hostinger testing failed' }
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
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
      <div className="space-y-2 lg:col-span-2">
        <div className={cardCls}>
          <h2 className="mb-2 border-b border-gray-100 pb-1.5 text-xs font-semibold text-gray-900">Compose</h2>
          <form onSubmit={handleSendEmail} className="space-y-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div>
                <label className="mb-0.5 block text-[11px] font-medium text-gray-600">Recipients</label>
                <select
                  value={emailContent.recipient}
                  onChange={(e) => setEmailContent({ ...emailContent, recipient: e.target.value })}
                  className={`${inputCls} w-full`}
                >
                  <option value="all">All users ({users.length})</option>
                  <option value="selected">Selected ({selectedUsers.length})</option>
                  <option value="customers">Customers only</option>
                  <option value="artists">Artists only</option>
                  <option value="test">Test</option>
                </select>
              </div>
              <div>
                <label className="mb-0.5 block text-[11px] font-medium text-gray-600">Subject</label>
                <input
                  type="text"
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                  placeholder="Subject line"
                  className={`${inputCls} w-full`}
                />
              </div>
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] font-medium text-gray-600">Message</label>
              <textarea
                value={emailContent.message}
                onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                placeholder="Plain text (line breaks preserved)"
                rows={5}
                className={textareaCls}
              />
            </div>

            {sendResult && (
              <div
                className={`flex items-start gap-1.5 rounded-md px-2 py-1.5 text-[11px] ${
                  sendResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {sendResult.success ? (
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <span>{sendResult.message}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 border-t border-gray-100 pt-2">
              <button type="submit" disabled={isSending} className={btnPrimary}>
                <Send className="h-3.5 w-3.5" />
                {isSending ? 'Sending…' : 'Send'}
              </button>
              <button type="button" onClick={handleLoadUsers} disabled={isLoadingUsers} className={btnOutline}>
                <Download className="h-3.5 w-3.5" />
                {isLoadingUsers ? 'Loading…' : 'Load users'}
              </button>
              <button type="button" onClick={() => setShowUserList(!showUserList)} className={btnOutline}>
                <UserPlus className="h-3.5 w-3.5" />
                Pick ({users.length})
              </button>
              <button type="button" onClick={handleTestConfiguration} className={btnOutline}>
                <CheckCircle className="h-3.5 w-3.5" />
                Config
              </button>
              <button type="button" onClick={handleTestEmails} disabled={isTesting} className={btnOutline}>
                <TestTube className="h-3.5 w-3.5" />
                {isTesting ? 'Testing…' : 'Test all'}
              </button>
            </div>
          </form>
        </div>

        {showUserList && (
          <div className={cardCls}>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 border-b border-gray-100 pb-1.5">
              <h3 className="text-xs font-semibold text-gray-900">Recipients</h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  {selectedUsers.length === users.length ? 'Clear' : 'All'}
                </button>
                <span className="text-[10px] text-gray-500 tabular-nums">
                  {selectedUsers.length}/{users.length}
                </span>
              </div>
            </div>

            {users.length > 0 ? (
              <div className="max-h-52 overflow-y-auto">
                <div className="space-y-1">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex cursor-pointer items-center gap-2 rounded border border-gray-100 px-1.5 py-1 hover:bg-gray-50/80"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700">
                        {(user.raw_user_meta_data?.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-gray-900">
                          {user.raw_user_meta_data?.name || user.email.split('@')[0]}
                        </p>
                        <p className="truncate text-[10px] text-gray-500">{user.email}</p>
                      </div>
                      <span className="shrink-0 text-[10px] capitalize text-gray-400">{user.role || 'customer'}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <Users className="mx-auto mb-1 h-6 w-6 text-gray-300" />
                <p className="text-[11px] text-gray-500">No users</p>
                <p className="text-[10px] text-gray-400">Use Load users</p>
              </div>
            )}
          </div>
        )}

        {testResults && (
          <div className={cardCls}>
            <h3 className="mb-1.5 text-xs font-semibold text-gray-900">Test results</h3>
            <div className="space-y-1">
              {testResults.map((test, index) => (
                <div
                  key={index}
                  className={`flex flex-wrap items-center gap-1.5 rounded-md px-2 py-1 text-[11px] ${
                    test.result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {test.result.success ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="font-medium">{test.test}</span>
                  <span className="text-[10px] opacity-90">{test.result.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={cardCls + ' h-fit lg:sticky lg:top-2'}>
        <h3 className="mb-1.5 border-b border-gray-100 pb-1.5 text-xs font-semibold text-gray-900">Stats</h3>
        <div className="flex flex-col gap-1">
          {[
            { label: 'Users', value: totalSubscribers.toLocaleString(), icon: Users, c: 'text-gray-600' },
            { label: 'Sent today', value: emailStats.sentToday, icon: Send, c: 'text-blue-600' },
            { label: 'This hour', value: emailStats.sentThisHour, icon: Clock, c: 'text-amber-600' },
            { label: 'Hour left', value: emailStats.rateLimitRemaining.hourly, icon: CheckCircle, c: 'text-green-600' },
            { label: 'Day left', value: emailStats.rateLimitRemaining.daily, icon: CheckCircle, c: 'text-green-700' }
          ].map(({ label, value, icon: Icon, c }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-2 rounded-md border border-gray-100 bg-gray-50/60 px-2 py-1"
            >
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-600">
                <Icon className={`h-3 w-3 shrink-0 ${c}`} />
                {label}
              </span>
              <span className="text-xs font-semibold tabular-nums text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-2">
      <div className={cardCls}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-1.5">
          <h2 className="text-xs font-semibold text-gray-900">Users</h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={handleLoadUsers} disabled={isLoadingUsers} className={btnPrimary}>
              <Download className="h-3.5 w-3.5" />
              {isLoadingUsers ? 'Loading…' : 'Load'}
            </button>
            <button type="button" onClick={handleSelectAll} className={btnOutline}>
              {selectedUsers.length === users.length ? 'Clear all' : 'Select all'}
            </button>
            <span className="text-[10px] text-gray-500 tabular-nums">
              {users.length} · {selectedUsers.length} sel.
            </span>
          </div>
        </div>

        {users.length > 0 ? (
          <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-100 p-1.5 hover:bg-gray-50/80"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700">
                    {(user.raw_user_meta_data?.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-gray-900">
                      {user.raw_user_meta_data?.name || user.email.split('@')[0]}
                    </p>
                    <p className="truncate text-[10px] text-gray-500">{user.email}</p>
                    <p className="text-[10px] capitalize text-gray-400">{user.role || 'customer'}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 py-8 text-center">
            <Users className="mx-auto mb-1 h-7 w-7 text-gray-300" />
            <p className="text-[11px] text-gray-500">No users loaded</p>
            <p className="text-[10px] text-gray-400">Use Load</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-2">
      <div className={cardCls}>
        <h2 className="mb-2 border-b border-gray-100 pb-1.5 text-xs font-semibold text-gray-900">Templates</h2>
        <p className="mb-2 text-[10px] text-gray-500">Click a card to load into Compose.</p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {emailTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                handleTemplateSelect(template);
                setActiveTab('compose');
              }}
              className="rounded-md border border-gray-200 bg-white p-2 text-left transition-colors hover:border-gray-400 hover:bg-gray-50/80"
            >
              <h4 className="text-[11px] font-medium text-gray-900">{template.name}</h4>
              <p className="mt-0.5 line-clamp-2 text-[10px] text-gray-500">{template.subject}</p>
              <span className="mt-1 inline-block rounded border border-gray-200 bg-gray-50 px-1 py-px text-[10px] font-medium capitalize text-gray-700">
                {template.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCampaignsTab = () => (
    <div className="space-y-2">
      <div className={cardCls}>
        <h2 className="mb-2 border-b border-gray-100 pb-1.5 text-xs font-semibold text-gray-900">Recent sends</h2>
        {recentCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-2 py-1">Campaign</th>
                  <th className="px-2 py-1">Sent</th>
                  <th className="px-2 py-1">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50/80">
                    <td className="max-w-[12rem] truncate px-2 py-1.5 font-medium text-gray-900">{campaign.name}</td>
                    <td className="px-2 py-1.5 tabular-nums text-gray-600">{campaign.sent}</td>
                    <td className="px-2 py-1.5 text-gray-500">{new Date(campaign.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 py-8 text-center">
            <Mail className="mx-auto mb-1 h-7 w-7 text-gray-300" />
            <p className="text-[11px] text-gray-500">No sends yet</p>
            <p className="text-[10px] text-gray-400">Send from Compose</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-2">
      <div className={cardCls}>
        <h2 className="mb-2 border-b border-gray-100 pb-1.5 text-xs font-semibold text-gray-900">Analytics</h2>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Users', value: totalSubscribers.toLocaleString(), icon: Users, c: 'text-gray-600' },
            { label: 'Today', value: emailStats.sentToday, icon: Send, c: 'text-blue-600' },
            { label: 'This hour', value: emailStats.sentThisHour, icon: Clock, c: 'text-amber-600' },
            { label: 'Hour quota', value: emailStats.rateLimitRemaining.hourly, icon: CheckCircle, c: 'text-green-600' },
            { label: 'Day quota', value: emailStats.rateLimitRemaining.daily, icon: CheckCircle, c: 'text-green-700' }
          ].map(({ label, value, icon: Icon, c }) => (
            <div
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px]"
            >
              <Icon className={`h-3 w-3 shrink-0 ${c}`} />
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold tabular-nums text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTestingTab = () => (
    <div className="space-y-2">
      <div className={cardCls}>
        <h2 className="mb-2 border-b border-gray-100 pb-1.5 text-xs font-semibold text-gray-900">Testing</h2>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <button type="button" onClick={handleTestConfiguration} className={btnOutline}>
            <CheckCircle className="h-3.5 w-3.5" />
            Config
          </button>
          <button type="button" onClick={handleTestEmails} disabled={isTesting} className={btnOutline}>
            <TestTube className="h-3.5 w-3.5" />
            {isTesting ? 'Running…' : 'All tests'}
          </button>
          <button type="button" onClick={handleTestHostinger} disabled={isTesting} className={btnOutline}>
            <CheckCircle className="h-3.5 w-3.5" />
            {isTesting ? 'Running…' : 'Hostinger'}
          </button>
        </div>

        {testResults && (
          <div className="space-y-1 border-t border-gray-100 pt-2">
            {testResults.map((test, index) => (
              <div
                key={index}
                className={`rounded-md border px-2 py-1.5 text-[11px] ${
                  test.result.success
                    ? 'border-green-200 bg-green-50 text-green-900'
                    : 'border-red-200 bg-red-50 text-red-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {test.result.success ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-600" />
                  )}
                  <span className="font-medium">{test.test}</span>
                </div>
                <p className={`mt-0.5 text-[10px] ${test.result.success ? 'text-green-800' : 'text-red-800'}`}>
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
    <div className="space-y-2">
      <div className={cardCls}>
        <h2 className="mb-2 border-b border-gray-100 pb-1.5 text-xs font-semibold text-gray-900">Settings</h2>
        <div className="space-y-2">
          <div className="rounded-md border border-gray-200 bg-gray-50/80 p-2">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-gray-700" />
              <h3 className="text-[11px] font-semibold text-gray-900">SMTP (outgoing)</h3>
            </div>
            <div className="grid grid-cols-1 gap-1 text-[10px] sm:grid-cols-2">
              {[
                ['Host', 'smtp.hostinger.com'],
                ['Port', '465'],
                ['Security', 'SSL/TLS'],
                ['Auth', 'Required']
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap items-baseline gap-1">
                  <span className="text-gray-500">{k}</span>
                  <code className="rounded border border-gray-200 bg-white px-1 py-px font-mono text-[10px] text-gray-800">
                    {v}
                  </code>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleTestConfiguration} className={`${btnPrimary} mt-2`}>
              Test SMTP
            </button>
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50/80 p-2">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-700" />
              <h3 className="text-[11px] font-semibold text-gray-900">IMAP (incoming)</h3>
            </div>
            <div className="grid grid-cols-1 gap-1 text-[10px] sm:grid-cols-2">
              {[
                ['Host', 'imap.hostinger.com'],
                ['Port', '993'],
                ['Security', 'SSL/TLS'],
                ['Auth', 'Required']
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap items-baseline gap-1">
                  <span className="text-gray-500">{k}</span>
                  <code className="rounded border border-gray-200 bg-white px-1 py-px font-mono text-[10px] text-gray-800">
                    {v}
                  </code>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-gray-500">Read mail on the server</p>
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50/80 p-2">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-gray-700" />
              <h3 className="text-[11px] font-semibold text-gray-900">POP (incoming)</h3>
            </div>
            <div className="grid grid-cols-1 gap-1 text-[10px] sm:grid-cols-2">
              {[
                ['Host', 'pop.hostinger.com'],
                ['Port', '995'],
                ['Security', 'SSL/TLS'],
                ['Auth', 'Required']
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap items-baseline gap-1">
                  <span className="text-gray-500">{k}</span>
                  <code className="rounded border border-gray-200 bg-white px-1 py-px font-mono text-[10px] text-gray-800">
                    {v}
                  </code>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-gray-500">Download to device</p>
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50/80 p-2">
            <h3 className="mb-1 text-[11px] font-semibold text-gray-900">Rate limits</h3>
            <div className="grid grid-cols-1 gap-1 text-[11px] sm:grid-cols-2">
              <div className="flex justify-between gap-2 border-b border-gray-100 py-0.5 sm:border-0">
                <span className="text-gray-600">Hourly</span>
                <span className="font-medium tabular-nums text-gray-900">
                  {emailStats.rateLimitRemaining.hourly}/100
                </span>
              </div>
              <div className="flex justify-between gap-2 py-0.5">
                <span className="text-gray-600">Daily</span>
                <span className="font-medium tabular-nums text-gray-900">
                  {emailStats.rateLimitRemaining.daily}/1000
                </span>
              </div>
            </div>
            <p className="mt-1.5 rounded border border-amber-100 bg-amber-50/80 p-1.5 text-[10px] text-amber-900">
              Limits reduce spam risk. Contact Hostinger for higher quotas.
            </p>
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50/80 p-2">
            <h3 className="mb-1 text-[11px] font-semibold text-gray-900">Env vars (reference)</h3>
            <div className="space-y-0.5 font-mono text-[10px]">
              {[
                'VITE_SMTP_HOST=smtp.hostinger.com',
                'VITE_SMTP_PORT=465',
                'VITE_SMTP_SECURE=true',
                'VITE_IMAP_HOST=imap.hostinger.com',
                'VITE_POP_HOST=pop.hostinger.com'
              ].map((line) => (
                <div key={line} className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-gray-800">
                  {line}
                </div>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-gray-500">Add to <code className="text-gray-700">.env</code> as needed</p>
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
      
      <div className="ml-[9.25rem] flex flex-1 flex-col overflow-hidden">
        <div className="p-3">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-gray-900">Email</h2>
            <p className="text-[11px] text-gray-500">Campaigns, recipients, and delivery checks</p>
          </div>
          {renderTabContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmailManagement;




