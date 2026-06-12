'use client';

import { supabase } from './supabaseService';

export type BlogStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  status: BlogStatus;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string | null;
  status: BlogStatus;
  tags?: string[];
  seo_title?: string | null;
  seo_description?: string | null;
}

const TABLE = 'blog_posts';
const SEO_BLOG_PACK: BlogPostInput[] = [
  {
    title: 'Luxury Wall Art India: How to Choose Timeless Pieces for Modern Homes',
    slug: 'luxury-wall-art-india-guide',
    excerpt:
      'A practical buyer guide to selecting luxury wall art in India by room style, wall size, and budget.',
    content: `Luxury wall art in India is no longer limited to galleries. Today, homeowners can curate premium interiors by selecting statement pieces that match architecture, lighting, and lifestyle.

Start with room intent. Living rooms usually benefit from large focal art, while bedrooms perform better with softer palettes and textured compositions. The second rule is scale. Measure your wall and choose artwork that fills roughly 60-75% of available width for balanced visual impact.

When evaluating quality, prioritize high-resolution artwork, premium print materials, and framing quality. Look for clear product details on print finish, mounting, and color durability. These details separate generic decor from true luxury wall art.

If you are exploring collections, compare options on /categories and shortlist products in /shop before checkout. This approach keeps your selection process structured and avoids impulse mismatches.

The best luxury wall art is not only beautiful. It should improve mood, complement your furniture language, and feel cohesive with your home's story.`,
    status: 'published',
    tags: ['luxury wall art India', 'premium wall decor for home', 'modern wall art'],
    seo_title: 'Luxury Wall Art India: Premium Picks for Modern Homes | Lurevi',
    seo_description:
      'Discover how to choose luxury wall art in India. Learn sizing, style matching, and premium print tips for elegant modern interiors.',
    cover_image:
      'https://images.unsplash.com/photo-1549887534-1541e9326642?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Buy Digital Art Prints Online: A Smart Buyer Checklist',
    slug: 'buy-digital-art-prints-online-checklist',
    excerpt: 'Use this checklist to buy digital art prints online with confidence, quality, and style clarity.',
    content: `Buying digital art prints online is fast and convenient, but quality decisions matter. Start by identifying your room theme and desired mood. Then shortlist artworks that match your color palette and furniture tone.

Before purchase, check image resolution, print ratio options, and frame compatibility. Good stores provide clear previews and practical details. If specifications are vague, skip the product.

For best outcomes, compare 3-5 shortlisted pieces and place them against your room context. A print that looks great in isolation may feel crowded once placed near existing decor.

If you want a curated path, browse /categories first and complete selection on /shop. This route reduces overwhelm and improves product-page comparison.

Online art buying becomes easy when your process is simple: intent, shortlist, validate quality, then purchase.`,
    status: 'published',
    tags: ['buy digital art prints online', 'digital art prints', 'shop wall art'],
    seo_title: 'Buy Digital Art Prints Online: Complete Quality Checklist | Lurevi',
    seo_description:
      'Planning to buy digital art prints online? Follow this quality checklist to choose the right style, resolution, and room fit.',
    cover_image:
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Premium Wall Decor for Home: Styling Framework by Room',
    slug: 'premium-wall-decor-for-home-styling-framework',
    excerpt: 'A room-by-room framework to select premium wall decor that improves flow, focus, and luxury feel.',
    content: `Premium wall decor for home works best when planned by function. The entry area should create first impression. The living room should signal personality. Bedrooms should prioritize calm and emotional comfort.

Use a consistent visual rhythm across spaces: color family, line weight, and spacing. This keeps your decor premium rather than random. Accent walls can carry bold art while secondary walls should use lighter visual density.

Material and finish also matter. Textured prints, matte frame options, and balanced negative space often create a more upscale appearance than overly saturated alternatives.

Explore ideas in /categories and then shortlist purchasable options in /shop. Keep a maximum of 2-3 style directions for consistency across the house.

Premium decor is less about quantity and more about curation quality.`,
    status: 'published',
    tags: ['premium wall decor for home', 'luxury interiors', 'wall decor ideas'],
    seo_title: 'Premium Wall Decor for Home: Room-Wise Styling Guide | Lurevi',
    seo_description:
      'Design a premium look with this room-by-room wall decor framework. Choose refined artwork that fits modern home aesthetics.',
    cover_image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'How to Decorate with Wall Prints: Beginner-Friendly Step-by-Step Guide',
    slug: 'how-to-decorate-with-wall-prints-step-by-step',
    excerpt: 'A simple step-by-step method for decorating with wall prints without overfilling your space.',
    content: `If you are new to wall styling, begin with one anchor wall. Choose one statement print and two supporting pieces. Maintain similar tone but vary scale.

Step 1: Measure your wall.
Step 2: Choose your color direction.
Step 3: Select one hero print.
Step 4: Add supporting prints only if needed.
Step 5: Maintain spacing consistency.

Common mistakes include choosing prints that are too small, mixing unrelated color families, and hanging pieces too high. Keep center alignment close to eye level.

For quick curation, discover themes on /categories and compare final options on /shop.

Great wall print styling is built on proportion and intention, not quantity.`,
    status: 'published',
    tags: ['how to decorate with wall prints', 'wall print guide', 'home decor tips'],
    seo_title: 'How to Decorate with Wall Prints: Step-by-Step Guide | Lurevi',
    seo_description:
      'Learn how to decorate with wall prints using a practical 5-step method. Avoid common layout mistakes and style your home confidently.',
    cover_image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Indian Contemporary Art Online: What to Look for Before You Buy',
    slug: 'indian-contemporary-art-online-buying-guide',
    excerpt:
      'How to evaluate Indian contemporary art online by originality, style relevance, and quality specifications.',
    content: `Indian contemporary art online offers unmatched variety, but smart selection still requires structure. Start by defining your style direction: minimal, abstract, geometric, cultural-modern, or editorial.

Evaluate each artwork on three points: visual character, print quality, and contextual fit. The strongest selections feel modern while still emotionally warm in Indian home environments.

Look for clean product metadata, clear previews, and practical details about print quality. This is especially important when buying for primary spaces such as living rooms and studios.

Use /categories for discovery and /shop for purchase decisions. Keep a shortlist and compare side by side before final checkout.

Contemporary art purchases perform best when guided by long-term relevance, not short-term trend pressure.`,
    status: 'published',
    tags: ['Indian contemporary art online', 'contemporary art India', 'modern Indian interiors'],
    seo_title: 'Indian Contemporary Art Online: Smart Buying Guide | Lurevi',
    seo_description:
      'Explore Indian contemporary art online with confidence. Learn what to evaluate before buying for modern Indian homes.',
    cover_image:
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Modern Art Prints for Living Room: Layout and Color Strategy',
    slug: 'modern-art-prints-for-living-room-layout-guide',
    excerpt: 'Use this layout and color strategy to choose modern art prints for your living room like a designer.',
    content: `The living room is your highest-impact visual zone. Modern art prints for living room styling should be based on furniture shape, wall ratio, and lighting direction.

Start with your largest wall. If your sofa is long, use either one large print or a balanced multi-frame set. Keep artwork width around two-thirds of sofa width for proportion.

Color strategy: match one dominant room color and one accent color from your print. This creates cohesion without visual monotony.

Need options quickly? Browse /categories for modern styles and finalize ready-to-buy picks in /shop.

When in doubt, choose cleaner compositions with fewer elements. Modern spaces benefit from clarity and breathing room.`,
    status: 'published',
    tags: ['modern art prints for living room', 'living room wall art', 'modern wall prints'],
    seo_title: 'Modern Art Prints for Living Room: Complete Styling Guide | Lurevi',
    seo_description:
      'Choose modern art prints for living room spaces using proven layout and color rules. Improve balance, style, and visual depth.',
    cover_image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Digital Art Download High Resolution: Why Quality Specs Matter',
    slug: 'digital-art-download-high-resolution-quality-guide',
    excerpt: 'Understand high-resolution digital art specs so your prints remain sharp at every size.',
    content: `A digital art download is only valuable if resolution is handled correctly. High-resolution files preserve detail, color edges, and texture depth when printed at large sizes.

Before purchase, check available dimensions and print ratio compatibility. A mismatch between file ratio and frame size can lead to cropping issues.

For home decor use, always prioritize clarity at your target print size. Lower-quality files may look fine on screen but lose fidelity in physical output.

Browse /shop for ready options and compare quality details before selecting. You can also use /categories to find styles suited for larger print displays.

Resolution quality is the hidden factor that separates premium outcomes from average prints.`,
    status: 'published',
    tags: ['digital art download high resolution', 'high resolution art prints', 'digital print quality'],
    seo_title: 'Digital Art Download High Resolution: Print Quality Guide | Lurevi',
    seo_description:
      'Learn how to evaluate high-resolution digital art downloads for sharp, premium print results across different frame sizes.',
    cover_image:
      'https://images.unsplash.com/photo-1618005182384-ae9021a400a0?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Art Prints Gift India: Elegant Gift Ideas That Feel Personal',
    slug: 'art-prints-gift-india-ideas',
    excerpt: 'Gift-ready art print ideas in India for housewarmings, anniversaries, and premium personal gifting.',
    content: `Art prints are one of the most thoughtful modern gifts because they combine design and emotion. In India, gift-worthy wall art performs especially well for housewarmings, weddings, and milestone celebrations.

Choose by recipient profile: calm palettes for minimal homes, bold compositions for expressive personalities, and neutral contemporary prints for universal appeal.

Presentation matters. Frame-ready prints with clean typography and premium material cues feel significantly more valuable as gifts.

To shortlist options quickly, start on /shop and validate style themes in /categories.

A good art gift is not generic. It should match the recipient's space, taste, and moment.`,
    status: 'published',
    tags: ['art prints gift India', 'home decor gifts', 'gift wall art'],
    seo_title: 'Art Prints Gift India: Premium Gift Ideas for Every Occasion | Lurevi',
    seo_description:
      'Discover premium art prints gift ideas in India for weddings, housewarmings, and personal milestones with elegant style fit.',
    cover_image:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Framed Art Prints for Bedroom India: Soft Luxury Styling Tips',
    slug: 'framed-art-prints-for-bedroom-india',
    excerpt: 'Design a calm, premium bedroom feel with framed art prints curated for Indian homes.',
    content: `Framed art prints for bedroom spaces should enhance calm and comfort. In Indian homes, warm neutrals, muted abstract forms, and balanced frame finishes usually perform best for rest-focused interiors.

Placement rule: hang artwork centered above the bed or on the opposite focal wall. Keep spacing and frame height consistent for a clean, premium look.

Avoid over-saturation in bedroom visuals. Softer tones and moderate contrast create a more relaxing environment.

Use /categories to discover bedroom-friendly styles and complete buying decisions on /shop.

Bedroom art should support emotional reset. That is why composition and palette are as important as subject matter.`,
    status: 'published',
    tags: ['framed art prints for bedroom India', 'bedroom wall art', 'framed decor India'],
    seo_title: 'Framed Art Prints for Bedroom India: Luxury Styling Guide | Lurevi',
    seo_description:
      'Find the best framed art prints for bedroom spaces in India. Learn placement, palette, and frame choices for a calm luxury look.',
    cover_image:
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Unique Home Decor Gifts Online: Curated Picks That Stand Out',
    slug: 'unique-home-decor-gifts-online-curated-picks',
    excerpt: 'A curated guide to unique home decor gifts online with style-first and premium intent.',
    content: `Unique home decor gifts online are best selected by space utility and personal style. Gifts that integrate with daily living spaces feel memorable and long-lasting.

When selecting decor gifts, prioritize versatile styles that can fit living rooms, bedrooms, or home offices. Contemporary prints and refined visual themes generally have higher acceptance across taste profiles.

Look for stores with clear product context and quality details. Ambiguity reduces confidence and gifting quality.

You can discover options through /categories and finalize curated products via /shop. Keep your shortlist focused to avoid style dilution.

Great decor gifting feels personal, elegant, and useful in real homes.`,
    status: 'published',
    tags: ['unique home decor gifts online', 'decor gift ideas', 'premium home gifts'],
    seo_title: 'Unique Home Decor Gifts Online: Curated Premium Ideas | Lurevi',
    seo_description:
      'Shop unique home decor gifts online with curated premium picks that suit modern homes and thoughtful gifting occasions.',
    cover_image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Digital illustration explained',
    slug: 'digital-illustration-guide',
    excerpt: 'Learn what digital illustration is, from its key styles and professional tools to tips on buying the best high-quality prints for your home in India.',
    content: `Digital illustration has transformed how we create, share, and decorate our homes with art. By combining traditional artistic techniques with cutting-edge software, digital illustrators produce stunning, high-fidelity visuals that look spectacular when printed. In this guide, we’ll explore the fundamentals of digital illustration, dive into the three main styles, examine the tools professionals use, and explain how to choose and buy high-quality prints for your home in India.

## What is Digital Illustration?

At its core, digital illustration is the use of digital tools—such as graphics tablets, styluses, and software—to create original artwork. Unlike digital photography or photo manipulation, digital illustration is drawn or painted from scratch, stroke by stroke, just like traditional art on canvas or paper. 

Because it is created in a digital environment, artists have access to an infinite color palette, layers for complex compositions, and the ability to scale their artwork without losing quality. This results in clean lines, precise shading, and vibrant color gradients that look exceptionally rich on physical prints.

## Three Popular Styles of Digital Illustration

While the possibilities are endless, three distinct styles dominate modern home decor and digital galleries:

### 1. Flat Illustration
Flat illustration relies on clean shapes, minimal detail, and two-dimensional depth. It uses bold color palettes and strong geometries rather than realistic shading or textures.
- **The Look**: Clean, modern, graphic, and visually striking.
- **Home Fit**: Perfect for mid-century modern, Scandinavian, or minimalist interiors. It brings a pop of structured color to clean spaces.

### 2. Line Art
Line art focuses on lines and strokes over solid fills or complex shading. It can range from single-line drawings (where the stylus never leaves the screen) to complex, detailed hatching.
- **The Look**: Elegant, delicate, abstract, and sophisticated.
- **Home Fit**: Ideal for modern bedrooms, study areas, or gallery walls. Muted line art creates a calming, luxury feel.

### 3. Painterly Illustration
Painterly illustration mimics traditional mediums like oil paint, acrylic, watercolor, or gouache. Artists use advanced digital brushes that simulate the texture, blending, and physical weight of real paint.
- **The Look**: Textured, deep, warm, and highly expressive.
- **Home Fit**: Adds character and emotional depth to living rooms, dining rooms, and hallways.

## The Tools of the Trade

Creating these beautiful pieces requires a balance of powerful hardware and professional software. Here are the tools digital artists rely on:

### Hardware: Graphics Tablets & Screens
- **Pen Displays (e.g., Wacom Cintiq, XP-Pen)**: High-resolution screens that artists draw directly on with a stylus. These offer the highest level of precision and pressure sensitivity.
- **iPad Pro & Apple Pencil**: The industry favorite for mobile illustration, powered by Procreate.
- **Pen Tablets (e.g., Wacom Intuos)**: Drawing pads without screens that connect to a computer monitor, requiring the artist to look at the screen while drawing.

### Software: Vector vs. Raster
- **Procreate (iOS)**: The leading tool for raster illustration and painterly styles, beloved for its intuitive brushes and smooth performance.
- **Adobe Photoshop (Windows/macOS)**: The gold standard for detailed digital painting, offering unmatched texturing and layout control.
- **Adobe Illustrator (Vector)**: The industry standard for vector-based flat illustration. Vector graphics can scale infinitely without pixelation, making them perfect for extra-large wall prints.

## How to Buy Quality Digital Prints in India

If you want to bring digital illustration into your physical space, buying high-quality prints requires attention to material, finish, and detail. Here is what to look for when shopping online in India:

### 1. Resolution & Scale
Ensure the artwork is printed from high-resolution files. A print size of 12x18 inches or larger requires at least 300 DPI (dots per inch) to prevent blurry lines and pixelation. Good online stores explicitly specify their print resolution.

### 2. Paper Quality (Gsm & Coating)
Cheap posters are printed on thin paper that wrinkles easily. For a premium, luxury look, choose:
- **Paper Weight**: At least 220–300 GSM (Grams per Square Meter) archival-grade paper.
- **Finish**: A matte or fine art textured finish. Avoid glossy paper for wall art, as it creates harsh reflections from overhead room lights.

### 3. Professional Framing
High-quality framing preserves the artwork and elevates your wall aesthetic. Opt for:
- Lightweight, durable frames (like fiberwood or wood composites) in neutral tones (matte black, natural oak, or pristine white).
- Shatter-resistant acrylic instead of heavy glass, which can break in transit and reflect too much glare.

### 4. Explore Curated Portals
Instead of generic marketplaces, shop at platforms dedicated to digital art and contemporary prints. For example, you can discover categorized themes on [Art Collections](https://lurevi.in/categories) and purchase premium, ready-to-hang framed prints in the [Art Shop](https://lurevi.in/shop).

<div class="my-8 p-6 bg-pink-50/50 rounded-2xl border border-pink-100/60">
  <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">Featured Digital Illustration Prints</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <img src="https://images.unsplash.com/photo-1618005182384-ae9021a400a0?w=600&q=80&auto=format&fit=crop" alt="Abstract Lines Illustration" class="w-full h-48 object-cover" />
      <div class="p-4">
        <h4 class="font-semibold text-gray-800 text-sm">Minimalist Abstract Lines</h4>
        <p class="text-xs text-gray-500 mt-1">Perfect modern line art for living rooms and bedrooms.</p>
        <div class="mt-3 flex items-center justify-between">
          <span class="text-sm font-semibold text-pink-600">From ₹499</span>
          <a href="https://lurevi.in/shop" target="_blank" rel="noopener noreferrer" class="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded text-xs font-medium transition-colors">View Product</a>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <img src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80&auto=format&fit=crop" alt="Vibrant Botanical Illustration" class="w-full h-48 object-cover" />
      <div class="p-4">
        <h4 class="font-semibold text-gray-800 text-sm">Vibrant Botanical Flora</h4>
        <p class="text-xs text-gray-500 mt-1">Colorful flat art to bring nature and warmth into your space.</p>
        <div class="mt-3 flex items-center justify-between">
          <span class="text-sm font-semibold text-pink-600">From ₹499</span>
          <a href="https://lurevi.in/shop" target="_blank" rel="noopener noreferrer" class="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded text-xs font-medium transition-colors">View Product</a>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="text-center mt-8">
  <a href="https://lurevi.in/categories/illustration" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-semibold transition-colors shadow-sm hover:shadow-md">
    Browse Illustration Prints
  </a>
</div>`,
    status: 'published',
    tags: ['digital illustration', 'buy digital art prints online', 'digital art prints'],
    seo_title: 'Digital Illustration Explained | Lurevi',
    seo_description:
      'Learn what digital illustration is and how to choose the best digital illustration prints for your home.',
    cover_image:
      'https://images.unsplash.com/photo-1618005182384-ae9021a400a0?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'How Digital Art Painting is Made: From Screen to Your Wall',
    slug: 'how-digital-art-painting-is-made',
    excerpt:
      'Ever wondered how a digital painting transitions from a glowing screen to a stunning physical masterpiece on your wall? Discover the tools, techniques, printing processes, and paper types that make it possible.',
    content: `<p>Digital art has redefined the boundaries of modern home decor. While traditional paintings on canvas will always hold their classic appeal, the world of digital painting offers a fresh, vibrant, and highly detailed alternative for modern interiors.</p>

<p>However, a common question remains: <em>How is a digital painting actually made?</em> And more importantly, *how does a file created on a screen transform into a premium, museum-quality print hanging on your living room wall?*</p>

<p>This guide demystifies the entire digital painting process, explaining the creative tools, technical conversions, fine art paper selection, and precision framing required to bring high-end art into your space.</p>

<hr />

<h2>Step 1: The Creative Spark — Drawing on the Digital Canvas</h2>

<p>The journey of any digital painting begins exactly like a traditional one: with a blank canvas and an artist's vision. However, instead of physical easel boards, brushes, and wet palettes, digital artists work on advanced hardware displays.</p>

<h3>Pen Displays and Styluses</h3>
<p>To capture the direct organic flow of hand movements, professional artists use <strong>pen displays</strong> (such as the Wacom Cintiq, iPad Pro, or XP-Pen tablets). These devices allow the artist to draw directly onto a high-definition screen.</p>

<p>The magic lies in the <strong>stylus</strong> (like the Apple Pencil or Wacom Pro Pen). Modern styluses feature over 8,000 levels of pressure sensitivity and tilt detection. If the artist presses lightly, they get a faint, thin line; if they press harder, the stroke becomes thick and bold—mimicking real graphite or ink perfectly.</p>

<h3>Professional Creation Software</h3>
<p>Digital artists utilize powerful drawing engines to simulate traditional mediums:</p>
<ul>
  <li><strong>Procreate (iOS)</strong>: The leading standard for sketch design and mobile <a href="/blog/digital-illustration-guide">digital illustration</a>. It is loved for its responsive brush engine.</li>
  <li><strong>Adobe Photoshop (desktop)</strong>: The gold standard for complex digital painting, offering advanced layering, custom textures, and rich color-blending algorithms.</li>
  <li><strong>Adobe Illustrator</strong>: Used primarily for vector-based styles. Unlike raster graphics (pixels), vectors use mathematical coordinates, making them infinitely scalable without losing sharpness.</li>
</ul>

<p>Through these tools, an artist builds the piece layer by layer, working on background tones, midground details, highlights, and fine textures.</p>

<hr />

<h2>Step 2: The Translation — Converting Pixels to Physical Colors</h2>

<p>Creating the artwork on screen is only half the battle. A screen displays color using <strong>light</strong>, whereas a printer displays color using <strong>physical ink</strong>. Bridging this gap requires precise technical handling.</p>

<h3>The RGB to CMYK Shift</h3>
<p>Screens operate in the <strong>RGB</strong> color space (Red, Green, Blue light). Printers, however, use the <strong>CMYK</strong> system (Cyan, Magenta, Yellow, and Key/Black ink). Because light has a wider color spectrum than physical ink, some vibrant neon colors visible on screen cannot be printed exactly.</p>

<p>To ensure color accuracy, artists and print technicians perform a process called <strong>soft proofing</strong>. They convert color profiles using standards like <em>Adobe RGB (1998)</em> or *U.S. Web Coated (SWOP)*, carefully adjusting color values so the physical print matches the screen design perfectly.</p>

<h3>Resolution (DPI)</h3>
<p>If you stretch a small image over a large wall, it will look blurry and pixelated. To make sharp, high-quality <a href="/categories/digital-art-prints">digital art prints</a>, the digital file must be configured to at least <strong>300 DPI</strong> (Dots Per Inch) at its final physical printing size. This high resolution ensures that every brushstroke and texture remains crisp and detailed on your wall.</p>

<hr />

<h2>Step 3: Material Excellence — Choosing the Right Paper and Canvas</h2>

<p>The substrate onto which an artwork is printed determines its texture, color depth, and lifespan. For premium <a href="/categories/digital-art-prints">wall art prints India</a>, two main materials are used:</p>

<h3>1. Archival Matte Paper (200–230 GSM)</h3>
<p>Cheap posters are printed on thin, glossy paper that wrinkles, tears, and causes annoying reflections under room lighting. Premium prints use heavy-weight <strong>archival matte paper</strong> (typically 200 to 230 GSM).</p>
<ul>
  <li><strong>GSM (Grams per Square Meter)</strong>: Measures paper density and thickness. Heavy paper prevents warping.</li>
  <li><strong>Matte Finish</strong>: Eliminates glare, allowing the artwork's colors to remain deep and visible from any angle.</li>
  <li><strong>Archival Quality</strong>: Made from acid-free wood pulp or cotton fibers, preventing the paper from turning yellow or brittle over time.</li>
</ul>

<h3>2. Fine Art Canvas (350+ GSM)</h3>
<p>For a more traditional gallery look, digital paintings are printed on premium canvas. Thick, textured canvas (around 350 GSM) gives the print a physical depth that replicates traditional oil or acrylic paintings.</p>

<hr />

<h2>Step 4: The Printing Pipeline — Giclée Craftsmanship</h2>

<p>You cannot print fine art on a standard home office printer. Professional art studios utilize a process known as <strong>Giclée printing</strong> (derived from the French word <em>gicler</em>, meaning "to spray").</p>

<p>Standard printers use dye-based inks and only 4 color cartridges. Giclée printers are large-format inkjet machines that use:</p>
<ul>
  <li><strong>10 to 12 Pigment-Based Inks</strong>: Using a wider array of pigments allows the printer to achieve smooth gradients and reach colors that traditional CMYK printers cannot.</li>
  <li><strong>Archival Pigments</strong>: Pigment inks are highly resistant to UV rays, meaning your artwork won't fade under indoor light. When paired with acid-free paper, a Giclée print will retain its original colors for over 100 years.</li>
</ul>

<p>This printing step is what turns a digital file into a true museum-quality collectible.</p>

<hr />

<h2>Step 5: Framing and Wall Presentation</h2>

<p>The final step is framing, which protects the print and integrates it into your home's architecture.</p>
<ul>
  <li><strong>The Frame</strong>: Clean profiles in matte black, natural oak, or pristine white are preferred for contemporary spaces. They frame the art without competing with its subject matter.</li>
  <li><strong>Protective Acrylic</strong>: Standard glass is heavy, reflects glare, and breaks easily in transit. High-quality prints are framed with lightweight, shatter-resistant, UV-blocking <strong>acrylic shields</strong> to preserve the artwork.</li>
  <li><strong>Hanging Tips</strong>: To style your home like a gallery, hang the center of the print at eye level (roughly 57 to 60 inches from the floor). Ensure the frame fills 60-75% of the wall width above a sofa or bed for optimal visual balance.</li>
</ul>

<hr />

<h2>Bring Premium Digital Art to Your Home</h2>

<p>Understanding <a href="/blog/what-is-digital-art">what is digital art</a> and how it is made makes you appreciate the incredible technology and human effort that goes into every piece. Choosing <a href="/blog/affordable-wall-art-high-end-look-india">affordable wall art India</a> with high-end print standards is the smartest way to elevate your space.</p>

<p>If you are looking to start or expand your collection, check out curated themes across <a href="/categories">Art Collections</a> or shop premium framed pieces in our <a href="/shop">Art Shop</a>.</p>

<div class="my-8 p-6 bg-stone-50 rounded-2xl border border-stone-100/60 font-sans">
  <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">Featured Digital Art Prints</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <img src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80&auto=format&fit=crop" alt="Abstract Painting Print" class="w-full h-48 object-cover" />
      <div class="p-4">
        <h4 class="font-semibold text-gray-800 text-sm">Vibrant Abstract Expression</h4>
        <p class="text-xs text-gray-500 mt-1 font-sans font-sans">Stunning digital brushstrokes printed on 230 GSM archival matte paper.</p>
        <div class="mt-3 flex items-center justify-between">
          <span class="text-sm font-semibold text-stone-900">From ₹499</span>
          <a href="/shop" class="px-3 py-1 bg-black hover:bg-stone-900 text-white rounded text-xs font-medium transition-colors font-sans">View Product</a>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&q=80&auto=format&fit=crop" alt="Modern Digital Landscape" class="w-full h-48 object-cover" />
      <div class="p-4">
        <h4 class="font-semibold text-gray-800 text-sm">Minimalist Digital Landscape</h4>
        <p class="text-xs text-gray-500 mt-1 font-sans font-sans">Calming geometric design, perfect for bedroom and living space styling.</p>
        <div class="mt-3 flex items-center justify-between">
          <span class="text-sm font-semibold text-stone-900">From ₹499</span>
          <a href="/shop" class="px-3 py-1 bg-black hover:bg-stone-900 text-white rounded text-xs font-medium transition-colors font-sans">View Product</a>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="text-center mt-8">
  <a href="/categories/digital-art" class="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-stone-900 text-white rounded-xl font-semibold transition-colors shadow-sm hover:shadow-md font-sans">
    Explore Digital Art Prints
  </a>
</div>`,
    status: 'published',
    tags: ['digital art prints', 'digital painting process', 'archival paper prints', 'wall art prints India', 'home decor tips'],
    seo_title: 'How Digital Art Painting is Made: From Screen to Wall | Lurevi',
    seo_description:
      'Discover the step-by-step process of how digital art paintings are created, proofed, printed on museum-grade archival paper, and framed for modern homes.',
    cover_image:
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=80&auto=format&fit=crop',
  },
];

