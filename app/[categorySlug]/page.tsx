import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NormalItemRouteHandlerClient from '@/src/page-components/NormalItemRouteHandler';

interface Props {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from('categories')
    .select('name, description, image_url')
    .eq('slug', categorySlug)
    .single();

  if (!category) {
    return { title: 'Lurevi' };
  }

  return {
    title: `${category.name} — Shop on Lurevi`,
    description:
      category.description ||
      `Browse ${category.name} artworks and prints at Lurevi. Unique curated pieces for your space.`,
    alternates: { canonical: `https://lurevi.in/${categorySlug}` },
    openGraph: {
      title: `${category.name} | Lurevi`,
      description:
        category.description ||
        `Explore our ${category.name} collection at Lurevi.`,
      images: category.image_url ? [{ url: category.image_url }] : [{ url: '/logo.png' }],
    },
  };
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const supabase = await createClient();

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
                      <a href={`/${categorySlug}/${p.slug}`}>
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
      <NormalItemRouteHandlerClient />
    </>
  );
}
