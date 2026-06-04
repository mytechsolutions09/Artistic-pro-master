-- Product Templates Setup for Artistic Pro
-- This file sets up the product_templates table and inserts default templates

-- Create product_templates table
CREATE TABLE IF NOT EXISTS product_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'product_templates_name_key' 
        AND conrelid = 'product_templates'::regclass
    ) THEN
        ALTER TABLE product_templates ADD CONSTRAINT product_templates_name_key UNIQUE (name);
    END IF;
END $$;

-- Create index on template name for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_templates_name ON product_templates(name);
CREATE INDEX IF NOT EXISTS idx_product_templates_data ON product_templates USING GIN(data);

-- Enable Row Level Security (RLS) and policies
ALTER TABLE product_templates ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
CREATE POLICY "Allow public read access to product templates" ON product_templates FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN
        -- Policy already exists, continue
        NULL;
END $$;

DO $$ 
BEGIN
CREATE POLICY "Allow authenticated users to manage templates" ON product_templates FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN
        -- Policy already exists, continue
        NULL;
END $$;

-- Create function and trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_templates_updated_at() RETURNS TRIGGER AS $$ 
BEGIN 
    NEW.updated_at = NOW(); 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_templates_updated_at ON product_templates;
CREATE TRIGGER update_product_templates_updated_at 
    BEFORE UPDATE ON product_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_product_templates_updated_at();

