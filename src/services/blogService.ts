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
    const payload = {
      ...input,
      slug: input.slug.toLowerCase().trim(),
      tags: input.tags || [],
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
    const payload = {
      ...input,
      slug: input.slug.toLowerCase().trim(),
      tags: input.tags || [],
      published_at: input.status === 'published' ? new Date().toISOString() : null,
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

