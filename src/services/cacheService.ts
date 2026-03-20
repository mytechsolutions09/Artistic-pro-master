'use client'

/**
 * In-memory + sessionStorage cache with TTL support.
 *
 * Two-tier storage:
 *  1. In-memory Map (fastest, zero serialization cost)
 *  2. sessionStorage (survives SPA client-side navigation, cleared on tab close)
 *
 * Usage:
 *   const data = await appCache.getOrFetch('key', () => fetchFromDB(), CACHE_TTL.PRODUCTS);
 *   appCache.invalidate('key');          // single key
 *   appCache.invalidatePrefix('products'); // all keys starting with 'products'
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const SESSION_PREFIX = 'app_cache:';

// SSR-safe sessionStorage wrapper
const _sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : {
  getItem: (_k: string) => null as string | null,
  setItem: (_k: string, _v: string) => {},
  removeItem: (_k: string) => {},
  clear: () => {},
};

class CacheService {
  private static instance: CacheService;
  private memory = new Map<string, CacheEntry<unknown>>();

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /** Read from memory → _sessionStorage. Returns null on miss or expiry. */
  get<T>(key: string): T | null {
    const memEntry = this.memory.get(key);
    if (memEntry) {
      if (!this.isExpired(memEntry)) return memEntry.data as T;
      this.memory.delete(key);
    }

    try {
      const raw = _sessionStorage.getItem(SESSION_PREFIX + key);
      if (raw) {
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (!this.isExpired(entry)) {
          this.memory.set(key, entry);
          return entry.data;
        }
        _sessionStorage.removeItem(SESSION_PREFIX + key);
      }
    } catch {
      // sessionStorage unavailable (SSR, private browsing restrictions, quota)
    }

    return null;
  }

  /** Write to both memory and _sessionStorage. */
  set<T>(key: string, data: T, ttlMs: number): void {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl: ttlMs };
    this.memory.set(key, entry);
    try {
      _sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Quota exceeded — memory-only is still useful
    }
  }

  /** Remove a single key from both tiers. */
  invalidate(key: string): void {
    this.memory.delete(key);
    try { _sessionStorage.removeItem(SESSION_PREFIX + key); } catch { /* noop */ }
  }

  /** Remove all keys whose name starts with `prefix`. */
  invalidatePrefix(prefix: string): void {
    for (const key of [...this.memory.keys()]) {
      if (key.startsWith(prefix)) this.memory.delete(key);
    }
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < _sessionStorage.length; i++) {
        const k = _sessionStorage.key(i);
        if (k?.startsWith(SESSION_PREFIX + prefix)) toRemove.push(k);
      }
      toRemove.forEach(k => _sessionStorage.removeItem(k));
    } catch { /* noop */ }
  }

  /** Clear the entire cache (all keys). */
  clear(): void {
    this.memory.clear();
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < _sessionStorage.length; i++) {
        const k = _sessionStorage.key(i);
        if (k?.startsWith(SESSION_PREFIX)) toRemove.push(k);
      }
      toRemove.forEach(k => _sessionStorage.removeItem(k));
    } catch { /* noop */ }
  }

  /**
   * Cache-aside helper: return cached value when fresh, otherwise call
   * `fetcher`, store the result, and return it.
   */
  async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }
}

export const appCache = CacheService.getInstance();

/** Stable cache keys — import these everywhere instead of raw strings. */
export const CACHE_KEYS = {
  PRODUCTS_ALL:        'products:all',
  PRODUCTS_FEATURED:   'products:featured',
  PRODUCTS_HOMEPAGE:   'products:homepage',
  CATEGORIES_ALL:      'categories:all',
  HOMEPAGE_SETTINGS:   'homepage:settings',
  APPEARANCE_SETTINGS: 'appearance:settings',
} as const;

/** TTLs in milliseconds. */
export const CACHE_TTL = {
  PRODUCTS:     5  * 60 * 1000,   // 5 min  — products change occasionally
  CATEGORIES:   10 * 60 * 1000,   // 10 min — category list is stable
  HOMEPAGE:     15 * 60 * 1000,   // 15 min — homepage config rarely changes
  APPEARANCE:   30 * 60 * 1000,   // 30 min — theme/branding almost never changes
} as const;