-- Insert default product templates (comprehensive templates for all categories)
-- Use ON CONFLICT to handle duplicate template names gracefully
INSERT INTO product_templates (name, icon, description, data) VALUES
(
    'Digital Art Template',
    '🎨',
    'Perfect for digital artwork and illustrations',
    '{
        "title": "Digital Artwork",
        "category": "Digital Art",
        "price": 299,
        "description": "A stunning digital artwork created with modern techniques and vibrant colors. Perfect for contemporary spaces and digital art enthusiasts.",
        "tags": "digital art, contemporary, vibrant, modern, illustration",
        "itemDetails": {
            "material": "Digital print on premium paper",
            "size": "24\" x 36\" (61cm x 91cm)",
            "frame": "Black aluminum frame",
            "style": "Contemporary digital",
            "origin": "Digitally created and printed"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹150",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹300",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "This digital artwork was created using cutting-edge software and techniques, representing the fusion of traditional artistic principles with modern technology.",
            "ecoFriendly": "Printed on eco-friendly paper using sustainable inks. Digital files reduce physical waste and carbon footprint.",
            "uniqueFeatures": "Each print is individually numbered and comes with a certificate of authenticity. The artwork can be customized in different sizes and formats."
        }
    }'
),
(
    'Nature Landscape Template',
    '🌿',
    'Ideal for nature and landscape photography',
    '{
        "title": "Nature Landscape",
        "category": "Nature",
        "price": 399,
        "description": "Breathtaking landscape photography capturing the raw beauty of nature. From majestic mountains to serene forests, each image tells a story of Earth''s wonders.",
        "tags": "nature, landscape, photography, mountains, forests, serene",
        "itemDetails": {
            "material": "Premium photographic paper",
            "size": "30\" x 40\" (76cm x 102cm)",
            "frame": "Natural wood frame",
            "style": "Natural landscape photography",
            "origin": "Captured in natural wilderness"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹200",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹400",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "These landscapes were captured during extensive travels through some of the world''s most beautiful natural locations, often requiring days of waiting for perfect lighting conditions.",
            "ecoFriendly": "Printed on sustainable materials and packaged in eco-friendly materials. A portion of proceeds supports environmental conservation efforts.",
            "uniqueFeatures": "Each photograph is limited edition with only 100 prints available. Comes with detailed location information and the story behind the capture."
        }
    }'
),
(
    'Abstract Modern Template',
    '✨',
    'Contemporary abstract and modern art',
    '{
        "title": "Abstract Modern Art",
        "category": "Abstract",
        "price": 599,
        "description": "Bold and expressive abstract artwork that challenges traditional boundaries. Perfect for modern interiors and art collectors seeking unique pieces.",
        "tags": "abstract, modern, contemporary, bold, expressive, unique",
        "itemDetails": {
            "material": "Acrylic on canvas",
            "size": "36\" x 48\" (91cm x 122cm)",
            "frame": "Floating frame",
            "style": "Abstract expressionism",
            "origin": "Hand-painted by contemporary artists"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n7-10 business days",
            "expressDelivery": "Express Delivery\n3-5 business days • ₹300",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹500",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "This abstract piece was created through a process of emotional expression and intuitive mark-making, representing the artist''s inner journey and contemporary artistic vision.",
            "ecoFriendly": "Uses non-toxic acrylic paints and sustainable canvas materials. The floating frame is made from responsibly sourced wood.",
            "uniqueFeatures": "Each piece is completely unique with no two artworks being identical. The painting technique creates depth and texture that changes with different lighting."
        }
    }'
),
(
    'Portrait & Character Template',
    '👤',
    'Perfect for portraits and character designs',
    '{
        "title": "Character Portrait",
        "category": "Portraits",
        "price": 449,
        "description": "Expressive character portraits that capture personality and emotion. From realistic human faces to imaginative character designs, each portrait tells a unique story.",
        "tags": "portrait, character, expressive, personality, emotion, storytelling",
        "itemDetails": {
            "material": "Mixed media on paper",
            "size": "22\" x 28\" (56cm x 71cm)",
            "frame": "Classic wooden frame",
            "style": "Character portrait art",
            "origin": "Hand-drawn and painted"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹180",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹350",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each character portrait begins with extensive character development, including personality traits, backstory, and visual design elements that make them truly unique.",
            "ecoFriendly": "Created using eco-friendly art supplies and sustainable paper. The framing materials are sourced from responsible suppliers.",
            "uniqueFeatures": "Every portrait comes with a character profile card detailing the character''s story, personality, and the inspiration behind the artwork."
        }
    }'
),
(
    'Minimalist Art Template',
    '⚪',
    'Clean and simple minimalist artwork',
    '{
        "title": "Minimalist Artwork",
        "category": "Minimalist",
        "price": 349,
        "description": "Clean, simple, and elegant minimalist artwork that emphasizes form, color, and space. Perfect for modern, uncluttered interiors seeking sophisticated simplicity.",
        "tags": "minimalist, clean, simple, elegant, modern, sophisticated",
        "itemDetails": {
            "material": "Fine art paper",
            "size": "20\" x 20\" (51cm x 51cm)",
            "frame": "Minimalist metal frame",
            "style": "Contemporary minimalist",
            "origin": "Hand-crafted with precision"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹120",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹250",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Minimalist art requires incredible precision and restraint. Each piece is carefully planned and executed to achieve perfect balance and harmony with minimal elements.",
            "ecoFriendly": "Uses sustainable art materials and eco-friendly printing processes. The minimalist approach naturally reduces material waste.",
            "uniqueFeatures": "The square format creates perfect symmetry and balance. Each piece is numbered and comes with a certificate of authenticity."
        }
    }'
),
(
    'Vintage Art Template',
    '🕰️',
    'Classic vintage and retro artwork',
    '{
        "title": "Vintage Artwork",
        "category": "Vintage/Retro",
        "price": 499,
        "description": "Timeless vintage artwork that captures the charm and elegance of bygone eras. From retro illustrations to classic artistic styles, these pieces add character and nostalgia to any space.",
        "tags": "vintage, retro, classic, nostalgic, elegant, timeless",
        "itemDetails": {
            "material": "Vintage-style paper",
            "size": "28\" x 35\" (71cm x 89cm)",
            "frame": "Antique-style frame",
            "style": "Vintage and retro",
            "origin": "Inspired by classic artistic periods"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n7-10 business days",
            "expressDelivery": "Express Delivery\n3-5 business days • ₹250",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹450",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "These vintage artworks are inspired by classic artistic movements and periods, carefully researched and recreated to capture the authentic feel and style of their respective eras.",
            "ecoFriendly": "Uses recycled and vintage-style papers, and eco-friendly inks that replicate the look of traditional printing methods.",
            "uniqueFeatures": "Each piece includes historical context about the artistic style and period it represents. The antique-style framing adds authentic vintage character."
        }
    }'
),
(
    'Animals Wildlife Template',
    '🦁',
    'Stunning wildlife and animal artwork',
    '{
        "title": "Wildlife Portrait",
        "category": "Animals",
        "price": 379,
        "description": "Captivating wildlife artwork that celebrates the beauty and majesty of the animal kingdom. From majestic lions to graceful deer, each piece captures the essence of nature''s most magnificent creatures.",
        "tags": "wildlife, animals, nature, majestic, graceful, natural",
        "itemDetails": {
            "material": "Premium art paper",
            "size": "26\" x 32\" (66cm x 81cm)",
            "frame": "Natural wood frame",
            "style": "Wildlife art",
            "origin": "Digitally created with natural inspiration"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹160",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹320",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each wildlife piece is created after extensive research into animal behavior and anatomy, ensuring every detail captures the true spirit and character of the subject.",
            "ecoFriendly": "A portion of proceeds supports wildlife conservation efforts. Printed on sustainable materials with eco-friendly inks.",
            "uniqueFeatures": "Each artwork includes educational information about the animal species and their natural habitat. Limited edition prints available."
        }
    }'
),
(
    'Automotive Art Template',
    '🚗',
    'Classic and modern automotive artwork',
    '{
        "title": "Vintage Car Art",
        "category": "Cars",
        "price": 429,
        "description": "Stunning automotive artwork celebrating the beauty and engineering of classic and modern vehicles. From vintage classics to sleek sports cars, each piece captures the romance of the open road.",
        "tags": "automotive, cars, vintage, classic, sports, engineering",
        "itemDetails": {
            "material": "Premium canvas",
            "size": "30\" x 40\" (76cm x 102cm)",
            "frame": "Modern metal frame",
            "style": "Automotive art",
            "origin": "Digitally created automotive designs"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹200",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹380",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each automotive piece is created with attention to every detail, from the curve of the fender to the reflection in the chrome, capturing the essence of automotive design excellence.",
            "ecoFriendly": "Printed on sustainable materials. Digital creation reduces environmental impact compared to traditional automotive photography.",
            "uniqueFeatures": "Includes detailed specifications about the featured vehicle and its historical significance in automotive design."
        }
    }'
),
(
    'Superhero Art Template',
    '🦸',
    'Epic superhero illustrations and comic art',
    '{
        "title": "Superhero Epic",
        "category": "Super-Heroes",
        "price": 399,
        "description": "Dynamic superhero artwork that brings comic book heroes to life with bold colors and dramatic compositions. Perfect for fans of superhero culture and comic art enthusiasts.",
        "tags": "superhero, comic, action, dynamic, bold, epic",
        "itemDetails": {
            "material": "High-quality art paper",
            "size": "24\" x 36\" (61cm x 91cm)",
            "frame": "Comic-style frame",
            "style": "Superhero comic art",
            "origin": "Digital comic book style artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹180",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹350",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each superhero piece is crafted with deep knowledge of comic book history and character development, ensuring authentic representation of beloved heroes.",
            "ecoFriendly": "Digital artwork reduces paper waste. Printed on sustainable materials with eco-friendly inks.",
            "uniqueFeatures": "Includes character backstory and comic book history. Each piece is numbered and comes with a certificate of authenticity."
        }
    }'
),
(
    'Floral Botanical Template',
    '🌸',
    'Beautiful botanical and floral artwork',
    '{
        "title": "Botanical Garden",
        "category": "Floral",
        "price": 329,
        "description": "Elegant floral artwork that celebrates the delicate beauty of nature''s blossoms. From roses to wildflowers, each piece captures the essence of botanical wonder.",
        "tags": "floral, botanical, flowers, garden, delicate, natural",
        "itemDetails": {
            "material": "Fine art paper",
            "size": "22\" x 28\" (56cm x 71cm)",
            "frame": "Elegant wooden frame",
            "style": "Botanical art",
            "origin": "Digitally created floral designs"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹140",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹280",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each floral piece begins with careful study of botanical forms and flower anatomy, ensuring every petal and leaf is rendered with botanical accuracy.",
            "ecoFriendly": "A portion of proceeds supports botanical garden conservation. Printed on sustainable materials.",
            "uniqueFeatures": "Includes botanical information about the featured flowers and their cultural significance throughout history."
        }
    }'
),
(
    'Forest Landscape Template',
    '🌲',
    'Serene forest landscapes and woodland scenes',
    '{
        "title": "Forest Serenity",
        "category": "Forest",
        "price": 449,
        "description": "Peaceful forest artwork that captures the tranquility and majesty of woodland landscapes. From dense pine forests to sun-dappled groves, each piece invites you into nature''s sanctuary.",
        "tags": "forest, woodland, nature, serene, peaceful, majestic",
        "itemDetails": {
            "material": "Premium canvas",
            "size": "28\" x 35\" (71cm x 89cm)",
            "frame": "Natural wood frame",
            "style": "Forest landscape",
            "origin": "Digitally created forest scenes"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹200",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹380",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each forest piece is inspired by real woodland locations, capturing the unique character and atmosphere of different forest ecosystems around the world.",
            "ecoFriendly": "A portion of proceeds supports forest conservation efforts. Printed on sustainable materials.",
            "uniqueFeatures": "Includes information about the forest ecosystem and the importance of forest conservation for our planet."
        }
    }'
),
(
    'Futuristic Sci-Fi Template',
    '🚀',
    'Sci-fi and futuristic artwork',
    '{
        "title": "Future World",
        "category": "Futuristic",
        "price": 479,
        "description": "Imaginative futuristic artwork that explores tomorrow''s possibilities. From space colonies to advanced technology, each piece offers a glimpse into humanity''s potential future.",
        "tags": "futuristic, sci-fi, technology, space, future, innovation",
        "itemDetails": {
            "material": "Premium art paper",
            "size": "30\" x 40\" (76cm x 102cm)",
            "frame": "Modern metal frame",
            "style": "Futuristic sci-fi",
            "origin": "Digital futuristic artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹220",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹420",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each futuristic piece is created with consideration of current scientific trends and technological possibilities, blending imagination with scientific plausibility.",
            "ecoFriendly": "Digital artwork reduces material waste. Printed on sustainable materials with eco-friendly inks.",
            "uniqueFeatures": "Includes scientific background information about the technologies and concepts featured in the artwork."
        }
    }'
),
(
    'City Maps Template',
    '🗺️',
    'Stylized city maps and urban designs',
    '{
        "title": "Urban Navigation",
        "category": "City Maps",
        "price": 359,
        "description": "Artistic city maps that transform urban navigation into beautiful artwork. From street grids to landmark illustrations, each piece celebrates the character of great cities.",
        "tags": "maps, city, urban, navigation, landmarks, artistic",
        "itemDetails": {
            "material": "Premium paper",
            "size": "24\" x 36\" (61cm x 91cm)",
            "frame": "Modern frame",
            "style": "Artistic cartography",
            "origin": "Digital map artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹160",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹320",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each city map is created with extensive research into urban history and architecture, ensuring every street and landmark is accurately represented.",
            "ecoFriendly": "Digital creation reduces paper waste. Printed on sustainable materials.",
            "uniqueFeatures": "Includes historical information about the featured city and its architectural highlights."
        }
    }'
),
(
    'Multi-Planetary Template',
    '🪐',
    'Cosmic artwork featuring space scenes',
    '{
        "title": "Cosmic Journey",
        "category": "Multi-Planetary",
        "price": 529,
        "description": "Stunning cosmic artwork that explores the wonders of our solar system and beyond. From planetary landscapes to interstellar vistas, each piece captures the majesty of space.",
        "tags": "space, planets, cosmic, solar system, interstellar, majestic",
        "itemDetails": {
            "material": "Premium canvas",
            "size": "32\" x 40\" (81cm x 102cm)",
            "frame": "Modern frame",
            "style": "Cosmic space art",
            "origin": "Digital space artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹240",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹460",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each cosmic piece is created with reference to actual astronomical data and scientific discoveries, ensuring scientific accuracy while maintaining artistic beauty.",
            "ecoFriendly": "Digital artwork reduces material waste. Printed on sustainable materials.",
            "uniqueFeatures": "Includes astronomical information about the featured celestial bodies and their scientific significance."
        }
    }'
),
(
    'Musical Art Template',
    '🎵',
    'Musical artwork and sound visualizations',
    '{
        "title": "Harmony in Art",
        "category": "Music",
        "price": 389,
        "description": "Beautiful musical artwork that visualizes the harmony and rhythm of music. From instrument illustrations to abstract sound representations, each piece celebrates the universal language of music.",
        "tags": "music, instruments, sound, harmony, rhythm, artistic",
        "itemDetails": {
            "material": "Premium art paper",
            "size": "26\" x 32\" (66cm x 81cm)",
            "frame": "Elegant frame",
            "style": "Musical art",
            "origin": "Digital musical artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹180",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹360",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each musical piece is created with deep appreciation for musical theory and the cultural significance of different musical traditions around the world.",
            "ecoFriendly": "Digital artwork reduces material waste. Printed on sustainable materials.",
            "uniqueFeatures": "Includes information about the musical elements featured and their cultural or historical significance."
        }
    }'
),
(
    'Digital Paintings Template',
    '🖼️',
    'Digital paintings and traditional art styles',
    '{
        "title": "Digital Masterpiece",
        "category": "Paintings",
        "price": 549,
        "description": "Exquisite digital paintings that recreate the beauty and technique of traditional art forms. From classical styles to contemporary approaches, each piece showcases digital artistry at its finest.",
        "tags": "painting, traditional, digital, classical, contemporary, artistic",
        "itemDetails": {
            "material": "Premium canvas",
            "size": "30\" x 40\" (76cm x 102cm)",
            "frame": "Classic frame",
            "style": "Digital painting",
            "origin": "Digital artwork with traditional techniques"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n7-10 business days",
            "expressDelivery": "Express Delivery\n3-5 business days • ₹250",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹480",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each digital painting is created using advanced software that replicates traditional painting techniques, from brush strokes to color blending, achieving authentic artistic results.",
            "ecoFriendly": "Digital creation eliminates the need for physical paints and solvents. Printed on sustainable materials.",
            "uniqueFeatures": "Includes information about the artistic techniques and styles represented in the artwork."
        }
    }'
),
(
    'Scenic Landscape Template',
    '🏔️',
    'Breathtaking scenic landscapes and vistas',
    '{
        "title": "Scenic Vista",
        "category": "Scenic",
        "price": 469,
        "description": "Magnificent scenic artwork that captures the awe-inspiring beauty of natural landscapes. From mountain peaks to coastal cliffs, each piece showcases Earth''s most spectacular vistas.",
        "tags": "scenic, landscape, vista, natural, spectacular, awe-inspiring",
        "itemDetails": {
            "material": "Premium canvas",
            "size": "32\" x 40\" (81cm x 102cm)",
            "frame": "Natural frame",
            "style": "Scenic landscape",
            "origin": "Digital scenic artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹220",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹420",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each scenic piece is inspired by real-world locations, capturing the unique character and atmosphere of some of the most beautiful places on Earth.",
            "ecoFriendly": "A portion of proceeds supports environmental conservation. Printed on sustainable materials.",
            "uniqueFeatures": "Includes geographical information about the featured location and its natural significance."
        }
    }'
),
(
    'Technology Innovation Template',
    '💻',
    'Modern technology illustrations and innovation',
    '{
        "title": "Tech Innovation",
        "category": "Technology",
        "price": 419,
        "description": "Cutting-edge technology artwork that celebrates human innovation and progress. From gadgets to futuristic concepts, each piece showcases the marvels of modern technology.",
        "tags": "technology, digital, innovation, modern, cutting-edge, progress",
        "itemDetails": {
            "material": "Premium art paper",
            "size": "28\" x 35\" (71cm x 89cm)",
            "frame": "Modern frame",
            "style": "Technology art",
            "origin": "Digital technology artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹200",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹380",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each technology piece is created with understanding of current technological trends and innovations, ensuring relevance and accuracy in representation.",
            "ecoFriendly": "Digital artwork reduces material waste. Printed on sustainable materials.",
            "uniqueFeatures": "Includes information about the technology featured and its impact on modern society."
        }
    }'
),
(
    'World Cities Template',
    '🌆',
    'Urban skylines and cityscapes',
    '{
        "title": "Urban Majesty",
        "category": "World Cities",
        "price": 439,
        "description": "Stunning urban artwork that captures the energy and grandeur of world cities. From iconic skylines to bustling street scenes, each piece celebrates urban life and architecture.",
        "tags": "city, skyline, urban, architecture, iconic, bustling",
        "itemDetails": {
            "material": "Premium canvas",
            "size": "30\" x 40\" (76cm x 102cm)",
            "frame": "Modern frame",
            "style": "Urban cityscape",
            "origin": "Digital urban artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹200",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹380",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each city piece is created with deep appreciation for urban architecture and the unique character of different cities around the world.",
            "ecoFriendly": "Digital artwork reduces material waste. Printed on sustainable materials.",
            "uniqueFeatures": "Includes architectural information about the featured city and its cultural significance."
        }
    }'
),
(
    'Watercolor Art Template',
    '🎨',
    'Fluid watercolor artworks with organic shapes',
    '{
        "title": "Watercolor Dreams",
        "category": "Watercolor",
        "price": 379,
        "description": "Beautiful watercolor artwork that captures the fluid, organic nature of this beloved medium. From soft washes to vibrant pigments, each piece showcases the magic of watercolor painting.",
        "tags": "watercolor, fluid, organic, soft, vibrant, artistic",
        "itemDetails": {
            "material": "Fine art paper",
            "size": "24\" x 30\" (61cm x 76cm)",
            "frame": "Elegant frame",
            "style": "Watercolor art",
            "origin": "Digital watercolor artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹160",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹320",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each watercolor piece is created using digital techniques that perfectly replicate the fluid, unpredictable nature of traditional watercolor painting.",
            "ecoFriendly": "Digital creation eliminates the need for physical water and pigments. Printed on sustainable materials.",
            "uniqueFeatures": "Includes information about watercolor techniques and the artistic process behind the artwork."
        }
    }'
),
(
    'Oil Painting Style Template',
    '🖼️',
    'Digital artworks in oil painting style',
    '{
        "title": "Oil Painting Elegance",
        "category": "Oil Painting Style",
        "price": 489,
        "description": "Exquisite digital artwork that captures the rich texture and depth of traditional oil painting. From classical techniques to contemporary styles, each piece showcases the timeless beauty of oil painting.",
        "tags": "oil painting, traditional, classical, textured, rich, timeless",
        "itemDetails": {
            "material": "Premium canvas",
            "size": "28\" x 35\" (71cm x 89cm)",
            "frame": "Classic frame",
            "style": "Oil painting style",
            "origin": "Digital oil painting artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n7-10 business days",
            "expressDelivery": "Express Delivery\n3-5 business days • ₹240",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹460",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each oil painting style piece is created using advanced digital techniques that replicate the texture, layering, and depth characteristic of traditional oil painting.",
            "ecoFriendly": "Digital creation eliminates the need for physical oils and solvents. Printed on sustainable materials.",
            "uniqueFeatures": "Includes information about oil painting techniques and the artistic traditions represented in the artwork."
        }
    }'
),
(
    'Sketch Line Art Template',
    '✏️',
    'Expressive line drawings and sketches',
    '{
        "title": "Line Art Expression",
        "category": "Sketch & Line Art",
        "price": 299,
        "description": "Elegant line art that celebrates the beauty of simplicity and precision. From expressive sketches to geometric designs, each piece showcases the power of line and form.",
        "tags": "sketch, line art, drawing, expressive, geometric, precise",
        "itemDetails": {
            "material": "Fine art paper",
            "size": "20\" x 26\" (51cm x 66cm)",
            "frame": "Minimalist frame",
            "style": "Line art and sketches",
            "origin": "Digital line artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹120",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹240",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each line art piece is created with careful attention to line quality and composition, ensuring every stroke contributes to the overall artistic impact.",
            "ecoFriendly": "Digital creation reduces paper waste. Printed on sustainable materials.",
            "uniqueFeatures": "Includes information about line art techniques and the artistic principles behind the composition."
        }
    }'
),
(
    'Pop Art Template',
    '🎭',
    'Vibrant pop art with bold colors',
    '{
        "title": "Pop Art Explosion",
        "category": "Pop Art",
        "price": 359,
        "description": "Bold and vibrant pop art that celebrates popular culture with bright colors and iconic imagery. From comic book styles to celebrity portraits, each piece captures the energy of pop culture.",
        "tags": "pop art, colorful, bold, popular culture, iconic, energetic",
        "itemDetails": {
            "material": "Premium art paper",
            "size": "24\" x 30\" (61cm x 76cm)",
            "frame": "Modern frame",
            "style": "Pop art",
            "origin": "Digital pop artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹160",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹320",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each pop art piece is created with understanding of the pop art movement and its influence on contemporary culture and artistic expression.",
            "ecoFriendly": "Digital artwork reduces material waste. Printed on sustainable materials.",
            "uniqueFeatures": "Includes information about pop art history and the cultural significance of the featured elements."
        }
    }'
),
(
    'Surreal Art Template',
    '🌙',
    'Dreamlike surreal artworks',
    '{
        "title": "Surreal Dreams",
        "category": "Surreal",
        "price": 429,
        "description": "Captivating surreal artwork that blends reality with imagination in dreamlike compositions. From impossible landscapes to symbolic imagery, each piece invites viewers into a world of wonder.",
        "tags": "surreal, dreamlike, fantasy, imaginative, symbolic, wonder",
        "itemDetails": {
            "material": "Premium canvas",
            "size": "28\" x 35\" (71cm x 89cm)",
            "frame": "Modern frame",
            "style": "Surreal art",
            "origin": "Digital surreal artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹200",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹380",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each surreal piece is created through a process of intuitive exploration and symbolic interpretation, allowing the subconscious to guide the artistic creation.",
            "ecoFriendly": "Digital artwork reduces material waste. Printed on sustainable materials.",
            "uniqueFeatures": "Includes interpretation of the symbolic elements and the psychological aspects of surreal art."
        }
    }'
),
(
    'Geometric Design Template',
    '🔷',
    'Precise geometric designs and patterns',
    '{
        "title": "Geometric Harmony",
        "category": "Geometric",
        "price": 339,
        "description": "Precise geometric artwork that explores mathematical beauty and symmetry. From complex patterns to simple shapes, each piece demonstrates the elegance of geometric design.",
        "tags": "geometric, pattern, mathematical, precise, symmetrical, elegant",
        "itemDetails": {
            "material": "Fine art paper",
            "size": "22\" x 28\" (56cm x 71cm)",
            "frame": "Modern frame",
            "style": "Geometric design",
            "origin": "Digital geometric artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹140",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹280",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each geometric piece is created using mathematical principles and precise calculations, ensuring perfect symmetry and balance in every composition.",
            "ecoFriendly": "Digital creation ensures perfect precision without material waste. Printed on sustainable materials.",
            "uniqueFeatures": "Includes mathematical information about the geometric principles and patterns featured in the artwork."
        }
    }'
),
(
    'Grunge Art Template',
    '🏚️',
    'Gritty grunge artworks with texture',
    '{
        "title": "Grunge Texture",
        "category": "Grunge",
        "price": 369,
        "description": "Raw and textured grunge artwork that celebrates urban aesthetics and industrial beauty. From distressed surfaces to gritty textures, each piece captures the raw energy of urban culture.",
        "tags": "grunge, textured, urban, industrial, raw, gritty",
        "itemDetails": {
            "material": "Textured canvas",
            "size": "26\" x 32\" (66cm x 81cm)",
            "frame": "Industrial frame",
            "style": "Grunge art",
            "origin": "Digital grunge artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n5-7 business days",
            "expressDelivery": "Express Delivery\n2-3 business days • ₹160",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹320",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each grunge piece is created with careful attention to texture and surface quality, replicating the worn, distressed appearance characteristic of grunge aesthetics.",
            "ecoFriendly": "Digital creation reduces material waste. Printed on sustainable materials.",
            "uniqueFeatures": "Includes information about grunge culture and the artistic techniques used to create textured effects."
        }
    }'
),
(
    'Photorealistic Art Template',
    '📸',
    'Incredibly detailed photorealistic artwork',
    '{
        "title": "Photorealistic Masterpiece",
        "category": "Photorealistic",
        "price": 599,
        "description": "Stunning photorealistic artwork that challenges the boundary between photography and painting. From detailed portraits to complex scenes, each piece demonstrates incredible artistic skill and attention to detail.",
        "tags": "photorealistic, detailed, lifelike, realistic, skillful, precise",
        "itemDetails": {
            "material": "Premium canvas",
            "size": "32\" x 40\" (81cm x 102cm)",
            "frame": "Professional frame",
            "style": "Photorealistic art",
            "origin": "Digital photorealistic artwork"
        },
        "delivery": {
            "standardDelivery": "Free Standard Delivery\n7-10 business days",
            "expressDelivery": "Express Delivery\n3-5 business days • ₹300",
            "sameDayDelivery": "Same Day Delivery\nAvailable in select cities • ₹580",
            "additionalInfo": "📦 All orders include tracking and insurance. Returns accepted within 30 days."
        },
        "didYouKnow": {
            "artistStory": "Each photorealistic piece is created through painstaking attention to detail, using advanced digital techniques to achieve incredible levels of realism and precision.",
            "ecoFriendly": "Digital creation eliminates the need for physical materials. Printed on sustainable materials.",
            "uniqueFeatures": "Includes information about photorealistic techniques and the artistic process behind achieving such detailed realism."
        }
    }'
)
ON CONFLICT (name) DO NOTHING;

