import type { Metadata } from 'next';
import { createStaticClient } from '@/lib/supabase/server';
import dynamic from 'next/dynamic';

const ClothingProductPage = dynamic(() => import('@/src/page-components/ClothingProductPage'));

interface Props {
  params: Promise<{ productSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('products')
    .select('title, description')
    .eq('slug', productSlug)
    .single();
  return {
    title: data ? `${data.title} | Lurevi Clothing` : 'Clothing | Lurevi',
    description:
      data?.description?.replace(/<[^>]*>/g, '').substring(0, 200) ??
      'Shop clothing at Lurevi.',
    alternates: {
      canonical: `https://lurevi.in/clothes/${productSlug}`,
      languages: {
        'en-IN': `https://lurevi.in/clothes/${productSlug}`,
        'x-default': `https://lurevi.in/clothes/${productSlug}`,
      },
    },
  };
}

export const revalidate = 3600;

export default async function Page({ params }: Props) {
  const { productSlug } = await params;
  const supabase = createStaticClient();

  const { data: product } = await supabase
    .from('products')
    .select('id, title, description, price, images')
    .eq('slug', productSlug)
    .single();

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
                  '@id': `https://lurevi.in/clothes/${productSlug}/#product`,
                  name: product.title,
                  description: product.description?.replace(/<[^>]*>/g, '') ?? undefined,
                  image: fallbackImages,
                  brand: { '@type': 'Brand', name: 'Lurevi' },
                  offers: {
                    '@type': 'Offer',
                    url: `https://lurevi.in/clothes/${productSlug}`,
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
                    { '@type': 'ListItem', position: 2, name: 'Clothing', item: 'https://lurevi.in/clothes' },
                    {
                      '@type': 'ListItem',
                      position: 3,
                      name: product.title,
                      item: `https://lurevi.in/clothes/${productSlug}`,
                    },
                  ],
                },
              ],
            }),
          }}
        />
      )}
      <ClothingProductPage />
    </>
  );
}
