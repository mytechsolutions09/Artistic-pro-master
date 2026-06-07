'use client'

import React, { useState, useEffect } from 'react';
import { Send, Users, Clock, CheckCircle, AlertCircle, CheckCircle2, TestTube, Download, UserPlus, Mail, Eye, Code, Copy, Check } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { EmailService, EmailRecipient, emailTemplates as systemEmailTemplates } from '../../services/emailService';
import { EmailTestUtils } from '../../utils/emailTestUtils';
import { RealUserService, RealUser } from '../../services/realUserService';
import EmailSecondaryNav from '../../components/admin/EmailSecondaryNav';
import { EmailType } from '../../config/email';

const inputCls =
  'h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const textareaCls =
  'min-h-[5.5rem] w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const cardCls = 'rounded-lg border border-gray-200 bg-white p-2 shadow-sm';

const btnPrimary =
  'inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-gray-900 px-2.5 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

const btnOutline =
  'inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

const templateMockData: Record<string, Record<string, any>> = {
  [EmailType.ORDER_CONFIRMATION]: {
    customerName: 'Arpit Kanotra',
    orderId: 'LUR-84729',
    orderDate: new Date().toLocaleDateString(),
    totalAmount: '4,999.00',
    items: `
      <div class="item" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <div>
          <strong>Divided Reflection (Canvas Art)</strong><br>
          <small style="color: #6b7280;">Quantity: 1 · Size: A2</small>
        </div>
        <div style="font-weight: 600;">₹4,999.00</div>
      </div>
    `,
    downloadLinks: `
      <a href="#" style="display: inline-block; background: #0f172a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin: 5px; font-size: 12px; font-weight: 500;">Download 'Divided Reflection' PDF</a>
    `
  },
  [EmailType.WELCOME]: {
    userName: 'Arpit Kanotra',
    dashboardUrl: 'https://lurevi.in/dashboard'
  },
  [EmailType.PASSWORD_RESET]: {
    userName: 'Arpit Kanotra',
    resetUrl: 'https://lurevi.in/reset-password?token=mock_token_123'
  },
  [EmailType.RETURN_REQUEST]: {
    returnId: 'RET-63821',
    orderId: 'LUR-84729',
    customerName: 'Arpit Kanotra',
    customerEmail: 'arpit@example.com',
    requestDate: new Date().toLocaleDateString(),
    productTitle: 'Divided Reflection',
    quantity: '1',
    totalPrice: '4,999.00',
    reason: 'Wrong item delivered',
    customerNotes: 'The print pattern doesn\'t match the image on website. Requesting a replacement or return.',
    adminUrl: 'https://lurevi.in/admin/returns'
  },
  [EmailType.RETURN_APPROVED]: {
    customerName: 'Arpit Kanotra',
    orderId: 'LUR-84729',
    productTitle: 'Divided Reflection',
    quantity: '1',
    totalPrice: '4,999.00',
    adminNotesSection: `
      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px; font-weight: 600; color: #065f46;">Notes from Lurevi Team</h3>
        <p style="margin: 0; font-size: 11px; color: #047857;">We have approved your request. Pickup will be handled by Delhivery courier within 24-48 hours. Please keep the item packed in original box.</p>
      </div>
    `
  },
  [EmailType.RETURN_REJECTED]: {
    customerName: 'Arpit Kanotra',
    orderId: 'LUR-84729',
    productTitle: 'Divided Reflection',
    adminNotesSection: `
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px; font-weight: 600; color: #991b1b;">Notes from Lurevi Team</h3>
        <p style="margin: 0; font-size: 11px; color: #b91c1c;">Return request rejected because the item was reported as purchased more than 15 days ago, exceeding our standard return policy window.</p>
      </div>
    `
  },
  [EmailType.REFUND_CONFIRMATION]: {
    customerName: 'Arpit Kanotra',
    orderId: 'LUR-84729',
    productTitle: 'Divided Reflection',
    refundAmount: '4,999.00',
    refundMethod: 'UPI (Google Pay)',
    adminNotesSection: `
      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px; font-weight: 600; color: #065f46;">Notes from Lurevi Team</h3>
        <p style="margin: 0; font-size: 11px; color: #047857;">Refund initiated to your original payment method. Transaction ID: REF-928472948.</p>
      </div>
    `
  },
  [EmailType.RETURN_CONFIRMATION_CUSTOMER]: {
    customerName: 'Arpit Kanotra',
    orderId: 'LUR-84729',
    productTitle: 'Divided Reflection',
    reason: 'Wrong item delivered',
    quantity: '1'
  }
};

