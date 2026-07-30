import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '@/src/utils/slugUtils';

const SITE_URL = 'https://lurevi.in';

const STATIC_ROUTES = [
  { path: '/', changeFrequency: 'daily' as const, priority: 1.0 },
  { path: '/browse', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/categories', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/shop', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/clothes', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/contact-us', changeFrequency: 'yearly' as const, priority: 0.4 },
  { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/shipping-info', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/returns-and-refunds', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/terms-and-conditions', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/about-us', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/collections', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/collections/luxury-wall-art', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/gifts', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/help-center', changeFrequency: 'monthly' as const, priority: 0.5 },
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
      console.warn('⚠️ [Sitemap] Supabase URL or Anon Key missing in environment during build! Sitemap will only contain static routes.');
      return entries;
    }

    const [{ data: categories }, { data: products }, { data: blogPosts }] = await Promise.all([
      supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('status', 'active'),
      supabase
        .from('products')
        .select('title, categories, updated_at, gender')
        .eq('status', 'active'),
      supabase
        .from('blog_posts')
        .select('slug, updated_at, published_at')
        .eq('status', 'published'),
    ]);

    for (const category of categories ?? []) {
      if (!category?.slug) continue;
      const safeCategorySlug = encodeURIComponent(String(category.slug));
      
      // Traditional category listing
      entries.push({
        url: `${SITE_URL}/categories/${safeCategorySlug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.9,
      });

      // Collections category page
      entries.push({
        url: `${SITE_URL}/collections/${safeCategorySlug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    for (const product of products ?? []) {
      if (!product?.title) continue;

      const safeProductSlug = encodeURIComponent(generateSlug(product.title));
      
      // Determine if this is a clothing product
      const isClothing = 
        (product.gender === 'Men' || product.gender === 'Women' || product.gender === 'Unisex') ||
        (Array.isArray(product.categories) && product.categories.some(cat => {
          const lowerCat = String(cat).toLowerCase();
          return lowerCat.includes('men') || 
                 lowerCat.includes('women') || 
                 lowerCat.includes('unisex') ||
                 lowerCat.includes('clothing');
        }));

      // Determine if this is an F&B product
      const categoriesList = Array.isArray(product.categories) ? product.categories : [];
      const categoriesLower = categoriesList.map(c => String(c).toLowerCase()).join(' ');
      const isFB = categoriesLower.includes('food & beverage') || 
                   categoriesLower.includes('f&b') || 
                   categoriesLower.includes('food-beverage') ||
                   categoriesLower.includes('dry fruit') || 
                   categoriesLower.includes('dried fruit') || 
                   categoriesLower.includes('spice');

      let productPath = '';
      if (isClothing) {
        productPath = `/clothes/${safeProductSlug}`;
      } else if (isFB) {
        productPath = `/${safeProductSlug}`;
      } else {
        const categorySlug = categoriesList[0];
        if (categorySlug) {
          const safeCategorySlug = encodeURIComponent(generateSlug(String(categorySlug)));
          productPath = `/categories/${safeCategorySlug}/${safeProductSlug}`;
        } else {
          productPath = `/categories/general/${safeProductSlug}`;
        }
      }

      entries.push({
        url: `${SITE_URL}${productPath}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    for (const post of blogPosts ?? []) {
      if (!post?.slug) continue;
      const safeSlug = encodeURIComponent(String(post.slug));
      entries.push({
        url: `${SITE_URL}/blog/${safeSlug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : post.published_at ? new Date(post.published_at) : now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }

    console.log(`✅ [Sitemap] Generated ${entries.length} URLs for sitemap.xml (${categories?.length || 0} categories, ${products?.length || 0} products, ${blogPosts?.length || 0} blog posts).`);
  } catch (err: any) {
    console.error('❌ [Sitemap] Error querying database for sitemap:', err?.message || err);
  }

  return entries;
}
