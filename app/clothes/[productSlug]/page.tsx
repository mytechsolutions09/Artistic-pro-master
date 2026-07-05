import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createStaticClient } from '@/lib/supabase/server';
import { generateSlug } from '@/src/utils/slugUtils';
import ClothingProductPage from '@/src/page-components/ClothingProductPage';

interface Props {
  params: Promise<{ productSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const supabase = createStaticClient();
  const { data: products } = await supabase
    .from('products')
    .select('title, description')
    .eq('status', 'active');

  const data = (products || []).find((p) => generateSlug(p.title) === productSlug);

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

export async function generateStaticParams() {
  try {
    const supabase = createStaticClient();
    const { data: products, error } = await supabase
      .from('products')
      .select('title, categories')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching products in generateStaticParams for clothes:', error);
      return [{ productSlug: 'fallback-product' }];
    }

    const clothingCategories = ['unisex', 'men', 'women', 'mens', 'womens', 'clothing', 'tshirt', 't-shirt', 'shirt', 'sweatshirt', 'hoodie'];

    const filtered = (products || [])
      .filter(p => {
        if (!p.title) return false;
        const categories = (p.categories || []).map((c: string) => c.toLowerCase());
        return categories.some(cat => 
          clothingCategories.some(cc => cat.includes(cc))
        );
      })
      .map(p => ({
        productSlug: generateSlug(p.title),
      }));

    console.log(`[Clothes generateStaticParams] Generated ${filtered.length} params`);
    
    if (filtered.length === 0) {
      return [{ productSlug: 'fallback-product' }];
    }
    return filtered;
  } catch (err) {
    console.error('Exception in generateStaticParams for clothes:', err);
    return [{ productSlug: 'fallback-product' }];
  }
}

export const revalidate = 3600;

export default async function Page({ params }: Props) {
  const { productSlug } = await params;
  const supabase = createStaticClient();

  const { data: products } = await supabase
    .from('products')
    .select('id, title, description, price, images, status')
    .eq('status', 'active');

  const product = (products || []).find((p) => generateSlug(p.title) === productSlug);

  if (!product) {
    return notFound();
  }

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
