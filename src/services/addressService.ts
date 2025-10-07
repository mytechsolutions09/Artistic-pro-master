import { supabase } from './supabaseService';

export interface UserAddress {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

class AddressService {
  /**
   * Get all addresses for a user
   */
  static async getUserAddresses(userId: string): Promise<UserAddress[]> {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user addresses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserAddresses:', error);
      return [];
    }
  }

  /**
   * Get default address for a user
   */
  static async getDefaultAddress(userId: string): Promise<UserAddress | null> {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error) {
        console.error('Error fetching default address:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getDefaultAddress:', error);
      return null;
    }
  }

  /**
   * Save a new address
   */
  static async saveAddress(userId: string, addressData: AddressFormData, isDefault: boolean = false): Promise<{ success: boolean; addressId?: string; error?: string }> {
    try {
      // If this is set as default, unset other default addresses
      if (isDefault) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', userId)
          .eq('is_default', true);
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: userId,
          email: addressData.email,
          first_name: addressData.firstName,
          last_name: addressData.lastName,
          phone: addressData.phone,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          zip_code: addressData.zipCode,
          country: addressData.country,
          is_default: isDefault
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving address:', error);
        return { success: false, error: error.message };
      }

      return { success: true, addressId: data.id };
    } catch (error) {
      console.error('Error in saveAddress:', error);
      return { success: false, error: 'Failed to save address' };
    }
  }

  /**
   * Update an existing address
   */
  static async updateAddress(addressId: string, addressData: AddressFormData, isDefault: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      // If this is set as default, unset other default addresses
      if (isDefault) {
        const { data: address } = await supabase
          .from('user_addresses')
          .select('user_id')
          .eq('id', addressId)
          .single();

        if (address) {
          await supabase
            .from('user_addresses')
            .update({ is_default: false })
            .eq('user_id', address.user_id)
            .eq('is_default', true)
            .neq('id', addressId);
        }
      }

      const { error } = await supabase
        .from('user_addresses')
        .update({
          email: addressData.email,
          first_name: addressData.firstName,
          last_name: addressData.lastName,
          phone: addressData.phone,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          zip_code: addressData.zipCode,
          country: addressData.country,
          is_default: isDefault,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId);

      if (error) {
        console.error('Error updating address:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateAddress:', error);
      return { success: false, error: 'Failed to update address' };
    }
  }

  /**
   * Delete an address
   */
  static async deleteAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        console.error('Error deleting address:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteAddress:', error);
      return { success: false, error: 'Failed to delete address' };
    }
  }

  /**
   * Set an address as default
   */
  static async setDefaultAddress(userId: string, addressId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, unset all default addresses
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the selected address as default
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error setting default address:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in setDefaultAddress:', error);
      return { success: false, error: 'Failed to set default address' };
    }
  }
}

export default AddressService;
