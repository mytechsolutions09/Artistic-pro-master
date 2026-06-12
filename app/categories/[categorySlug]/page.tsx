import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createStaticClient } from '@/lib/supabase/server';
import NormalItemRouteHandlerClient from '@/src/page-components/NormalItemRouteHandler';
import { getCategoryExplainer } from '@/src/config/categoryExplainers';
import { generateSlug } from '@/src/utils/slugUtils';

interface Props {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const supabase = createStaticClient();

  let category = null;
  try {
    const { data } = await supabase
      .from('categories')
      .select('name, description, image_url')
      .eq('slug', categorySlug)
      .single();
    category = data;
  } catch (err) {
    console.error('Error fetching category for metadata:', err);
  }

  // Fallback if fetch fails
  const name = category?.name ?? categorySlug.replace(/-/g, ' ');
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  // Fetch count of active products in this category
  let count = null;
  if (category) {
    try {
      const { count: fetchedCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .contains('categories', [categorySlug])
        .eq('status', 'active');
      count = fetchedCount;
    } catch (err) {
      console.error('Error fetching count for metadata:', err);
    }
  }

  const titleText = `${formattedName} Digital Art Prints — Buy Online India | Lurevi`;
  const countPrefix = count ? `${count} ` : '';
  const descText = category?.description ?? 
    `Browse ${countPrefix}curated ${formattedName.toLowerCase()} digital art prints at Lurevi. Curated collection, premium quality, ships across India.`;

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
      url: `https://lurevi.in/categories/${categorySlug}`,
      images: category?.image_url ? [{ url: category.image_url }] : [{ url: '/logo.png' }],
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
  let category = null;
  let products = null;
  try {
    const [{ data: catData }, { data: prodData }] = await Promise.all([
      supabase
        .from('categories')
        .select('id, name, slug, description, image_url')
        .eq('slug', categorySlug)
        .single(),
      supabase
        .from('products')
        .select('id, title, description, price, images, rating, featured, created_date, status, categories, tags')
        .contains('categories', [categorySlug])
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(24),
    ]);
    category = catData;
    products = prodData;
  } catch (err) {
    console.error('Error fetching category/products for CategoryPage:', err);
  }

  const finalCategory = category || {
    id: categorySlug,
    name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' '),
    slug: categorySlug,
    description: `Browse ${categorySlug.replace(/-/g, ' ')} digital art prints.`
  };

  return (
    <>
      {finalCategory && (
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
                  name: `${finalCategory.name} — Luxury Collection`,
                  description: finalCategory.description ?? undefined,
                  inLanguage: 'en-IN',
                  isPartOf: { '@id': 'https://lurevi.in/#website' },
                },
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lurevi.in' },
                    { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://lurevi.in/categories' },
                    { '@type': 'ListItem', position: 3, name: finalCategory.name, item: `https://lurevi.in/categories/${categorySlug}` },
                  ],
                },
              ],
            }),
          }}
        />
      )}
      {/* Server-rendered content for Google */}
      {finalCategory && (
        <noscript>
          <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
            <h1>{finalCategory.name}</h1>
            {finalCategory.description && <p>{finalCategory.description}</p>}

            {products && products.length > 0 && (
              <section>
                <h2>{finalCategory.name} Artworks</h2>
                <ul>
                  {products.map((p) => (
                    <li key={p.id}>
                      <a href={`/categories/${categorySlug}/${p.slug || generateSlug(p.title)}`}>
                        {p.title} — ₹{p.price}
                        {p.description && ` — ${p.description.substring(0, 120)}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(() => {
              const explainer = categorySlug ? getCategoryExplainer(categorySlug) : null;
              if (!explainer) return null;
              return (
                <section style={{ marginTop: '2rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#fafafa', borderRadius: '0.5rem', border: '1px solid #eaeaea' }}>
                  <h2>{explainer.title}</h2>
                  <p>{explainer.description}</p>
                  <h3>{explainer.benefitsTitle}</h3>
                  <ul>
                    {explainer.benefits.map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </section>
              );
            })()}
          </main>
        </noscript>
      )}

      {/* Full interactive React page */}
      <NormalItemRouteHandlerClient 
        isCategoryPage={true} 
        initialCategory={finalCategory}
        initialProducts={products || []}
      />
    </>
  );
}
