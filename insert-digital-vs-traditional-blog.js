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
  title: 'Digital art vs traditional art: which makes better wall prints?',
  slug: 'digital-art-vs-traditional-art',
  excerpt: 'Comparing digital and traditional art for home printing — colour, cost, and longevity. Plus the best digital art prints in India.',
  cover_image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800',
  status: 'published',
  tags: ['digital art', 'digital painting', 'traditional art', 'art prints', 'wall art guide'],
  seo_title: 'Digital art vs traditional art for wall prints | Lurevi',
  seo_description: 'Comparing digital and traditional art for home printing — colour, cost, and longevity. Plus the best digital art prints in India.',
  published_at: new Date().toISOString(),
  content: `<h1>Digital art vs traditional art for wall prints</h1>

<p>When it comes to decorating your home with striking visuals, you are often faced with a choice: should you buy a print of a traditional painting, or opt for <strong>digital art</strong> created specifically for modern mediums? Both have their unique charm, but when the end goal is a high-quality wall print, they perform very differently.</p>

<p>In this guide, we compare <strong>digital art</strong> and traditional art across key factors like colour accuracy, longevity, cost, and collectability to help you decide which makes the better wall print for your space.</p>

<hr>

<h2>What is Digital Art vs. Traditional Art?</h2>

<p><strong>Traditional Art</strong> refers to physical mediums: oil paints on canvas, watercolors on paper, charcoal, and acrylics. To turn a traditional piece into a print, the original artwork must be photographed or scanned at a very high resolution.</p>

<p><strong>Digital Art</strong> (including <strong>digital painting</strong> and vector illustration) is created entirely on a digital device—like an iPad Pro or a Wacom tablet—using software such as Procreate or Adobe Photoshop. Because it is born digitally, there is no scanning process required; the file is exported directly to the printer.</p>

<hr>

<h2>Colour Accuracy in Print</h2>

<h3>Traditional Art Prints</h3>
<p>When a traditional painting is scanned, lighting and camera sensors can slightly alter the original hues. Achieving a 100% accurate reproduction of an oil painting's vibrant reds or deep blues is notoriously difficult. Furthermore, traditional paints have textures (impasto) that cast shadows when photographed, which can look flat or "muddy" when printed on smooth paper.</p>

<h3>Digital Art Prints</h3>
<p>Because a <strong>digital painting</strong> is created in a color space designed for screens and printers (RGB/CMYK), the color translation is incredibly precise. When printed on high-quality archival paper, the colors are exactly as the artist intended—crisp, vibrant, and perfectly balanced, with no scanning artifacts or unwanted shadows.</p>

<p><strong>Winner for Print Clarity:</strong> Digital Art</p>

<hr>

<h2>Longevity and Durability</h2>

<p>Both digital and traditional art prints rely on the quality of the printer and paper.</p>

<p>At Lurevi, our digital art prints are produced using museum-grade 200 GSM matte paper and archival pigment inks. This ensures that a digital print can last decades without fading, provided it is kept out of direct, harsh sunlight. Traditional art prints offer the same longevity <em>if</em> printed with identical archival methods. However, original traditional art (like an actual watercolor) is highly susceptible to humidity, light, and temperature changes.</p>

<p><strong>Winner:</strong> Tie (depends entirely on the printing materials used)</p>

<hr>

<h2>Cost Comparison</h2>

<h3>Traditional Art</h3>
<p>Buying an original oil painting is a significant investment, often costing tens of thousands of rupees. Even limited-edition prints of famous traditional works command a premium because of the artist's established physical gallery presence and the expensive scanning process involved.</p>

<h3>Digital Art</h3>
<p><strong>Digital art</strong> democratizes luxury decor. Because there are no physical material costs (canvas, expensive pigments) or scanning fees during the creation process, artists can offer ultra-high-resolution prints at much more accessible prices. You can easily find a premium, large-format digital art print for a fraction of the cost of a traditional original.</p>

<p><strong>Winner for Budget-Friendly Luxury:</strong> Digital Art</p>

<hr>

<h2>Collectability and Exclusivity</h2>

<p>Traditional art has historically been valued for its uniqueness—there is only one physical original. For serious art investors, a one-of-a-kind physical canvas holds undeniable prestige.</p>

<p>However, the landscape is changing. Digital artists now offer limited-run prints, ensuring exclusivity. While you may not own a physical canvas with wet paint, you own a piece of modern, curated design that speaks to contemporary aesthetics.</p>

<p><strong>Winner for Investors:</strong> Traditional Original Art<br>
<strong>Winner for Interior Decorators:</strong> Digital Art Prints</p>

<hr>

<h2>Frequently Asked Questions</h2>

<h3>Does a digital painting look like a "real" painting when printed?</h3>
<p>Yes. Many digital artists use specialized digital brushes that mimic the texture and flow of oil, watercolor, or charcoal. When printed on high-quality textured paper or canvas, a <strong>digital painting</strong> can look incredibly similar to a traditional piece, but with sharper, cleaner edges.</p>

<h3>Can I print digital art myself?</h3>
<p>Absolutely. Many digital artworks are sold as high-resolution instant downloads. You can purchase the file and have it printed at a local professional print shop, giving you total control over the paper type and frame.</p>

<h3>Which style is better for modern Indian homes?</h3>
<p>For modern, minimalist, or contemporary Indian homes, digital art often provides the clean lines and precise color palettes that complement modern furniture. Traditional art prints work beautifully in heritage or classically styled spaces.</p>

<hr>

<div class="cta-container" style="text-align: center; margin: 3rem 0; padding: 2rem; background-color: #fafafa; border-radius: 12px; border: 1px solid #eaeaea;">
  <h3 style="margin-top: 0;">Discover flawless digital prints</h3>
  <p style="font-size: 0.9rem; color: #666; margin-bottom: 1.5rem;">Explore our curated collection of pristine, gallery-quality digital artwork designed to transform your walls.</p>
  <a href="https://lurevi.in/categories" style="display: inline-block; background-color: #0d9488; color: white; font-weight: 600; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; transition: background-color 0.2s;">Explore Lurevi's collection</a>
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
