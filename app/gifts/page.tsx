import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gifts | Lurevi',
  description:
    'Shop unique home decor gifts online from Lurevi. Discover premium wall art and curated gift-ready prints for every occasion in India.',
  alternates: {
    canonical: 'https://lurevi.in/gifts',
  },
};

export default function GiftsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-gray-900">Gift-Ready Art Prints</h1>
      <p className="mt-3 text-gray-700">
        Discover unique home decor gifts online with curated wall art picks for birthdays, weddings, and housewarmings.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-medium text-gray-900">Premium Gifts for New Homes</h2>
          <p className="mt-2 text-sm text-gray-600">
            Elegant wall decor options that fit modern Indian interiors and gifting moments.
          </p>
          <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-pink-600 hover:text-pink-700">
            Shop Gift Picks
          </Link>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-medium text-gray-900">Explore Gift-Friendly Categories</h2>
          <p className="mt-2 text-sm text-gray-600">
            Browse curated categories to match styles, rooms, and occasion-based gifting.
          </p>
          <Link href="/categories" className="mt-3 inline-block text-sm font-medium text-pink-600 hover:text-pink-700">
            View Categories
          </Link>
        </article>
      </section>
    </main>
  );
}

