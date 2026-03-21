import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductPageClient from '@/src/page-components/ProductPage';

interface Props {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, productSlug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('title, description, price, images, meta_description')
    .eq('slug', productSlug)
    .single();

  if (!product) {
    return { title: 'Product | Lurevi' };
  }

  const image = Array.isArray(product.images) ? product.images[0] : product.images;
  const description =
    product.meta_description ||
    (product.description
      ? product.description.replace(/<[^>]*>/g, '').substring(0, 200)
      : `Buy ${product.title} at Lurevi. Premium art prints and digital artwork.`);

  return {
    title: `${product.title} | Lurevi`,
    description,
    alternates: {
      canonical: `https://lurevi.in/${categorySlug}/${productSlug}`,
      languages: {
        'en-IN': `https://lurevi.in/${categorySlug}/${productSlug}`,
        'x-default': `https://lurevi.in/${categorySlug}/${productSlug}`,
      },
    },
    openGraph: {
      type: 'og:product' as 'website',
      title: `${product.title} | Lurevi`,
      description,
      images: image ? [{ url: image, alt: product.title }] : [{ url: '/logo.png' }],
      url: `https://lurevi.in/${categorySlug}/${productSlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Lurevi`,
      description,
      images: image ? [image] : ['/logo.png'],
    },
    other: {
      'product:price:amount': String(product.price ?? ''),
      'product:price:currency': 'INR',
    },
  };
}

export const revalidate = 3600;

export default async function ProductPage({ params }: Props) {
  const { categorySlug, productSlug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('id, title, slug, description, price, images, tags, categories')
    .eq('slug', productSlug)
    .single();

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Product',
                  '@id': `https://lurevi.in/${categorySlug}/${productSlug}/#product`,
                  name: product.title,
                  description: product.description?.replace(/<[^>]*>/g, '') ?? undefined,
                  image: Array.isArray(product.images) ? product.images : product.images ? [product.images] : [],
                  brand: { '@type': 'Brand', name: 'Lurevi' },
                  offers: {
                    '@type': 'Offer',
                    url: `https://lurevi.in/${categorySlug}/${productSlug}`,
                    priceCurrency: 'INR',
                    price: product.price,
                    availability: 'https://schema.org/InStock',
                    seller: { '@id': 'https://lurevi.in/#organization' },
                  },
                },
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lurevi.in' },
                    {
                      '@type': 'ListItem',
                      position: 2,
                      name: categorySlug.replace(/-/g, ' '),
                      item: `https://lurevi.in/${categorySlug}`,
                    },
                    { '@type': 'ListItem', position: 3, name: product.title, item: `https://lurevi.in/${categorySlug}/${productSlug}` },
                  ],
                },
              ],
            }),
          }}
        />
      )}
      {/* Server-rendered product content for Google */}
      {product && (
        <noscript>
          <main
            style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem', fontFamily: 'Inter, sans-serif' }}
            itemScope
            itemType="https://schema.org/Product"
          >
            <h1 itemProp="name">{product.title}</h1>
            {product.description && (
              <div
                itemProp="description"
                dangerouslySetInnerHTML={{
                  __html: product.description.replace(/<[^>]*>/g, '').substring(0, 500),
                }}
              />
            )}
            {product.price && (
              <p>
                <span itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  Price:{' '}
                  <span itemProp="price" content={String(product.price)}>
                    ₹{product.price}
                  </span>
                  <meta itemProp="priceCurrency" content="INR" />
                  <meta itemProp="availability" content="https://schema.org/InStock" />
                </span>
              </p>
            )}
            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <p>Tags: {product.tags.join(', ')}</p>
            )}
            <p>
              <a href={`https://lurevi.in/${categorySlug}/${productSlug}`}>
                View {product.title} on Lurevi
              </a>
            </p>
          </main>
        </noscript>
      )}

      {/* Full interactive React page */}
      <ProductPageClient />
    </>
  );
}
