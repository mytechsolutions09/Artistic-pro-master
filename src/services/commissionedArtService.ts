import { supabase } from './supabaseService';

export interface CommissionedArt {
  id: string;
  // Customer Information
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_id?: string;
  
  // Commission Details
  title: string;
  description?: string;
  art_type: 'painting' | 'digital' | 'sculpture' | 'mixed_media' | 'illustration' | 'custom';
  dimensions?: string;
  medium?: string;
  reference_images?: string[];
  
  // Pricing and Budget
  budget_min?: number;
  budget_max?: number;
  quoted_price?: number;
  final_price?: number;
  deposit_paid?: number;
  
  // Status and Timeline
  status: 'inquiry' | 'quoted' | 'accepted' | 'in_progress' | 'review' | 'completed' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requested_delivery_date?: string;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  
  // Progress Tracking
  progress?: number;
  work_in_progress_images?: string[];
  final_artwork_images?: string[];
  
  // Communication
  notes?: string;
  admin_notes?: string;
  revision_count?: number;
  revision_limit?: number;
  
  // Payment Details
  payment_method?: string;
  payment_status: 'pending' | 'deposit_paid' | 'partially_paid' | 'fully_paid' | 'refunded';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  
  // Additional Information
  tags?: string[];
  featured?: boolean;
  is_archived?: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

class CommissionedArtService {
  // Get all commissioned art
  async getAllCommissions(): Promise<CommissionedArt[]> {
    try {
      const { data, error } = await supabase
        .from('commissioned_art')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching commissioned art:', error);
      throw error;
    }
  }

  // Get single commission by ID
  async getCommissionById(id: string): Promise<CommissionedArt | null> {
    try {
      const { data, error } = await supabase
        .from('commissioned_art')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching commission:', error);
      throw error;
    }
  }

  // Get commissions by customer
  async getCommissionsByCustomer(customerEmail: string): Promise<CommissionedArt[]> {
    try {
      const { data, error } = await supabase
        .from('commissioned_art')
        .select('*')
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customer commissions:', error);
      throw error;
    }
  }

  // Get commissions by status
  async getCommissionsByStatus(status: string): Promise<CommissionedArt[]> {
    try {
      const { data, error } = await supabase
        .from('commissioned_art')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching commissions by status:', error);
      throw error;
    }
  }

  // Create new commission
  async createCommission(commission: Partial<CommissionedArt>): Promise<CommissionedArt | null> {
    try {
      const { data, error } = await supabase
        .from('commissioned_art')
        .insert([commission])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating commission:', error);
      throw error;
    }
  }

  // Update commission
  async updateCommission(id: string, updates: Partial<CommissionedArt>): Promise<CommissionedArt | null> {
    try {
      const { data, error } = await supabase
        .from('commissioned_art')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating commission:', error);
      throw error;
    }
  }

  // Delete commission
  async deleteCommission(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('commissioned_art')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting commission:', error);
      throw error;
    }
  }

  // Update commission status
  async updateStatus(id: string, status: CommissionedArt['status']): Promise<CommissionedArt | null> {
    return this.updateCommission(id, { status });
  }

  // Update progress
  async updateProgress(id: string, progress: number): Promise<CommissionedArt | null> {
    return this.updateCommission(id, { progress });
  }

  // Get statistics
  async getStats() {
    try {
      const { data, error } = await supabase
        .from('commissioned_art')
        .select('status, payment_status, priority, final_price');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        by_status: {
          inquiry: 0,
          quoted: 0,
          accepted: 0,
          in_progress: 0,
          review: 0,
          completed: 0,
          delivered: 0,
          cancelled: 0,
        },
        by_payment: {
          pending: 0,
          deposit_paid: 0,
          partially_paid: 0,
          fully_paid: 0,
          refunded: 0,
        },
        by_priority: {
          low: 0,
          normal: 0,
          high: 0,
          urgent: 0,
        },
        total_revenue: 0,
      };

      data?.forEach((item: any) => {
        if (item.status) stats.by_status[item.status as keyof typeof stats.by_status]++;
        if (item.payment_status) stats.by_payment[item.payment_status as keyof typeof stats.by_payment]++;
        if (item.priority) stats.by_priority[item.priority as keyof typeof stats.by_priority]++;
        if (item.final_price) stats.total_revenue += parseFloat(item.final_price);
      });

      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
}

export default new CommissionedArtService();

