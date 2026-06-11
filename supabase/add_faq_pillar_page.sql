-- SQL Script to insert the "Everything You Need to Know About Buying Art in India" FAQ Pillar Page
-- Run this in your Supabase SQL editor: https://app.supabase.com

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  status,
  tags,
  seo_title,
  seo_description,
  published_at,
  cover_image
)
values (
  'Everything You Need to Know About Buying Art in India: Ultimate FAQ Guide',
  'art-buying-india-faq-guide',
  'A comprehensive FAQ pillar page answering 20+ questions about original art, prints, framing, dimensions, and styling in India.',
  'Buying art is a deeply personal and transformative experience, but it often comes with many practical questions. Whether you are curious about the difference between original paintings and digital prints, trying to figure out price ranges in India, or looking for framing tips, this guide has you covered.

Here is everything you need to know about buying, framing, and styling art in India, structured as quick, expert-verified answers.

<div class="faq-item">
  <p><strong>What is the difference between original art and a print?</strong></p>
  <p>Original art is a one-of-a-kind unique piece created directly by an artist using physical mediums like oils, acrylics, or watercolors. An art print is a high-quality digital or mechanical reproduction of an artwork on paper or canvas. While originals hold investment value, prints offer affordable styling flexibility.</p>
</div>

<div class="faq-item">
  <p><strong>How do I know if a painting is authentic?</strong></p>
  <p>To verify if a painting is authentic, always request a Certificate of Authenticity (COA) signed by the artist or representing gallery. Additionally, inspect the canvas surface for physical paint relief textures, verify the signature consistency, and trace the artist''s professional background, sales records, and exhibition history.</p>
</div>

<div class="faq-item">
  <p><strong>What art styles are popular in Indian homes?</strong></p>
  <p>Indian homes lean heavily toward styles that combine traditional warmth with modern design. Popular styles include textured abstract art, serene nature landscapes, bold botanicals, and contemporary interpretations of classic Indian folk motifs like Madhubani or Pichwai. These styles inject vibrant color, character, and cultural roots into modern living spaces.</p>
</div>

<div class="faq-item">
  <p><strong>How much does original art cost in India?</strong></p>
  <p>Original art prices in India depend on the artist''s career stage. Original canvases by emerging artists typically range from ₹10,000 to ₹30,000. Artworks by mid-career painters cost between ₹30,000 and ₹1,50,000, while established masterworks sell for lakhs. High-quality digital prints offer a budget-friendly starting point at ₹499.</p>
</div>

<div class="faq-item">
  <p><strong>Is art a good gift? What occasions suit it?</strong></p>
  <p>Art is an exceptionally thoughtful gift because it lasts a lifetime and conveys a deep personal connection. In India, framed art prints and canvas reproductions make perfect gifts for occasions like housewarmings, weddings, corporate milestones, and major festive celebrations like Diwali, offering aesthetic beauty that recipient families cherish.</p>
</div>

<div class="faq-item">
  <p><strong>How is abstract art different from modern art?</strong></p>
  <p>Abstract art uses non-representational elements like shapes, colors, textures, and gestural marks to convey feeling, completely free from physical reality. Modern art, however, refers to a specific historical art period spanning from the late 19th to mid-20th century, which encompasses abstract styles alongside impressionism, cubism, and surrealism.</p>
</div>

<div class="faq-item">
  <p><strong>What should I look for when buying portrait art?</strong></p>
  <p>When purchasing portrait art, look for emotional resonance, character expression, and harmonious anatomical proportions. Consider how the portrait''s color palette fits your wall colors. Muted, classic portraits add sophisticated elegance to studies and bedrooms, while stylized, high-contrast pop-art portraits serve as great conversation starters in living rooms.</p>
</div>

<div class="faq-item">
  <p><strong>How do I safely ship/receive artwork in India?</strong></p>
  <p>To safely ship artwork in India, protect the canvas face with acid-free glassine paper, wrap it in multiple layers of heavy bubble wrap, and pack it within a double-walled corrugated box or wooden crate. Unframed prints should be rolled and shipped inside thick, moisture-resistant cardboard mailing tubes.</p>
</div>

<div class="faq-item">
  <p><strong>What is digital art and is it valuable?</strong></p>
  <p>Digital art is original artwork created by artists using software, styluses, and drawing tablets. While the digital file itself can be copied, its value lies in high-quality physical outputs like limited-edition Giclée prints. These physical prints provide collectors with incredible resolution, color depth, and lasting value at accessible price points.</p>
</div>

<div class="faq-item">
  <p><strong>How do I decorate with nature photography?</strong></p>
  <p>To style your home with nature photography, select high-resolution landscape, forest, marine, or botanical prints to establish a relaxing focal point. Mount them in frames that match your wooden furniture or room trims, and hang them on neutral walls to bring calming, organic outdoor elements into your space.</p>
</div>

<div class="faq-item">
  <p><strong>Can digital art prints be framed with normal glass?</strong></p>
  <p>While you can use normal float glass for framing, lightweight, shatter-resistant acrylic is highly recommended. Acrylic is safer to ship across India, weighs less on your walls, and typically offers built-in UV-blocking properties that prevent rich digital ink colors from fading or yellowing under sunlight over the years.</p>
</div>

<div class="faq-item">
  <p><strong>What is a Giclée print?</strong></p>
  <p>A Giclée print is a museum-quality reproduction produced using advanced large-format inkjet printers loaded with specialized archival pigment-based inks. Printed on acid-free fine art paper or canvas, Giclée prints offer exceptional color accuracy, precise details, and a lifespan exceeding 100 years without noticeable fading or degradation.</p>
</div>

<div class="faq-item">
  <p><strong>What does GSM mean for art paper?</strong></p>
  <p>GSM stands for Grams per Square Meter, which measures the weight and thickness of the paper. For premium art prints, prioritize heavyweight papers ranging from 230 to 300 GSM. This ensures the paper feels sturdy, resists warping under heavy ink, and remains perfectly flat inside its frame.</p>
</div>

<div class="faq-item">
  <p><strong>How do I measure my wall for hanging prints?</strong></p>
  <p>First, measure the total width of your empty wall space. Ideally, your selected artwork should fill approximately 60% to 75% of that width. When hanging art above furniture like a bed or sofa, ensure the frame span is roughly two-thirds of the furniture''s total width for proper visual balance.</p>
</div>

<div class="faq-item">
  <p><strong>Does sun exposure damage art prints?</strong></p>
  <p>Yes, direct sun exposure emits ultraviolet rays that break down paint and ink pigments, causing colors to fade and paper to yellow. Protect your investment by hanging prints away from harsh sunbeams, or frame them with UV-filtering glass or professional acrylic shields to lock in original colors.</p>
</div>

<div class="faq-item">
  <p><strong>What is a canvas print stretch?</strong></p>
  <p>Canvas stretching is the process of pulling a canvas print tightly over a thick, wooden support structure known as stretcher bars, securing it with heavy-duty staples on the back. This creates a clean, frameless, modern look that allows the artwork to be hung directly on the wall.</p>
</div>

<div class="faq-item">
  <p><strong>Can I return digital downloads?</strong></p>
  <p>Generally, digital download purchases are non-refundable because files are delivered instantly and cannot be returned. However, premium platforms like Lurevi provide full support for download issues and offer free replacements for any physical, framed, or canvas prints that are damaged during transit or shipping.</p>
</div>

<div class="faq-item">
  <p><strong>What is the best height to hang a painting?</strong></p>
  <p>The industry standard height to hang a painting is at eye level, meaning the center of the artwork sits roughly 57 to 60 inches from the floor. This gallery-standard placement ensures comfortable viewing for guests and creates a balanced, harmonious look throughout your living space.</p>
</div>

<div class="faq-item">
  <p><strong>Should I buy art from independent artists?</strong></p>
  <p>Buying from independent artists supports creators directly, helps fund the creative community, and brings unique character to your home. Platforms like Lurevi connect you with verified artists, guaranteeing they receive fair royalty payments while ensuring you receive a technically audited, high-resolution print for your home.</p>
</div>

<div class="faq-item">
  <p><strong>How do I choose the correct frame color?</strong></p>
  <p>Select a frame color that complements both the dominant tones of the artwork and your wall paint. Matte black and natural oak frames are highly versatile choices that ground modern minimalist art, while clean white frames work beautifully to highlight bright, high-contrast, colorful compositions.</p>
</div>

<div class="faq-item">
  <p><strong>Do you ship framed art prints to all cities in India?</strong></p>
  <p>Yes, we ship premium framed art prints to over 19,000 pin codes across India, including major metros like Mumbai, Delhi, Bangalore, and Chennai, as well as tier-2 and tier-3 cities. All orders include free shipping, premium packaging, and real-time package transition tracking.</p>
</div>

<div class="faq-item">
  <p><strong>How do I clean and maintain my framed wall art?</strong></p>
  <p>To clean your framed art, gently wipe the frame and the acrylic front with a soft, dry microfiber cloth. Avoid spraying water or chemical glass cleaners directly onto the frame, as moisture can seep through the back and stain the paper print.</p>
</div>

*Need help selecting the perfect piece for your wall layout? Explore our curated catalog by style in [Lurevi Collections](https://lurevi.in/categories) or browse ready-to-buy framed works in [Art Shop](https://lurevi.in/shop).*',
  'published',
  array['buy art online India','art buying guide','home decor FAQ','art prints India'],
  'Buying Art in India: The Ultimate FAQ Pillar Guide | Lurevi',
  'Everything you need to know about buying art in India. Detailed, expert-verified answers to 20+ questions on original art, prints, framing, and decor.',
  now(),
  'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'
)
on conflict (slug)
do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  status = excluded.status,
  tags = excluded.tags,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  published_at = excluded.published_at,
  cover_image = excluded.cover_image,
  updated_at = now();
