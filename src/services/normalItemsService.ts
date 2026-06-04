'use client'

import { supabase } from './supabaseService';
import { ProductService } from './supabaseService';

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
   * Optimized to only fetch necessary columns for listing
   */
  static async getActiveItems(): Promise<NormalItem[]> {
    try {
      const { data, error } = await supabase
        .from('normal_items')
        .select('id, title, description, images, main_image, price, original_price, discount_percentage, slug, status, created_at, updated_at, tags')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to prevent loading too many items at once

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
   * Get item by title-generated slug (matches URL generated from title)
   */
  static async getItemByTitleSlug(titleSlug: string): Promise<NormalItem | null> {
    try {
      // Get all items and find one where the title generates the matching slug
      const { data, error } = await supabase
        .from('normal_items')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      
      if (!data) return null;

      // Find item where generated slug from title matches the URL slug
      const item = data.find(item => {
        const generatedSlug = this.generateSlug(item.title);
        return generatedSlug === titleSlug;
      });

      return item || null;
    } catch (error) {
      console.error('Error fetching normal item by title slug:', error);
      return null;
    }
  }

  /**
   * Create a new normal item
   * Also creates a corresponding entry in products table so it has a product_id
   */
  static async createItem(itemData: Omit<NormalItem, 'id' | 'created_at' | 'updated_at'>): Promise<NormalItem | null> {
    try {
      // First create the product in products table
      const productData = {
        title: itemData.title,
        description: itemData.description,
        price: itemData.price,
        originalPrice: itemData.original_price,
        discountPercentage: itemData.discount_percentage,
        categories: ['Normal'],
        images: itemData.images,
        main_image: itemData.main_image || itemData.images[0],
        status: itemData.status === 'active' ? 'active' : 'inactive',
        tags: itemData.tags || [],
        itemDetails: itemData.item_details || {},
        delivery: itemData.delivery_info || {},
        didYouKnow: itemData.did_you_know || {},
        productType: 'digital' as const,
        featured: false
      };

      const product = await ProductService.createProduct(productData);
      
      // Now create the normal_item with the same ID as the product
      const { data, error } = await supabase
        .from('normal_items')
        .insert([{
          id: product.id, // Use the same ID as the product
          ...itemData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        // If normal_items insert fails, try to delete the product we created
        try {
          await ProductService.deleteProduct(product.id);
        } catch (deleteError) {
          console.error('Error cleaning up product after normal_items insert failure:', deleteError);
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating normal item:', error);
      throw error;
    }
  }

  /**
   * Update a normal item
   * Also updates the corresponding entry in products table
   */
  static async updateItem(id: string, itemData: Partial<NormalItem>): Promise<NormalItem | null> {
    try {
      // Update the product in products table
      const productUpdateData: any = {};
      if (itemData.title !== undefined) productUpdateData.title = itemData.title;
      if (itemData.description !== undefined) productUpdateData.description = itemData.description;
      if (itemData.price !== undefined) productUpdateData.price = itemData.price;
      if (itemData.original_price !== undefined) productUpdateData.originalPrice = itemData.original_price;
      if (itemData.discount_percentage !== undefined) productUpdateData.discountPercentage = itemData.discount_percentage;
      if (itemData.images !== undefined) productUpdateData.images = itemData.images;
      if (itemData.main_image !== undefined) productUpdateData.main_image = itemData.main_image;
      if (itemData.status !== undefined) productUpdateData.status = itemData.status === 'active' ? 'active' : 'inactive';
      if (itemData.tags !== undefined) productUpdateData.tags = itemData.tags;
      if (itemData.item_details !== undefined) productUpdateData.itemDetails = itemData.item_details;
      if (itemData.delivery_info !== undefined) productUpdateData.delivery = itemData.delivery_info;
      if (itemData.did_you_know !== undefined) productUpdateData.didYouKnow = itemData.did_you_know;

      // Update product if there are changes
      if (Object.keys(productUpdateData).length > 0) {
        try {
          await ProductService.updateProduct(id, productUpdateData);
        } catch (productError) {
          console.warn('Error updating product for normal item:', productError);
          // Continue with normal_items update even if product update fails
        }
      }

      // Update normal_items table
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
   * Also deletes the corresponding entry in products table
   */
  static async deleteItem(id: string): Promise<boolean> {
    try {
      // Delete from normal_items first
      const { error: normalItemError } = await supabase
        .from('normal_items')
        .delete()
        .eq('id', id);

      if (normalItemError) throw normalItemError;

      // Then delete from products table
      try {
        await ProductService.deleteProduct(id);
      } catch (productError) {
        console.warn('Error deleting product for normal item:', productError);
        // Continue even if product deletion fails (might already be deleted)
      }

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




