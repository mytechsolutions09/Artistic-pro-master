import type { Metadata } from 'next';
import Link from 'next/link';
import { createStaticClient } from '@/lib/supabase/server';
import { generateSlug } from '@/src/utils/slugUtils';

const SITE = 'https://lurevi.in';

const GIFTS_DESCRIPTION =
  'Buy unique home decor gifts online at Lurevi — premium wall art, gift-ready prints, and curated decor for birthdays, weddings, and housewarmings across India.';

const GIFTS_KEYWORDS = [
  'unique home decor gifts online',
  'home decor gifts online India',
  'luxury wall art gifts India',
  'art print gifts online',
  'gift ready wall art',
  'housewarming gifts decor',
  'wedding gift wall art India',
  'premium decor gifts online',
  'curated art gifts',
] as const;

export const metadata: Metadata = {
  title: 'Gift Digital Art Prints & Home Decor Gifts India | Lurevi',
  description: GIFTS_DESCRIPTION,
  keywords: [...GIFTS_KEYWORDS],
  alternates: {
    canonical: `${SITE}/gifts`,
    languages: {
      'en-IN': `${SITE}/gifts`,
      'x-default': `${SITE}/gifts`,
    },
  },
  openGraph: {
    type: 'website',
    url: `${SITE}/gifts`,
    siteName: 'Lurevi',
    title: 'Gift Digital Art Prints & Home Decor Gifts India | Lurevi',
    description:
      'Shop unique home decor gifts online — premium wall art and curated gift-ready prints for every gifting occasion in India.',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gift Digital Art Prints & Home Decor Gifts India | Lurevi',
    description:
      'Premium wall art and curated home decor gifts online. Perfect for weddings, housewarmings, and celebrations in India.',
  },
  robots: { index: true, follow: true },
};

export const revalidate = 3600; // Cache for 1 hour

