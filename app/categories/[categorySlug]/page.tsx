import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createStaticClient } from '@/lib/supabase/server';
import NormalItemRouteHandlerClient from '@/src/page-components/NormalItemRouteHandler';

interface Props {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const supabase = createStaticClient();

  const { data: category } = await supabase
    .from('categories')
    .select('name, description, image_url')
    .eq('slug', categorySlug)
    .single();

  if (!category) {
    return { title: 'Lurevi' };
  }

  // Fetch count of active products in this category
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .contains('categories', [categorySlug])
    .eq('status', 'active');

  const catName = category.name;
  const capitalizedName = catName.charAt(0).toUpperCase() + catName.slice(1);
  const titleText = `${capitalizedName} Digital Art Prints — Buy Online India | Lurevi`;
  const countPrefix = count ? `${count} ` : '';
  const descText = `Shop ${countPrefix}curated ${catName.toLowerCase()} digital art prints. Premium wall art for modern Indian homes. Free shipping across India.`;

  return {
    title: titleText,
    description: descText,
    alternates: {
      canonical: `https://lurevi.in/categories/${categorySlug}`,
      languages: {
        'en-IN': `https://lurevi.in/categories/${categorySlug}`,
        'x-default': `https://lurevi.in/categories/${categorySlug}`,
      },
    },
    openGraph: {
      title: titleText,
      description: descText,
      images: category.image_url ? [{ url: category.image_url }] : [{ url: '/logo.png' }],
    },
  };
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('slug');

  return (categories || []).map((category) => ({
    categorySlug: category.slug,
  }));
}
export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const supabase = createStaticClient();

  // Fetch category and its products for server-side SEO HTML
  const [{ data: category }, { data: products }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, description, image_url')
      .eq('slug', categorySlug)
      .single(),
    supabase
      .from('products')
      .select('id, title, slug, description, price, images')
      .contains('categories', [categorySlug])
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(24),
  ]);

  return (
    <>
      {category && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'CollectionPage',
                  '@id': `https://lurevi.in/categories/${categorySlug}/#webpage`,
                  url: `https://lurevi.in/categories/${categorySlug}`,
                  name: `${category.name} — Luxury Collection`,
                  description: category.description ?? undefined,
                  inLanguage: 'en-IN',
                  isPartOf: { '@id': 'https://lurevi.in/#website' },
                },
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lurevi.in' },
                    { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://lurevi.in/categories' },
                    { '@type': 'ListItem', position: 3, name: category.name, item: `https://lurevi.in/categories/${categorySlug}` },
                  ],
                },
              ],
            }),
          }}
        />
      )}
      {/* Server-rendered content for Google */}
      {category && (
        <noscript>
          <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
            <h1>{category.name}</h1>
            {category.description && <p>{category.description}</p>}

            {products && products.length > 0 && (
              <section>
                <h2>{category.name} Artworks</h2>
                <ul>
                  {products.map((p) => (
                    <li key={p.id}>
                      <a href={`/categories/${categorySlug}/${p.slug}`}>
                        {p.title} — ₹{p.price}
                        {p.description && ` — ${p.description.substring(0, 120)}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </main>
        </noscript>
      )}

      {/* Full interactive React page */}
      <NormalItemRouteHandlerClient isCategoryPage={true} />
    </>
  );
}
