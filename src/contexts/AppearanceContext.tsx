import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseService';

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

interface AppearanceContextType {
  settings: AppearanceSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

interface AppearanceProviderProps {
  children: ReactNode;
}

export const AppearanceProvider: React.FC<AppearanceProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppearanceSettings>({
    themeColors: {
      lightPink: '#ffffff',
      pink: '#ffffff',
      darkPink: '#ffffff'
    },
    leftSideImage: '',
    leftSideImageType: 'custom'
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appearance_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading appearance settings:', error);
        return;
      }

      if (data) {
        const newSettings = {
          themeColors: data.theme_colors || {
            lightPink: '#ffffff',
            pink: '#ffffff',
            darkPink: '#ffffff'
          },
          leftSideImage: data.left_side_image || '',
          leftSideImageType: data.left_side_image_type || 'illustration'
        };
        setSettings(newSettings);
        applyThemeColors(newSettings.themeColors);
      }
    } catch (error) {
      console.error('Error loading appearance settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyThemeColors = (themeColors: ThemeColors) => {
    const root = document.documentElement;
    root.style.setProperty('--theme-light-pink', themeColors.lightPink);
    root.style.setProperty('--theme-pink', themeColors.pink);
    root.style.setProperty('--theme-dark-pink', themeColors.darkPink);
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <AppearanceContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = (): AppearanceContextType => {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
};
