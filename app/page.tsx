import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import HomepageClient from '@/src/page-components/Homepage';

export const metadata: Metadata = {
  title: 'Lurevi | Luxury That Stays With You',
  description:
    'Discover curated digital art, wall prints, and premium collections at Lurevi. Shop unique artwork that transforms your space.',
  alternates: { canonical: 'https://lurevi.in/' },
};

// Revalidate every hour so new categories/products appear quickly
export const revalidate = 3600;

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch categories server-side so Google can index them directly in HTML
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(24);

  // Fetch featured products server-side for SEO visibility
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('id, title, slug, description, price, images, categories')
    .eq('status', 'active')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(12);

  const hasSeoSections =
    Boolean(categories && categories.length > 0) ||
    Boolean(featuredProducts && featuredProducts.length > 0);

  return (
    <>
      {/* Crawlable server-rendered homepage content for non-JS and low-JS crawlers */}
      {hasSeoSections && (
        <main className="mx-auto max-w-6xl px-4 py-2">
          {categories && categories.length > 0 && (
            <section className="mt-2">
              <h2 className="text-lg font-medium text-gray-900">Popular Categories</h2>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {categories.slice(0, 10).map((cat) => (
                  <li key={cat.id}>
                    <a href={`/${cat.slug}`} className="hover:underline">
                      {cat.name}
                    </a>
                    {cat.description ? ` - ${cat.description}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {featuredProducts && featuredProducts.length > 0 && (
            <section className="mt-2">
              <h2 className="text-lg font-medium text-gray-900">Featured Artworks</h2>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {featuredProducts.slice(0, 10).map((p) => {
                  const categorySlug = Array.isArray(p.categories) ? p.categories[0] : 'browse';
                  return (
                    <li key={p.id}>
                      <a href={`/${categorySlug}/${p.slug}`} className="hover:underline">
                        {p.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </main>
      )}

      {/* Server-rendered SEO content — visible to Google, hidden to users once JS loads */}
      <noscript>
        <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
          <h1>Lurevi — Luxury That Stays With You</h1>
          <p>Discover curated digital art, wall prints, and premium collections.</p>

          {categories && categories.length > 0 && (
            <section>
              <h2>Shop by Category</h2>
              <ul>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <a href={`/${cat.slug}`}>
                      <strong>{cat.name}</strong>
                      {cat.description && ` — ${cat.description}`}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {featuredProducts && featuredProducts.length > 0 && (
            <section>
              <h2>Featured Artworks</h2>
              <ul>
                {featuredProducts.map((p) => (
                  <li key={p.id}>
                    <a href={`/${Array.isArray(p.categories) ? p.categories[0] : 'browse'}/${p.slug}`}>
                      {p.title} — ₹{p.price}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </noscript>

      {/* Client-side React app — full interactive experience */}
      <HomepageClient />
    </>
  );
}

