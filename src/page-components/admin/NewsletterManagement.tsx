'use client'

import React, { useState, useEffect } from 'react';
import { Mail, Search, Download, Trash2, Eye, Code, Plus, Save, Send, Edit, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../services/supabaseService';
import { EmailService } from '../../services/emailService';

const inputCls =
  'h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const textareaCls =
  'w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const cardCls = 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm';

const btnPrimary =
  'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

const btnOutline =
  'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

interface Subscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  created_at: string;
}

interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent';
  created_at: string;
  updated_at: string;
  sent_at?: string | null;
}

const NewsletterManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');
  
  // Subscribers State
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');

  // Campaigns State
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  
  // Compose Form State
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState<'html' | 'view'>('html');
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);

  // General Notification State
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, message: msg });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchSubscribers();
    fetchCampaigns();
  }, []);

  // Fetch Subscribers from Supabase
  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      let query = supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      console.error('Error fetching subscribers:', error);
      showNotification('error', 'Failed to load subscribers: ' + error.message);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  // Fetch Campaigns from Supabase
  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      showNotification('error', 'Failed to load newsletters: ' + error.message);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Subscribe Status toggle (unsubscribe/subscribe)
  const toggleSubscriberStatus = async (sub: Subscriber) => {
    const newStatus = sub.status === 'subscribed' ? 'unsubscribed' : 'subscribed';
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ status: newStatus })
        .eq('id', sub.id);

      if (error) throw error;
      
      setSubscribers(prev =>
        prev.map(s => (s.id === sub.id ? { ...s, status: newStatus } : s))
      );
      showNotification('success', `Updated status of ${sub.email} to ${newStatus}`);
    } catch (error: any) {
      console.error('Error toggling status:', error);
      showNotification('error', 'Failed to update status: ' + error.message);
    }
  };

  // Delete Subscriber from DB
  const deleteSubscriber = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) return;
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubscribers(prev => prev.filter(s => s.id !== id));
      showNotification('success', `Removed ${email} from subscriber list.`);
    } catch (error: any) {
      console.error('Error deleting subscriber:', error);
      showNotification('error', 'Failed to delete subscriber: ' + error.message);
    }
  };

  // Export subscribers to CSV
  const exportToCSV = () => {
    if (subscribers.length === 0) {
      showNotification('error', 'No subscribers available to export.');
      return;
    }

    const headers = ['Email', 'Status', 'Subscribed At'];
    const rows = subscribers.map(sub => [
      sub.email,
      sub.status,
      new Date(sub.created_at).toLocaleString()
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('success', 'Subscribers list exported to CSV.');
  };

  // Create or Update Campaign (Draft)
  const saveCampaign = async () => {
    if (!subject || !content) {
      showNotification('error', 'Please fill in both Subject and Content.');
      return;
    }

    setSavingCampaign(true);
    try {
      if (editingCampaignId) {
        // Update existing campaign
        const { error } = await supabase
          .from('newsletters')
          .update({ subject, content, status: 'draft' })
          .eq('id', editingCampaignId);

        if (error) throw error;
        showNotification('success', 'Draft saved successfully.');
      } else {
        // Insert new campaign
        const { data, error } = await supabase
          .from('newsletters')
          .insert([{ subject, content, status: 'draft' }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setEditingCampaignId(data.id);
        }
        showNotification('success', 'Draft created and saved.');
      }
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      showNotification('error', 'Failed to save draft: ' + error.message);
    } finally {
      setSavingCampaign(false);
    }
  };

  // Send campaign to all active subscribers
  const sendCampaign = async () => {
    if (!subject || !content) {
      showNotification('error', 'Please fill in both Subject and Content.');
      return;
    }

    // Get active subscribers
    const activeSubs = subscribers.filter(s => s.status === 'subscribed');
    if (activeSubs.length === 0) {
      showNotification('error', 'There are no active subscribers to send this newsletter to.');
      return;
    }

    if (!window.confirm(`Are you sure you want to send this newsletter to ${activeSubs.length} active subscriber(s)?`)) {
      return;
    }

    setSendingCampaign(true);
    try {
      // 1. Send emails using EmailService
      const recipients = activeSubs.map(s => ({ email: s.email }));
      const emailResult = await EmailService.sendEmail({
        to: recipients,
        subject: subject,
        html: content,
        text: content.replace(/<[^>]*>/g, '') // Strip HTML tags for plain text fallback
      });

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Failed to send campaign emails.');
      }

      // 2. Save/Update campaign status to 'sent' in database
      const sentTime = new Date().toISOString();
      if (editingCampaignId) {
        const { error } = await supabase
          .from('newsletters')
          .update({ subject, content, status: 'sent', sent_at: sentTime })
          .eq('id', editingCampaignId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('newsletters')
          .insert([{ subject, content, status: 'sent', sent_at: sentTime }]);

        if (error) throw error;
      }

      showNotification('success', `Newsletter sent successfully to ${activeSubs.length} subscriber(s)!`);
      setIsComposing(false);
      setEditingCampaignId(null);
      setSubject('');
      setContent('');
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      showNotification('error', 'Failed to send newsletter: ' + error.message);
    } finally {
      setSendingCampaign(false);
    }
  };

  // Select campaign for editing
  const editCampaign = (campaign: NewsletterCampaign) => {
    setEditingCampaignId(campaign.id);
    setSubject(campaign.subject);
    setContent(campaign.content);
    setIsComposing(true);
  };

  // Delete Campaign
  const deleteCampaign = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const { error } = await supabase
        .from('newsletters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCampaigns(prev => prev.filter(c => c.id !== id));
      showNotification('success', 'Newsletter deleted.');
    } catch (error: any) {
      console.error('Error deleting newsletter:', error);
      showNotification('error', 'Failed to delete newsletter: ' + error.message);
    }
  };

  // Filters subscriber list
  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(subSearch.toLowerCase());
    const matchesFilter = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout title="Newsletter Management">
      {/* Top Banner Notifications */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg max-w-sm transition-all duration-300 animate-slideIn ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Main Tab Controls */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-2 shadow-sm">
        <button
          type="button"
          onClick={() => { setActiveTab('subscribers'); setIsComposing(false); }}
          className={`px-6 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'subscribers'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          Subscribers ({subscribers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`px-6 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'campaigns'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-black'
          }`}
        >
          Campaigns & Drafts ({campaigns.length})
        </button>
      </div>

      {/* TAB CONTENT: Subscribers */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  placeholder="Search subscribers..."
                  className={`${inputCls} pl-8 w-60`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`${inputCls}`}
              >
                <option value="all">All Statuses</option>
                <option value="subscribed">Subscribed</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={fetchSubscribers} disabled={loadingSubscribers} className={btnOutline}>
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSubscribers ? 'animate-spin' : ''}`} />
                Reload
              </button>
              <button onClick={exportToCSV} className={btnOutline}>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm">
            {loadingSubscribers ? (
              <div className="p-8 text-center text-xs text-gray-500">Loading subscribers...</div>
            ) : filteredSubscribers.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Subscribed At</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-medium text-gray-900">{sub.email}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            sub.status === 'subscribed'
                              ? 'bg-green-50 text-green-700 border-green-150'
                              : 'bg-red-50 text-red-700 border-red-150'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500">{new Date(sub.created_at).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => toggleSubscriberStatus(sub)}
                            className="text-gray-500 hover:text-black font-semibold text-[11px] underline px-1.5 py-1"
                          >
                            {sub.status === 'subscribed' ? 'Unsubscribe' : 'Subscribe'}
                          </button>
                          <button
                            onClick={() => deleteSubscriber(sub.id, sub.email)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove subscriber"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-gray-500">
                {subSearch || statusFilter !== 'all' ? 'No subscribers match filters.' : 'No newsletter subscribers found.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {/* Main Controls & Header */}
          {!isComposing && (
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-500">Create, edit, and send newsletter campaigns.</span>
              <button
                onClick={() => {
                  setIsComposing(true);
                  setEditingCampaignId(null);
                  setSubject('');
                  setContent('');
                }}
                className={btnPrimary}
              >
                <Plus className="w-4 h-4" />
                New Newsletter
              </button>
            </div>
          )}

          {/* Composing Pane */}
          {isComposing && (
            <div className={cardCls + " space-y-4 animate-fadeIn"}>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-xs font-semibold text-gray-900">
                  {editingCampaignId ? 'Edit Newsletter Campaign' : 'Compose New Newsletter'}
                </h3>
                <button
                  onClick={() => setIsComposing(false)}
                  className="text-xs text-gray-500 hover:text-black underline cursor-pointer"
                >
                  Back to List
                </button>
              </div>

              {/* Form Input fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Weekly Art Releases: Curated Luxury Prints Inside"
                    className={`${inputCls} w-full`}
                  />
                </div>

                {/* Editor Content Area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-medium text-gray-600">HTML Body</label>
                    
                    {/* View/HTML Mode Toggle */}
                    <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('html')}
                        className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-medium transition-all ${
                          previewMode === 'html'
                            ? 'bg-black text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Code className="h-3 w-3" />
                        HTML Source
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('view')}
                        className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-medium transition-all ${
                          previewMode === 'view'
                            ? 'bg-black text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Eye className="h-3 w-3" />
                        Rendered View
                      </button>
                    </div>
                  </div>

                  {/* Editors rendering depending on mode */}
                  {previewMode === 'html' ? (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your email body in HTML format. For example: <div style='padding: 20px;'><h1>Hello Subscriber!</h1><p>Enjoy our prints.</p></div>"
                      rows={15}
                      className={textareaCls + " font-mono text-xs h-96"}
                    />
                  ) : (
                    <div className="border border-gray-200 rounded-md bg-gray-50 h-96 overflow-hidden shadow-inner">
                      <iframe
                        title="Newsletter Live Preview"
                        srcDoc={content || '<p style="padding: 20px; font-family: sans-serif; color: #6b7280; font-size: 13px;">Composed newsletter rendering will appear here in real-time...</p>'}
                        className="w-full h-full bg-white"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Composing Action Pane */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <div className="flex gap-2">
                  <button onClick={saveCampaign} disabled={savingCampaign} className={btnOutline}>
                    <Save className="w-3.5 h-3.5" />
                    {savingCampaign ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button onClick={sendCampaign} disabled={sendingCampaign} className={btnPrimary}>
                    <Send className="w-3.5 h-3.5" />
                    {sendingCampaign ? 'Sending...' : 'Send to All Subscribers'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Newsletter List */}
          {!isComposing && (
            <div className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm">
              {loadingCampaigns ? (
                <div className="p-8 text-center text-xs text-gray-500">Loading campaigns...</div>
              ) : campaigns.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-3">Subject Line</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Sent At</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3 font-medium text-gray-900 max-w-xs truncate">{camp.subject}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              camp.status === 'sent'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-150'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-150'
                            }`}
                          >
                            {camp.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500">{new Date(camp.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-gray-500">
                          {camp.sent_at ? new Date(camp.sent_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="inline-flex gap-2">
                            {camp.status === 'draft' && (
                              <button
                                onClick={() => editCampaign(camp)}
                                className="text-gray-600 hover:text-black p-1"
                                title="Edit Draft"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteCampaign(camp.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete campaign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs text-gray-500">No campaigns or drafts created yet.</div>
              )}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default NewsletterManagement;
