// Centralized tag generation service for automatic category-to-tags mapping
export interface CategoryTagMapping {
  [categoryName: string]: string[];
}

// Comprehensive category-to-tags mapping based on the actual 33 categories from the UI
export const categoryTagsMapping: CategoryTagMapping = {
  // Row 1: Abstract, Animals, Cars, Chinese Calligraphy, Classical, Contemporary, Expressionist, Fantasy
  'Abstract': ['abstract', 'art', 'modern', 'contemporary', 'creative', 'expressive'],
  'Animals': ['animals', 'wildlife', 'pets', 'nature', 'cute', 'majestic'],
  'Cars': ['cars', 'automotive', 'vehicle', 'transport', 'speed', 'classic'],
  'Chinese Calligraphy': ['calligraphy', 'chinese', 'writing', 'art', 'traditional', 'elegant'],
  'Classical': ['classical', 'traditional', 'heritage', 'art', 'timeless', 'elegant'],
  'Contemporary': ['contemporary', 'modern', 'current', 'art', 'today', 'fresh'],
  'Expressionist': ['expressionist', 'expressionism', 'art', 'emotional', 'bold', 'dramatic'],
  'Fantasy': ['fantasy', 'magical', 'imaginative', 'dreamy', 'mystical', 'creative'],
  
  // Row 2: Floral, Forest, Funny, Illustration, Impressionist, Japanese Calligra..., Landscapes, Maps
  'Floral': ['floral', 'flowers', 'botanical', 'nature', 'garden', 'delicate'],
  'Forest': ['forest', 'trees', 'woodland', 'nature', 'green', 'serene'],
  'Funny': ['funny', 'humorous', 'comedy', 'playful', 'amusing', 'entertaining'],
  'Illustration': ['illustration', 'drawing', 'detailed', 'artistic', 'creative', 'visual'],
  'Impressionist': ['impressionist', 'impressionism', 'art', 'painting', 'colorful', 'brushstrokes'],
  'Japanese Calligraphy': ['calligraphy', 'japanese', 'writing', 'art', 'traditional', 'elegant'],
  'Landscapes': ['landscape', 'nature', 'scenic', 'outdoor', 'view', 'beautiful'],
  'Maps': ['maps', 'geography', 'navigation', 'location', 'travel', 'cartographic'],
  
  // Row 3: Minimalist, Monochrome, Motivational, Nature, Painting, Photography, Pop Art, Popular Shows
  'Minimalist': ['minimalist', 'simple', 'clean', 'modern', 'elegant', 'minimal'],
  'Monochrome': ['monochrome', 'black', 'white', 'grayscale', 'minimal', 'classic'],
  'Motivational': ['motivational', 'inspirational', 'positive', 'uplifting', 'encouraging', 'empowering'],
  'Nature': ['nature', 'landscape', 'outdoor', 'natural', 'scenic', 'beautiful'],
  'Painting': ['painting', 'art', 'canvas', 'brush', 'traditional', 'artistic'],
  'Photography': ['photography', 'photo', 'camera', 'capture', 'realistic', 'documentary'],
  'Pop Art': ['pop', 'art', 'colorful', 'bold', 'contemporary', 'iconic'],
  'Popular Shows': ['tv shows', 'television', 'series', 'entertainment', 'popular', 'culture'],
  
  // Row 4: Shapes, Sports, Still Life, Street Art, Super-Heroes, Vintage, Vintage Movies, Woman
  'Shapes': ['shapes', 'geometric', 'forms', 'abstract', 'design', 'mathematical'],
  'Sports': ['sports', 'athletic', 'competition', 'fitness', 'active', 'dynamic'],
  'Still Life': ['still life', 'composition', 'objects', 'arrangement', 'artistic', 'classic'],
  'Street Art': ['street art', 'urban', 'graffiti', 'public', 'rebellious', 'edgy'],
  'Super-Heroes': ['superhero', 'comic', 'hero', 'action', 'fantasy', 'epic'],
  'Vintage': ['vintage', 'retro', 'classic', 'nostalgic', 'old-style', 'timeless'],
  'Vintage Movies': ['vintage movies', 'classic films', 'cinema', 'retro', 'nostalgic', 'timeless'],
  'Woman': ['woman', 'female', 'portrait', 'people', 'human', 'character'],
  
  // Row 5: World Cities
  'World Cities': ['city', 'urban', 'world', 'travel', 'architecture', 'iconic']
};

