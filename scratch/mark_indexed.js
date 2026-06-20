const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually from .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase URL or Service Role Key in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const paths = [
  '/categories/coder',
  '/blog/how-to-choose-affordable-wall-art-that-looks-high-end-in-india',
  '/shop',
  '/categories/football',
  '/categories/football/crimson-lionel-messi-legacy',
  '/categories/football/legends-of-football-glory',
  '/categories/motivational/success-loves-expensive-taste',
  '/categories/vintage/manhattan-urban-blueprint',
  '/categories/abstract',
  '/privacy',
  '/returns-and-refunds',
  '/blog/how-to-choose-digital-artwork-for-your-home',
  '/blog/digital-painting-vs-digital-illustration',
  '/categories/woman',
  '/browse',
  '/blog/lurevi-masterclass-luxury-wall-decor',
  '/blog/luxury-art-prints-gift-india',
  '/blog/living-canvas-styling-luxury-modern-art-prints-for-the-discerning-indian-home',
  '/blog/luxury-framed-art-prints-for-bedroom-india-oasis',
  '/blog/lurevis-masterclass-luxury-home-decor-wall-print-styling',
  '/blog',
  '/blog/what-is-digital-art',
  '/gifts',
  '/faq',
  '/',
  '/motivational/success-loves-expensive-taste',
  '/contact-us',
  '/rebellion',
  '/clothes',
  '/blog/modern-art-prints-for-living-room-layout-guide'
];

async function markAsIndexed() {
  console.log(`Marking ${paths.length} URLs as indexed...`);
  
  const defaultAuditPayload = {
    title: { text: '', status: 'warning', message: 'Not audited yet' },
    description: { text: '', status: 'warning', message: 'Not audited yet' },
    h1: { count: 0, status: 'warning', message: 'N/A' },
    headings: { h2Count: 0, h3Count: 0, status: 'warning', message: 'N/A' },
    images: { total: 0, missingAlt: 0, status: 'warning', message: 'N/A' },
    og: { hasTitle: false, hasDesc: false, hasImage: false, status: 'warning', message: 'N/A' }
  };

  try {
    for (const path of paths) {
      // Check if record exists
      const { data: existing } = await supabase
        .from('seo_scores')
        .select('score, audit_data')
        .eq('path', path)
        .single();

      const score = existing?.score ?? 0;
      const audit_data = existing?.audit_data ?? defaultAuditPayload;

      const { error } = await supabase
        .from('seo_scores')
        .upsert({
          path,
          score,
          audit_data,
          is_indexed: true
        }, { onConflict: 'path' });

      if (error) {
        console.error(`Failed to upsert ${path}:`, error.message);
      } else {
        console.log(`✅ Marked ${path} as indexed.`);
      }
    }
    console.log('\nDone updating all URLs!');
  } catch (err) {
    console.error('Error executing upsert operations:', err);
  }
}

markAsIndexed();
