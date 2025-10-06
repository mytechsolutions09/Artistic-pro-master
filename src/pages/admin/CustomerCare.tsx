import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Reply, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  User,
  Mail,
  Calendar,
  Tag,
  Star,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ContactMessageService, ContactMessage, ContactMessageFilters } from '../../services/contactMessageService';

const CustomerCare: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ContactMessageFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadMessages();
    loadStats();
  }, [filters]);

  const loadMessages = async () => {
    setLoading(true);
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
      setLoading(false);
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
        loadMessages();
        loadStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePriorityUpdate = async (messageId: string, priority: string) => {
    try {
      const result = await ContactMessageService.updateMessage(messageId, { priority: priority as any });
      if (result.success) {
        loadMessages();
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
          loadMessages();
          loadStats();
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'order': return 'bg-purple-100 text-purple-800';
      case 'shipping': return 'bg-indigo-100 text-indigo-800';
      case 'returns': return 'bg-pink-100 text-pink-800';
      case 'technical': return 'bg-red-100 text-red-800';
      case 'billing': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout title="Customer Care">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Customer Care</h1>
          </div>
          <button
            onClick={loadMessages}
            className="flex items-center space-x-1 px-3 py-1.5 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">New</p>
                  <p className="text-lg font-bold text-blue-600">{stats.new}</p>
                </div>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">In Progress</p>
                  <p className="text-lg font-bold text-yellow-600">{stats.in_progress}</p>
                </div>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Resolved</p>
                  <p className="text-lg font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-3 py-1.5 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-sm"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                >
                  <option value="">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="order">Order</option>
                  <option value="shipping">Shipping</option>
                  <option value="returns">Returns</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100">
          <div className="p-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Messages ({messages.length})</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map((message) => (
                <div key={message.id} className="p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(message.status)}
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {message.subject}
                        </h3>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getCategoryColor(message.category)}`}>
                          {message.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mb-1">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{message.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-32">{message.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(message.created_at || '').toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {message.message}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-3">
                      <button
                        onClick={() => setSelectedMessage(message)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {/* Dropdown menu would go here */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-md shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Message Details</h2>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-sm text-gray-900">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCategoryColor(selectedMessage.category)}`}>
                      {selectedMessage.category}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-sm text-gray-900">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => handleStatusUpdate(selectedMessage.id!, e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={selectedMessage.priority}
                      onChange={(e) => handlePriorityUpdate(selectedMessage.id!, e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id!)}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-3 py-1.5 bg-pink-500 text-white rounded text-sm hover:bg-pink-600 transition-colors"
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
