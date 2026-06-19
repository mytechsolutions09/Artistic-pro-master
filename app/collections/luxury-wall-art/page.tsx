import type { Metadata } from 'next';
import { createStaticClient } from '@/lib/supabase/server';
import { generateSlug } from '@/src/utils/slugUtils';
import { Link } from '@/src/compat/router';
import LuxuryWallArtClient from './LuxuryWallArtClient';

export const metadata: Metadata = {
  title: 'Luxury Wall Art Prints — Premium Curated Decor India | Lurevi',
  description:
    'Shop premium luxury wall art prints online in India. Curated fine art, contemporary abstract paintings, and canvas prints designed to elevate your living room, bedroom, and office. Free shipping above ₹999.',
  alternates: {
    canonical: 'https://lurevi.in/collections/luxury-wall-art',
    languages: {
      'en-IN': 'https://lurevi.in/collections/luxury-wall-art',
      'x-default': 'https://lurevi.in/collections/luxury-wall-art',
    },
  },
  openGraph: {
    title: 'Luxury Wall Art Prints — Premium Curated Decor India | Lurevi',
    description:
      'Shop premium luxury wall art prints online in India. Curated fine art, contemporary abstract paintings, and canvas prints designed to elevate your living room, bedroom, and office. Free shipping above ₹999.',
    url: 'https://lurevi.in/collections/luxury-wall-art',
    images: [{ url: 'https://lurevi.in/logo.png', width: 1200, height: 630, alt: 'Lurevi Luxury Curation' }],
  },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = createStaticClient();

  // Fetch active products and filter by category in memory
  let products = [];
  let debugInfo = {};
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, price, images, rating, featured, status, categories, tags, product_type, original_price, discount_percentage')
      .eq('status', 'active');
    
    // Map snake_case database columns to camelCase client properties
    const allProducts = (data || []).map(p => ({
      ...p,
      originalPrice: p.original_price,
      discountPercentage: p.discount_percentage
    }));
    
    // Filter for 'Luxury Wall Art' category in memory
    products = allProducts.filter(p => {
      const categories = (p.categories || []).map((c: string) => c.toLowerCase());
      return categories.includes('luxury wall art') || categories.includes('luxury-wall-art');
    });

    // Fallback to highest rated active products if none in the category
    let isFallbackUsed = false;
    if (products.length === 0) {
      isFallbackUsed = true;
      products = [...allProducts]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 16);
    }

    // Prepare debug info
    debugInfo = {
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'undefined',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      totalActiveProducts: allProducts.length,
      luxuryFilteredCount: products.length,
      isFallbackUsed,
      dbError: error || null
    };
  } catch (err) {
    debugInfo = {
      timestamp: new Date().toISOString(),
      exception: err.message || err.toString()
    };
    console.error('Luxury Page: Caught error in product fetch/filter:', err);
  }

  // Filter out clothing products to display only art
  const displayProducts = products.filter(product => {
    const isClothing = 
      product.product_type === 'clothing' || 
      (product.categories && product.categories.some((cat: string) => 
        cat.toLowerCase().includes('men') || 
        cat.toLowerCase().includes('women') || 
        cat.toLowerCase().includes('unisex') ||
        cat.toLowerCase().includes('clothing')
      ));
    return !isClothing;
  });



  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://lurevi.in/collections/luxury-wall-art/#webpage',
        url: 'https://lurevi.in/collections/luxury-wall-art',
        name: 'Luxury Wall Art Prints — Premium Curated Decor India | Lurevi',
        description: 'Shop premium luxury wall art prints online in India. Curated fine art, contemporary abstract paintings, and canvas prints designed to elevate your living room, bedroom, and office.',
        inLanguage: 'en-IN',
        isPartOf: { '@id': 'https://lurevi.in/#website' },
      },
      {
        '@type': 'ItemList',
        '@id': 'https://lurevi.in/collections/luxury-wall-art/#itemlist',
        name: 'Curated Luxury Wall Art Prints',
        numberOfItems: displayProducts.length,
        itemListElement: displayProducts.slice(0, 8).map((p, idx) => {
          const firstImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : 'https://lurevi.in/logo.png';
          const catSlug = Array.isArray(p.categories) && p.categories.length > 0 ? generateSlug(p.categories[0]) : 'luxury-wall-art';
          const productSlug = p.slug || generateSlug(p.title);
          
          return {
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'Product',
              name: p.title,
              image: [firstImage],
              url: `https://lurevi.in/categories/${catSlug}/${productSlug}`,
              offers: {
                '@type': 'Offer',
                price: p.price,
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
              },
            },
          };
        }),
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://lurevi.in/collections/luxury-wall-art/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What defines luxury wall art at Lurevi?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Luxury wall art at Lurevi represents museum-quality fine art prints created by professional digital and traditional artists. They are printed on thick 240+ GSM archival-grade matte paper or heavy 350 GSM cotton canvas using lightfast pigment inks that maintain color depth for over 75 years.',
            },
          },
          {
            '@type': 'Question',
            name: 'What sizes are recommended for luxury living rooms?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'For statement feature walls in living rooms or reception lobbies, we highly recommend A1 (59.4 × 84.1 cm) or larger custom size formats. These dimensions command attention and perfectly anchor the visual theme of the room.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do these prints come framed?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We ship premium prints rolled in protective tubes to guarantee damage-free transit. They are sized to standard formats, allowing easy custom framing at local framing galleries to perfectly match your furniture and interior trim.',
            },
          },
          {
            '@type': 'Question',
            name: 'How long does delivery take across India?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'All luxury orders are printed and dispatched within 24-48 hours. Express shipping delivers to metro areas like Delhi, Mumbai, Bengaluru, and Chennai in 3-5 business days. Free shipping is provided for all orders above ₹999.',
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />
      {/* Crawlable server-rendered text content for search engine indexers */}
      <noscript>
        <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
          <h1>Luxury Wall Art Prints — Curated Premium Decor India</h1>
          <p>
            Welcome to the Lurevi Luxury Collection. Our premium selection features high-end digital paintings, contemporary abstract art, and museum-quality photography prints designed specifically to elevate upscale residential and commercial spaces. Every piece is curated from professional creators globally, ensuring your walls display artwork that is sophisticated and distinct.
          </p>

          <section style={{ marginTop: '2rem' }}>
            <h2>Museum-Grade Canvas & Archival Prints</h2>
            <p>
              We believe luxury lies in the fine details. That is why Lurevi prints exclusively on high-weight 240+ GSM archival matte paper and premium 350 GSM canvas. By leveraging advanced pigment ink formulations, our prints resist fading for up to 75+ years under standard lighting conditions, preserving the deep blacks and rich golden gradients exactly as the artist intended.
            </p>
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h2>Shop the Luxury Wall Art Collection</h2>
            <ul>
              {displayProducts.map((p) => (
                <li key={p.id}>
                  <a href={`/categories/${Array.isArray(p.categories) && p.categories.length > 0 ? generateSlug(p.categories[0]) : 'luxury-wall-art'}/${p.slug || generateSlug(p.title)}`}>
                    {p.title} — ₹{p.price}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </noscript>

      {/* Full interactive React page with custom luxury styling */}
      <LuxuryWallArtClient initialProducts={displayProducts} />
    </>
  );
}
