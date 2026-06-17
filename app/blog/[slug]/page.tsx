import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { blogCoverUrl } from '@/lib/blogCover';
import ProductCard from '@/src/components/ProductCard';
import { marked } from 'marked';
import { User } from 'lucide-react';
import ShareButton from '@/src/components/ShareButton';


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

async function getFeaturedProducts() {
  try {
    const supabase = getPublicSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(4);
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
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
  const canonicalUrl = `${SITE_URL}/blog/${slug}`;
  const post = await getPostBySlug(slug);
  if (!post) {
    return {
      title: 'Blog Post | Lurevi',
      description: 'Read the latest insights from Lurevi.',
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const title = post.seo_title || `${post.title} | Lurevi Blog`;
  const description = post.seo_description || post.excerpt || 'Read this article on the Lurevi blog.';
  const ogImage = blogCoverUrl(post.cover_image);

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
      images: [{ url: ogImage, alt: post.title }],
      publishedTime: post.published_at || post.created_at,
      tags: Array.isArray(post.tags) ? post.tags : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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

/** Always fetch fresh post so cover image edits from Admin appear immediately. */
export const dynamic = 'force-dynamic';

function extractFaqs(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  try {
    const faqItemRegex = /<div class="faq-item">([\s\S]*?)<\/div>/g;
    let match;
    while ((match = faqItemRegex.exec(content)) !== null) {
      const itemContent = match[1];
      const questionMatch = itemContent.match(/<strong>([\s\S]*?)<\/strong>/);
      const paragraphs = [...itemContent.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => m[1]);
      
      const question = questionMatch ? questionMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      let answer = '';
      if (paragraphs.length >= 2) {
        answer = paragraphs[1].replace(/<[^>]+>/g, '').trim();
      } else if (paragraphs.length === 1) {
        answer = paragraphs[0].replace(/<strong>[\s\S]*?<\/strong>/, '').replace(/<[^>]+>/g, '').trim();
      }

      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
  } catch (err) {
    console.error('Failed to parse FAQs from content:', err);
  }
  return faqs;
}

function parseMarkdownInsideHtml(content: string): string {
  if (!content) return '';
  return content
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/(?<!\!)\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const isInternal = url.startsWith('/') || url.startsWith('#') || url.includes('lurevi.in');
      if (isInternal) {
        return `<a href="${url}">${text}</a>`;
      } else {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const featuredProducts = await getFeaturedProducts();
  const publishedISO = post.published_at || post.created_at;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seo_description || post.excerpt || '',
    image: blogCoverUrl(post.cover_image),
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

  const faqs = extractFaqs(post.content);
  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <Link href="/blog" className="text-sm text-teal-700 hover:text-teal-800 font-medium">
        Back to Blog
      </Link>
      <h1 className="mt-3 text-3xl font-semibold text-gray-900">{post.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 font-sans">
        <span>Published: {new Date(publishedISO).toLocaleDateString('en-IN')}</span>
        <span>•</span>
        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Last Updated: June 2026
        </span>
        <span className="ml-auto">
          <ShareButton title={post.title} url={`${SITE_URL}/blog/${post.slug}`} />
        </span>
      </div>

      {post.slug !== 'lurevi-vs-artzolo-comparison-guide' && (
        <img
          src={blogCoverUrl(post.cover_image)}
          alt={post.title}
          className="mt-5 w-full h-72 object-cover rounded-lg border border-gray-100"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      )}

      {post.excerpt && <p className="mt-5 text-base text-gray-700">{post.excerpt}</p>}

      <article 
        className="mt-6 leading-7 text-gray-800 space-y-4 font-normal [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_strong]:font-semibold [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:mx-auto [&_a]:text-teal-700 [&_a]:hover:underline [&_a]:font-medium [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
        dangerouslySetInnerHTML={{ __html: marked.parse(parseMarkdownInsideHtml(post.content.replace(/^[ \t]+/gm, ''))) as string }}
      />

      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Author & Reviewer Attribution */}
      <div className="mt-12 border-t border-gray-200 pt-6 flex items-start space-x-4 bg-gray-50 p-4 rounded-xl font-sans">
        <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-600">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Written & Reviewed by Arpit</h3>
          <p className="text-xs text-gray-500 font-medium">Co-Founder & Lead Art Curation Director</p>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-normal font-sans">
            Arpit is a co-founder and lead curator at Lurevi. With extensive experience in the Indian e-commerce landscape and digital art curation, Arpit drives the platform's vision of making premium contemporary prints accessible to modern homes across India.
          </p>
        </div>
      </div>

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

