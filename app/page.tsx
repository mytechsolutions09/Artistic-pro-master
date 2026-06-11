import type { Metadata } from 'next';
import { createStaticClient } from '@/lib/supabase/server';
import dynamic from 'next/dynamic';

const HomepageClient = dynamic(() => import('@/src/page-components/Homepage'));

export const metadata: Metadata = {
  title: 'Lurevi | Luxury That Stays With You',
  description:
    'Discover curated digital art, wall prints, and premium collections at Lurevi. Shop unique artwork that transforms your space.',
  alternates: { canonical: 'https://lurevi.in/' },
};

// Revalidate every hour so new categories/products appear quickly
export const revalidate = 3600;

export default async function HomePage() {
  const supabase = createStaticClient();

  // Fetch categories server-side so Google can index them directly in HTML
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url')
    .order('sort_order', { ascending: true })
    .limit(24);

  // Fetch featured products server-side for SEO visibility
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('id, title, slug, description, price, images, categories')
    .eq('status', 'active')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(12);

  const hasSeoSections =
    Boolean(categories && categories.length > 0) ||
    Boolean(featuredProducts && featuredProducts.length > 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://lurevi.in/#organization',
                name: 'Lurevi',
                url: 'https://lurevi.in/',
                logo: 'https://lurevi.in/logo.png',
                description: 'Luxury digital art, wall prints, and premium collections.',
              },
              {
                '@type': 'WebSite',
                '@id': 'https://lurevi.in/#website',
                url: 'https://lurevi.in/',
                name: 'Lurevi',
                publisher: {
                  '@id': 'https://lurevi.in/#organization'
                }
              },
              {
                '@type': 'FAQPage',
                '@id': 'https://lurevi.in/#faq',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'How do I receive my digital files after purchase?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Immediately upon checkout, you will receive an email with direct download links for your files. Alternatively, you can log into your Lurevi profile dashboard and access them from the \'Downloads\' tab at any time.'
                    }
                  },
                  {
                    '@type': 'Question',
                    name: 'What dimensions are Lurevi\'s digital prints suitable for?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Our files are exported as ultra-high-resolution 300 DPI files in standard print ratios (e.g. ISO A1-A4, 2:3 ratio, 3:4 ratio, 4:5 ratio). This allows you to print files at sizes ranging from 4x6 inches up to massive poster sizes like 24x36 inches without pixelation.'
                    }
                  },
                  {
                    '@type': 'Question',
                    name: 'Do Lurevi downloads include a commercial license?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'No, all digital files purchased on Lurevi are for personal use only. If you wish to use our designs for commercial decoration, product packaging, or advertising, please reach out to our support team for a commercial license.'
                    }
                  },
                  {
                    '@type': 'Question',
                    name: 'Do you ship physical prints and frames?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes! While we default to digital art downloads, you can select \'Physical Poster\' on the product page. We will print the artwork on museum-grade 200 GSM matte paper and deliver it directly to your address in protective tubes. Note that frames are not included.'
                    }
                  }
                ]
              }
            ]
          })
        }}
      />
      {/* Crawlable server-rendered homepage content for non-JS and low-JS crawlers */}
      {hasSeoSections && (
        <main className="mx-auto max-w-6xl px-4 py-2">
          {categories && categories.length > 0 && (
            <section className="mt-2">
              <h2 className="text-lg font-medium text-gray-900">Popular Categories</h2>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {categories.slice(0, 10).map((cat) => (
                  <li key={cat.id}>
                    <a href={`/${cat.slug}`} className="hover:underline">
                      {cat.name}
                    </a>
                    {cat.description ? ` - ${cat.description}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {featuredProducts && featuredProducts.length > 0 && (
            <section className="mt-2">
              <h2 className="text-lg font-medium text-gray-900">Featured Artworks</h2>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                {featuredProducts.slice(0, 10).map((p) => {
                  const categorySlug = Array.isArray(p.categories) ? p.categories[0] : 'browse';
                  return (
                    <li key={p.id}>
                      <a href={`/${categorySlug}/${p.slug}`} className="hover:underline">
                        {p.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </main>
      )}

      {/* Server-rendered SEO content — visible to Google, hidden to users once JS loads */}
      <noscript>
        <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
          <h1>Lurevi — Premium Digital Art Prints & Luxury Collections</h1>
          <p>
            Welcome to Lurevi, your premier destination for curated luxury digital art, high-resolution wall prints, and exclusive lifestyle collections. We design and select exquisite masterpieces that bring visual harmony, sophistication, and modern aesthetics into your home or office. Whether you are seeking museum-quality digital downloads for instant framing or looking to explore premium physical apparel, Lurevi blends artistic vision with premium craftsmanship to transform your everyday spaces.
          </p>

          <section style={{ marginTop: '2rem' }}>
            <h2>Why Choose Lurevi?</h2>
            <table border={1} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '8px' }}>Feature</th>
                  <th style={{ padding: '8px', fontWeight: 'bold', color: '#065f46' }}>Lurevi Premium</th>
                  <th style={{ padding: '8px' }}>Standard Downloads</th>
                  <th style={{ padding: '8px' }}>Generic Stock Art</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>File Resolution</td>
                  <td style={{ padding: '8px', color: '#047857', fontWeight: 'bold' }}>300 DPI Giclée-ready</td>
                  <td style={{ padding: '8px' }}>72 - 150 DPI web res</td>
                  <td style={{ padding: '8px' }}>Variable / compressed</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Licensing & Rights</td>
                  <td style={{ padding: '8px', color: '#047857', fontWeight: 'bold' }}>Personal Print Rights Included</td>
                  <td style={{ padding: '8px' }}>Restricted / single-use</td>
                  <td style={{ padding: '8px' }}>Strict commercial terms</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Expert Curation</td>
                  <td style={{ padding: '8px', color: '#047857', fontWeight: 'bold' }}>100% Curated by Panel</td>
                  <td style={{ padding: '8px' }}>Unfiltered user uploads</td>
                  <td style={{ padding: '8px' }}>Algorithmic selection</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h2>Art Curation & Design Insights</h2>
            <div>
              <h3>What is digital art and how does downloading it work?</h3>
              <p>Digital art is high-resolution artwork delivered in digital format (like 300 DPI JPEGs or PDFs). Once purchased, you download the file instantly and can print it using a home printer, local print shop, or online printing service. This provides an affordable, instant way to decorate your space.</p>
            </div>
            <div>
              <h3>What paper weight and style are recommended for printing wall art?</h3>
              <p>For the best results, we recommend printing on heavy-weight matte paper of at least 200 GSM or premium canvas. Matte paper eliminates reflections, making it perfect for brightly lit rooms, while canvas provides a classic, painterly texture.</p>
            </div>
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h2>Frequently Asked Questions</h2>
            <ul>
              <li><strong>How do I receive my digital files after purchase?</strong> Immediately upon checkout, you will receive an email with direct download links.</li>
              <li><strong>What dimensions are Lurevi\'s digital prints suitable for?</strong> High-resolution 300 DPI files in standard print ratios up to 24x36 inches.</li>
            </ul>
          </section>

          {categories && categories.length > 0 && (
            <section style={{ marginTop: '2rem' }}>
              <h2>Shop by Category</h2>
              <ul>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <a href={`/${cat.slug}`}>
                      <strong>{cat.name}</strong>
                      {cat.description && ` — ${cat.description}`}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {featuredProducts && featuredProducts.length > 0 && (
            <section style={{ marginTop: '2rem' }}>
              <h2>Featured Artworks</h2>
              <ul>
                {featuredProducts.map((p) => (
                  <li key={p.id}>
                    <a href={`/${Array.isArray(p.categories) ? p.categories[0] : 'browse'}/${p.slug}`}>
                      {p.title} — ₹{p.price}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </noscript>

      {/* Client-side React app — full interactive experience */}
      <HomepageClient />
    </>
  );
}

