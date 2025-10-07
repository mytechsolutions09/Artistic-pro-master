import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Star, StarOff, User, Mail, Phone } from 'lucide-react';
import { UserAddress, AddressFormData } from '../services/addressService';
import AddressService from '../services/addressService';

interface AddressManagementProps {
  userId: string;
}

const AddressManagement: React.FC<AddressManagementProps> = ({ userId }) => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const loadAddresses = async () => {
    try {
      const userAddresses = await AddressService.getUserAddresses(userId);
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingAddress) {
        result = await AddressService.updateAddress(editingAddress.id, formData, false);
      } else {
        result = await AddressService.saveAddress(userId, formData, addresses.length === 0);
      }

      if (result.success) {
        await loadAddresses();
        resetForm();
      } else {
        console.error('Error saving address:', result.error);
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      email: address.email,
      firstName: address.first_name,
      lastName: address.last_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      country: address.country
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const result = await AddressService.deleteAddress(addressId);
        if (result.success) {
          await loadAddresses();
        } else {
          console.error('Error deleting address:', result.error);
        }
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const result = await AddressService.setDefaultAddress(userId, addressId);
      if (result.success) {
        await loadAddresses();
      } else {
        console.error('Error setting default address:', result.error);
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const formatAddress = (address: UserAddress) => {
    return `${address.address}, ${address.city}, ${address.state} ${address.zip_code}, ${address.country}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-bold text-gray-800">Address Management</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-bold text-gray-800">Address Management</h3>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-semibold text-gray-800 mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No addresses saved</h4>
          <p className="text-gray-500 mb-4">Add your first address to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {address.first_name} {address.last_name}
                    </span>
                    {address.is_default && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>Default</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3 h-3" />
                      <span>{address.email}</span>
                    </div>
                    {address.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3" />
                        <span>{address.phone}</span>
                      </div>
                    )}
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{formatAddress(address)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                      title="Set as default"
                    >
                      <StarOff className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                    title="Edit address"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManagement;
