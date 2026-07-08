import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { blogCoverUrl } from '@/lib/blogCover';
import ProductCard from '@/src/components/ProductCard';
import { marked } from 'marked';
import { User } from 'lucide-react';
import ShareButton from '@/src/components/ShareButton';
import TableOfContents from '@/src/components/TableOfContents';


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

  let title = post.seo_title?.trim() || `${post.title} | Lurevi Blog`;
  if (title.length < 30) {
    if (!title.toLowerCase().includes('lurevi')) {
      title = `${title} | Lurevi Blog`;
    }
    if (title.length < 30) {
      title = `${title} - Premium Art Prints`;
    }
  }

  let description = post.seo_description?.trim() || post.excerpt?.trim() || '';
  if (description.length < 80) {
    description = description 
      ? `${description}. Discover premium digital art prints, luxury wall decor styling ideas, and home styling inspiration on the Lurevi Blog.`
      : 'Read this article on the Lurevi blog. Discover premium digital art prints, luxury wall decor styling ideas, and home styling inspiration.';
  }
  if (description.length > 170) {
    description = description.substring(0, 165) + '...';
  }

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

export const revalidate = 3600;

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

  let htmlContent = (marked.parse(parseMarkdownInsideHtml(post.content.replace(/^[ \t]+/gm, ''))) as string)
    .replace(/<h1/g, '<h2')
    .replace(/<\/h1>/g, '<\/h2>');

  const toc: Array<{ id: string; text: string; level: number }> = [];
  htmlContent = htmlContent.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g, (match, level, attrs, innerText) => {
    let id = '';
    const idMatch = attrs.match(/id="([^"]+)"/);
    if (idMatch) {
      id = idMatch[1];
    } else {
      const text = innerText.replace(/<[^>]+>/g, '').trim();
      id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      attrs = `${attrs} id="${id}"`;
    }
    const text = innerText.replace(/<[^>]+>/g, '').trim();
    if (text) {
      toc.push({ id, text, level: parseInt(level) });
    }
    return `<h${level}${attrs}>${innerText}</h${level}>`;
  });

  // Format date like "8 JUL 2026"
  const formattedDate = new Date(publishedISO).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  // Derive a category label from first tag or fallback
  const categoryLabel = Array.isArray(post.tags) && post.tags.length > 0
    ? post.tags[0].toUpperCase()
    : 'BLOG';

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* Back to Blog */}
      <Link href="/blog" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-medium tracking-wide uppercase mb-6 transition-colors">
        ‹ Back to Blogs
      </Link>

      {/* Hero: Image left, Meta right */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start mb-10">
        {/* Cover Image */}
        {post.slug !== 'lurevi-vs-artzolo-comparison-guide' && (
          <div className="w-full md:w-[45%] shrink-0 rounded-xl overflow-hidden border border-gray-100">
            <img
              src={blogCoverUrl(post.cover_image)}
              alt={post.title}
              className="w-full h-auto object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        )}

        {/* Right Meta Column */}
        <div className="flex-1 flex flex-col justify-start pt-1">
          {/* Category + Date */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-bold tracking-widest uppercase bg-gray-100 text-gray-600 px-2.5 py-1 rounded">
              {categoryLabel}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
              </svg>
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>

          {/* Excerpt as blockquote */}
          {post.excerpt && (
            <blockquote className="border-l-4 border-gray-300 pl-4 text-sm text-gray-600 italic mb-5 leading-relaxed">
              {post.excerpt}
            </blockquote>
          )}

          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span key={tag} className="text-[11px] text-gray-500 hover:text-gray-800 cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest mt-auto">
            <span className="font-semibold">Share:</span>
            <ShareButton title={post.title} url={`${SITE_URL}/blog/${post.slug}`} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-8" />

      {/* Article + TOC */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Article content */}
        <div className="flex-1 min-w-0">
          <article
            className="leading-7 text-gray-800 space-y-4 font-normal [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-gray-900 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-gray-900 [&_strong]:font-semibold [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-6 [&_img]:mx-auto [&_a]:text-teal-700 [&_a]:hover:underline [&_a]:font-medium [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

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
        </div>

        {/* Sticky TOC */}
        <TableOfContents toc={toc} />
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

