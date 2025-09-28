import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization for Supabase clients
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

// Function to get Supabase configuration
function getSupabaseConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  // Validate required environment variables
  if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
    console.error('❌ VITE_SUPABASE_URL is not set or is using default value');
    console.error('Please set VITE_SUPABASE_URL in your .env file');
    throw new Error('VITE_SUPABASE_URL is required');
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
    console.error('❌ VITE_SUPABASE_ANON_KEY is not set or is using default value');
    console.error('Please set VITE_SUPABASE_ANON_KEY in your .env file');
    throw new Error('VITE_SUPABASE_ANON_KEY is required');
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceKey: supabaseServiceKey || ''
  };
}

// Lazy getter for regular Supabase client
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    try {
      const config = getSupabaseConfig();
      _supabase = createClient(config.url, config.anonKey);
      console.log('✅ Supabase client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      throw error;
    }
  }
  return _supabase;
}

// Lazy getter for admin Supabase client
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    try {
      const config = getSupabaseConfig();
      _supabaseAdmin = createClient(config.url, config.serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log('✅ Supabase admin client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase admin client:', error);
      throw error;
    }
  }
  return _supabaseAdmin;
}

// Backward compatibility exports - these will be initialized when first accessed
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  }
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  }
});

// Real User interface based on Supabase auth.users
export interface RealUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  phone?: string;
  raw_app_meta_data?: any;
  raw_user_meta_data?: any;
  is_anonymous?: boolean;
  role?: string;
  aud?: string;
  confirmation_sent_at?: string;
  recovery_sent_at?: string;
  email_change_sent_at?: string;
  new_email?: string;
  invited_at?: string;
  action_link?: string;
  email_change?: string;
  new_phone?: string;
  phone_change?: string;
  phone_change_sent_at?: string;
  confirmed_at?: string;
  email_change_confirm_status?: number;
  banned_until?: string;
  reauthentication_sent_at?: string;
  reauthentication_token?: string;
  is_sso_user?: boolean;
  deleted_at?: string;
  is_super_admin?: boolean;
  app_metadata?: any;
  user_metadata?: any;
  identities?: any[];
  factors?: any[];
}

// User stats interface
export interface UserStats {
  total: number;
  confirmed: number;
  unconfirmed: number;
  active: number;
  inactive: number;
  recent_signups: number;
}