// Enhanced fallback function for unknown categories
export const generateFallbackTags = (category: string): string[] => {
  const lowerCategory = category.toLowerCase();
  const baseTags = [lowerCategory, 'art'];
  
  // Pattern-based tag generation
  const patterns = [
    // Art styles and techniques
    { keywords: ['paint', 'impression', 'expression'], tags: ['painting', 'artistic', 'creative'] },
    { keywords: ['watercolor', 'water'], tags: ['watercolor', 'fluid', 'soft', 'delicate'] },
    { keywords: ['oil', 'traditional'], tags: ['traditional', 'classic', 'oil', 'textured'] },
    { keywords: ['sketch', 'line', 'drawing'], tags: ['sketch', 'line', 'drawing', 'expressive'] },
    { keywords: ['pop', 'colorful'], tags: ['pop', 'colorful', 'bold', 'vibrant'] },
    { keywords: ['surreal', 'dream'], tags: ['surreal', 'dreamy', 'fantasy', 'imaginative'] },
    { keywords: ['geometric', 'pattern'], tags: ['geometric', 'pattern', 'mathematical', 'precise'] },
    { keywords: ['grunge', 'texture'], tags: ['grunge', 'textured', 'urban', 'raw'] },
    { keywords: ['photo', 'realistic'], tags: ['photorealistic', 'realistic', 'detailed', 'lifelike'] },
    
    // Subjects and themes
    { keywords: ['woman', 'man', 'people', 'portrait'], tags: ['portrait', 'human', 'people', 'character'] },
    { keywords: ['nature', 'landscape', 'forest'], tags: ['nature', 'outdoor', 'natural', 'scenic'] },
    { keywords: ['city', 'urban', 'street'], tags: ['urban', 'city', 'architecture', 'modern'] },
    { keywords: ['space', 'cosmic', 'planetary'], tags: ['space', 'cosmic', 'universe', 'astronomy'] },
    { keywords: ['music', 'sound', 'audio'], tags: ['music', 'audio', 'sound', 'harmony'] },
    { keywords: ['animal', 'wildlife'], tags: ['animals', 'wildlife', 'nature', 'majestic'] },
    { keywords: ['car', 'automotive'], tags: ['cars', 'automotive', 'vehicle', 'classic'] },
    { keywords: ['superhero', 'hero', 'comic'], tags: ['superhero', 'comic', 'action', 'epic'] },
    { keywords: ['floral', 'flower', 'botanical'], tags: ['floral', 'flowers', 'botanical', 'delicate'] },
    
    // Art movements and periods
    { keywords: ['modern', 'contemporary'], tags: ['modern', 'contemporary', 'current', 'innovative'] },
    { keywords: ['vintage', 'retro', 'classic'], tags: ['vintage', 'retro', 'classic', 'nostalgic'] },
    { keywords: ['minimalist', 'minimal'], tags: ['minimalist', 'simple', 'clean', 'elegant'] },
    { keywords: ['abstract'], tags: ['abstract', 'creative', 'expressive', 'artistic'] },
    { keywords: ['digital', 'tech'], tags: ['digital', 'modern', 'tech', 'innovative'] },
    { keywords: ['futuristic', 'sci-fi'], tags: ['futuristic', 'sci-fi', 'future', 'technology'] }
  ];
  
  // Apply pattern matching
  patterns.forEach(pattern => {
    if (pattern.keywords.some(keyword => lowerCategory.includes(keyword))) {
      pattern.tags.forEach(tag => {
        if (!baseTags.includes(tag)) {
          baseTags.push(tag);
        }
      });
    }
  });
  
  // Remove duplicates and return
  return [...new Set(baseTags)];
};

// Main function to generate tags from selected categories
export const generateTagsFromCategories = (selectedCategories: string[]): string => {
  const allTags = new Set<string>();
  
  selectedCategories.forEach(category => {
    // Try exact match first
    let tags = categoryTagsMapping[category] || [];
    
    if (tags.length === 0) {
      // Try case-insensitive match
      const lowerCategory = category.toLowerCase();
      const matchingKey = Object.keys(categoryTagsMapping).find(key => 
        key.toLowerCase() === lowerCategory
      );
      
      if (matchingKey) {
        tags = categoryTagsMapping[matchingKey];
      } else {
        // Use fallback for unknown categories
        tags = generateFallbackTags(category);
      }
    }
    
    // Add all tags to the set
    tags.forEach(tag => allTags.add(tag));
  });
  
  return Array.from(allTags).join(', ');
};

// Function to automatically add new categories to the mapping
export const addCategoryToMapping = (categoryName: string, customTags?: string[]): void => {
  if (!categoryTagsMapping[categoryName]) {
    if (customTags && customTags.length > 0) {
      categoryTagsMapping[categoryName] = customTags;
    } else {
      categoryTagsMapping[categoryName] = generateFallbackTags(categoryName);
    }
  }
};

// Function to get all available categories
export const getAllMappedCategories = (): string[] => {
  return Object.keys(categoryTagsMapping);
};

// Function to check if a category has custom mapping
export const hasCustomMapping = (categoryName: string): boolean => {
  return categoryName in categoryTagsMapping;
};

// Function to get tags for a specific category
export const getTagsForCategory = (categoryName: string): string[] => {
  if (categoryTagsMapping[categoryName]) {
    return categoryTagsMapping[categoryName];
  }
  
  // Try case-insensitive match
  const lowerCategory = categoryName.toLowerCase();
  const matchingKey = Object.keys(categoryTagsMapping).find(key => 
    key.toLowerCase() === lowerCategory
  );
  
  if (matchingKey) {
    return categoryTagsMapping[matchingKey];
  }
  
  // Return fallback tags
  return generateFallbackTags(categoryName);
};
