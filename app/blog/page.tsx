import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

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

export const revalidate = 1800;

type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
  status: 'draft' | 'published';
};

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
      .select('id, title, slug, excerpt, cover_image, published_at, created_at, status')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (error) return [];
    return (data || []) as BlogListItem[];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
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
      image: post.cover_image || undefined,
      description: post.excerpt || undefined,
    })),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <h1 className="text-3xl font-semibold text-gray-900">Lurevi Blog</h1>
      <p className="mt-3 text-gray-700">
        Explore luxury decor insights, style tips, and curated inspiration from the Lurevi team.
      </p>

      {posts.length === 0 ? (
        <section className="mt-8 rounded-lg border border-dashed border-gray-300 p-5 bg-white">
          <p className="text-sm text-gray-600">
            No published blog posts yet. Create and publish posts from Admin - Blog.
          </p>
        </section>
      ) : (
        <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Published blog posts">
          {posts.map((post) => (
            <article key={post.id} className="rounded-lg border border-gray-200 bg-white p-4">
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-44 object-cover rounded-md border border-gray-100"
                />
              )}
              <h2 className="mt-3 text-lg font-medium text-gray-900">
                <Link href={`/blog/${post.slug}`} className="hover:text-pink-700">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {post.excerpt || 'Read the latest article from Lurevi blog.'}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(post.published_at || post.created_at).toLocaleDateString('en-IN')}
                </span>
                <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-pink-600 hover:text-pink-700">
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