-- Create a view for easy template access
CREATE OR REPLACE VIEW product_templates_view AS 
SELECT 
    id, 
    name, 
    icon, 
    description, 
    data->>'title' as template_title, 
    (data->>'price')::integer as template_price, 
    data->>'category' as template_category, 
    data->>'description' as template_description, 
    data->>'tags' as template_tags, 
    data->'itemDetails' as template_item_details, 
    data->'delivery' as template_delivery, 
    data->'didYouKnow' as template_did_you_know 
FROM product_templates 
ORDER BY name;

-- Grant permissions
DO $$ 
BEGIN
GRANT SELECT ON product_templates TO anon, authenticated;
GRANT ALL ON product_templates TO authenticated;
GRANT SELECT ON product_templates_view TO anon, authenticated;
EXCEPTION
    WHEN OTHERS THEN
        -- Permissions might already exist, continue
        NULL;
END $$;

-- Create functions to get templates by category and search templates
CREATE OR REPLACE FUNCTION get_templates_by_category(category_name VARCHAR) 
RETURNS TABLE (id UUID, name VARCHAR, icon VARCHAR, description TEXT, data JSONB) AS $$ 
BEGIN 
    RETURN QUERY 
    SELECT pt.id, pt.name, pt.icon, pt.description, pt.data 
    FROM product_templates pt 
    WHERE pt.data->>'category' = category_name 
    ORDER BY pt.name; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_templates(search_term VARCHAR) 
