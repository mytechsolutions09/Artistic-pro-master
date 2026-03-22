'use client'

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Calendar,
  RefreshCw,
  X
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ContactMessageService, ContactMessage, ContactMessageFilters } from '../../services/contactMessageService';

const inputCls =
  'h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

const CustomerCare: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ContactMessageFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadMessages();
    loadStats();
  }, [filters]);

  const loadMessages = async (opts?: { skipLoading?: boolean }) => {
    if (!opts?.skipLoading) setLoading(true);
    try {
      const result = await ContactMessageService.getMessages(filters);
      if (result.success && result.messages) {
        setMessages(result.messages);
      } else {
        console.error('Failed to load messages:', result.error);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      if (!opts?.skipLoading) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMessages({ skipLoading: true });
      await loadStats();
    } finally {
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await ContactMessageService.getMessageStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined
    }));
  };

  const handleStatusUpdate = async (messageId: string, status: string) => {
    try {
      const result = await ContactMessageService.updateMessage(messageId, { status: status as any });
      if (result.success) {
        await loadMessages({ skipLoading: true });
        await loadStats();
        setSelectedMessage((prev) =>
          prev?.id === messageId ? { ...prev, status: status as ContactMessage['status'] } : prev
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePriorityUpdate = async (messageId: string, priority: string) => {
    try {
      const result = await ContactMessageService.updateMessage(messageId, { priority: priority as any });
      if (result.success) {
        await loadMessages({ skipLoading: true });
        setSelectedMessage((prev) =>
          prev?.id === messageId ? { ...prev, priority: priority as ContactMessage['priority'] } : prev
        );
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const result = await ContactMessageService.deleteMessage(messageId);
        if (result.success) {
          await loadMessages({ skipLoading: true });
          await loadStats();
          setSelectedMessage((prev) => (prev?.id === messageId ? null : prev));
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-3 w-3 shrink-0 text-blue-600" />;
      case 'in_progress':
        return <AlertCircle className="h-3 w-3 shrink-0 text-amber-600" />;
      case 'resolved':
        return <CheckCircle className="h-3 w-3 shrink-0 text-green-600" />;
      case 'closed':
        return <XCircle className="h-3 w-3 shrink-0 text-gray-500" />;
      default:
        return <Clock className="h-3 w-3 shrink-0 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'high':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'medium':
        return 'border-amber-200 bg-amber-50 text-amber-900';
      case 'low':
        return 'border-green-200 bg-green-50 text-green-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'order':
        return 'border-violet-200 bg-violet-50 text-violet-800';
      case 'shipping':
        return 'border-indigo-200 bg-indigo-50 text-indigo-800';
      case 'returns':
        return 'border-rose-200 bg-rose-50 text-rose-800';
      case 'technical':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'billing':
        return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  return (
    <AdminLayout title="Customer Care" noHeader>
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Customer care</h1>
            <p className="text-[11px] text-gray-500">Contact form messages and follow-up</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {stats && (
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Total', value: stats.total, icon: MessageSquare, tone: 'text-gray-600' },
              { label: 'New', value: stats.new, icon: Clock, tone: 'text-blue-600' },
              { label: 'In progress', value: stats.in_progress, icon: AlertCircle, tone: 'text-amber-600' },
              { label: 'Resolved', value: stats.resolved, icon: CheckCircle, tone: 'text-green-600' },
              { label: 'Closed', value: stats.closed, icon: XCircle, tone: 'text-gray-500' }
            ].map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px]"
              >
                <Icon className={`h-3 w-3 shrink-0 ${tone}`} />
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold tabular-nums text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className={`${inputCls} w-full pl-7`}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={handleSearch}
                className="h-8 rounded-md bg-gray-900 px-2.5 text-xs font-medium text-white hover:bg-gray-800"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium ${
                  showFilters
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 pt-2 md:grid-cols-4">
              <div>
                <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={`${inputCls} w-full`}
                >
                  <option value="">All</option>
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className={`${inputCls} w-full`}
                >
                  <option value="">All</option>
                  <option value="general">General</option>
                  <option value="order">Order</option>
                  <option value="shipping">Shipping</option>
                  <option value="returns">Returns</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  Priority
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className={`${inputCls} w-full`}
                >
                  <option value="">All</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  From date
                </label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className={`${inputCls} w-full`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-2 py-1.5">
            <h2 className="text-xs font-semibold text-gray-900">Messages</h2>
            <span className="text-[10px] tabular-nums text-gray-500">{messages.length}</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-8">
              <RefreshCw className="mb-1 h-5 w-5 animate-spin text-gray-400" />
              <p className="text-[11px] text-gray-500">Loading…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center border border-dashed border-gray-200 py-8 text-center">
              <MessageSquare className="mb-1 h-6 w-6 text-gray-300" />
              <p className="text-[11px] text-gray-500">No messages</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map((message) => (
                <div key={message.id} className="px-2 py-1.5 hover:bg-gray-50/80">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex flex-wrap items-center gap-1">
                        {getStatusIcon(message.status)}
                        <h3 className="truncate text-[11px] font-medium text-gray-900">{message.subject}</h3>
                        <span
                          className={`inline-flex items-center rounded border px-1 py-px text-[10px] font-medium capitalize ${getPriorityColor(message.priority)}`}
                        >
                          {message.priority}
                        </span>
                        <span
                          className={`inline-flex items-center rounded border px-1 py-px text-[10px] font-medium capitalize ${getCategoryColor(message.category)}`}
                        >
                          {message.category}
                        </span>
                      </div>
                      <div className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500">
                        <span className="inline-flex items-center gap-0.5">
                          <User className="h-2.5 w-2.5 shrink-0" />
                          {message.name}
                        </span>
                        <span className="inline-flex min-w-0 max-w-[10rem] items-center gap-0.5 truncate sm:max-w-xs">
                          <Mail className="h-2.5 w-2.5 shrink-0" />
                          {message.email}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Calendar className="h-2.5 w-2.5 shrink-0" />
                          {new Date(message.created_at || '').toLocaleDateString()}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-[10px] text-gray-600">{message.message}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => setSelectedMessage(message)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        title="View"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(message.id!)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
              role="dialog"
            >
              <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-gray-100 bg-white px-3 py-2">
                <h2 className="text-sm font-semibold text-gray-900">Message</h2>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-md border border-gray-100 bg-gray-50/80 px-2 py-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Name</p>
                    <p className="text-xs text-gray-900">{selectedMessage.name}</p>
                  </div>
                  <div className="rounded-md border border-gray-100 bg-gray-50/80 px-2 py-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Email</p>
                    <p className="break-all text-xs text-gray-900">{selectedMessage.email}</p>
                  </div>
                  <div className="rounded-md border border-gray-100 bg-gray-50/80 px-2 py-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Category</p>
                    <span
                      className={`mt-0.5 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize ${getCategoryColor(selectedMessage.category)}`}
                    >
                      {selectedMessage.category}
                    </span>
                  </div>
                  <div className="rounded-md border border-gray-100 bg-gray-50/80 px-2 py-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Priority</p>
                    <span
                      className={`mt-0.5 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize ${getPriorityColor(selectedMessage.priority)}`}
                    >
                      {selectedMessage.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-0.5 text-[11px] font-medium text-gray-600">Subject</p>
                  <p className="text-xs text-gray-900">{selectedMessage.subject}</p>
                </div>

                <div>
                  <p className="mb-0.5 text-[11px] font-medium text-gray-600">Body</p>
                  <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-2">
                    <p className="whitespace-pre-wrap text-xs text-gray-900">{selectedMessage.message}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="min-w-[8rem] flex-1">
                    <label className="mb-0.5 block text-[11px] font-medium text-gray-600">Status</label>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => handleStatusUpdate(selectedMessage.id!, e.target.value)}
                      className={`${inputCls} w-full`}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="min-w-[8rem] flex-1">
                    <label className="mb-0.5 block text-[11px] font-medium text-gray-600">Priority</label>
                    <select
                      value={selectedMessage.priority}
                      onChange={(e) => handlePriorityUpdate(selectedMessage.id!, e.target.value)}
                      className={`${inputCls} w-full`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 px-3 py-2">
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(selectedMessage.id!)}
                  className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CustomerCare;




