export interface CategoryExplainer {
  title: string;
  description: string;
  benefitsTitle: string;
  benefits: string[];
  ctaText: string;
}

export const CATEGORY_EXPLAINERS: Record<string, CategoryExplainer> = {
  'luxury-wall-art': {
    title: 'What Is Luxury Wall Art?',
    description: 'Luxury wall art represents premium, curated digital and fine art designs selected to elevate modern interiors. Printed on high-weight archival canvas or museum-grade matte paper, these pieces combine visual refinement, rich color palettes, and standard-setting clarity to serve as elegant statement anchors in living rooms, luxury homes, and executive offices.',
    benefitsTitle: 'Why collectors choose luxury wall art:',
    benefits: [
      'Archival-grade giclée prints designed to resist fading for 75+ years',
      'Museum-quality heavy media (240+ GSM paper or 350 GSM canvas)',
      'Curated contemporary designs that fit upscale and modern spaces',
      'Supports independent artists with license payouts for each piece'
    ],
    ctaText: "Explore Lurevi's Luxury Collection →"
  },
  abstract: {
    title: 'What Is Abstract Art?',
    description: 'Abstract art moves away from realistic representation, using shapes, colors, forms, and lines to express ideas and emotions. Unlike figurative art, abstract pieces invite personal interpretation — the same painting can evoke entirely different responses in different viewers. Abstract art has been central to modern art movements since the early 20th century.',
    benefitsTitle: 'Why collectors choose abstract art:',
    benefits: [
      'Versatile — complements diverse interior styles',
      'Emotionally resonant without narrative constraints',
      'Strong conversation pieces in living and workspace',
      'Broad price range accessible to first-time collectors'
    ],
    ctaText: "Browse Lurevi's Abstract Collection →"
  },
  paintings: {
    title: 'What Is Painting Art?',
    description: 'Traditional and contemporary paintings represent one of the oldest forms of human expression. Using physical or digital brushes, artists apply color pigments to surfaces to capture light, shadow, texture, and depth. From classic oils and acrylics to modern digital paintings, original strokes and textures add organic beauty and artistic sophistication to any wall.',
    benefitsTitle: 'Why collectors choose paintings:',
    benefits: [
      'Authentic texture and painterly depth that feels alive',
      'Timeless appeal that spans generations and decor cycles',
      'Direct representation of the artist\'s personal touch and vision',
      'Adds rich focal warmth to living rooms and entryways'
    ],
    ctaText: "Browse Lurevi's Paintings Collection →"
  },
  photography: {
    title: 'What Is Fine Art Photography?',
    description: 'Fine art photography goes beyond simple documentation to convey the photographer\'s creative vision and emotional intent. Using masterfully controlled lighting, focus, perspective, and composition, fine art photography captures moments, structures, and stories in high-definition clarity. It transforms physical spaces into atmospheric, modern experiences.',
    benefitsTitle: 'Why collectors choose photography:',
    benefits: [
      'Real-world realism combined with striking artistic perspective',
      'High-definition clarity and precision framing opportunities',
      'Perfect for sleek, modern, industrial, or minimalist interiors',
      'Creates a strong, clean visual impact on large statement walls'
    ],
    ctaText: "Browse Lurevi's Photography Collection →"
  },
  nature: {
    title: 'What Is Nature Art?',
    description: 'Nature art captures the serenity, energy, and organic patterns of the natural world, bringing elements of the outdoors inside. Ranging from lush forest photography and ocean landscapes to botanical prints, nature art is visually calming and emotionally grounding. It helps reduce stress and establishes a tranquil atmosphere in busy homes.',
    benefitsTitle: 'Why collectors choose nature art:',
    benefits: [
      'Establishes a soothing, relaxing, and therapeutic atmosphere',
      'Promotes natural wellness and brings organic colors indoors',
      'Versatile styles fitting bedrooms, offices, and dining spaces',
      'Universally loved theme that connects people across age groups'
    ],
    ctaText: "Browse Lurevi's Nature Collection →"
  },
  portrait: {
    title: 'What Is Portrait Art?',
    description: 'Portrait art focuses on capturing the likeness, expression, and mood of human subjects. Beyond physical features, a powerful portrait explores the inner depth, personality, and emotion of the individual. Ranging from classical charcoal and oil styles to modern high-contrast pop-art, portraits introduce human connection and focal intrigue to walls.',
    benefitsTitle: 'Why collectors choose portrait art:',
    benefits: [
      'Adds a strong sense of personality and human connection to rooms',
      'Serves as an excellent, thought-provoking conversation starter',
      'Sophisticated, classical, or expressive pop-art styling options',
      'Highly effective as an eye-catching focal piece in main halls'
    ],
    ctaText: "Browse Lurevi's Portrait Collection →"
  },
  portraits: {
    title: 'What Is Portrait Art?',
    description: 'Portrait art focuses on capturing the likeness, expression, and mood of human subjects. Beyond physical features, a powerful portrait explores the inner depth, personality, and emotion of the individual. Ranging from classical charcoal and oil styles to modern high-contrast pop-art, portraits introduce human connection and focal intrigue to walls.',
    benefitsTitle: 'Why collectors choose portrait art:',
    benefits: [
      'Adds a strong sense of personality and human connection to rooms',
      'Serves as an excellent, thought-provoking conversation starter',
      'Sophisticated, classical, or expressive pop-art styling options',
      'Highly effective as an eye-catching focal piece in main halls'
    ],
    ctaText: "Browse Lurevi's Portrait Collection →"
  },
  digital: {
    title: 'What Is Digital Art?',
    description: 'Digital art represents original creative works created by artists using drawing tablets, software, and styluses. Unlike reproductions of physical media, digital art is crafted directly in the digital space, offering incredible resolution, color fidelity, and modern styles. Printed on premium archival papers, it serves as state-of-the-art wall decor.',
    benefitsTitle: 'Why collectors choose digital art:',
    benefits: [
      'Stunning crisp details with high-resolution printing output',
      'Modern aesthetics like vector geometry, flat illustrations, and vaporwave',
      'Archival Giclée grade inks ensure colors resist fading for decades',
      'Exceptional value for museum-quality framed decor pieces'
    ],
    ctaText: "Browse Lurevi's Digital Art Collection →"
  },
  'digital-art': {
    title: 'What Is Digital Art?',
    description: 'Digital art represents original creative works created by artists using drawing tablets, software, and styluses. Unlike reproductions of physical media, digital art is crafted directly in the digital space, offering incredible resolution, color fidelity, and modern styles. Printed on premium archival papers, it serves as state-of-the-art wall decor.',
    benefitsTitle: 'Why collectors choose digital art:',
    benefits: [
      'Stunning crisp details with high-resolution printing output',
      'Modern aesthetics like vector geometry, flat illustrations, and vaporwave',
      'Archival Giclée grade inks ensure colors resist fading for decades',
      'Exceptional value for museum-quality framed decor pieces'
    ],
    ctaText: "Browse Lurevi's Digital Art Collection →"
  },
  'digital-art-prints': {
    title: 'What Is Digital Art?',
    description: 'Digital art represents original creative works created by artists using drawing tablets, software, and styluses. Unlike reproductions of physical media, digital art is crafted directly in the digital space, offering incredible resolution, color fidelity, and modern styles. Printed on premium archival papers, it serves as state-of-the-art wall decor.',
    benefitsTitle: 'Why collectors choose digital art:',
    benefits: [
      'Stunning crisp details with high-resolution printing output',
      'Modern aesthetics like vector geometry, flat illustrations, and vaporwave',
      'Archival Giclée grade inks ensure colors resist fading for decades',
      'Exceptional value for museum-quality framed decor pieces'
    ],
    ctaText: "Browse Lurevi's Digital Art Collection →"
  },
  minimalist: {
    title: 'What Is Minimalist Art?',
    description: 'Minimalist art is characterized by extreme simplicity, focusing on basic shapes, clean lines, and a restricted color palette. By removing unnecessary elements, it emphasizes the beauty of negative space, form, and raw colors. It creates a serene, clutter-free environment that promotes calm and clarity.',
    benefitsTitle: 'Why collectors choose minimalist art:',
    benefits: [
      'Elegant simplicity that expands the feeling of space',
      'complements Scandinavian, Japandi, and modern decor',
      'Creates a calming, peaceful ambiance in bedrooms and studies',
      'Focuses attention on form, color balance, and spatial geometry'
    ],
    ctaText: "Browse Lurevi's Minimalist Collection →"
  },
  'vintage-retro': {
    title: 'What Is Vintage & Retro Art?',
    description: 'Vintage and retro art draws inspiration from the styles, advertising, typography, and cultural aesthetics of bygone decades. Combining nostalgia, faded color palettes, and distressed textures, these designs add timeless charm, historical character, and cozy warmth to both modern and classic interiors.',
    benefitsTitle: 'Why collectors choose vintage & retro art:',
    benefits: [
      'Adds nostalgic warmth, cozy comfort, and historical charm',
      'Features unique classic typography and retro color combinations',
      'Excellent for creating cozy focal zones in kitchens and cafes',
      'Brings timeless, long-lasting aesthetic appeal to modern homes'
    ],
    ctaText: "Browse Lurevi's Vintage & Retro Collection →"
  },
  animals: {
    title: 'What Is Animal & Wildlife Art?',
    description: 'Animal and wildlife art celebrates the diversity, grace, and majesty of the animal kingdom. From striking wildlife photography to stylized digital animal portraits, these artworks bring nature\'s living energy, emotional depth, and raw beauty directly into your room layout.',
    benefitsTitle: 'Why collectors choose animal art:',
    benefits: [
      'Brings vibrant living energy and natural warmth into rooms',
      'Evokes powerful emotional connections and biological interest',
      'Great as expressive focal pieces in living and childrens\' rooms',
      'Features stunning biological details and color palettes'
    ],
    ctaText: "Browse Lurevi's Animals Collection →"
  },
  cars: {
    title: 'What Is Automotive Art?',
    description: 'Automotive art showcases the beauty, engineering, and cultural impact of classic, sports, and vintage cars. Through dramatic lighting, technical lines, and action-oriented compositions, these pieces capture speed, elegance, and design innovation, appealing to car enthusiasts and modern designers alike.',
    benefitsTitle: 'Why collectors choose automotive art:',
    benefits: [
      'Celebrates sleek industrial design, mechanics, and speed',
      'Perfect for offices, garages, studios, and teenage bedrooms',
      'Adds a strong dynamic energy and technical focal interest',
      'Captures historical milestones of vintage and racing legends'
    ],
    ctaText: "Browse Lurevi's Cars Collection →"
  },
  'super-heroes': {
    title: 'What Is Superhero Art?',
    description: 'Superhero art translates beloved pop-culture heroes, comic book legends, and cinematic figures into high-quality visual prints. Combining bold color styling, action compositions, and dynamic shading, these artworks bring energy, imagination, and personal passion to room layouts.',
    benefitsTitle: 'Why collectors choose superhero art:',
    benefits: [
      'Showcases personal passions and pop-culture fandoms',
      'Adds vibrant primary colors and dynamic action scenes',
      'Ideal for gaming rooms, home theaters, and kids\' bedrooms',
      'Highly engaging conversation starter for friends and guests'
    ],
    ctaText: "Browse Lurevi's Superhero Collection →"
  },
  floral: {
    title: 'What Is Floral & Botanical Art?',
    description: 'Floral and botanical art captures the delicate structures, organic color ranges, and natural elegance of flowers, plants, and gardens. Ranging from classical botanical illustrations to bright contemporary prints, floral art brings freshness, organic life, and seasonal beauty indoors.',
    benefitsTitle: 'Why collectors choose floral art:',
    benefits: [
      'Brings year-round floral freshness and organic colors indoors',
      'Creates a soft, inviting, and peaceful room atmosphere',
      'complements light wood furniture and natural fabrics perfectly',
      'Universally matching style for dining rooms and hallways'
    ],
    ctaText: "Browse Lurevi's Floral Collection →"
  },
  forest: {
    title: 'What Is Forest Art?',
    description: 'Forest art focuses on the serene depth, peaceful foliage, and green color palettes of woodland landscapes. Ranging from misty mountain forests to sun-dappled pathways, these prints bring organic visual comfort, fresh visual perspectives, and quiet peace into your living spaces.',
    benefitsTitle: 'Why collectors choose forest art:',
    benefits: [
      'Deep green palettes that promote relaxation and comfort',
      'Creates a refreshing window-like view of natural foliage',
      'Helps ground spaces, reducing visual clutter and mental stress',
      'Fits beautifully in bedrooms, study areas, and living rooms'
    ],
    ctaText: "Browse Lurevi's Forest Collection →"
  },
  futuristic: {
    title: 'What Is Futuristic Art?',
    description: 'Futuristic art explores science fiction themes, advanced technology, cybernetic cities, and space colonization. Utilizing neon color accents, complex geometries, and architectural concepts, these designs inject cutting-edge imagination, speed, and conceptual depth into modern workspaces.',
    benefitsTitle: 'Why collectors choose futuristic art:',
    benefits: [
      'Injects highly imaginative, conceptual, and sci-fi themes',
      'Features striking neon highlights and architectural geometries',
      'Perfect for tech offices, modern studios, and game rooms',
      'Inspires innovation, curiosity, and creative brainstorming'
    ],
    ctaText: "Browse Lurevi's Futuristic Collection →"
  },
  'city-maps': {
    title: 'What Is City Map Art?',
    description: 'City map art transforms urban layouts, streets, and geographies into clean, geometric designs. By highlighting the visual structure of iconic world cities like New York, London, or Mumbai, these prints merge personal travel memories with modern cartographic aesthetics.',
    benefitsTitle: 'Why collectors choose city map art:',
    benefits: [
      'Merges personal travel stories with sleek cartography',
      'Adds clean, structured linear patterns to your wall layout',
      'Universally elegant fit for home offices and entrance lobbies',
      'Available in minimal black-and-white or metallic gold styles'
    ],
    ctaText: "Browse Lurevi's City Maps Collection →"
  },
  'multi-planetary': {
    title: 'What Is Cosmic & Planetary Art?',
    description: 'Cosmic and planetary art captures the vastness of outer space, distant galaxies, planets, and celestial events. Blending real astronomical visuals with creative sci-fi illustrations, these designs invoke wonder, scale, and deep curiosity, expanding the boundary of any room.',
    benefitsTitle: 'Why collectors choose cosmic art:',
    benefits: [
      'Creates a deep sense of scale, wonder, and curiosity',
      'Features rich color palettes of nebulae, stars, and planets',
      'Adds a striking, contemplative focal theme to workspaces',
      'complements dark, moody, or industrial interior themes'
    ],
    ctaText: "Browse Lurevi's Cosmic Collection →"
  },
  music: {
    title: 'What Is Music Art?',
    description: 'Music art visualizes musical instruments, soundwaves, legendary musicians, and abstract sound concepts. Through expressive brushstrokes, dynamic composition, and symbolic colors, these prints capture the rhythm, mood, and auditory magic of music in a physical visual form.',
    benefitsTitle: 'Why collectors choose music art:',
    benefits: [
      'Visualizes a love for instruments, bands, and sounds',
      'Adds rhythmic movement, dynamic energy, and soul to walls',
      'Perfect for practice rooms, recording studios, and libraries',
      'Sets a creative, artistic tone in common family zones'
    ],
    ctaText: "Browse Lurevi's Music Collection →"
  },
  scenic: {
    title: 'What Is Scenic Landscape Art?',
    description: 'Scenic landscape art captures grand visual vistas, tranquil mountains, winding rivers, and dramatic coastlines. By focusing on distance, natural lighting, and atmospheric depth, these artworks create a beautiful visual window, expanding rooms and bringing calm horizon views indoors.',
    benefitsTitle: 'Why collectors choose scenic art:',
    benefits: [
      'Creates a wide visual window that makes small rooms feel larger',
      'Offers relaxing horizon views that calm the mind and eyes',
      'Pairs well with standard gallery framing on focal walls',
      'Classic, timeless style that never goes out of fashion'
    ],
    ctaText: "Browse Lurevi's Scenic Collection →"
  },
  technology: {
    title: 'What Is Technology Art?',
    description: 'Technology art blends industrial design, circuit boards, digital innovation, and technical graphics into artistic patterns. Emphasizing clean structure, electronic components, and digital grids, these prints represent the intersection of science, logic, and contemporary creativity.',
    benefitsTitle: 'Why collectors choose technology art:',
    benefits: [
      'Celebrates digital logic, innovation, and computing science',
      'Sleek, linear patterns ideal for modern IT workspaces',
      'complements clean metal, glass, and steel office furniture',
      'Signals modern innovation and forward-looking concepts'
    ],
    ctaText: "Browse Lurevi's Technology Collection →"
  },
  'world-cities': {
    title: 'What Is World Cityscape Art?',
    description: 'World cityscape art captures the iconic skylines, historic architecture, and vibrant streets of global metropolises. From the historic landmarks of Paris to the neon-dappled streets of Tokyo, these prints capture the unique energy, culture, and architecture of urban hubs.',
    benefitsTitle: 'Why collectors choose cityscape art:',
    benefits: [
      'Brings the cosmopolitan energy of world capitals home',
      'Ideal for modern living spaces and executive meeting rooms',
      'Highlights beautiful urban architecture and skyline lines',
      'Keeps travel memories and global aspirations alive daily'
    ],
    ctaText: "Browse Lurevi's World Cities Collection →"
  },
  watercolor: {
    title: 'What Is Watercolor Art?',
    description: 'Watercolor art is defined by its fluid transparency, organic shapes, and soft color gradients. Recreated in high-fidelity digital prints, the beautiful bleed of pigment, soft edges, and delicate textures of watercolor paintings add light, air, and soft movement to modern walls.',
    benefitsTitle: 'Why collectors choose watercolor art:',
    benefits: [
      'Fluid, organic transparency that feels soft and light',
      'Muted color gradients that fit calm bedroom environments',
      'Adds artistic movement without overwhelming visual weight',
      'Blends beautifully with minimal and traditional room decor'
    ],
    ctaText: "Browse Lurevi's Watercolor Collection →"
  },
  'oil-painting-style': {
    title: 'What Is Oil Painting Art?',
    description: 'Oil painting style prints capture the classic depth, layered colors, and rich textures of oil canvases. Replicating the physical impasto strokes and rich pigments of traditional oils, these premium digital prints deliver the luxurious look and emotional weight of gallery art.',
    benefitsTitle: 'Why collectors choose oil styles:',
    benefits: [
      'Captures the luxurious thickness, depth, and richness of oils',
      'Brings a classical gallery aesthetic into your home workspace',
      'Rich, light-absorbing textures that feel heavy and valuable',
      'Timeless art format that stands as a major wall statement'
    ],
    ctaText: "Browse Lurevi's Oil Painting Collection →"
  },
  'sketch-line-art': {
    title: 'What Is Line & Sketch Art?',
    description: 'Line and sketch art explores simplicity by focusing purely on strokes, outlines, and charcoal gestures. Stripping away heavy fills, it highlights elegant shapes, facial contours, and spatial geometries, making it the perfect design choice for chic, modern rooms.',
    benefitsTitle: 'Why collectors choose line art:',
    benefits: [
      'Extremely clean and chic design that feels light and open',
      'complements black-and-white minimalist home interior layouts',
      'Brings sophisticated artistic shapes without cluttering views',
      'Perfect for multi-frame gallery walls and dressing rooms'
    ],
    ctaText: "Browse Lurevi's Line Art Collection →"
  },
  'pop-art': {
    title: 'What Is Pop Art?',
    description: 'Pop art draws inspiration from popular culture, mass media, comic books, and bold consumer imagery. Featuring highly saturated primary colors, high-contrast outlines, and ironic subjects, pop art prints add retro energy and expressive character to living spaces.',
    benefitsTitle: 'Why collectors choose pop art:',
    benefits: [
      'Vibrant primary colors that bring immediate life to dull walls',
      'Retro, playful, and high-energy feel that shifts room moods',
      'Great as bold conversation starters for common family rooms',
      'Celebrates iconic culture, humor, and contemporary design'
    ],
    ctaText: "Browse Lurevi's Pop Art Collection →"
  },
  surreal: {
    title: 'What Is Surreal Art?',
    description: 'Surreal art blends realistic detail with dreamlike, illogical, and fantasy scenes. By uniting unrelated objects and physics-defying structures, surreal prints spark imagination, transport viewers into dreams, and introduce a deep, mysterious visual focus to walls.',
    benefitsTitle: 'Why collectors choose surreal art:',
    benefits: [
      'Dreamlike, imaginative scenes that inspire constant curiosity',
      'Unconventional visual storytelling that stands out immediately',
      'Adds deep conceptual mystery and layers to studies and rooms',
      'Pairs well with unique, modern, or eclectic decor designs'
    ],
    ctaText: "Browse Lurevi's Surreal Collection →"
  },
  geometric: {
    title: 'What Is Geometric Art?',
    description: 'Geometric art focuses on mathematical shapes, symmetrical patterns, precise lines, and color blocking. By highlighting clean structure, order, and spatial harmony, these designs bring absolute symmetry and modern logic to residential and commercial walls.',
    benefitsTitle: 'Why collectors choose geometric art:',
    benefits: [
      'Crisp shapes and symmetrical order that clean up visual spaces',
      'pairs excellently with mid-century modern and industrial themes',
      'Creates structured focal paths in corridors and open rooms',
      'Bold color blocks that establish clean, modern anchor points'
    ],
    ctaText: "Browse Lurevi's Geometric Collection →"
  },
  grunge: {
    title: 'What Is Grunge Art?',
    description: 'Grunge art is characterized by distressed textures, gritty dark overlays, industrial concepts, and a raw visual style. Merging vintage decay with modern urban themes, these prints inject a bold, textured, and rebel character into urban lofts and creative workspaces.',
    benefitsTitle: 'Why collectors choose grunge art:',
    benefits: [
      'Gritty, rich textures that bring physical warmth to walls',
      'complements raw concrete, brick, and industrial steel layouts',
      'Adds strong, independent character and raw creative edge',
      'Ideal for music rooms, studios, lofts, and urban cafes'
    ],
    ctaText: "Browse Lurevi's Grunge Collection →"
  },
  photorealistic: {
    title: 'What Is Photorealistic Art?',
    description: 'Photorealistic art challenges the boundaries of representation by creating paintings and digital illustrations with lifelike detail. Every reflection, shadow, and skin texture is rendered with extreme precision, delivering a stunning illusion of reality that leaves viewers in awe.',
    benefitsTitle: 'Why collectors choose photorealism:',
    benefits: [
      'Jaw-dropping lifelike detail that challenges human perception',
      'Showcases incredible precision, skill, and creative patience',
      'Adds a strong sense of reality and high-definition detail',
      'Perfect for high-impact galleries and main executive halls'
    ],
    ctaText: "Browse Lurevi's Photorealistic Collection →"
  }
};

/**
 * Returns the explainer for a given category slug.
 * If the slug is not pre-defined, it generates a beautiful default fallback explainer.
 */
export function getCategoryExplainer(slug: string): CategoryExplainer {
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (CATEGORY_EXPLAINERS[normalizedSlug]) {
    return CATEGORY_EXPLAINERS[normalizedSlug];
  }

  // Format a reader-friendly name from the slug
  const categoryName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `What Is ${categoryName} Art?`,
    description: `${categoryName} represents a curated collection of beautiful themes and visual styles, hand-selected to bring design cohesion, aesthetic beauty, and personal character to modern living spaces. Each print captures unique artistic perspectives to elevate your interior design.`,
    benefitsTitle: `Why collectors choose ${categoryName.toLowerCase()} art:`,
    benefits: [
      'Curated selection matching modern interior trends',
      'High-resolution print quality preserving fine details',
      'Brings instant visual warmth and emotional connection',
      'Available in versatile frame options and sizes'
    ],
    ctaText: `Browse Lurevi's ${categoryName} Collection →`
  };
}
