import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createStaticClient } from '@/lib/supabase/server';
import NormalItemsPage from '@/src/page-components/NormalItemsPage';

interface Props {
  params: Promise<{ itemSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { itemSlug } = await params;
  const supabase = createStaticClient();

  // Prefer matching by stored slug; if it fails we fall back to a generic title.
  const { data: item } = await supabase
    .from('normal_items')
    .select('title')
    .eq('slug', itemSlug)
    .single();

  const title = item 
    ? `${item.title} — Premium Art Print | Lurevi` 
    : 'Premium Art Print & Luxury Wall Decor | Lurevi';

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

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: items } = await supabase
    .from('normal_items')
    .select('slug')
    .eq('status', 'active');

  return (items || []).filter((item) => item?.slug).map((item) => ({
    itemSlug: String(item.slug),
  }));
}

export const revalidate = 3600;

export default async function Page({ params }: Props) {
  const { itemSlug } = await params;
  const supabase = createStaticClient();

  const { data: item } = await supabase
    .from('normal_items')
    .select('id, title, description, price, images')
    .eq('slug', itemSlug)
    .single();

  if (!item) {
    return notFound();
  }

  const images = item && (Array.isArray(item.images) ? item.images : item.images ? [item.images] : []);
  const fallbackImages = images && images.length > 0 ? images : ['https://lurevi.in/logo.png'];

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
              image: fallbackImages,
              brand: { '@type': 'Brand', name: 'Lurevi' },
              offers: {
                '@type': 'Offer',
                url: `https://lurevi.in/shop/${itemSlug}`,
                priceCurrency: 'INR',
                price: item.price,
                availability: 'https://schema.org/InStock',
                seller: { '@id': 'https://lurevi.in/#organization' },
                hasMerchantReturnPolicy: {
                  '@type': 'MerchantReturnPolicy',
                  applicableCountry: 'IN',
                  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                  merchantReturnDays: 7,
                  returnMethod: 'https://schema.org/ReturnByMail',
                  returnFees: 'https://schema.org/FreeReturn',
                },
                shippingDetails: {
                  '@type': 'OfferShippingDetails',
                  shippingRate: {
                    '@type': 'MonetaryAmount',
                    value: 0,
                    currency: 'INR',
                  },
                  shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'IN',
                  },
                  deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    handlingTime: {
                      '@type': 'QuantitativeValue',
                      minValue: 1,
                      maxValue: 2,
                      unitCode: 'DAY',
                    },
                    transitTime: {
                      '@type': 'QuantitativeValue',
                      minValue: 3,
                      maxValue: 5,
                      unitCode: 'DAY',
                    },
                  },
                },
              },
            }),
          }}
        />
      )}
      <NormalItemsPage />
    </>
  );
}

