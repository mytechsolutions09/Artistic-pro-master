const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let url = '';
let anonKey = '';

try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      url = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      anonKey = line.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error('Failed to parse .env file:', e);
}

if (!url || !anonKey) {
  console.error('Supabase env vars missing from .env!');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

function extractFaqs(content) {
  const faqs = [];
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

async function run() {
  const slug = 'how-to-choose-affordable-wall-art-that-looks-high-end-in-india';
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    console.error('Error fetching post:', error);
    return;
  }

  console.log('Post Title:', post.title);
  console.log('Post Excerpt:', post.excerpt);
  console.log('--- CONTENT START ---');
  console.log(post.content);
  console.log('--- CONTENT END ---');
  const faqs = extractFaqs(post.content);
  console.log('Extracted FAQs count:', faqs.length);
  console.log('FAQs:', JSON.stringify(faqs, null, 2));

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seo_description || post.excerpt || '',
    datePublished: post.published_at || post.created_at,
    url: `https://lurevi.in/blog/${post.slug}`,
  };

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

  console.log('Article Schema JSON valid?');
  try {
    const s = JSON.stringify(articleSchema, null, 2);
    JSON.parse(s);
    console.log('Yes, Article Schema is valid JSON. Length:', s.length);
    console.log(s);
  } catch (e) {
    console.error('No, Article Schema is invalid:', e);
  }

  if (faqSchema) {
    console.log('FAQ Schema JSON valid?');
    try {
      const s = JSON.stringify(faqSchema);
      JSON.parse(s);
      console.log('Yes, FAQ Schema is valid JSON. Length:', s.length);
      console.log('FAQ Schema:', s);
    } catch (e) {
      console.error('No, FAQ Schema is invalid:', e);
    }
  }
}

run();