export class RealUserService {
  // Get all users from auth.users table
  static async getAllUsers(): Promise<RealUser[]> {
    try {
      // Try admin API first (requires service role key)
      const config = getSupabaseConfig();
      if (config.serviceKey) {
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();
        
        if (error) {
          console.error('Error fetching users with admin API:', error);
          // Fall back to alternative method
          return await this.getUsersFallback();
        }

        return data.users.map(user => ({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          phone: user.phone,
          raw_app_meta_data: user.app_metadata,
          raw_user_meta_data: user.user_metadata,
          is_anonymous: user.is_anonymous,
          role: user.app_metadata?.role || 'customer',
          aud: user.aud,
          confirmation_sent_at: user.confirmation_sent_at,
          recovery_sent_at: user.recovery_sent_at,
          email_change_sent_at: user.email_change_sent_at,
          new_email: user.new_email,
          invited_at: user.invited_at,
          action_link: user.action_link,
          email_change: user.new_email,
          new_phone: user.phone,
          phone_change: user.phone,
          phone_change_sent_at: user.email_change_sent_at,
          confirmed_at: user.confirmed_at,
          email_change_confirm_status: 0,
          banned_until: undefined,
          reauthentication_sent_at: undefined,
          reauthentication_token: undefined,
          is_sso_user: user.is_sso_user,
          deleted_at: user.deleted_at,
          is_super_admin: false,
          app_metadata: user.app_metadata,
          user_metadata: user.user_metadata,
          identities: user.identities,
          factors: user.factors
        }));
      } else {
        // No service role key, use fallback method
        return await this.getUsersFallback();
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return await this.getUsersFallback();
    }
  }

  // Fallback method to get users when admin API is not available
  static async getUsersFallback(): Promise<RealUser[]> {
    try {
      // Try to get current user and create a sample list
      const supabase = getSupabase();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const users: RealUser[] = [];
      
      if (currentUser) {
        // Add current user
        users.push({
          id: currentUser.id,
          email: currentUser.email || '',
          created_at: currentUser.created_at,
          email_confirmed_at: currentUser.email_confirmed_at,
          last_sign_in_at: currentUser.last_sign_in_at,
          phone: currentUser.phone,
          raw_app_meta_data: currentUser.app_metadata,
          raw_user_meta_data: currentUser.user_metadata,
          is_anonymous: currentUser.is_anonymous,
          role: currentUser.app_metadata?.role || 'admin',
          aud: currentUser.aud,
          confirmation_sent_at: currentUser.confirmation_sent_at,
          recovery_sent_at: currentUser.recovery_sent_at,
          email_change_sent_at: currentUser.email_change_sent_at,
          new_email: currentUser.new_email,
          invited_at: currentUser.invited_at,
          action_link: currentUser.action_link,
          email_change: currentUser.new_email,
          new_phone: currentUser.phone,
          phone_change: currentUser.phone,
          phone_change_sent_at: currentUser.email_change_sent_at,
          confirmed_at: currentUser.confirmed_at,
          email_change_confirm_status: 0,
          banned_until: undefined,
          reauthentication_sent_at: undefined,
          reauthentication_token: undefined,
          is_sso_user: currentUser.is_sso_user,
          deleted_at: currentUser.deleted_at,
          is_super_admin: false,
          app_metadata: currentUser.app_metadata,
          user_metadata: currentUser.user_metadata,
          identities: currentUser.identities,
          factors: currentUser.factors
        });
      }
      
      return users;
    } catch (error) {
      console.error('Error in fallback user fetch:', error);
      return [];
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<UserStats> {
    try {
      const users = await this.getAllUsers();
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      return {
        total: users.length,
        confirmed: users.filter(u => u.email_confirmed_at).length,
        unconfirmed: users.filter(u => !u.email_confirmed_at).length,
        active: users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo).length,
        inactive: users.filter(u => !u.last_sign_in_at || new Date(u.last_sign_in_at) <= thirtyDaysAgo).length,
        recent_signups: users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        total: 0,
        confirmed: 0,
        unconfirmed: 0,
        active: 0,
        inactive: 0,
        recent_signups: 0
      };
    }
  }

  // Update user role
  static async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: { role }
      });
      
      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  // Ban/unban user
  static async banUser(userId: string, banUntil?: string): Promise<boolean> {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: banUntil || 'none'
      });
      
      if (error) {
        console.error('Error banning user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error banning user:', error);
      return false;
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Create user (admin only)
  static async createUser(email: string, password: string, userData?: any): Promise<boolean> {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userData
      });
      
      if (error) {
        console.error('Error creating user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<RealUser | null> {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (error || !data.user) {
        console.error('Error fetching user:', error);
        return null;
      }

      const user = data.user;
      return {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        phone: user.phone,
        raw_app_meta_data: user.app_metadata,
        raw_user_meta_data: user.user_metadata,
        is_anonymous: user.is_anonymous,
        role: user.app_metadata?.role || 'customer',
        aud: user.aud,
        confirmation_sent_at: user.confirmation_sent_at,
        recovery_sent_at: user.recovery_sent_at,
        email_change_sent_at: user.email_change_sent_at,
        new_email: user.new_email,
        invited_at: user.invited_at,
        action_link: user.action_link,
        email_change: user.new_email,
        new_phone: user.phone,
        phone_change: user.phone,
        phone_change_sent_at: user.email_change_sent_at,
        confirmed_at: user.confirmed_at,
        email_change_confirm_status: 0,
        banned_until: undefined,
        reauthentication_sent_at: undefined,
        reauthentication_token: undefined,
        is_sso_user: user.is_sso_user,
        deleted_at: user.deleted_at,
        is_super_admin: false,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
        identities: user.identities,
        factors: user.factors
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}