RETURNS TABLE (id UUID, name VARCHAR, icon VARCHAR, description TEXT, data JSONB, relevance_score INTEGER) AS $$ 
BEGIN 
    RETURN QUERY 
    SELECT 
        pt.id, 
        pt.name, 
        pt.icon, 
        pt.description, 
        pt.data, 
        CASE 
            WHEN pt.name ILIKE ''%'' || search_term || ''%'' THEN 3 
            WHEN pt.description ILIKE ''%'' || search_term || ''%'' THEN 2 
            WHEN pt.data::text ILIKE ''%'' || search_term || ''%'' THEN 1 
            ELSE 0 
        END as relevance_score 
    FROM product_templates pt 
    WHERE 
        pt.name ILIKE ''%'' || search_term || ''%'' OR 
        pt.description ILIKE ''%'' || search_term || ''%'' OR 
        pt.data::text ILIKE ''%'' || search_term || ''%'' 
    ORDER BY relevance_score DESC, pt.name; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get popular templates (most used)
CREATE OR REPLACE FUNCTION get_popular_templates(limit_count INTEGER DEFAULT 6) 
RETURNS TABLE (id UUID, name VARCHAR, icon VARCHAR, description TEXT, data JSONB, usage_count BIGINT) AS $$ 
BEGIN 
    RETURN QUERY 
    SELECT 
        pt.id, 
        pt.name, 
        pt.icon, 
        pt.description, 
        pt.data, 
        COALESCE(tc.usage_count, 0) as usage_count 
    FROM product_templates pt 
    LEFT JOIN (
        SELECT 
            template_id, 
            COUNT(*) as usage_count 
        FROM template_usage_log 
        GROUP BY template_id
    ) tc ON pt.id = tc.template_id 
    ORDER BY usage_count DESC, pt.name 
    LIMIT limit_count; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get templates by price range
