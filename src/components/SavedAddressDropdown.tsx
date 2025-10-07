import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, User, Mail, Phone, Plus } from 'lucide-react';
import { UserAddress, AddressFormData } from '../services/addressService';
import AddressService from '../services/addressService';

interface SavedAddressDropdownProps {
  onSelectAddress: (address: AddressFormData) => void;
  onSaveNewAddress: (address: AddressFormData) => void;
  currentFormData: AddressFormData;
  userId: string;
}

const SavedAddressDropdown: React.FC<SavedAddressDropdownProps> = ({
  onSelectAddress,
  onSaveNewAddress,
  currentFormData,
  userId
}) => {
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedAddresses();
  }, [userId]);

  const loadSavedAddresses = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const addresses = await AddressService.getUserAddresses(userId);
      setSavedAddresses(addresses);
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address: UserAddress) => {
    const addressData: AddressFormData = {
      email: address.email,
      firstName: address.first_name,
      lastName: address.last_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      country: address.country
    };
    onSelectAddress(addressData);
    setIsOpen(false);
  };

  const handleSaveCurrentAddress = () => {
    onSaveNewAddress(currentFormData);
    setIsOpen(false);
  };

  const formatAddress = (address: UserAddress) => {
    return `${address.address}, ${address.city}, ${address.state} ${address.zip_code}`;
  };

  if (loading) {
    return (
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Loading saved addresses...</span>
        </div>
      </div>
    );
  }

  if (savedAddresses.length === 0) {
    return (
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-800">No saved addresses found</span>
          </div>
          <button
            onClick={handleSaveCurrentAddress}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Save Current</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {savedAddresses.length} Saved Address{savedAddresses.length !== 1 ? 'es' : ''}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelectAddress(address)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        {address.first_name} {address.last_name}
                      </span>
                      {address.is_default && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600">{address.email}</span>
                    </div>
                    {address.phone && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600">{address.phone}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-600 mt-1">
                      {formatAddress(address)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={handleSaveCurrentAddress}
                className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Save Current Address</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAddressDropdown;
