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
  title: 'Digital sculptures as wall art: the emerging trend',
  slug: 'digital-sculptures-wall-art',
  excerpt: 'Explore the emerging trend of digital sculptures as wall art — and find curated 3D-style prints at Lurevi.',
  cover_image: 'https://images.pexels.com/photos/301395/pexels-photo-301395.jpeg?auto=compress&cs=tinysrgb&w=800',
  status: 'published',
  tags: ['digital art', 'digital artwork', 'digital sculptures', '3d art prints', 'wall art trends'],
  seo_title: 'Digital sculptures as wall art | Lurevi Blog',
  seo_description: 'Explore the emerging trend of digital sculptures as wall art — and find curated 3D-style prints at Lurevi.',
  published_at: new Date().toISOString(),
  content: `<h1>Digital sculptures as wall art</h1>

<p>When we think of sculptures, we often picture heavy marble blocks in museums, bronze figures in public squares, or clay pottery on a shelf. But a new design movement is breaking these physical boundaries: <strong>digital sculptures</strong>. By combining advanced 3D modeling software with high-end print technology, artists are bringing the depth, shadow, and architectural elegance of 3D sculptures onto flat walls.</p>

<p>In this article, we explore the emerging trend of digital sculptures as wall art, explain why they make exceptional prints, highlight styles to watch, and show how Lurevi curates premium 3D-style prints to elevate modern interiors.</p>

<hr>

<h2>What are Digital Sculptures?</h2>

<p>A digital sculpture is a piece of <strong>digital art</strong> created using specialized 3D sculpting software (like ZBrush, Blender, or Cinema 4D). Rather than painting on a flat digital canvas, the artist manipulates a virtual block of "clay," carving out shapes, defining textures, and placing virtual light sources to cast realistic shadows and highlights.</p>

<p>The result is a hyper-realistic 3D object that looks as though it has physical volume, weight, and texture, even though it exists purely in a digital space.</p>

<hr>

<h2>Why Digital Sculptures Work as Wall Prints</h2>

<p>You might wonder: how does a 3D sculpture translate onto a 2D wall print? The answer lies in the mastery of depth and lighting:</p>

<ul>
  <li><strong>Illusion of Depth</strong>: Because the artist can control the light source precisely, the rendered image captures subtle gradients, shadows, and reflections that make the artwork seem to "pop" off the paper. It adds an architectural quality to your room.</li>
  <li><strong>Modern Minimalism</strong>: Many digital sculptures feature smooth curves, abstract geometric forms, or liquid metal textures that align perfectly with Scandinavian, industrial, and minimalist home decor.</li>
  <li><strong>Vibrant Details</strong>: High-resolution rendering ensures that every ridge, crease, and texture is perfectly sharp. When printed on museum-quality matte paper, these details remain crisp and clear.</li>
</ul>

<hr>

<h2>3D Art Styles and Artists to Follow</h2>

<p>The world of 3D <strong>digital artwork</strong> is incredibly diverse. Here are a few prominent styles gaining traction in the interior design space:</p>

<h3>1. Biomorphic &amp; Organic Forms</h3>
<p>Inspired by nature, these sculptures feature soft, flowing lines reminiscent of smooth river stones, shells, or folded silk. They bring a calming, Zen-like atmosphere to bedrooms and living spaces.</p>

<h3>2. Metallic &amp; Chrome Surrealism</h3>
<p>Perfect for contemporary and tech-forward homes, this style uses reflective gold, silver, or iridescent textures. These prints create a striking statement, reflecting the futuristic aesthetic of modern digital culture.</p>

<h3>3. Neo-Classical Digital Fusion</h3>
<p>Some digital sculptors reinterpret classic marble busts and Grecian columns, blending ancient art history with modern surrealist elements (like levitating geometric shapes or glowing neon accents).</p>

<hr>

<h2>How Lurevi Curates 3D-Style Art</h2>

<p>At Lurevi, we are passionate about bringing the finest digital creations into your home. We work with leading 3D digital artists to curate prints that translate perfectly to paper and canvas:</p>

<p>We select pieces with strong lighting contrast, ensuring the depth is fully realized. Every <strong>digital artwork</strong> is printed on museum-grade 200 GSM heavyweight matte paper using archival inks, which prevent reflections and keep the focus entirely on the artwork's intricate form and shadow play.</p>

<hr>

<div class="cta-container" style="text-align: center; margin: 3rem 0; padding: 2rem; background-color: #fafafa; border-radius: 12px; border: 1px solid #eaeaea;">
  <h3 style="margin-top: 0;">Elevate your space with 3D depth</h3>
  <p style="font-size: 0.9rem; color: #666; margin-bottom: 1.5rem;">Browse our handpicked collection of digital sculpture prints and 3D-style wall art.</p>
  <a href="https://lurevi.in/categories/digital-art" style="display: inline-block; background-color: #0d9488; color: white; font-weight: 600; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; transition: background-color 0.2s;">Explore 3D art prints</a>
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
