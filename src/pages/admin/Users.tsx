import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Eye, Edit2, UserX, Plus, X,
  Users as UsersIcon, Shield, Calendar, CheckCircle, XCircle, Crown,
  Ban, Unlock, Trash2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { RealUserService, RealUser, UserStats } from '../../services/realUserService';

const Users: React.FC = () => {
  const [users, setUsers] = useState<RealUser[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    confirmed: 0,
    unconfirmed: 0,
    active: 0,
    inactive: 0,
    recent_signups: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RealUser | null>(null);

  // Load users and stats
  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        RealUserService.getAllUsers(),
        RealUserService.getUserStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Create user
  const handleCreateUser = async (userData: { email: string; password: string; role: string }) => {
    try {
      const success = await RealUserService.createUser(userData.email, userData.password, {
        role: userData.role
      });
      if (success) {
        await loadData();
        setShowCreateModal(false);
        alert('User created successfully!');
      } else {
        alert('Failed to create user. Please try again.');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  // Update user role
  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const success = await RealUserService.updateUserRole(userId, role);
      if (success) {
        await loadData();
        alert('User role updated successfully!');
      } else {
        alert('Failed to update user role. Please try again.');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  // Ban/unban user
  const handleBanUser = async (userId: string, banUntil?: string) => {
    try {
      const success = await RealUserService.banUser(userId, banUntil);
      if (success) {
        await loadData();
        alert(banUntil ? 'User banned successfully!' : 'User unbanned successfully!');
      } else {
        alert('Failed to update user status. Please try again.');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const success = await RealUserService.deleteUser(userId);
        if (success) {
          await loadData();
          alert('User deleted successfully!');
        } else {
          alert('Failed to delete user. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // View user details
  const handleViewUser = (user: RealUser) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Edit user
  const handleEditUser = (user: RealUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'confirmed' && user.email_confirmed_at) ||
                           (filterStatus === 'unconfirmed' && !user.email_confirmed_at) ||
                           (filterStatus === 'active' && user.last_sign_in_at && 
                            new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                           (filterStatus === 'inactive' && (!user.last_sign_in_at || 
                            new Date(user.last_sign_in_at) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof RealUser];
      let bValue = b[sortBy as keyof RealUser];
      
      if (sortBy === 'created_at' || sortBy === 'last_sign_in_at' || sortBy === 'email_confirmed_at') {
        aValue = aValue ? new Date(aValue as string).getTime() : 0;
        bValue = bValue ? new Date(bValue as string).getTime() : 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'artist': return 'bg-purple-100 text-purple-800';
      case 'customer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'artist': return <Shield className="w-4 h-4" />;
      case 'customer': return <UsersIcon className="w-4 h-4" />;
      default: return <UsersIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUserActive = (user: RealUser) => {
    if (!user.last_sign_in_at) return false;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return new Date(user.last_sign_in_at) > thirtyDaysAgo;
  };

  return (
    <AdminLayout title="Users" noHeader={true}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage user accounts and permissions from Supabase Auth</p>
            {!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ Service role key not configured. Showing sample data. Add VITE_SUPABASE_SERVICE_ROLE_KEY to access real user data.
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <UsersIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Unconfirmed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unconfirmed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Active (30d)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <UserX className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <Plus className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">New (30d)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recent_signups}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="unconfirmed">Unconfirmed</option>
              <option value="active">Active (30d)</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="artist">Artist</option>
              <option value="customer">Customer</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="last_sign_in_at-desc">Last Active</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-pink-800">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearSelection}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    selectedUsers.forEach(id => handleBanUser(id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()));
                    setSelectedUsers([]);
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Ban Selected
                </button>
                <button
                  onClick={() => {
                    selectedUsers.forEach(id => handleBanUser(id));
                    setSelectedUsers([]);
                  }}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Unban Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-hidden">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Role</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Created</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Last Sign In</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{user.email}</div>
                            <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1">
                            {user.email_confirmed_at ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-orange-500" />
                            )}
                            <span className={`text-xs ${user.email_confirmed_at ? 'text-green-600' : 'text-orange-600'}`}>
                              {user.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'}
                            </span>
                          </div>
                          {isUserActive(user) && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role || 'customer')}`}>
                          {getRoleIcon(user.role || 'customer')}
                          <span className="ml-1 capitalize">{user.role || 'customer'}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(user.last_sign_in_at)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-gray-400 hover:text-gray-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleBanUser(user.id, user.banned_until ? undefined : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())}
                            className={user.banned_until ? "text-green-400 hover:text-green-600" : "text-yellow-400 hover:text-yellow-600"}
                            title={user.banned_until ? "Unban User" : "Ban User"}
                          >
                            {user.banned_until ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete User"
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
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <CreateUserModal
            onSubmit={handleCreateUser}
            onClose={() => setShowCreateModal(false)}
          />
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <ViewUserModal
            user={selectedUser}
            onClose={() => {
              setShowViewModal(false);
              setSelectedUser(null);
            }}
          />
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onSubmit={handleUpdateRole}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

// Create User Modal Component
interface CreateUserModalProps {
  onSubmit: (user: { email: string; password: string; role: string }) => void;
  onClose: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Create New User</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="customer">Customer</option>
              <option value="artist">Artist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Create User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View User Modal Component
interface ViewUserModalProps {
  user: RealUser;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ user, onClose }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-medium">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">{user.email}</h4>
              <p className="text-sm text-gray-600">ID: {user.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Confirmed</label>
              <p className={`text-sm ${user.email_confirmed_at ? 'text-green-600' : 'text-orange-600'}`}>
                {user.email_confirmed_at ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <p className="text-sm text-gray-900 capitalize">{user.role || 'customer'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-sm text-gray-900">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Sign In</label>
              <p className="text-sm text-gray-900">{formatDate(user.last_sign_in_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-sm text-gray-900">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banned Until</label>
              <p className="text-sm text-gray-900">{user.banned_until ? formatDate(user.banned_until) : 'Not banned'}</p>
            </div>
          </div>

          {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Metadata</label>
              <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
            </div>
          )}

          {user.app_metadata && Object.keys(user.app_metadata).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">App Metadata</label>
              <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(user.app_metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal Component
interface EditUserModalProps {
  user: RealUser;
  onSubmit: (userId: string, role: string) => void;
  onClose: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onSubmit, onClose }) => {
  const [role, setRole] = useState(user.role || 'customer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(user.id, role);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Edit User Role</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="customer">Customer</option>
              <option value="artist">Artist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Update Role
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Users;