function normalizeRow(row: any): BlogPost {
  return {
    id: row.id,
    title: row.title || '',
    slug: row.slug || '',
    excerpt: row.excerpt || '',
    content: row.content || '',
    cover_image: row.cover_image || null,
    status: (row.status || 'draft') as BlogStatus,
    tags: Array.isArray(row.tags) ? row.tags : [],
    seo_title: row.seo_title || null,
    seo_description: row.seo_description || null,
    published_at: row.published_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export class BlogService {
  static BLOG_IMAGES_BUCKET = process.env.NEXT_PUBLIC_BLOG_IMAGES_BUCKET || 'blog-images';

  static async getAdminPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeRow);
  }

  static async getPublicPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeRow);
  }

  static async getBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data ? normalizeRow(data) : null;
  }

  static async createPost(input: BlogPostInput): Promise<BlogPost> {
    const slug = input.slug.toLowerCase().trim();
    const tags = input.tags || [];
    const cover =
      input.cover_image === undefined || input.cover_image === null
        ? null
        : String(input.cover_image).trim() || null;

    const payload = {
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt.trim(),
      content: input.content.trim(),
      cover_image: cover,
      status: input.status,
      tags,
      seo_title: input.seo_title?.trim() || null,
      seo_description: input.seo_description?.trim() || null,
      published_at: input.status === 'published' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select('*')
      .single();

    if (error) throw error;
    return normalizeRow(data);
  }

  static async updatePost(id: string, input: BlogPostInput): Promise<BlogPost> {
    const slug = input.slug.toLowerCase().trim();
    const tags = input.tags || [];
    const cover =
      input.cover_image === undefined || input.cover_image === null
        ? null
        : String(input.cover_image).trim() || null;

    const { data: existing, error: fetchErr } = await supabase
      .from(TABLE)
      .select('published_at, status')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    let published_at: string | null = null;
    if (input.status === 'published') {
      if (existing?.status === 'published' && existing?.published_at) {
        published_at = existing.published_at;
      } else {
        published_at = new Date().toISOString();
      }
    }

    const payload = {
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt.trim(),
      content: input.content.trim(),
      cover_image: cover,
      status: input.status,
      tags,
      seo_title: input.seo_title?.trim() || null,
      seo_description: input.seo_description?.trim() || null,
      published_at,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return normalizeRow(data);
  }

  static async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async uploadCoverImage(file: File, slugHint?: string): Promise<string> {
    if (!file) throw new Error('No image file selected.');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid image type. Use JPG, PNG, WEBP, or GIF.');
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error('Image size must be 10MB or less.');
    }

    const extension = file.name.split('.').pop() || 'jpg';
    const safeSlug = (slugHint || 'blog')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    const path = `${safeSlug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(this.BLOG_IMAGES_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      if (uploadError.message.toLowerCase().includes('bucket')) {
        throw new Error(
          `Storage bucket '${this.BLOG_IMAGES_BUCKET}' not found. Create it in Supabase Storage and make it public.`
        );
      }
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from(this.BLOG_IMAGES_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('Failed to generate public image URL.');
    return data.publicUrl;
  }

  static getSeoBlogPack(): BlogPostInput[] {
    return SEO_BLOG_PACK;
  }

  static async upsertSeoBlogPack(): Promise<number> {
    const rows = SEO_BLOG_PACK.map((post, index) => ({
      ...post,
      published_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    }));
    const { error } = await supabase
      .from(TABLE)
      .upsert(rows, { onConflict: 'slug' });
    if (error) throw error;
    return rows.length;
  }
}

