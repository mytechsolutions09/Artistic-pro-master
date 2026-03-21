import type { Metadata } from 'next';
import Link from 'next/link';

const SITE = 'https://lurevi.in';

const GIFTS_DESCRIPTION =
  'Buy unique home decor gifts online at Lurevi — premium wall art, gift-ready prints, and curated decor for birthdays, weddings, and housewarmings across India.';

/** Primary intent: "unique home decor gifts online" + India / wall art gifting */
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
  title: 'Unique Home Decor Gifts Online | Art & Wall Print Gifts | Lurevi',
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
    title: 'Unique Home Decor Gifts Online | Lurevi',
    description:
      'Shop unique home decor gifts online — premium wall art and curated gift-ready prints for every occasion in India.',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unique Home Decor Gifts Online | Lurevi',
    description:
      'Premium wall art and curated home decor gifts online. Perfect for weddings, housewarmings, and celebrations in India.',
  },
  robots: { index: true, follow: true },
};

export default function GiftsPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Unique Home Decor Gifts Online | Lurevi',
    url: `${SITE}/gifts`,
    description: GIFTS_DESCRIPTION,
    inLanguage: 'en-IN',
    keywords: GIFTS_KEYWORDS.join(', '),
    isPartOf: { '@type': 'WebSite', name: 'Lurevi', url: SITE },
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

      <h1 className="text-3xl font-semibold text-gray-900">Unique Home Decor Gifts Online</h1>
      <p className="mt-3 text-lg text-gray-800">
        Find <strong>unique home decor gifts online</strong> at Lurevi — premium wall art and curated prints for
        birthdays, weddings, housewarmings, and celebrations across India.
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Gift-ready wall art, luxury decor gifts, and art print ideas for housewarmings, weddings, and special occasions.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Gift shopping">
        <article className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-medium text-gray-900">Premium Gifts for New Homes</h2>
          <p className="mt-2 text-sm text-gray-600">
            Elegant wall decor and art prints that suit modern Indian homes — ideal when you want a memorable{' '}
            <span className="whitespace-nowrap">home decor gift online</span>.
          </p>
          <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-pink-600 hover:text-pink-700">
            Shop gift picks
          </Link>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-medium text-gray-900">Explore gift-friendly categories</h2>
          <p className="mt-2 text-sm text-gray-600">
            Browse categories to match styles, rooms, and occasions — from minimal prints to statement wall art for
            gifting.
          </p>
          <Link href="/categories" className="mt-3 inline-block text-sm font-medium text-pink-600 hover:text-pink-700">
            View categories
          </Link>
        </article>
      </section>
    </main>
  );
}
