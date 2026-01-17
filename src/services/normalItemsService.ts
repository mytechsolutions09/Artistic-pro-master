import { supabase } from './supabaseService';

export interface NormalItem {
  id: string;
  title: string;
  description?: string;
  images: string[];
  main_image?: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  slug: string;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  tags?: string[];
  item_details?: Record<string, any>;
  delivery_info?: Record<string, any>;
  did_you_know?: Record<string, any>;
}

class NormalItemsService {
  /**
   * Get all normal items
   */
  static async getAllItems(): Promise<NormalItem[]> {
    try {
      const { data, error } = await supabase
        .from('normal_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching normal items:', error);
      return [];
    }
  }

  /**
   * Get active normal items only
   */
  static async getActiveItems(): Promise<NormalItem[]> {
    try {
      const { data, error } = await supabase
        .from('normal_items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active normal items:', error);
      return [];
    }
  }

  /**
   * Get item by ID
   */
  static async getItemById(id: string): Promise<NormalItem | null> {
    try {
      const { data, error } = await supabase
        .from('normal_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching normal item by ID:', error);
      return null;
    }
  }

  /**
   * Get item by slug
   */
  static async getItemBySlug(slug: string): Promise<NormalItem | null> {
    try {
      const { data, error } = await supabase
        .from('normal_items')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching normal item by slug:', error);
      return null;
    }
  }

  /**
   * Create a new normal item
   */
  static async createItem(itemData: Omit<NormalItem, 'id' | 'created_at' | 'updated_at'>): Promise<NormalItem | null> {
    try {
      const { data, error } = await supabase
        .from('normal_items')
        .insert([{
          ...itemData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating normal item:', error);
      throw error;
    }
  }

  /**
   * Update a normal item
   */
  static async updateItem(id: string, itemData: Partial<NormalItem>): Promise<NormalItem | null> {
    try {
      const { data, error } = await supabase
        .from('normal_items')
        .update({
          ...itemData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating normal item:', error);
      throw error;
    }
  }

  /**
   * Delete a normal item
   */
  static async deleteItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('normal_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting normal item:', error);
      throw error;
    }
  }

  /**
   * Generate slug from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export default NormalItemsService;
