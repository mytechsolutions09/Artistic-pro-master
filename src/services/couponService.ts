import { supabase } from './supabaseService';
import { createClient } from '@supabase/supabase-js';

// Create a service role client for admin operations
const createServiceRoleClient = () => {
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn('Service role key not found. Using regular client.');
    return supabase;
  }
  
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  discount: number;
  min_amount: number;
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponValidationResult {
  is_valid: boolean;
  discount_amount: number;
  error_message: string;
}

export class CouponService {
  // Get all coupons (admin only)
  static async getAllCoupons(): Promise<Coupon[]> {
    try {
      const client = createServiceRoleClient();
      const { data, error } = await client
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      throw error;
    }
  }

  // Get active coupons only (public access)
  static async getActiveCoupons(): Promise<Coupon[]> {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active coupons:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch active coupons:', error);
      throw error;
    }
  }

  // Create a new coupon
  static async createCoupon(couponData: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'>): Promise<Coupon> {
    try {
      const client = createServiceRoleClient();
      const { data, error } = await client
        .from('coupons')
        .insert([{
          ...couponData,
          code: couponData.code.toUpperCase()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating coupon:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to create coupon:', error);
      throw error;
    }
  }

  // Update a coupon
  static async updateCoupon(id: string, updates: Partial<Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'>>): Promise<Coupon> {
    try {
      const client = createServiceRoleClient();
      const updateData = {
        ...updates,
        code: updates.code ? updates.code.toUpperCase() : undefined
      };

      const { data, error } = await client
        .from('coupons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating coupon:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update coupon:', error);
      throw error;
    }
  }

  // Delete a coupon
  static async deleteCoupon(id: string): Promise<void> {
    try {
      const client = createServiceRoleClient();
      const { error } = await client
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting coupon:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      throw error;
    }
  }

  // Toggle coupon active status
  static async toggleCouponStatus(id: string, isActive: boolean): Promise<Coupon> {
    try {
      const client = createServiceRoleClient();
      const { data, error } = await client
        .from('coupons')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling coupon status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to toggle coupon status:', error);
      throw error;
    }
  }

  // Validate a coupon (public function)
  static async validateCoupon(couponCode: string, orderAmount: number): Promise<CouponValidationResult> {
    try {
      const { data, error } = await supabase
        .rpc('validate_coupon', {
          coupon_code: couponCode.toUpperCase(),
          order_amount: orderAmount
        });

      if (error) {
        console.error('Error validating coupon:', error);
        return {
          is_valid: false,
          discount_amount: 0,
          error_message: 'Failed to validate coupon'
        };
      }

      return data[0] || {
        is_valid: false,
        discount_amount: 0,
        error_message: 'Invalid coupon code'
      };
    } catch (error) {
      console.error('Failed to validate coupon:', error);
      return {
        is_valid: false,
        discount_amount: 0,
        error_message: 'Failed to validate coupon'
      };
    }
  }

  // Increment coupon usage (called after successful order)
  static async incrementCouponUsage(couponCode: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('increment_coupon_usage', {
          coupon_code: couponCode.toUpperCase()
        });

      if (error) {
        console.error('Error incrementing coupon usage:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Failed to increment coupon usage:', error);
      return false;
    }
  }

  // Check if coupon code already exists
  static async checkCouponCodeExists(code: string, excludeId?: string): Promise<boolean> {
    try {
      const client = createServiceRoleClient();
      let query = client
        .from('coupons')
        .select('id')
        .eq('code', code.toUpperCase());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking coupon code:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Failed to check coupon code:', error);
      return false;
    }
  }
}
