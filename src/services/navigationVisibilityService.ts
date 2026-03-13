export type NavigationSection = 'clothes' | 'fb';

export interface NavigationVisibilitySettings {
  clothesActive: boolean;
  fbActive: boolean;
}

const STORAGE_KEY = 'navigation_visibility_settings';
const UPDATE_EVENT = 'navigation-visibility-updated';

const DEFAULT_SETTINGS: NavigationVisibilitySettings = {
  clothesActive: true,
  fbActive: true,
};

const readSettings = (): NavigationVisibilitySettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw);
    return {
      clothesActive: parsed?.clothesActive ?? DEFAULT_SETTINGS.clothesActive,
      fbActive: parsed?.fbActive ?? DEFAULT_SETTINGS.fbActive,
    };
  } catch (error) {
    console.error('Failed to read navigation visibility settings:', error);
    return DEFAULT_SETTINGS;
  }
};

const persistSettings = (settings: NavigationVisibilitySettings) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(UPDATE_EVENT));
};

export const NavigationVisibilityService = {
  getSettings(): NavigationVisibilitySettings {
    return readSettings();
  },

  setSectionActive(section: NavigationSection, isActive: boolean): NavigationVisibilitySettings {
    const current = readSettings();
    const updated: NavigationVisibilitySettings =
      section === 'clothes'
        ? { ...current, clothesActive: isActive }
        : { ...current, fbActive: isActive };

    persistSettings(updated);
    return updated;
  },

  subscribe(onChange: (settings: NavigationVisibilitySettings) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleChange = () => onChange(readSettings());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        onChange(readSettings());
      }
    };

    window.addEventListener(UPDATE_EVENT, handleChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleChange);
      window.removeEventListener('storage', handleStorage);
    };
  },
};
