import type { Metadata } from 'next';
import { createStaticClient } from '@/lib/supabase/server';
import { generateSlug } from '@/src/utils/slugUtils';
import DigitalArtPageClient from './DigitalArtPageClient';

export const metadata: Metadata = {
  title: 'Digital Art Prints — Buy Online India | Lurevi',
  description:
    'Shop curated digital art prints in India. Contemporary illustrations, paintings and wall art — printed on archival paper, shipped across India. From ₹320.',
  alternates: {
    canonical: 'https://lurevi.in/categories/digital-art',
    languages: {
      'en-IN': 'https://lurevi.in/categories/digital-art',
      'x-default': 'https://lurevi.in/categories/digital-art',
    },
  },
  openGraph: {
    title: 'Digital Art Prints — Buy Online India | Lurevi',
    description:
      'Shop curated digital art prints in India. Contemporary illustrations, paintings and wall art — printed on archival paper, shipped across India. From ₹320.',
    url: 'https://lurevi.in/categories/digital-art',
    images: [{ url: 'https://lurevi.in/logo.png', width: 1200, height: 630, alt: 'Lurevi' }],
  },
};

export const revalidate = 3600;

export default async function Page() {
  const supabase = createStaticClient();

  // Fetch active digital products from the products catalog
  let products = [];
  try {
    const { data } = await supabase
      .from('products')
      .select('id, title, description, price, images, rating, featured, created_date, status, categories, tags, product_type')
      .eq('status', 'active')
      .eq('product_type', 'digital');
    
    products = data || [];
  } catch (err) {
    console.error('Error fetching digital products for collection:', err);
  }

  // Pick 5 random products
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const selectedProducts = shuffled.slice(0, 5);

  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://lurevi.in/categories/digital-art/#webpage',
        url: 'https://lurevi.in/categories/digital-art',
        name: 'Digital Art Prints — Buy Online India | Lurevi',
        description: 'Shop curated digital art prints in India. Contemporary illustrations, paintings and wall art — printed on archival paper, shipped across India. From ₹320.',
        inLanguage: 'en-IN',
        isPartOf: { '@id': 'https://lurevi.in/#website' },
      },
      {
        '@type': 'ItemList',
        '@id': 'https://lurevi.in/categories/digital-art/#itemlist',
        name: 'Top Digital Art Prints',
        numberOfItems: selectedProducts.length,
        itemListElement: selectedProducts.map((p, idx) => {
          const firstImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : 'https://lurevi.in/logo.png';
          const categorySlug = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0].toLowerCase() : 'digital-art';
          const productSlug = p.slug || generateSlug(p.title);
          
          return {
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'Product',
              name: p.title,
              image: [firstImage],
              url: `https://lurevi.in/categories/${categorySlug}/${productSlug}`,
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
        '@id': 'https://lurevi.in/categories/digital-art/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is digital art?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Digital art is artwork created using digital technology, such as computers, tablets, and stylus pens, instead of traditional physical media like oil paints or watercolor.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is a digital art print made?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'At Lurevi, digital art prints are created by taking the high-resolution digital-native file and printing it using premium pigment-based inks on museum-grade archival matte paper (200 GSM) or premium canvas (350 GSM).',
            },
          },
          {
            '@type': 'Question',
            name: 'Is digital art as good as original paintings for home decor?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Digital art prints offer exceptional clarity, crisp lines, and uniform color accuracy. Because they are designed natively on screens, they translate to print with incredible fidelity, making them perfect for modern, clean decor.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I get digital art prints framed in India?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Lurevi ships all prints in standard dimensions (like A4, A3, A2, A1), making it very easy to find pre-made frames at local shops or online. You can also take them to any local framing shop in India.',
            },
          },
          {
            '@type': 'Question',
            name: 'What digital art styles work best in Indian homes?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Indian home decors range from traditional to modern minimalist. Abstract prints and geometric landscape illustrations work beautifully in contemporary apartments, while colorful portraits and map prints add a personalized touch to family living rooms.',
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
        <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
          <h1>Digital art prints — curated wall art for modern Indian homes</h1>
          <p>
            Digital art is a contemporary art form created entirely on a digital medium, born directly on a digital screen rather than on a traditional canvas. If you want to learn more about this medium, you can read our article on <a href="https://lurevi.in/blog/what-is-digital-art">what is digital art</a>. At Lurevi, we curate only digital-native work. This means every single piece was designed digitally from the very start, rather than being scanned from a physical original, ensuring that the visual lines remain clean and crisp. Our museum-quality <a href="https://lurevi.in/categories/digital-art-prints">digital art prints</a> are produced using archival materials, promising stunning clarity and long-lasting vibrance. Explore our curated selection below to find the perfect addition to your space.
          </p>

          <section style={{ marginTop: '2rem' }}>
            <h2>What makes Lurevi's digital art different</h2>
            <p>
              When decoration demands excellence, Lurevi offers a distinctive approach. First, our <strong>curated selection</strong> process is rigorous — not every submission is accepted, ensuring only standard, premium-tier artwork enters our collection. Second, we focus exclusively on <strong>digital-native only</strong> creations. Unlike digital art galleries in India that display scanned physical originals, this guarantees sharper prints, highly accurate colour translation, and a complete absence of scan artefacts or muddy textures. If you are exploring <a href="https://lurevi.in/blog/digital-art-galleries-india">digital art galleries in India</a>, you will find Lurevi's approach to be unique. Finally, all physical orders are <strong>printed in India</strong> on archival 200 GSM paper or heavy canvas using advanced pigment inks, and then shipped domestically. This domestic printing pipeline ensures fast, secure shipping across India, delivering museum-grade wall art prints right to your doorstep.
            </p>
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h2>Browse by style</h2>
            <p>
              Finding the perfect match for your home is simple when you browse by style. Whether you are looking for bold abstract pieces, modern <a href="https://lurevi.in/blog/digital-illustration-guide">digital illustration</a> designs, striking portrait art, scenic landscape layouts, or geometric world cities representations, Lurevi offers specialized sub-collections for each category. Exploring these styles allows you to construct a cohesive theme across your home or office walls, making it easy to create beautiful, unified spaces that tell a story. By filtering our categories, you can easily discover pieces that match your home's color scheme and architectural lines.
            </p>
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h2>How to choose digital art for your home</h2>
            <p>
              Selecting the right piece for your decor is a rewarding creative process. Here are three practical tips to guide you. First, try to <strong>match the colour</strong> of your artwork to at least one existing element in the room, such as your cushions, rug, or an accent wall, to create a harmonized palette. Second, <strong>go larger than you think</strong> — small frames can look lost on expansive walls; ideally, your art should occupy about 60–75% of the available wall width to command the space. Finally, <strong>choose print over download</strong> if you want it framed immediately; Lurevi prints are sent print-ready on professional archival paper. This makes Lurevi a premier choice for finding <a href="https://lurevi.in/blog/affordable-wall-art-high-end-look-india">affordable wall art India</a> that delivers a high-end luxury look without breaking the budget. By taking these factors into account, you can confidently choose pieces that elevate your home's aesthetic appeal.
            </p>
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h2>Print specifications</h2>
            <table border={1} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '8px' }}>Spec</th>
                  <th style={{ padding: '8px' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Paper</td>
                  <td style={{ padding: '8px' }}>200 GSM archival matte</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Canvas</td>
                  <td style={{ padding: '8px' }}>350 GSM premium canvas</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Ink</td>
                  <td style={{ padding: '8px' }}>Pigment inks, 75+ year lightfastness</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Resolution</td>
                  <td style={{ padding: '8px' }}>300 DPI</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Sizes</td>
                  <td style={{ padding: '8px' }}>A4, A3, A2, A1, custom</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Shipping</td>
                  <td style={{ padding: '8px' }}>Free above ₹999 · 3–5 days across India</td>
                </tr>
              </tbody>
            </table>
          </section>

          {selectedProducts.length > 0 && (
            <section style={{ marginTop: '2rem' }}>
              <h2>Shop Digital Art Collection</h2>
              <ul>
                {selectedProducts.map((p) => (
                  <li key={p.id}>
                    <a href={`/categories/${Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0].toLowerCase() : 'digital-art'}/${p.slug || generateSlug(p.title)}`}>
                      {p.title} — ₹{p.price}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </noscript>

      <DigitalArtPageClient initialProducts={selectedProducts} />
    </>
  );
}
