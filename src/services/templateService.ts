import { supabase } from './supabaseService';

export interface ProductTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  data: {
    title: string;
    category: string;
    price: number;
    description: string;
    tags: string;
    productType: 'digital' | 'poster';
    posterSize?: string;
    itemDetails: {
      material: string;
      size: string;
      frame: string;
      style: string;
      origin: string;
    };
    delivery: {
      standardDelivery: string;
      expressDelivery: string;
      sameDayDelivery: string;
      additionalInfo: string;
    };
    didYouKnow: {
      artistStory: string;
      ecoFriendly: string;
      uniqueFeatures: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateTemplateData {
  name: string;
  icon: string;
  description: string;
  data: ProductTemplate['data'];
}

export interface UpdateTemplateData {
  name?: string;
  icon?: string;
  description?: string;
  data?: Partial<ProductTemplate['data']>;
}

class TemplateService {
  /**
   * Get all product templates
   */
  async getAllTemplates(): Promise<ProductTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('product_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id: string): Promise<ProductTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('product_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<ProductTemplate[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_templates_by_category', { category_name: category });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      throw error;
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(searchTerm: string): Promise<ProductTemplate[]> {
    try {
      const { data, error } = await supabase
        .rpc('search_templates', { search_term: searchTerm });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching templates:', error);
      throw error;
    }
  }

  /**
   * Create new template
   */
  async createTemplate(templateData: CreateTemplateData): Promise<ProductTemplate> {
    try {
      const { data, error } = await supabase
        .from('product_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, templateData: UpdateTemplateData): Promise<ProductTemplate> {
    try {
      const { data, error } = await supabase
        .from('product_templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Get templates view (simplified data)
   */
  async getTemplatesView(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('product_templates_view')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates view:', error);
      throw error;
    }
  }

  /**
   * Get popular templates (most used)
   */
  async getPopularTemplates(limit: number = 6): Promise<ProductTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('product_templates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching popular templates:', error);
      throw error;
    }
  }

  /**
   * Get templates by price range
   */
  async getTemplatesByPriceRange(minPrice: number, maxPrice: number): Promise<ProductTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('product_templates')
        .select('*')
        .gte('data->>price', minPrice.toString())
        .lte('data->>price', maxPrice.toString())
        .order('data->>price');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates by price range:', error);
      throw error;
    }
  }

  /**
   * Get templates by style/material
   */
  async getTemplatesByStyle(style: string): Promise<ProductTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('product_templates')
        .select('*')
        .or(`data->itemDetails->>style.ilike.%${style}%,data->itemDetails->>material.ilike.%${style}%`)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates by style:', error);
      throw error;
    }
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    averagePrice: number;
    priceRange: { min: number; max: number };
  }> {
    try {
      const { data: templates, error } = await supabase
        .from('product_templates')
        .select('*');

      if (error) throw error;

      const total = templates?.length || 0;
      const byCategory: Record<string, number> = {};
      const prices: number[] = [];

      templates?.forEach(template => {
        const category = template.data.category;
        byCategory[category] = (byCategory[category] || 0) + 1;
        
        if (template.data.price) {
          prices.push(template.data.price);
        }
      });

      const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
      const priceRange = {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0
      };

      return {
        total,
        byCategory,
        averagePrice: Math.round(averagePrice),
        priceRange
      };
    } catch (error) {
      console.error('Error fetching template stats:', error);
      throw error;
    }
  }
}

export const templateService = new TemplateService();
export default templateService;