CREATE OR REPLACE FUNCTION get_templates_by_price_range(min_price INTEGER, max_price INTEGER) 
RETURNS TABLE (id UUID, name VARCHAR, icon VARCHAR, description TEXT, data JSONB) AS $$ 
BEGIN 
    RETURN QUERY 
    SELECT pt.id, pt.name, pt.icon, pt.description, pt.data 
    FROM product_templates pt 
    WHERE (pt.data->>'price')::integer BETWEEN min_price AND max_price 
    ORDER BY (pt.data->>'price')::integer; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get templates by style
CREATE OR REPLACE FUNCTION get_templates_by_style(style_name VARCHAR) 
RETURNS TABLE (id UUID, name VARCHAR, icon VARCHAR, description TEXT, data JSONB) AS $$ 
BEGIN 
    RETURN QUERY 
    SELECT pt.id, pt.name, pt.icon, pt.description, pt.data 
    FROM product_templates pt 
    WHERE pt.data->'itemDetails'->>'style' ILIKE ''%'' || style_name || ''%'' 
    ORDER BY pt.name; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get template statistics
CREATE OR REPLACE FUNCTION get_template_stats() 
RETURNS TABLE (total_templates BIGINT, categories_count BIGINT, avg_price NUMERIC, price_range TEXT) AS $$ 
BEGIN 
    RETURN QUERY 
    SELECT 
        COUNT(*) as total_templates,
        COUNT(DISTINCT data->>'category') as categories_count,
        ROUND(AVG((data->>'price')::numeric), 2) as avg_price,
        MIN((data->>'price')::integer) || '' - '' || MAX((data->>'price')::integer) as price_range
    FROM product_templates; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create template usage logging table (optional, for analytics)
