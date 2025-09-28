import { supabase } from './supabaseService';

export interface HomepageSettings {
  id?: string;
  hero_section: any;
  image_slider: any;
  featured_grid: any;
  best_sellers: any;
  featured_artwork: any;
  categories: any;
  trending_collections: any;
  stats: any;
  newsletter: any;
  created_at?: string;
  updated_at?: string;
}

export class HomepageSettingsService {
  /**
   * Get homepage settings from database
   */
  static async getHomepageSettings(): Promise<HomepageSettings | null> {
    try {
      console.log('Attempting to fetch homepage settings...');
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log('Error fetching homepage settings:', error);
        if (error.code === 'PGRST116') {
          // No rows found, return null
          console.log('No homepage settings found in database');
          return null;
        }
        throw error;
      }

      console.log('Homepage settings fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching homepage settings:', error);
      return null;
    }
  }

  /**
   * Save homepage settings to database
   */
  static async saveHomepageSettings(settings: Omit<HomepageSettings, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if settings already exist
      const existingSettings = await this.getHomepageSettings();
      
      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('homepage_settings')
          .update({
            hero_section: settings.hero_section,
            image_slider: settings.image_slider,
            featured_grid: settings.featured_grid,
            best_sellers: settings.best_sellers,
            featured_artwork: settings.featured_artwork,
            categories: settings.categories,
            trending_collections: settings.trending_collections,
            stats: settings.stats,
            newsletter: settings.newsletter,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('homepage_settings')
          .insert([{
            hero_section: settings.hero_section,
            image_slider: settings.image_slider,
            featured_grid: settings.featured_grid,
            best_sellers: settings.best_sellers,
            featured_artwork: settings.featured_artwork,
            categories: settings.categories,
            trending_collections: settings.trending_collections,
            stats: settings.stats,
            newsletter: settings.newsletter,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error saving homepage settings:', error);
      throw error;
    }
  }

  /**
   * Reset homepage settings to default
   */
  static async resetHomepageSettings(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('homepage_settings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resetting homepage settings:', error);
      throw error;
    }
  }
}
