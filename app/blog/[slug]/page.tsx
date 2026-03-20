import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://lurevi.in';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
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

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !data) return null;
    return data as BlogPost;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return {
      title: 'Blog Post | Lurevi',
      description: 'Read the latest insights from Lurevi.',
    };
  }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const title = post.seo_title || `${post.title} | Lurevi Blog`;
  const description = post.seo_description || post.excerpt || 'Read this article on the Lurevi blog.';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Lurevi',
      images: post.cover_image ? [{ url: post.cover_image, alt: post.title }] : undefined,
      publishedTime: post.published_at || post.created_at,
      tags: Array.isArray(post.tags) ? post.tags : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export async function generateStaticParams() {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('status', 'published')
      .limit(200);
    return (data || []).filter((row) => row?.slug).map((row) => ({ slug: String(row.slug) }));
  } catch {
    return [];
  }
}

export const revalidate = 1800;

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const publishedISO = post.published_at || post.created_at;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo_description || post.excerpt || '',
    image: post.cover_image || undefined,
    datePublished: publishedISO,
    dateModified: publishedISO,
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Lurevi',
      url: SITE_URL,
    },
    keywords: Array.isArray(post.tags) ? post.tags.join(', ') : undefined,
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Link href="/blog" className="text-sm text-pink-600 hover:text-pink-700">
        Back to Blog
      </Link>
      <h1 className="mt-3 text-3xl font-semibold text-gray-900">{post.title}</h1>
      <p className="mt-2 text-xs text-gray-500">
        {new Date(publishedISO).toLocaleDateString('en-IN')}
      </p>

      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="mt-5 w-full h-72 object-cover rounded-lg border border-gray-100"
        />
      )}

      {post.excerpt && <p className="mt-5 text-base text-gray-700">{post.excerpt}</p>}

      <article className="mt-6 whitespace-pre-wrap leading-7 text-gray-800">{post.content}</article>

      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </main>
  );
}

