const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const post = {
  title: 'Digital Illustration for Every Room: A Home Decor Guide',
  slug: 'digital-illustration-home-decor',
  excerpt: 'A complete room-by-room guide to decorating your Indian home with digital illustration and digital wall painting prints.',
  status: 'published',
  tags: ['digital illustration', 'digital wall painting', 'home decor India', 'wall art', 'digital prints'],
  seo_title: 'Digital Illustration for Every Room: A Home Decor Guide | Lurevi',
  seo_description: "Style your home with digital illustration prints — room-by-room ideas from Lurevi's curated collection. Living room, bedroom, home office and more.",
  cover_image: 'https://images.unsplash.com/photo-1594498653386-3dd94132b4b4?w=1200&q=80&auto=format&fit=crop',
  content: `<header class="post-header">
  <h2>A complete room-by-room guide to decorating your Indian home with digital illustration and digital wall painting prints.</h2>
</header>

<section class="post-content">
  <p>Digital illustration has revolutionized interior styling. With their sharp details and vibrant (or subtle) tones, digital wall painting prints are incredibly versatile, slipping seamlessly into modern Indian homes. Whether you're refreshing a cozy reading nook or making a grand statement in your living room, there's a perfect digital art piece waiting for you.</p>

  <h3>Living Room: The Grand Statement</h3>
  <p>Your living room is the heart of the house—it sets the tone for guests and serves as a gathering space for family. This is where you can go big.</p>
  <h4>Choosing the Right Piece</h4>
  <p>Look for expansive digital illustrations that command attention. Abstract digital paintings or detailed architectural sketches work beautifully above a sofa. Ensure the subject matter complements your furniture layout without overwhelming it.</p>
  <h4>Styling Tip</h4>
  <p>Hang a large A1 or A2 print as a standalone feature, or create a symmetrical gallery wall of three A3 prints for a sophisticated, balanced look.</p>

  <h3>Bedroom: A Serene Retreat</h3>
  <p>Bedrooms demand tranquility. The artwork you choose should foster relaxation and comfort after a long day.</p>
  <h4>Choosing the Right Piece</h4>
  <p>Soft digital watercolor-style prints or minimalist line art are ideal. Consider botanical digital illustrations or calming landscapes that draw the eye but don't overstimulate.</p>
  <h4>Styling Tip</h4>
  <p>Place a pair of complementary prints above the headboard. Opt for frames in natural wood or sleek white to maintain an airy feel.</p>

  <h3>Home Office: Fueling Productivity</h3>
  <p>With remote work becoming standard, your home office needs to strike a balance between professional and inspiring.</p>
  <h4>Choosing the Right Piece</h4>
  <p>Geometric digital art or motivational typographic illustrations work well here. The key is to select pieces that keep you focused but offer a visual break from the screen.</p>
  <h4>Styling Tip</h4>
  <p>Rest a framed print directly on your desk or mount a grid of smaller A4 prints behind your monitor for an engaging background during video calls.</p>

  <h3>Dining Area: Sparking Conversation</h3>
  <p>Art in the dining room should be appetizing and convivial. It's the perfect spot for pieces that tell a story.</p>
  <h4>Choosing the Right Piece</h4>
  <p>Vibrant digital food illustrations, abstract color splashes, or culturally rich Indian contemporary themes can enliven the space and serve as great icebreakers.</p>
  <h4>Styling Tip</h4>
  <p>Ensure the center of the artwork is hung at eye level for someone sitting at the dining table, rather than standing.</p>

  <h3>Hallways and Entryways: The First Impression</h3>
  <p>Don't neglect the transitional spaces! Entryways give visitors their first glimpse of your personal style.</p>
  <h4>Choosing the Right Piece</h4>
  <p>Bold, welcoming digital prints or a series of smaller, related illustrations can guide guests through the space. These areas are great for experimenting with quirkier pieces.</p>
  <h4>Styling Tip</h4>
  <p>A vertical arrangement of prints works wonders on narrow hallway walls, instantly making the ceiling feel higher.</p>
</section>

<section class="faq-section">
  <h2>Frequently Asked Questions</h2>
  
  <details>
    <summary>How do I match digital art with my existing furniture?</summary>
    <p>Pull one accent colour from your furniture or cushions and look for prints that feature that colour. For neutral interiors, almost any print works — bold colours will pop, muted tones will harmonise. For colourful Indian interiors, choose prints with a dominant neutral that grounds the composition.</p>
  </details>

  <details>
    <summary>Can I order custom-size digital art prints from Lurevi?</summary>
    <p>Yes. Lurevi offers standard sizes (A4, A3, A2, A1) and custom sizing on request. Write to us at <a href="mailto:hello@lurevi.in">hello@lurevi.in</a> with your wall dimensions and we'll advise on the best fit.</p>
  </details>
</section>`
};

async function insertBlog() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .upsert(post, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error('Error inserting blog:', error);
    } else {
      console.log('Successfully inserted blog post:', data[0]?.slug);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

insertBlog();
