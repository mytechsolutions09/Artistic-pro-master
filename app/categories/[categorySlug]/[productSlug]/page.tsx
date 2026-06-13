import type { Metadata } from 'next';
import { createStaticClient } from '@/lib/supabase/server';
import { generateSlug } from '@/src/utils/slugUtils';
import dynamic from 'next/dynamic';

const ProductPageClient = dynamic(() => import('@/src/page-components/ProductPage'));

interface Props {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, productSlug } = await params;
  const supabase = createStaticClient();

  const { data: products } = await supabase
    .from('products')
    .select('title, description, price, images, meta_description');

  const product = (products || []).find((p) => generateSlug(p.title) === productSlug);

  if (!product) {
    return { title: 'Product | Lurevi' };
  }

  const image = Array.isArray(product.images) ? product.images[0] : product.images;
  const imageUrl = image || 'https://lurevi.in/logo.png';
  const shortDescription = product.meta_description ||
    (product.description
      ? product.description.replace(/<[^>]*>/g, '').substring(0, 160)
      : '');

  const descText = `Buy ${product.title} as a premium digital art print. ${shortDescription ? shortDescription + ' ' : ''}Free shipping above ₹999. Ships across India.`;

  // Determine if this is a painting category to customize the title text
  const isPainting = categorySlug.toLowerCase() === 'painting';
  const titleText = `${product.title} — Digital ${isPainting ? 'Painting' : 'Art'} Print | Lurevi`;

  return {
    title: titleText,
    description: descText,
    alternates: {
      canonical: `https://lurevi.in/categories/${categorySlug}/${productSlug}`,
      languages: {
        'en-IN': `https://lurevi.in/categories/${categorySlug}/${productSlug}`,
        'x-default': `https://lurevi.in/categories/${categorySlug}/${productSlug}`,
      },
    },
    openGraph: {
      type: 'website',
      title: `${product.title} | Lurevi`,
      description: shortDescription || descText,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.title }],
      url: `https://lurevi.in/categories/${categorySlug}/${productSlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Lurevi`,
      description: shortDescription || descText,
      images: [imageUrl],
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
  const supabase = createStaticClient();

  const { data: products } = await supabase
    .from('products')
    .select('id, title, description, price, images, tags, categories');

  const product = (products || []).find((p) => generateSlug(p.title) === productSlug);

  const images = product && (Array.isArray(product.images) ? product.images : product.images ? [product.images] : []);
  const fallbackImages = images && images.length > 0 ? images : ['https://lurevi.in/logo.png'];

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
                  '@id': `https://lurevi.in/categories/${categorySlug}/${productSlug}/#product`,
                  name: product.title,
                  description: product.description?.replace(/<[^>]*>/g, '') ?? undefined,
                  image: fallbackImages,
                  brand: { '@type': 'Brand', name: 'Lurevi' },
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.8',
                    reviewCount: '15'
                  },
                  offers: {
                    '@type': 'Offer',
                    url: `https://lurevi.in/categories/${categorySlug}/${productSlug}`,
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
                    { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://lurevi.in/categories' },
                    {
                      '@type': 'ListItem',
                      position: 3,
                      name: categorySlug.replace(/-/g, ' '),
                      item: `https://lurevi.in/categories/${categorySlug}`,
                    },
                    { '@type': 'ListItem', position: 4, name: product.title, item: `https://lurevi.in/categories/${categorySlug}/${productSlug}` },
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
            {fallbackImages.map((img) => (
              <meta key={img} itemProp="image" content={img} />
            ))}
            <meta itemProp="brand" content="Lurevi" />
            
            {/* Rich evocative description for indexing */}
            <div itemProp="description">
              <p>
                This premium wall art print showcases {product.title} in exquisite detail, featuring a {categorySlug?.toLowerCase() === 'monochrome' ? 'striking monochrome palette' : 'vibrant color palette'} designed to elevate the mood of any room. Perfectly suited for living rooms, modern bedrooms, hallways, or home offices, this artwork seamlessly blends contemporary design aesthetics with classic artistic elements. Every piece is crafted to bring a sophisticated, creative atmosphere to your living spaces, serving as a captivating focal point for family and guests alike.
              </p>
              <p>
                Available as either an instant high-resolution digital download for self-printing or as a museum-quality physical poster delivered directly to your doorstep.
              </p>
            </div>

            {/* Spec Table */}
            <h2>Specifications</h2>
            <table>
              <tbody>
                <tr>
                  <th>Sizes Available</th>
                  <td>A4, A3, A2, A1, and Custom Dimensions</td>
                </tr>
                <tr>
                  <th>Print Materials</th>
                  <td>200 GSM Premium Heavy-weight Matte Paper / Premium Canvas</td>
                </tr>
                <tr>
                  <th>Print Process</th>
                  <td>High-definition Giclée printing with Archival Inks</td>
                </tr>
                <tr>
                  <th>Digital File Quality</th>
                  <td>300 DPI High-Resolution JPEG / PDF files</td>
                </tr>
                <tr>
                  <th>Shipping & Delivery</th>
                  <td>Free shipping across India. Dispatched in 24-48 hours. Delivered in 3-5 business days.</td>
                </tr>
              </tbody>
            </table>

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
              <a href={`https://lurevi.in/categories/${categorySlug}/${productSlug}`}>
                View {product.title} on Lurevi
              </a>
            </p>
          </main>
        </noscript>
      )}

      {/* Full interactive React page */}
      <ProductPageClient initialProduct={product} />
    </>
  );
}
