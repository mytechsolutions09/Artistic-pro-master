import { supabase } from './supabaseService';

export interface LogoSettings {
  id?: string;
  logo_url: string;
  logo_text: string;
  logo_color: string;
  background_color: string;
  show_underline: boolean;
  underline_color: string;
  font_size: number;
  font_family: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export class LogoService {
  /**
   * Get the current active logo settings
   */
  static async getActiveLogoSettings(): Promise<LogoSettings | null> {
    try {
      const { data, error } = await supabase
        .from('logo_settings')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching logo settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getActiveLogoSettings:', error);
      return null;
    }
  }

  /**
   * Update logo settings
   */
  static async updateLogoSettings(settings: Partial<LogoSettings>): Promise<boolean> {
    try {
      // First, deactivate all current settings
      await supabase
        .from('logo_settings')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new settings as active
      const { error } = await supabase
        .from('logo_settings')
        .insert({
          ...settings,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating logo settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateLogoSettings:', error);
      return false;
    }
  }

  /**
   * Upload logo file to storage bucket
   */
  static async uploadLogoFile(file: File, fileName: string): Promise<string | null> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `logo-${timestamp}.${fileExtension}`;

      // Upload file to storage bucket
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading logo file:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(uniqueFileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadLogoFile:', error);
      return null;
    }
  }

  /**
   * Delete logo file from storage
   */
  static async deleteLogoFile(filePath: string): Promise<boolean> {
    try {
      // Extract filename from path
      const fileName = filePath.split('/').pop();
      if (!fileName) {
        console.error('Invalid file path');
        return false;
      }

      const { error } = await supabase.storage
        .from('logos')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting logo file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteLogoFile:', error);
      return false;
    }
  }

  /**
   * Generate SVG logo from text settings
   */
  static generateSVGLogo(settings: LogoSettings): string {
    return `<svg width="200" height="80" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .logo-text {
        font-family: '${settings.font_family}', 'Lucida Handwriting', 'Comic Sans MS', cursive, sans-serif;
        font-size: ${settings.font_size}px;
        font-weight: 400;
        fill: ${settings.logo_color};
        stroke: none;
      }
      .logo-underline {
        fill: none;
        stroke: ${settings.underline_color};
        stroke-width: 1.2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="200" height="80" fill="${settings.background_color}"/>
  
  <!-- Logo Text -->
  <text x="100" y="50" text-anchor="middle" class="logo-text">${settings.logo_text}</text>
  
  <!-- Wavy Underline -->
  ${settings.show_underline ? '<path d="M 60 58 Q 80 61 100 58 T 140 58" class="logo-underline"/>' : ''}
</svg>`;
  }

  /**
   * Upload generated SVG to storage
   */
  static async uploadGeneratedSVG(settings: LogoSettings): Promise<string | null> {
    try {
      const svgContent = this.generateSVGLogo(settings);
      const timestamp = Date.now();
      const fileName = `generated-logo-${timestamp}.svg`;
      
      // Convert SVG string to blob
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      
      // Upload to storage
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading generated SVG:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadGeneratedSVG:', error);
      return null;
    }
  }

  /**
   * Get all logo settings history
   */
  static async getAllLogoSettings(): Promise<LogoSettings[]> {
    try {
      const { data, error } = await supabase
        .from('logo_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all logo settings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllLogoSettings:', error);
      return [];
    }
  }
}
