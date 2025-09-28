import { supabase } from './supabaseService';
import { Product } from '../types';

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  product?: Product; // Joined product data
}

export interface FavoriteWithProduct extends Favorite {
  product: Product;
}

export class FavoritesService {
  /**
   * Get all favorites for the current user
   */
  static async getUserFavorites(): Promise<FavoriteWithProduct[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user favorites:', error);
        throw error;
      }

      return data as FavoriteWithProduct[];
    } catch (error) {
      console.error('Error in getUserFavorites:', error);
      throw error;
    }
  }

  /**
   * Add a product to favorites
   */
  static async addToFavorites(productId: string): Promise<Favorite> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          product_id: productId
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding to favorites:', error);
        throw error;
      }

      return data as Favorite;
    } catch (error) {
      console.error('Error in addToFavorites:', error);
      throw error;
    }
  }

  /**
   * Remove a product from favorites
   */
  static async removeFromFavorites(productId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from favorites:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in removeFromFavorites:', error);
      throw error;
    }
  }

  /**
   * Check if a product is in user's favorites
   */
  static async isFavorite(productId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking favorite status:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isFavorite:', error);
      return false;
    }
  }

  /**
   * Toggle favorite status for a product
   */
  static async toggleFavorite(productId: string): Promise<boolean> {
    try {
      const isCurrentlyFavorite = await this.isFavorite(productId);
      
      if (isCurrentlyFavorite) {
        await this.removeFromFavorites(productId);
        return false;
      } else {
        await this.addToFavorites(productId);
        return true;
      }
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      throw error;
    }
  }

  /**
   * Get favorite count for a product
   */
  static async getFavoriteCount(productId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (error) {
        console.error('Error getting favorite count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getFavoriteCount:', error);
      return 0;
    }
  }

  /**
   * Get user's favorite count
   */
  static async getUserFavoriteCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return 0;
      }

      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error getting user favorite count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUserFavoriteCount:', error);
      return 0;
    }
  }
}
