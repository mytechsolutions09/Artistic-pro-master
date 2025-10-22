import { supabase } from './supabaseService';

export interface StoreCreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'credit' | 'debit' | 'refund' | 'return';
  description: string | null;
  order_id: string | null;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

export interface StoreCreditBalance {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export class StoreCreditService {
  /**
   * Get user's store credit balance
   */
  static async getUserBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_credit_balance', {
          p_user_id: userId
        });

      if (error) {
        console.error('Error fetching store credit balance:', error);
        return 0;
      }

      return parseFloat(data || '0');
    } catch (error) {
      console.error('Error in getUserBalance:', error);
      return 0;
    }
  }

  /**
   * Add store credit to user account
   */
  static async addCredit(
    userId: string,
    amount: number,
    description?: string,
    orderId?: string,
    transactionType: 'credit' | 'refund' | 'return' = 'credit'
  ): Promise<{ success: boolean; error?: string; balance?: number }> {
    try {
      const { data, error } = await supabase
        .rpc('add_store_credit', {
          p_user_id: userId,
          p_amount: amount,
          p_description: description || null,
          p_order_id: orderId || null,
          p_transaction_type: transactionType
        });

      if (error) {
        console.error('Error adding store credit:', error);
        return { success: false, error: error.message };
      }

      const result = data as any;
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        balance: parseFloat(result.balance_after)
      };
    } catch (error) {
      console.error('Error in addCredit:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Deduct store credit from user account
   */
  static async deductCredit(
    userId: string,
    amount: number,
    description?: string,
    orderId?: string
  ): Promise<{ success: boolean; error?: string; balance?: number }> {
    try {
      const { data, error } = await supabase
        .rpc('deduct_store_credit', {
          p_user_id: userId,
          p_amount: amount,
          p_description: description || null,
          p_order_id: orderId || null
        });

      if (error) {
        console.error('Error deducting store credit:', error);
        return { success: false, error: error.message };
      }

      const result = data as any;
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        balance: parseFloat(result.balance_after)
      };
    } catch (error) {
      console.error('Error in deductCredit:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get user's transaction history
   */
  static async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<{ success: boolean; transactions?: StoreCreditTransaction[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('store_credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching transaction history:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        transactions: data as StoreCreditTransaction[]
      };
    } catch (error) {
      console.error('Error in getTransactionHistory:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get store credit record for a user
   */
  static async getCreditRecord(userId: string): Promise<StoreCreditBalance | null> {
    try {
      const { data, error } = await supabase
        .from('store_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found
          return null;
        }
        console.error('Error fetching credit record:', error);
        return null;
      }

      return data as StoreCreditBalance;
    } catch (error) {
      console.error('Error in getCreditRecord:', error);
      return null;
    }
  }

  /**
   * Check if user has sufficient credit
   */
  static async hasSufficientCredit(userId: string, requiredAmount: number): Promise<boolean> {
    const balance = await this.getUserBalance(userId);
    return balance >= requiredAmount;
  }

  /**
   * Format currency amount
   */
  static formatAmount(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Process store credit payment for an order
   */
  static async processPayment(
    userId: string,
    orderAmount: number,
    orderId: string
  ): Promise<{ success: boolean; creditUsed: number; remainingBalance: number; error?: string }> {
    try {
      // Get current balance
      const balance = await this.getUserBalance(userId);

      if (balance <= 0) {
        return {
          success: false,
          creditUsed: 0,
          remainingBalance: 0,
          error: 'No store credit available'
        };
      }

      // Calculate how much credit to use
      const creditToUse = Math.min(balance, orderAmount);

      // Deduct credit
      const result = await this.deductCredit(
        userId,
        creditToUse,
        `Payment for order #${orderId}`,
        orderId
      );

      if (!result.success) {
        return {
          success: false,
          creditUsed: 0,
          remainingBalance: balance,
          error: result.error
        };
      }

      return {
        success: true,
        creditUsed: creditToUse,
        remainingBalance: result.balance || 0
      };
    } catch (error) {
      console.error('Error in processPayment:', error);
      return {
        success: false,
        creditUsed: 0,
        remainingBalance: 0,
        error: (error as Error).message
      };
    }
  }
}

export default StoreCreditService;