CREATE TABLE IF NOT EXISTS template_usage_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES product_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action VARCHAR(50) NOT NULL -- 'viewed', 'applied', 'shared'
);

-- Create index on template usage log
CREATE INDEX IF NOT EXISTS idx_template_usage_log_template_id ON template_usage_log(template_id);
CREATE INDEX IF NOT EXISTS idx_template_id ON template_usage_log(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_log_user_id ON template_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_log_used_at ON template_usage_log(used_at);

-- Enable RLS on usage log
ALTER TABLE template_usage_log ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
CREATE POLICY "Allow authenticated users to log template usage" ON template_usage_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN
        -- Policy already exists, continue
        NULL;
END $$;

DO $$ 
BEGIN
CREATE POLICY "Allow users to view their own usage" ON template_usage_log FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN
        -- Policy already exists, continue
        NULL;
END $$;

-- Grant permissions on usage log
DO $$ 
BEGIN
GRANT SELECT, INSERT ON template_usage_log TO authenticated;
EXCEPTION
    WHEN OTHERS THEN
        -- Permissions might already exist, continue
        NULL;
END $$;

-- Create function to log template usage
CREATE OR REPLACE FUNCTION log_template_usage(template_uuid UUID, action_type VARCHAR, user_uuid UUID DEFAULT NULL) 
RETURNS VOID AS $$ 
BEGIN 
    INSERT INTO template_usage_log (template_id, user_id, action) 
    VALUES (template_uuid, user_uuid, action_type); 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Display success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Product templates setup completed successfully!'; 
    RAISE NOTICE 'Created % template(s)', (SELECT COUNT(*) FROM product_templates); 
    RAISE NOTICE 'Available categories: %', (SELECT string_agg(DISTINCT data->>'category', ', ') FROM product_templates);
END $$;