export default async function GiftsPage() {
  const supabase = createStaticClient();

  // Fetch categories and featured products in parallel for speed and SEO
  const [categoriesRes, productsRes] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, description, image')
      .order('name', { ascending: true })
      .limit(12),
    supabase
      .from('products')
      .select('id, title, description, price, original_price, discount_percentage, images, categories')
      .eq('status', 'active')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const categories = categoriesRes.data || [];
  const featuredProducts = productsRes.data || [];

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Gift Digital Art Prints & Home Decor Gifts India | Lurevi',
    url: `${SITE}/gifts`,
    description: GIFTS_DESCRIPTION,
    inLanguage: 'en-IN',
    keywords: GIFTS_KEYWORDS.join(', '),
    isPartOf: { '@type': 'WebSite', name: 'Lurevi', url: SITE },
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Gift-Ready Digital Art Prints',
    description: 'Handpicked and curated home decor art prints suitable for gifting.',
    url: `${SITE}/gifts`,
    itemListElement: featuredProducts.map((p, index) => {
      const categorySlug = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0] : 'browse';
      const imageUrl = Array.isArray(p.images) && p.images.length > 0 
        ? p.images[0] 
        : 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600';
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: p.title,
        url: `${SITE}/categories/${categorySlug}/${generateSlug(p.title)}`,
        image: imageUrl,
      };
    }),
  };

  // Utility to format price
  const formatPrice = (priceVal: any) => {
    const num = Number(priceVal);
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-gray-900 pb-16 font-sans">
      {/* Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-gray-900 to-black text-white py-16 px-4 text-center sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,110,120,0.15)_0,transparent_100%)]" />
        <div className="relative max-w-4xl mx-auto z-10">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-teal-300 uppercase bg-teal-950/60 rounded-full border border-teal-800/30">
            Curated Gifting Collection
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-teal-100 via-white to-teal-200">
            Gift Digital Art Prints & Home Decor Gifts India
          </h1>
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover <strong>unique home decor gifts online</strong> at Lurevi. Our high-definition Giclée prints and instant, frame-ready digital downloads make for thoughtful, sophisticated housewarming, wedding, and birthday presents.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="#categories" className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all duration-300 text-sm">
              Browse Categories
            </a>
            <a href="#featured" className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg border border-white/20 hover:border-white/30 transition-all duration-300 text-sm">
              Best Sellers
            </a>
          </div>
        </div>
      </section>

      {/* Occasions / Category Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 scroll-mt-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-sans">Shop Gift Ideas by Category</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-xl mx-auto font-normal">
            Choose from a wide variety of themes to perfectly match their personality, room vibe, or home interior.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => {
              const catImage = cat.image || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=400';
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group block bg-white border border-gray-200/80 hover:border-teal-800/20 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-50">
                    <img
                      src={catImage}
                      alt={`${cat.name} digital art print gift`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-bold text-base sm:text-lg leading-tight tracking-tight font-sans capitalize">{cat.name}</h3>
                      <span className="text-[10px] text-teal-200 font-semibold uppercase tracking-wider block mt-1">
                        Explore Collection →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm py-12">Loading categories...</p>
        )}
      </section>

      {/* Featured Products Grid */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 scroll-mt-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-sans">Curated Best Selling Gifts</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-xl mx-auto font-normal">
            Browse our top-rated art prints and digital downloads that make for perfect, ready-to-frame presents.
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.map((p) => {
              const categorySlug = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0] : 'browse';
              const pImage = Array.isArray(p.images) && p.images.length > 0 
                ? p.images[0] 
                : 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600';
              const productUrl = `/categories/${categorySlug}/${generateSlug(p.title)}`;

              return (
                <Link
                  key={p.id}
                  href={productUrl}
                  className="group block bg-white border border-gray-200/80 hover:border-teal-800/20 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
                    <img
                      src={pImage}
                      alt={`${p.title} - digital art print by Lurevi`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {p.discount_percentage && p.discount_percentage > 0 && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {p.discount_percentage}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow justify-between bg-white border-t border-gray-100">
                    <div>
                      <span className="text-[10px] font-bold text-teal-800 tracking-widest uppercase block mb-1">
                        {categorySlug.replace(/-/g, ' ')}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-teal-800 transition-colors duration-200 line-clamp-1 capitalize font-sans" title={p.title}>
                        {p.title}
                      </h3>
                      <div className="flex items-baseline space-x-2 mt-1.5 mb-2">
                        <span className="text-sm font-bold text-gray-900 font-sans">{formatPrice(p.price)}</span>
                        {p.original_price && p.original_price > p.price && (
                          <span className="text-xs text-gray-400 line-through font-sans">{formatPrice(p.original_price)}</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full mt-2 py-2 bg-gray-900 group-hover:bg-teal-800 text-white text-xs font-semibold transition-colors duration-300 rounded flex items-center justify-center space-x-1">
                      <span>Explore Gift</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm py-12">No featured gift products found.</p>
        )}
      </section>

      {/* Gifting Specifications Guide */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-sans">Digital Download vs. Physical Prints Gifting Guide</h2>
          <p className="text-sm text-gray-500 mt-2 font-normal">
            Understand how our premium formats work so you can pick the perfect art print gift online.
          </p>
        </div>

        <div className="overflow-hidden border border-gray-200/80 rounded-xl bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">
                  Gifting Feature
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Digital Art Download
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Physical Poster Print
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-600">
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">Delivery Speed</td>
                <td className="px-6 py-4 text-teal-800 font-medium">Instant (Immediate access via email/dashboard)</td>
                <td className="px-6 py-4">Dispatched in 24-48 hours. Delivered in 3-5 business days.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">Best Occasion</td>
                <td className="px-6 py-4">Last-minute gifting, international gifts, self-framing flexibility</td>
                <td className="px-6 py-4">Housewarmings, weddings, corporate gifting, direct home delivery</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">Format & Quality</td>
                <td className="px-6 py-4">High-resolution 300 DPI JPEG + PDF files</td>
                <td className="px-6 py-4">Museum-quality Giclée printing on 200 GSM archival matte paper</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">Packaging</td>
                <td className="px-6 py-4">Digital delivery (No environmental footprint)</td>
                <td className="px-6 py-4">Secured in thick, crush-resistant shipping tubes (gift-ready)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">Shipping Cost</td>
                <td className="px-6 py-4 text-teal-800 font-medium">Free (Worldwide digital delivery)</td>
                <td className="px-6 py-4">Free standard delivery across India on all orders</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
