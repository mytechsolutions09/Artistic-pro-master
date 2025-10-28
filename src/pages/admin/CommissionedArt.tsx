import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, RefreshCw, X,
  Brush, DollarSign, Clock, TrendingUp, CheckCircle, AlertCircle,
  Grid, List, User, Mail
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import commissionedArtService, { CommissionedArt as CommissionedArtType } from '../../services/commissionedArtService';
import { ImageUploadService } from '../../services/imageUploadService';

const CommissionedArt: React.FC = () => {
  const [commissions, setCommissions] = useState<CommissionedArtType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState<CommissionedArtType | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Load commissions
  const loadCommissions = async () => {
    try {
      setLoading(true);
      const data = await commissionedArtService.getAllCommissions();
      setCommissions(data || []);
      
      // Load stats
      const statsData = await commissionedArtService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh commissions
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommissions();
    setRefreshing(false);
  };

  // Create commission
  const handleCreateCommission = async (commissionData: any) => {
    try {
      // Upload reference images if provided
      let referenceImageUrls: string[] = [];
      if (commissionData.referenceImageFiles && commissionData.referenceImageFiles.length > 0) {
        for (const file of commissionData.referenceImageFiles) {
          const uploaded = await ImageUploadService.uploadFile(file, 'product-images', 'commissioned-art/reference');
          if (uploaded.url) {
            referenceImageUrls.push(uploaded.url);
          }
        }
      }

      // Upload WIP images if provided
      let wipImageUrls: string[] = [];
      if (commissionData.wipImageFiles && commissionData.wipImageFiles.length > 0) {
        for (const file of commissionData.wipImageFiles) {
          const uploaded = await ImageUploadService.uploadFile(file, 'product-images', 'commissioned-art/wip');
          if (uploaded.url) {
            wipImageUrls.push(uploaded.url);
          }
        }
      }

      // Upload final artwork images if provided
      let finalImageUrls: string[] = [];
      if (commissionData.finalImageFiles && commissionData.finalImageFiles.length > 0) {
        for (const file of commissionData.finalImageFiles) {
          const uploaded = await ImageUploadService.uploadFile(file, 'product-images', 'commissioned-art/final');
          if (uploaded.url) {
            finalImageUrls.push(uploaded.url);
          }
        }
      }

      const dataToSave = {
        ...commissionData,
        reference_images: referenceImageUrls,
        work_in_progress_images: wipImageUrls,
        final_artwork_images: finalImageUrls,
      };

      // Remove file objects before saving
      delete dataToSave.referenceImageFiles;
      delete dataToSave.wipImageFiles;
      delete dataToSave.finalImageFiles;

      const result = await commissionedArtService.createCommission(dataToSave);
      
      if (result) {
        await loadCommissions();
        setShowCreateModal(false);
      } else {
        alert('Failed to create commission. Please try again.');
      }
    } catch (error) {
      console.error('Error creating commission:', error);
      alert('Error creating commission: ' + (error as Error).message);
    }
  };

  // Update commission
  const handleUpdateCommission = async (commissionData: any) => {
    try {
      if (editingCommission) {
        // Upload new reference images if provided
        let referenceImageUrls = editingCommission.reference_images || [];
        if (commissionData.referenceImageFiles && commissionData.referenceImageFiles.length > 0) {
          for (const file of commissionData.referenceImageFiles) {
            const uploaded = await ImageUploadService.uploadFile(file, 'product-images', 'commissioned-art/reference');
            if (uploaded.url) {
              referenceImageUrls.push(uploaded.url);
            }
          }
        }

        // Upload new WIP images if provided
        let wipImageUrls = editingCommission.work_in_progress_images || [];
        if (commissionData.wipImageFiles && commissionData.wipImageFiles.length > 0) {
          for (const file of commissionData.wipImageFiles) {
            const uploaded = await ImageUploadService.uploadFile(file, 'product-images', 'commissioned-art/wip');
            if (uploaded.url) {
              wipImageUrls.push(uploaded.url);
            }
          }
        }

        // Upload new final artwork images if provided
        let finalImageUrls = editingCommission.final_artwork_images || [];
        if (commissionData.finalImageFiles && commissionData.finalImageFiles.length > 0) {
          for (const file of commissionData.finalImageFiles) {
            const uploaded = await ImageUploadService.uploadFile(file, 'product-images', 'commissioned-art/final');
            if (uploaded.url) {
              finalImageUrls.push(uploaded.url);
            }
          }
        }

        const dataToSave = {
          ...commissionData,
          reference_images: referenceImageUrls,
          work_in_progress_images: wipImageUrls,
          final_artwork_images: finalImageUrls,
        };

        // Remove file objects before saving
        delete dataToSave.referenceImageFiles;
        delete dataToSave.wipImageFiles;
        delete dataToSave.finalImageFiles;

        await commissionedArtService.updateCommission(editingCommission.id, dataToSave);
        await loadCommissions();
        setEditingCommission(null);
      }
    } catch (error) {
      console.error('Error updating commission:', error);
      alert('Error updating commission: ' + (error as Error).message);
    }
  };

  // Delete commission
  const handleDeleteCommission = async (commissionId: string) => {
    if (window.confirm('Are you sure you want to delete this commission?')) {
      try {
        await commissionedArtService.deleteCommission(commissionId);
        await loadCommissions();
      } catch (error) {
        console.error('Error deleting commission:', error);
        alert('Error deleting commission: ' + (error as Error).message);
      }
    }
  };

  useEffect(() => {
    loadCommissions();
  }, []);

  // Filter and sort commissions
  const filteredCommissions = commissions
    .filter(commission => {
      const matchesSearch = 
        commission.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commission.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || commission.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || commission.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof CommissionedArtType];
      let bValue: any = b[sortBy as keyof CommissionedArtType];
      
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Status badge colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      inquiry: 'bg-blue-100 text-blue-800',
      quoted: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      review: 'bg-orange-100 text-orange-800',
      completed: 'bg-teal-100 text-teal-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Priority badge colors
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  return (
    <AdminLayout title="Commissioned Art" noHeader={true}>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Commissioned Art Management</h2>
            <p className="text-sm text-gray-600">Manage custom art commissions and requests</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Commission</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <Brush className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Inquiry</p>
                  <p className="text-lg font-bold text-gray-900">{stats.by_status.inquiry}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-500">In Progress</p>
                  <p className="text-lg font-bold text-gray-900">{stats.by_status.in_progress}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-bold text-gray-900">{stats.by_status.completed}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <div>
                  <p className="text-xs text-gray-500">Delivered</p>
                  <p className="text-lg font-bold text-gray-900">{stats.by_status.delivered}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-lg font-bold text-gray-900">₹{stats.total_revenue.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search commissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="inquiry">Inquiry</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="customer_name-asc">Customer A-Z</option>
              <option value="customer_name-desc">Customer Z-A</option>
              <option value="requested_delivery_date-asc">Delivery Date (Soonest)</option>
              <option value="final_price-desc">Price (High to Low)</option>
            </select>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Commissions List/Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading commissions...</span>
          </div>
        ) : filteredCommissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
            <Brush className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No commissions found</h3>
            <p className="text-gray-500">Try adjusting your filters or create a new commission</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCommissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{commission.customer_name}</p>
                          <p className="text-xs text-gray-500">{commission.customer_email}</p>
                          {commission.customer_phone && (
                            <p className="text-xs text-gray-400">{commission.customer_phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{commission.title}</p>
                          {commission.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{commission.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(commission.status)}`}>
                          {commission.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(commission.priority)}`}>
                          {commission.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {commission.final_price ? (
                            <p className="font-medium text-gray-900">₹{commission.final_price}</p>
                          ) : commission.quoted_price ? (
                            <p className="text-gray-600">₹{commission.quoted_price}</p>
                          ) : commission.budget_max ? (
                            <p className="text-gray-500">₹{commission.budget_min}-{commission.budget_max}</p>
                          ) : (
                            <p className="text-gray-400">-</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">
                          {commission.requested_delivery_date ? (
                            new Date(commission.requested_delivery_date).toLocaleDateString()
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setEditingCommission(commission)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCommission(commission.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommissions.map((commission) => (
              <div
                key={commission.id}
                className="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{commission.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{commission.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {commission.customer_name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {commission.customer_email}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(commission.status)}`}>
                      {commission.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(commission.priority)}`}>
                      {commission.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {commission.final_price ? `₹${commission.final_price}` : 
                       commission.quoted_price ? `₹${commission.quoted_price}` :
                       commission.budget_max ? `₹${commission.budget_min}-${commission.budget_max}` : '-'}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingCommission(commission)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCommission(commission.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingCommission) && (
          <CommissionModal
            commission={editingCommission || undefined}
            onSubmit={editingCommission ? handleUpdateCommission : handleCreateCommission}
            onClose={() => {
              setShowCreateModal(false);
              setEditingCommission(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Commission Modal Component
interface CommissionModalProps {
  commission?: CommissionedArtType;
  onSubmit: (commission: any) => void;
  onClose: () => void;
}

const CommissionModal: React.FC<CommissionModalProps> = ({ commission, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    customer_name: commission?.customer_name || '',
    customer_email: commission?.customer_email || '',
    customer_phone: commission?.customer_phone || '',
    title: commission?.title || '',
    description: commission?.description || '',
    art_type: commission?.art_type || 'painting',
    dimensions: commission?.dimensions || '',
    medium: commission?.medium || '',
    budget_min: commission?.budget_min || 0,
    budget_max: commission?.budget_max || 0,
    quoted_price: commission?.quoted_price || 0,
    final_price: commission?.final_price || 0,
    status: commission?.status || 'inquiry',
    priority: commission?.priority || 'normal',
    requested_delivery_date: commission?.requested_delivery_date || '',
    estimated_completion_date: commission?.estimated_completion_date || '',
    progress: commission?.progress || 0,
    notes: commission?.notes || '',
    admin_notes: commission?.admin_notes || '',
    payment_status: commission?.payment_status || 'pending',
  });

  const [referenceImageFiles, setReferenceImageFiles] = useState<File[]>([]);
  const [wipImageFiles, setWipImageFiles] = useState<File[]>([]);
  const [finalImageFiles, setFinalImageFiles] = useState<File[]>([]);
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<string[]>(commission?.reference_images || []);
  const [wipImagePreviews, setWipImagePreviews] = useState<string[]>(commission?.work_in_progress_images || []);
  const [finalImagePreviews, setFinalImagePreviews] = useState<string[]>(commission?.final_artwork_images || []);

  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setReferenceImageFiles([...referenceImageFiles, ...newFiles]);
      
      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setReferenceImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleWipImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setWipImageFiles([...wipImageFiles, ...newFiles]);
      
      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setWipImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleFinalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFinalImageFiles([...finalImageFiles, ...newFiles]);
      
      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFinalImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImagePreviews(prev => prev.filter((_, i) => i !== index));
    setReferenceImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeWipImage = (index: number) => {
    setWipImagePreviews(prev => prev.filter((_, i) => i !== index));
    setWipImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeFinalImage = (index: number) => {
    setFinalImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFinalImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      referenceImageFiles,
      wipImageFiles,
      finalImageFiles,
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="h-full overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 text-center flex-1">
              {commission ? 'Edit Commission' : 'New Commission'}
            </h2>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="commission-form"
                className="px-6 py-2 text-sm bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
              >
                {commission ? 'Update Commission' : 'Create Commission'}
              </button>
            </div>
          </div>
        
        <form id="commission-form" onSubmit={handleSubmit} className="space-y-4 text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email *</label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            {/* Commission Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
              <input
                type="text"
                placeholder="e.g., 24x36 inches"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medium</label>
              <input
                type="text"
                placeholder="e.g., Oil on Canvas"
                value={formData.medium}
                onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            {/* Pricing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Min (₹)</label>
              <input
                type="number"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Max (₹)</label>
              <input
                type="number"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quoted Price (₹)</label>
              <input
                type="number"
                value={formData.quoted_price}
                onChange={(e) => setFormData({ ...formData, quoted_price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final Price (₹)</label>
              <input
                type="number"
                value={formData.final_price}
                onChange={(e) => setFormData({ ...formData, final_price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="inquiry">Inquiry</option>
                <option value="quoted">Quoted</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="pending">Pending</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="fully_paid">Fully Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested Delivery Date</label>
              <input
                type="date"
                value={formData.requested_delivery_date}
                onChange={(e) => setFormData({ ...formData, requested_delivery_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Completion</label>
              <input
                type="date"
                value={formData.estimated_completion_date}
                onChange={(e) => setFormData({ ...formData, estimated_completion_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            {/* Progress */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={3}
            />
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={2}
            />
          </div>
          
          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Internal)</label>
            <textarea
              value={formData.admin_notes}
              onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={2}
            />
          </div>

          {/* Reference Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Images</label>
            <p className="text-xs text-gray-500 mb-2">Upload customer reference images for the commission</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleReferenceImageUpload}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
            {referenceImagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {referenceImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Reference ${index + 1}`} className="w-full h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeReferenceImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Work in Progress Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work in Progress Images</label>
            <p className="text-xs text-gray-500 mb-2">Upload progress photos to share with customer</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleWipImageUpload}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
            {wipImagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {wipImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`WIP ${index + 1}`} className="w-full h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeWipImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Final Artwork Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Artwork Images</label>
            <p className="text-xs text-gray-500 mb-2">Upload final completed artwork images</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFinalImageUpload}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
            {finalImagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {finalImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Final ${index + 1}`} className="w-full h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeFinalImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default CommissionedArt;

