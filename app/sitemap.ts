import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://lurevi.in';

const STATIC_ROUTES = [
  { path: '/', changeFrequency: 'daily' as const, priority: 1 },
  { path: '/browse', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/categories', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/shop', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/clothes', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/contact-us', changeFrequency: 'yearly' as const, priority: 0.4 },
  { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/shipping-info', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/returns-and-refunds', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/terms-and-conditions', changeFrequency: 'yearly' as const, priority: 0.3 },
] as const;

function getPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) {
      return entries;
    }

    const [{ data: categories }, { data: products }] = await Promise.all([
      supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('is_active', true),
      supabase
        .from('products')
        .select('slug, categories, updated_at')
        .eq('status', 'active'),
    ]);

    for (const category of categories ?? []) {
      if (!category?.slug) continue;
      const safeCategorySlug = encodeURIComponent(String(category.slug));
      entries.push({
        url: `${SITE_URL}/${safeCategorySlug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }

    for (const product of products ?? []) {
      if (!product?.slug || !Array.isArray(product.categories) || product.categories.length === 0) {
        continue;
      }

      const categorySlug = product.categories[0];
      if (!categorySlug) continue;
      const safeCategorySlug = encodeURIComponent(String(categorySlug));
      const safeProductSlug = encodeURIComponent(String(product.slug));

      entries.push({
        url: `${SITE_URL}/${safeCategorySlug}/${safeProductSlug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch {
    // If DB is unavailable during generation, keep static routes in sitemap.
  }

  return entries;
}
