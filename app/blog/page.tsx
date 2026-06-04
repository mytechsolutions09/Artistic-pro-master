import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { blogCoverUrl } from '@/lib/blogCover';
import BlogList, { BlogListItem } from './BlogList';

const SITE_URL = 'https://lurevi.in';

export const metadata: Metadata = {
  title: 'Blog | Lurevi',
  description:
    'Read Lurevi blog articles on luxury decor ideas, digital art trends, styling inspiration, and product guides.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/blog`,
    title: 'Lurevi Blog',
    description:
      'Read Lurevi blog articles on luxury decor ideas, digital art trends, styling inspiration, and product guides.',
    siteName: 'Lurevi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lurevi Blog',
    description:
      'Read Lurevi blog articles on luxury decor ideas, digital art trends, styling inspiration, and product guides.',
  },
};

/** Always fetch fresh posts so Admin cover URL changes show up without waiting for ISR. */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

async function getPublishedPosts(): Promise<BlogListItem[]> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, published_at, created_at, updated_at, status, tags')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (error) return [];
    return (data || []) as BlogListItem[];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  noStore();
  const posts = await getPublishedPosts();
  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Lurevi Blog',
    url: `${SITE_URL}/blog`,
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.published_at || post.created_at,
      image: blogCoverUrl(post.cover_image),
      description: post.excerpt || undefined,
    })),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <header className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">Lurevi Blog</h1>
        <p className="mt-3 text-gray-700">
          Explore luxury decor insights, style tips, and curated inspiration from the Lurevi team.
        </p>
      </header>

      <BlogList posts={posts} />
    </main>
  );
}
