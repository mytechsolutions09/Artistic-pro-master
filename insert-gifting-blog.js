const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually to avoid external dependencies
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env file not found!');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
      let val = match[2].trim();
      // Remove surrounding quotes if any
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      env[match[1]] = val;
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Role Key missing in .env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const blogPost = {
  title: 'Gifting digital art: why a print beats anything this festive season',
  slug: 'gifting-digital-art-india',
  excerpt: 'Looking for a unique gift? A digital art print from Lurevi is personal, lasting and beautifully packaged.',
  cover_image: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
  status: 'published',
  tags: ['digital artwork', 'digital art prints', 'gifting art', 'wall art gifts', 'festive gifts India'],
  seo_title: 'Gifting digital art in India | Lurevi Blog',
  seo_description: 'Looking for a unique gift? A digital art print from Lurevi is personal, lasting and beautifully packaged.',
  published_at: new Date().toISOString(),
  content: `<h1>Gifting digital art in India</h1>

<p>Finding the perfect gift during the festive season can feel like an endless search. With generic gift baskets, mass-produced sweets, and predictable apparel flooding the market, how do you give something that truly stands out?</p>

<p>Enter <strong>digital artwork</strong>. Over the last few years, <strong>digital art prints</strong> have emerged as one of the most thoughtful, unique, and premium gifts you can share with your loved ones. Whether it is a housewarming, a wedding anniversary, or a major milestone, a high-quality art print offers a personal touch that conventional gifts simply cannot replicate.</p>

<p>In this guide, we will explore why a digital art print beats standard gifts, compare digital versus physical formats, look at budget options, check out Lurevi's premium packaging, and highlight our top 6 picks for this festive season.</p>

<hr>

<h2>Why Art is a Meaningful Gift</h2>

<p>Gifting art is more than just handing over a decorative item; it is a way of saying, <em>"I know your style, and I want to bring beauty into your everyday life."</em></p>

<ul>
  <li><strong>It Lasts a Lifetime</strong>: Unlike chocolates that disappear in days or clothing that goes out of style, a premium art print stays on the wall for decades. It becomes a permanent backdrop to family memories.</li>
  <li><strong>It Evokes Emotion</strong>: Art triggers emotional responses. Every time your recipient looks at the print in their living room or bedroom, they will be reminded of the special occasion and your relationship.</li>
  <li><strong>It Personalizes a Space</strong>: Giving art is a deeply personal gesture. It shows you have taken the time to understand their design sensibilities, whether they prefer minimalist monochrome or vibrant abstract pieces.</li>
</ul>

<hr>

<h2>Digital vs. Physical Art Gifts</h2>

<p>When people hear "digital art," they sometimes assume it only exists on a screen. At Lurevi, we bridge the gap between digital creativity and tangible luxury:</p>

<ol>
  <li><strong>Instant Digital Downloads</strong>: If you are a last-minute shopper or want complete control over the framing, you can purchase an ultra-high-resolution (300 DPI) digital file. You receive it instantly in your email and can print it locally on your choice of paper or canvas.</li>
  <li><strong>Museum-Quality Physical Prints</strong>: If you prefer a ready-to-unwrap gift, you can order a physical poster. Lurevi prints every <strong>digital artwork</strong> on museum-grade 200 GSM heavy-weight matte paper using archival pigment inks, ensuring clean lines and vibrant colors that do not fade over time.</li>
</ol>

<p>By gifting <strong>digital art prints</strong>, you combine the precision of modern graphic design with the timeless elegance of traditional framing.</p>

<hr>

<h2>Premium Art for Every Budget</h2>

<p>You do not need to spend a fortune to gift high-end art. Lurevi offers beautiful pieces across several pricing tiers:</p>

<ul>
  <li><strong>Under ₹1,000</strong>: Perfect for standard frame-ready A4 or A3 prints. Ideal for secret Santa gifts, birthday presents, or a gesture of appreciation for a colleague.</li>
  <li><strong>₹1,500 – ₹3,000</strong>: Excellent for large A2 prints or multi-print gallery sets. This is the sweet spot for housewarming gifts or close friends.</li>
  <li><strong>₹3,000+</strong>: Premium statement pieces (A1 size or museum-grade canvas prints) designed to serve as the main focal point in a living room, master bedroom, or executive office.</li>
</ul>

<hr>

<h2>The Lurevi Unboxing Experience: Ready to Gift</h2>

<p>Half the joy of receiving a gift lies in the packaging. We believe a premium product deserves premium presentation.</p>

<p>Every physical print from Lurevi is carefully rolled in protective acid-free tissue paper and shipped in our <strong>signature rigid luxury tubes</strong>. These matte-textured tubes feature sleek branding, gold-foil accents, a verified curator certificate signed by our Lead Curator, and a customizable handwritten greeting note.</p>

<p>When your recipient opens their package, they do not just get a poster—they get a curated gallery experience delivered straight to their door.</p>

<hr>

<h2>Top 6 Picks for This Festive Season</h2>

<p>Here are six handpicked digital art prints from Lurevi's collections that make flawless gifts:</p>

<h3>1. Abstract Modernism (For the Living Room)</h3>
<p>A bold, multi-colored abstract print is perfect for those who love contemporary design. It coordinates easily with neutral couches and brings a splash of sophistication to any main wall.</p>

<h3>2. Serene Landscapes (For the Bedroom)</h3>
<p>Gift peace and tranquility with soft watercolor forest prints or calming misty mountain horizons. These pieces promote relaxation and work beautifully above a headboard.</p>

<h3>3. Minimalist Line Art (For the Scandinavian Decor Lover)</h3>
<p>Clean, elegant, and timeless. Black-and-white line art fits into any home color scheme, making it a safe yet incredibly chic choice if you are unsure of their exact color preferences.</p>

<h3>4. Sports Portrait Art (For the Football Fanatic)</h3>
<p>Know a Messi fan? Gift our popular <em>Lionel Messi Beneath the Red Sun</em> or <em>Golden Football Portrait of Messi</em>. These dynamic illustrations elevate fan art into high-end gallery pieces.</p>

<h3>5. Tech Humor &amp; Coding Prints (For the Office or Dev Friend)</h3>
<p>For your programmer or tech-entrepreneur friends, prints like <em>Light Attracts Bugs</em> combine clean typography with witty coding humor, perfect for styling a home office desk or study wall.</p>

<h3>6. Contemporary Traditional Fusion (For the Festive Vibe)</h3>
<p>Modern digital illustrations that pay homage to classic Indian patterns, motifs, and colors. These prints capture the festive spirit of Diwali or housewarmings while remaining clean and modern.</p>

<hr>

<div class="cta-container" style="text-align: center; margin: 3rem 0; padding: 2rem; background-color: #fafafa; border-radius: 12px; border: 1px solid #eaeaea;">
  <h3 style="margin-top: 0;">Ready to give a gift that stays?</h3>
  <p style="font-size: 0.9rem; color: #666; margin-bottom: 1.5rem;">Explore our curated selection of gift-ready posters and instant downloads.</p>
  <a href="https://lurevi.in/gifts" style="display: inline-block; background-color: #0d9488; color: white; font-weight: 600; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; transition: background-color 0.2s;">Shop gift-ready prints</a>
</div>`
};

async function run() {
  console.log('Inserting blog post into Supabase...');
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .upsert(blogPost, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error('Error inserting blog:', error);
      process.exit(1);
    } else {
      console.log('Successfully inserted/updated blog post:', data[0]?.slug);
      process.exit(0);
    }
  } catch (err) {
    console.error('Exception occurred:', err);
    process.exit(1);
  }
}

run();
