import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://lurevi.in';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

type BlogRow = {
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function GET() {
  let itemsXml = '';
  try {
    const supabase = getPublicSupabaseClient();
    if (supabase) {
      const { data } = await supabase
        .from('blog_posts')
        .select('title, slug, excerpt, published_at, created_at, updated_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);
      const posts = (data || []) as BlogRow[];
      for (const post of posts) {
        const link = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
        const when = post.published_at || post.created_at;
        const pubDate = when ? new Date(when).toUTCString() : new Date().toUTCString();
        const desc = (post.excerpt?.trim() || '').slice(0, 2000);
        itemsXml += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(desc)}</description>
    </item>`;
      }
    }
  } catch {
    // empty feed on error
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Lurevi Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Luxury decor ideas, digital art trends, and product guides from Lurevi.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
