import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseService';
import { Palette, Image, Save, Upload, Eye, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface ThemeColors {
  lightPink: string;
  pink: string;
  darkPink: string;
}

interface AppearanceSettings {
  themeColors: ThemeColors;
  leftSideImage: string;
  leftSideImageType: 'illustration' | 'custom';
}

const AppearanceSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppearanceSettings>({
    themeColors: {
      lightPink: '#fce7f3',
      pink: '#ec4899',
      darkPink: '#be185d'
    },
    leftSideImage: '',
    leftSideImageType: 'illustration'
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appearance_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setSettings({
          themeColors: data.theme_colors || settings.themeColors,
          leftSideImage: data.left_side_image || '',
          leftSideImageType: data.left_side_image_type || 'illustration'
        });
      }
    } catch (error) {
      console.error('Error loading appearance settings:', error);
      setMessage({ type: 'error', text: 'Failed to load appearance settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const { error } = await supabase
        .from('appearance_settings')
        .upsert({
          id: 1, // Single row for global settings
          theme_colors: settings.themeColors,
          left_side_image: settings.leftSideImage,
          left_side_image_type: settings.leftSideImageType,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Appearance settings saved successfully!' });
      
      // Apply theme colors to CSS custom properties
      applyThemeColors();
      
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      setMessage({ type: 'error', text: 'Failed to save appearance settings' });
    } finally {
      setSaving(false);
    }
  };

  const applyThemeColors = () => {
    const root = document.documentElement;
    root.style.setProperty('--theme-light-pink', settings.themeColors.lightPink);
    root.style.setProperty('--theme-pink', settings.themeColors.pink);
    root.style.setProperty('--theme-dark-pink', settings.themeColors.darkPink);
  };

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setSettings(prev => ({
      ...prev,
      themeColors: {
        ...prev.themeColors,
        [colorKey]: value
      }
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // Check current user authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();


      
      if (userError) {
        console.error('User error:', userError);
        throw new Error('Authentication error: ' + userError.message);
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // Upload to Supabase Storage (using public bucket temporarily)
      const fileExt = file.name.split('.').pop();
      const fileName = `auth-images/backgrounds/${Date.now()}.${fileExt}`;
      



      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('public')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(fileName);

      setSettings(prev => ({
        ...prev,
        leftSideImage: publicUrl,
        leftSideImageType: 'custom'
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      
      let errorMessage = 'Failed to upload image';
      if (error instanceof Error) {
        if (error.message.includes('row-level security policy')) {
          errorMessage = 'Permission denied. Please ensure you are logged in as an admin.';
        } else if (error.message.includes('413')) {
          errorMessage = 'Image file is too large. Please choose a smaller image.';
        } else if (error.message.includes('415')) {
          errorMessage = 'Unsupported file type. Please use JPG, PNG, or GIF images.';
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };


  const togglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      applyThemeColors();
    } else {
      // Reset to original colors
      const root = document.documentElement;
      root.style.removeProperty('--theme-light-pink');
      root.style.removeProperty('--theme-pink');
      root.style.removeProperty('--theme-dark-pink');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-pink-600" />
          <span className="text-gray-600">Loading appearance settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-1 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between pt-12">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-pink-600" />
            Appearance & Branding
          </h1>
          <p className="text-gray-600 text-sm">
            Customize your platform's visual identity, themes, and branding elements
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={togglePreview}
            className={`px-3 py-1.5 rounded border transition-colors flex items-center space-x-1 text-sm ${
              previewMode 
                ? 'bg-pink-50 border-pink-200 text-pink-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-3 py-1.5 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 text-sm"
          >
            <Save className="w-3 h-3" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded p-2 border flex items-center space-x-2 text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Color Theme Section */}
      <div className="bg-white rounded border border-gray-200 p-2">
        <div className="flex items-center space-x-2 mb-2">
          <Palette className="w-4 h-4 text-pink-600" />
          <h2 className="text-base font-semibold text-gray-900">Color Theme</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Light Pink */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Light Pink
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.themeColors.lightPink}
                onChange={(e) => handleColorChange('lightPink', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.themeColors.lightPink}
                onChange={(e) => handleColorChange('lightPink', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-transparent text-xs"
                placeholder="#fce7f3"
              />
            </div>
            <p className="text-xs text-gray-500">Backgrounds and accents</p>
          </div>

          {/* Pink */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Pink
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.themeColors.pink}
                onChange={(e) => handleColorChange('pink', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.themeColors.pink}
                onChange={(e) => handleColorChange('pink', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-transparent text-xs"
                placeholder="#ec4899"
              />
            </div>
            <p className="text-xs text-gray-500">Primary brand color</p>
          </div>

          {/* Dark Pink */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Dark Pink
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.themeColors.darkPink}
                onChange={(e) => handleColorChange('darkPink', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.themeColors.darkPink}
                onChange={(e) => handleColorChange('darkPink', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-transparent text-xs"
                placeholder="#be185d"
              />
            </div>
            <p className="text-xs text-gray-500">Hover states and emphasis</p>
          </div>
        </div>

        {/* Color Preview */}
        <div className="mt-2 p-2 bg-gray-50 rounded">
          <h3 className="text-xs font-medium text-gray-700 mb-1">Color Preview</h3>
          <div className="flex space-x-2">
            <div 
              className="w-8 h-8 rounded border border-gray-300"
              style={{ backgroundColor: settings.themeColors.lightPink }}
            ></div>
            <div 
              className="w-8 h-8 rounded border border-gray-300"
              style={{ backgroundColor: settings.themeColors.pink }}
            ></div>
            <div 
              className="w-8 h-8 rounded border border-gray-300"
              style={{ backgroundColor: settings.themeColors.darkPink }}
            ></div>
          </div>
        </div>
      </div>

      {/* Left Side Image Section */}
      <div className="bg-white rounded border border-gray-200 p-2">
        <div className="flex items-center space-x-2 mb-2">
          <Image className="w-4 h-4 text-pink-600" />
          <h2 className="text-base font-semibold text-gray-900">Authentication Page Image</h2>
        </div>

        <div className="space-y-2">
          {/* Image Type Selection */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              Image Type
            </label>
            <div className="flex space-x-3">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="imageType"
                  value="illustration"
                  checked={settings.leftSideImageType === 'illustration'}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    leftSideImageType: e.target.value as 'illustration' | 'custom',
                    leftSideImage: e.target.value === 'illustration' ? '' : prev.leftSideImage
                  }))}
                  className="text-pink-600 focus:ring-pink-500"
                />
                <span className="text-xs text-gray-700">Default Illustration</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="imageType"
                  value="custom"
                  checked={settings.leftSideImageType === 'custom'}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    leftSideImageType: e.target.value as 'illustration' | 'custom'
                  }))}
                  className="text-pink-600 focus:ring-pink-500"
                />
                <span className="text-xs text-gray-700">Custom Image</span>
              </label>
            </div>
          </div>

          {/* Custom Image Upload */}
          {settings.leftSideImageType === 'custom' && (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-gray-300 rounded p-2 text-center">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    Upload a custom image for the authentication pages
                  </p>
                  <p className="text-xs text-gray-500">
                    Recommended: 600x400px, JPG/PNG format
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="inline-flex items-center px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 cursor-pointer transition-colors text-xs"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Choose Image
                  </label>
                </div>
              </div>

              {/* Current Image Preview */}
              {settings.leftSideImage && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Current Image
                  </label>
                  <div className="relative w-full max-w-xs">
                    <img
                      src={settings.leftSideImage}
                      alt="Current authentication image"
                      className="w-full h-24 object-cover rounded border border-gray-300"
                    />
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, leftSideImage: '' }))}
                      className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Default Illustration Preview */}
          {settings.leftSideImageType === 'illustration' && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">
                Default Illustration Preview
              </label>
              <div className="w-full max-w-xs h-24 bg-gradient-to-br from-pink-100 to-pink-200 rounded border border-gray-300 relative overflow-hidden">
                {/* Windows */}
                <div className="absolute top-1 left-1 right-1 grid grid-cols-3 gap-1">
                  <div className="h-2 bg-white/60 rounded"></div>
                  <div className="h-2 bg-white/60 rounded"></div>
                  <div className="h-2 bg-white/60 rounded"></div>
                </div>
                <div className="absolute top-3 left-1 right-1 grid grid-cols-3 gap-1">
                  <div className="h-2 bg-white/60 rounded"></div>
                  <div className="h-2 bg-white/60 rounded"></div>
                  <div className="h-2 bg-white/60 rounded"></div>
                </div>
                
                {/* Art Pieces */}
                <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                  <div className="w-3 h-4 bg-gradient-to-br from-pink-200 to-pink-300 rounded"></div>
                  <div className="w-3 h-4 bg-gradient-to-br from-pink-300 to-pink-400 rounded"></div>
                  <div className="w-3 h-4 bg-gradient-to-br from-pink-400 to-pink-500 rounded"></div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-200 rounded-full opacity-60"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-300 rounded-full opacity-60"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center pt-2 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={togglePreview}
            className={`px-3 py-1.5 rounded border transition-colors flex items-center space-x-1 text-sm ${
              previewMode 
                ? 'bg-pink-50 border-pink-200 text-pink-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-1.5 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 text-sm"
          >
            <Save className="w-3 h-3" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