const interpolateTemplate = (html: string, mockData: Record<string, any>) => {
  let result = html;
  for (const [key, value] of Object.entries(mockData)) {
    const escapedPlaceholder = "\\$\\{'{" + key + "}'\\}";
    result = result.replace(new RegExp(escapedPlaceholder, 'g'), String(value));
  }
  
  // Clean up any remaining placeholders
  const remainingPlaceholderRegex = /\$\{'[^']+'\}/g;
  result = result.replace(remainingPlaceholderRegex, '');
  return result;
};

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
  const [templatesSubTab, setTemplatesSubTab] = useState<'presets' | 'preview'>('presets');
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<string>(EmailType.ORDER_CONFIRMATION);
  const [previewMode, setPreviewMode] = useState<'render' | 'html'>('render');
  const [isCopied, setIsCopied] = useState(false);

  const emailTemplates = [
    { id: '1', name: 'New Artwork Notification', subject: 'Fresh Art Just Added!', type: 'marketing' },
    { id: '2', name: 'Order Confirmation', subject: 'Your Order is Confirmed', type: 'transactional' },
    { id: '3', name: 'Welcome Email', subject: 'Welcome to Lurevi', type: 'onboarding' },
    { id: '4', name: 'Newsletter', subject: 'Weekly Art Update', type: 'marketing' },
    { id: '5', name: 'Password Reset', subject: 'Reset Your Password', type: 'security' },
    { id: '6', name: 'Return Request Confirmation', subject: 'Return Request Received - Order #{{orderId}}', type: 'transactional' },
    { id: '7', name: 'Return Request Approved', subject: 'Return Approved - Order #{{orderId}}', type: 'transactional' },
    { id: '8', name: 'Return Request Rejection', subject: 'Return Update - Order #{{orderId}}', type: 'transactional' },
    { id: '9', name: 'Refund Processed Confirmation', subject: 'Refund Processed - Order #{{orderId}}', type: 'transactional' }
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
    let message = `Hello,\n\n${template.name} content goes here...\n\nBest regards,\nLurevi Team`;

    if (template.id === '2') {
      message = `Hello {{customerName}},\n\nYour order #{{orderId}} has been confirmed! Here are the details:\n\n- Order ID: {{orderId}}\n- Total Amount: ₹{{totalAmount}}\n- Date: {{orderDate}}\n\nYou can access your downloads or view details on your dashboard.\n\nBest regards,\nLurevi Team`;
    } else if (template.id === '6') {
      message = `Hello {{customerName}},\n\nWe have received your return request for the product: {{productTitle}} (Order #{{orderId}}).\n\nOur team is currently reviewing your request, and we will update you within 24-48 hours.\n\nBest regards,\nLurevi Team`;
    } else if (template.id === '7') {
      message = `Hello {{customerName}},\n\nGood news! Your return request for Order #{{orderId}} has been approved.\n\nDetails of return:\n- Product: {{productTitle}}\n- Quantity: {{quantity}}\n- Value: ₹{{totalPrice}}\n\nPickup Instructions:\nWe have scheduled a return pickup. Please keep the item packed and ready in its original condition with the tags intact.\n\nBest regards,\nLurevi Team`;
    } else if (template.id === '8') {
      message = `Hello {{customerName}},\n\nWe are writing to let you know that your return request for Order #{{orderId}} and product {{productTitle}} could not be approved at this time.\n\nReason:\n{{adminNotes}}\n\nIf you have any questions or feel this is an error, please reach out to us at support@lurevi.in.\n\nBest regards,\nLurevi Team`;
    } else if (template.id === '9') {
      message = `Hello {{customerName}},\n\nYour refund has been processed successfully!\n\nDetails:\n- Order ID: #{{orderId}}\n- Product: {{productTitle}}\n- Refunded Amount: ₹{{refundAmount}}\n- Refund Method: {{refundMethod}}\n\nNote: The refund may take 3-5 business days to reflect in your account.\n\nBest regards,\nLurevi Team`;
    }

    setEmailContent({
      ...emailContent,
      subject: template.subject,
      message
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
                className={`flex items-start gap-1.5 rounded-md border px-2 py-1.5 text-[11px] ${
                  sendResult.success ? 'bg-gray-50 text-gray-800 border-gray-200' : 'bg-gray-100 text-gray-900 border-gray-300'
                }`}
              >
                {sendResult.success ? (
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
                ) : (
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-700" />
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
                    test.result.success ? 'bg-gray-50 text-gray-800 border border-gray-150' : 'bg-gray-100 text-gray-900 border border-gray-200'
                  }`}
                >
                  {test.result.success ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-gray-700" />
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
            { label: 'Sent today', value: emailStats.sentToday, icon: Send, c: 'text-gray-600' },
            { label: 'This hour', value: emailStats.sentThisHour, icon: Clock, c: 'text-gray-600' },
            { label: 'Hour left', value: emailStats.rateLimitRemaining.hourly, icon: CheckCircle, c: 'text-gray-600' },
            { label: 'Day left', value: emailStats.rateLimitRemaining.daily, icon: CheckCircle, c: 'text-gray-600' }
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

  const renderHTMLPreviewTab = () => {
    const template = systemEmailTemplates[selectedPreviewTemplate];
    if (!template) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-xs text-gray-500">
          Template "{selectedPreviewTemplate}" not found.
        </div>
      );
    }

    const mockData = templateMockData[selectedPreviewTemplate] || {};
    const interpolatedHtml = interpolateTemplate(template.html, mockData);

    const handleCopy = () => {
      navigator.clipboard.writeText(interpolatedHtml);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    return (
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-4 min-h-[500px]">
        {/* Templates List Pane */}
        <div className="lg:col-span-1 space-y-1 overflow-y-auto max-h-[600px] pr-1">
          {Object.keys(systemEmailTemplates).map((typeKey) => {
            const temp = systemEmailTemplates[typeKey];
            const isSelected = selectedPreviewTemplate === typeKey;
            const label = typeKey
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setSelectedPreviewTemplate(typeKey)}
                className={`w-full text-left p-2 rounded-md border text-xs transition-all ${
                  isSelected
                    ? 'border-gray-900 bg-gray-900 text-white shadow-sm font-semibold'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="truncate">{label}</div>
                <div className={`text-[10px] mt-0.5 truncate font-normal ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                  {temp.subject}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview Container Pane */}
        <div className="lg:col-span-3 flex flex-col border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2 gap-2">
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-gray-900 truncate">
                {selectedPreviewTemplate
                  .split('_')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </h3>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate max-w-[280px] sm:max-w-md">
                Subject: {template.subject}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Toggle Buttons */}
              <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPreviewMode('render')}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-all ${
                    previewMode === 'render'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  Rendered
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('html')}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-all ${
                    previewMode === 'html'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Code className="h-3 w-3" />
                  Raw HTML
                </button>
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-[10px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-gray-900" />
                    <span className="text-gray-900 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Viewport */}
          <div className="flex-1 bg-gray-50 p-3 flex flex-col justify-center min-h-[450px]">
            {previewMode === 'render' ? (
              <iframe
                title="Email Render Preview"
                srcDoc={interpolatedHtml}
                className="w-full flex-1 min-h-[450px] border border-gray-200 rounded-md bg-white shadow-sm"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="w-full flex-1 min-h-[450px] relative rounded-md border border-gray-200 bg-gray-900 p-3 overflow-auto">
                <pre className="text-[10px] text-gray-200 font-mono whitespace-pre-wrap break-all select-all">
                  {interpolatedHtml}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTemplatesTab = () => (
    <div className="space-y-2">
      <div className="flex border-b border-gray-200 mb-2">
        <button
          type="button"
          onClick={() => setTemplatesSubTab('presets')}
          className={`px-4 py-1.5 text-xs font-medium border-b-2 transition-all ${
            templatesSubTab === 'presets'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Select Templates
        </button>
        <button
          type="button"
          onClick={() => setTemplatesSubTab('preview')}
          className={`px-4 py-1.5 text-xs font-medium border-b-2 transition-all ${
            templatesSubTab === 'preview'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          HTML Preview
        </button>
      </div>

      {templatesSubTab === 'presets' ? (
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
      ) : (
        renderHTMLPreviewTab()
      )}
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
            { label: 'Today', value: emailStats.sentToday, icon: Send, c: 'text-gray-600' },
            { label: 'This hour', value: emailStats.sentThisHour, icon: Clock, c: 'text-gray-600' },
            { label: 'Hour quota', value: emailStats.rateLimitRemaining.hourly, icon: CheckCircle, c: 'text-gray-600' },
            { label: 'Day quota', value: emailStats.rateLimitRemaining.daily, icon: CheckCircle, c: 'text-gray-600' }
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
                    ? 'border-gray-200 bg-gray-50 text-gray-800'
                    : 'border-gray-300 bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {test.result.success ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-gray-700" />
                  )}
                  <span className="font-medium">{test.test}</span>
                </div>
                <p className={`mt-0.5 text-[10px] ${test.result.success ? 'text-gray-600' : 'text-gray-800'}`}>
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
          {/* Resend API Settings */}
          <div className="rounded-md border border-gray-200 bg-gray-50/80 p-2">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-700" />
              <h3 className="text-[11px] font-semibold text-gray-900">Resend API (outgoing - Primary)</h3>
            </div>
            <p className="text-[10px] text-gray-600 mb-1.5">
              Currently configured to send transactional emails via Deno Edge Function using Resend.
            </p>
            <div className="flex flex-wrap items-baseline gap-1 text-[10px]">
              <span className="text-gray-500">RESEND_API_KEY:</span>
              <code className="rounded border border-gray-200 bg-white px-1 py-px font-mono text-[10px] text-gray-800">
                re_JUa3...Sc (Configured)
              </code>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50/80 p-2">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-gray-700" />
              <h3 className="text-[11px] font-semibold text-gray-900">SMTP (outgoing - Fallback)</h3>
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
                'RESEND_API_KEY=re_JUa3mU3w_8o6KQewbzZCq7RnzCM8nibSc',
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




