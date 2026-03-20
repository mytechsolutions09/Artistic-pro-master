'use client'

// SSR-safe localStorage wrapper
const _storage = typeof window !== 'undefined' ? window.localStorage : {
  getItem: (_k: string) => null,
  setItem: (_k: string, _v: string) => {},
  removeItem: (_k: string) => {},
};

export type NavigationSection = 'clothes' | 'fb';

export interface NavigationVisibilitySettings {
  clothesActive: boolean;
  fbActive: boolean;
}

const STORAGE_KEY = 'navigation_visibility_settings';
const UPDATE_EVENT = 'navigation-visibility-updated';

const DEFAULT_SETTINGS: NavigationVisibilitySettings = {
  // Keep both sections disabled by default until an admin explicitly enables them.
  clothesActive: false,
  fbActive: false,
};

const FB_KEYWORDS = [
  'food & beverage',
  'f&b',
  'f & b',
  'food and beverage',
  'dry fruit',
  'dried fruit',
  'spice',
  'spices',
];

const CLOTHING_KEYWORDS = [
  'men',
  'women',
  'unisex',
  'clothing',
  'hoodie',
  'sweatshirt',
  't-shirt',
  'tshirt',
  'shirt',
];

const getCombinedProductText = (product: any): string => {
  const categories = Array.isArray(product?.categories) ? product.categories : [];
  const tags = Array.isArray(product?.tags) ? product.tags : [];
  const category = product?.category ? [product.category] : [];

  return [...categories, ...tags, ...category]
    .map((value) => String(value || '').toLowerCase())
    .join(' ');
};

const isFBProduct = (product: any): boolean => {
  const combined = getCombinedProductText(product);
  return FB_KEYWORDS.some((keyword) => combined.includes(keyword));
};

const isClothingProduct = (product: any): boolean => {
  const gender = String(product?.gender || '').toLowerCase();
  if (gender === 'men' || gender === 'women' || gender === 'unisex') return true;

  const combined = getCombinedProductText(product);
  return CLOTHING_KEYWORDS.some((keyword) => combined.includes(keyword));
};

const readSettings = (): NavigationVisibilitySettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = window._storage.getItem(STORAGE_KEY);
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

  window._storage.setItem(STORAGE_KEY, JSON.stringify(settings));
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

  isFBProduct(product: any): boolean {
    return isFBProduct(product);
  },

  isClothingProduct(product: any): boolean {
    return isClothingProduct(product);
  },

  isProductVisible(product: any, settings?: NavigationVisibilitySettings): boolean {
    const resolvedSettings = settings || readSettings();
    if (!resolvedSettings.fbActive && isFBProduct(product)) return false;
    if (!resolvedSettings.clothesActive && isClothingProduct(product)) return false;
    return true;
  },

  filterProductsByVisibility<T>(products: T[], settings?: NavigationVisibilitySettings): T[] {
    const resolvedSettings = settings || readSettings();
    return products.filter((product) => this.isProductVisible(product, resolvedSettings));
  },
};




