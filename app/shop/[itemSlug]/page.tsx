import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import dynamic from 'next/dynamic';

const NormalItemsPage = dynamic(() => import('@/src/page-components/NormalItemsPage'));

interface Props {
  params: Promise<{ itemSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { itemSlug } = await params;
  const supabase = await createClient();

  // Prefer matching by stored slug; if it fails we fall back to a generic title.
  const { data: item } = await supabase
    .from('normal_items')
    .select('title')
    .eq('slug', itemSlug)
    .single();

  const title = item ? `${item.title} | Lurevi` : 'Product | Lurevi';

  return {
    title,
    alternates: {
      canonical: `https://lurevi.in/shop/${itemSlug}`,
      languages: {
        'en-IN': `https://lurevi.in/shop/${itemSlug}`,
        'x-default': `https://lurevi.in/shop/${itemSlug}`,
      },
    },
  };
}

export const revalidate = 3600;

export default async function Page({ params }: Props) {
  const { itemSlug } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from('normal_items')
    .select('id, title, description, price, images')
    .eq('slug', itemSlug)
    .single();

  return (
    <>
      {item && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              '@id': `https://lurevi.in/shop/${itemSlug}/#product`,
              name: item.title,
              description: item.description?.replace(/<[^>]*>/g, '') ?? undefined,
              image: Array.isArray(item.images) ? item.images : item.images ? [item.images] : [],
              brand: { '@type': 'Brand', name: 'Lurevi' },
              offers: {
                '@type': 'Offer',
                url: `https://lurevi.in/shop/${itemSlug}`,
                priceCurrency: 'INR',
                price: item.price,
                availability: 'https://schema.org/InStock',
                seller: { '@id': 'https://lurevi.in/#organization' },
              },
            }),
          }}
        />
      )}
      <NormalItemsPage />
    </>
  );
}

