import { supabase } from './supabaseService';
import { CategoryService as SupabaseCategoryService } from './supabaseService';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  image_path?: string; // Storage path for the image
  count: number;
  status: 'active' | 'inactive';
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  revenue: number;
  views: number;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description: string;
  image: string;
  tags: string[];
  featured: boolean;
  status: 'active' | 'inactive';
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
  image_path?: string; // Storage path for the image
}

// Real business categories - these are actual product categories for the digital art marketplace
export const productionCategories: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'revenue' | 'views'>[] = [
  {
    name: 'Abstract',
    slug: 'abstract',
    description: 'Modern abstract digital artworks with vibrant colors and unique compositions',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: true,
    tags: ['modern', 'colorful', 'digital']
  },
  {
    name: 'Animals',
    slug: 'animals',
    description: 'Stunning wildlife and pet portraits showcasing the beauty of the animal kingdom',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: true,
    tags: ['wildlife', 'pets', 'nature']
  },
  {
    name: 'Cars',
    slug: 'cars',
    description: 'Classic and modern automotive art featuring vintage and sports cars',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['automotive', 'vintage', 'sports']
  },
  {
    name: 'Super-Heroes',
    slug: 'super-heroes',
    description: 'Epic superhero illustrations and comic book style artworks',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['superhero', 'comic', 'action']
  },
  {
    name: 'Floral',
    slug: 'floral',
    description: 'Beautiful botanical and floral artworks featuring flowers and gardens',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: true,
    tags: ['flowers', 'botanical', 'garden']
  },
  {
    name: 'Forest',
    slug: 'forest',
    description: 'Serene forest landscapes and woodland scenes capturing nature\'s tranquility',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['forest', 'landscape', 'nature']
  },
  {
    name: 'Futuristic',
    slug: 'futuristic',
    description: 'Sci-fi and futuristic artworks imagining tomorrow\'s world',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['sci-fi', 'future', 'technology']
  },
  {
    name: 'City Maps',
    slug: 'city-maps',
    description: 'Stylized city maps and urban navigation designs',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['maps', 'city', 'urban']
  },
  {
    name: 'Multi-Planetary',
    slug: 'multi-planetary',
    description: 'Cosmic artworks featuring multiple planets and space scenes',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['space', 'planets', 'cosmic']
  },
  {
    name: 'Music',
    slug: 'music',
    description: 'Musical artworks featuring instruments and sound visualizations',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['music', 'instruments', 'sound']
  },
  {
    name: 'Paintings',
    slug: 'paintings',
    description: 'Digital paintings and traditional art styles recreated digitally',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: true,
    tags: ['painting', 'traditional', 'digital']
  },
  {
    name: 'Scenic',
    slug: 'scenic',
    description: 'Breathtaking scenic landscapes and natural vistas',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['scenic', 'landscape', 'vista']
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Modern technology illustrations featuring gadgets and innovation',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['technology', 'digital', 'innovation']
  },
  {
    name: 'World Cities',
    slug: 'world-cities',
    description: 'Urban skylines and cityscapes from major metropolitan areas',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['city', 'skyline', 'urban']
  },
  {
    name: 'Minimalist',
    slug: 'minimalist',
    description: 'Clean and simple minimalist designs embracing negative space',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['minimal', 'clean', 'simple']
  },
  {
    name: 'Watercolor',
    slug: 'watercolor',
    description: 'Fluid watercolor artworks with organic shapes and flowing colors',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: true,
    tags: ['watercolor', 'fluid', 'organic']
  },
  {
    name: 'Oil Painting Style',
    slug: 'oil-painting-style',
    description: 'Digital artworks capturing traditional oil painting techniques',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['oil painting', 'traditional', 'classical']
  },
  {
    name: 'Sketch & Line Art',
    slug: 'sketch-line-art',
    description: 'Expressive line drawings and sketches',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['sketch', 'line art', 'drawing']
  },
  {
    name: 'Pop Art',
    slug: 'pop-art',
    description: 'Vibrant pop art pieces with bold colors and iconic imagery',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['pop art', 'colorful', 'bold']
  },
  {
    name: 'Surreal',
    slug: 'surreal',
    description: 'Dreamlike surreal artworks blending reality with imagination',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['surreal', 'dreamlike', 'fantasy']
  },
  {
    name: 'Geometric',
    slug: 'geometric',
    description: 'Precise geometric designs exploring mathematical beauty',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['geometric', 'pattern', 'mathematical']
  },
  {
    name: 'Vintage/Retro',
    slug: 'vintage-retro',
    description: 'Nostalgic vintage and retro-inspired artworks',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['vintage', 'retro', 'nostalgic']
  },
  {
    name: 'Grunge',
    slug: 'grunge',
    description: 'Gritty grunge artworks with textured surfaces',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['grunge', 'textured', 'urban']
  },
  {
    name: 'Photorealistic',
    slug: 'photorealistic',
    description: 'Incredibly detailed photorealistic artworks',
    image: '', // Category image - users can upload via admin interface
    count: 0,
    status: 'active',
    featured: false,
    tags: ['photorealistic', 'detailed', 'lifelike']
  }
];

class CategoryService {
  private categories: Category[] = [];
  private isInitialized = false;

  constructor() {
    // Initialize with real business categories
    this.initializeRealCategories();
  }

  private initializeRealCategories() {
    const now = new Date().toISOString();
    this.categories = productionCategories.map((cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'revenue' | 'views'>, index: number) => ({
      ...cat,
      id: (index + 1).toString(),
      createdAt: now,
      updatedAt: now,
      revenue: 0, // Real revenue will come from actual sales data
      views: 0    // Real views will come from actual analytics
    }));
  }

  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    try {
      // Try to fetch from Supabase first
      const supabaseCategories = await SupabaseCategoryService.getAllCategories();
      
      if (supabaseCategories && supabaseCategories.length > 0) {
        // Transform Supabase data to match our Category interface
        const transformedCategories = supabaseCategories.map(cat => {
          const transformed = {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            image: cat.image || '',
            image_path: cat.image_path || undefined, // Add image_path
            count: cat.product_count || cat.count || 0,
            status: cat.status || 'active',
            featured: cat.featured || false,
            tags: cat.tags || [],
            createdAt: cat.created_at || new Date().toISOString(),
            updatedAt: cat.updated_at || new Date().toISOString(),
            revenue: cat.revenue || 0,
            views: cat.views || 0
          };
          
          return transformed;
        });
        
        this.isInitialized = true;
        return transformedCategories;
      }
      
      // If no Supabase data, return real business categories
      console.log('No categories found in Supabase, using real business categories');
      return this.categories;
    } catch (error) {
      console.error('Error fetching categories from Supabase:', error);
      // Return real business categories on error
      return this.categories;
    }
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      // Try to fetch from Supabase first
      const supabaseCategory = await SupabaseCategoryService.getCategoryById(id);
      
      if (supabaseCategory) {
        // Transform Supabase data to match our Category interface
        return {
          id: supabaseCategory.id,
          name: supabaseCategory.name,
          slug: supabaseCategory.slug,
          description: supabaseCategory.description || '',
          image: supabaseCategory.image || '',
          image_path: supabaseCategory.image_path || undefined, // Add image_path
          count: supabaseCategory.product_count || 0,
          status: supabaseCategory.status || 'active',
          featured: supabaseCategory.featured || false,
          tags: supabaseCategory.tags || [],
          createdAt: supabaseCategory.created_at || new Date().toISOString(),
          updatedAt: supabaseCategory.updated_at || new Date().toISOString(),
          revenue: supabaseCategory.revenue || 0,
          views: supabaseCategory.views || 0
        };
      }
      
      // If no Supabase data, return from real business categories
      return this.categories.find(cat => cat.id === id) || null;
    } catch (error) {
      console.error('Error fetching category from Supabase:', error);
      // Return from real business categories on error
      return this.categories.find(cat => cat.id === id) || null;
    }
  }

  // Create new category
  async createCategory(categoryData: CreateCategoryData): Promise<Category | null> {
    try {
      console.log('Creating category with data:', categoryData);
      
      // Ensure slug is not null or empty
      const slug = categoryData.slug || categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      if (!slug) {
        throw new Error('Category slug cannot be empty');
      }
      
      // Try to create in Supabase first
      const supabaseCategory = await SupabaseCategoryService.createCategory({
        name: categoryData.name,
        slug: slug,
        description: categoryData.description,
        image: categoryData.image,
        status: categoryData.status,
        featured: categoryData.featured,
        tags: categoryData.tags
      });
      
      console.log('Supabase category created:', supabaseCategory);
      
      if (supabaseCategory) {
        // Transform Supabase data to match our Category interface
        const newCategory: Category = {
          id: supabaseCategory.id,
          name: supabaseCategory.name,
          slug: supabaseCategory.slug,
          description: supabaseCategory.description || '',
          image: supabaseCategory.image || '',
          image_path: supabaseCategory.image_path || undefined, // Add image_path
          count: 0,
          status: categoryData.status,
          featured: categoryData.featured,
          tags: categoryData.tags,
          createdAt: supabaseCategory.created_at || new Date().toISOString(),
          updatedAt: supabaseCategory.updated_at || new Date().toISOString(),
          revenue: 0,
          views: 0
        };
        
        // Also add to local array for consistency
        this.categories.push(newCategory);
        console.log('Category created successfully:', newCategory);
        return newCategory;
      }
      
      // If Supabase creation fails, create in local array
      const newCategory: Category = {
        ...categoryData,
        id: (this.categories.length + 1).toString(),
        count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        revenue: 0,
        views: 0
      };
      
      this.categories.push(newCategory);
      console.log('Category created locally:', newCategory);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }

  // Update category
  async updateCategory(updateData: UpdateCategoryData): Promise<Category | null> {
    try {
      const { id, image_path, ...updateFields } = updateData;
      
      // Note: image_path is extracted but not sent to database
      // because the 'image_path' column doesn't exist in the current schema
      // We keep it in local state for future reference
      
      // Try to update in Supabase first
      const supabaseCategory = await SupabaseCategoryService.updateCategory(id, {
        name: updateFields.name,
        slug: updateFields.slug,
        description: updateFields.description,
        image: updateFields.image,
        status: updateFields.status,
        featured: updateFields.featured,
        tags: updateFields.tags
      });
      
      if (supabaseCategory) {
        // Transform Supabase data to match our Category interface
        const updatedCategory: Category = {
          id: supabaseCategory.id,
          name: supabaseCategory.name,
          slug: supabaseCategory.slug,
          description: supabaseCategory.description || '',
          image: supabaseCategory.image || '',
          image_path: image_path, // Use the extracted image_path from the update data
          count: supabaseCategory.product_count || 0,
          status: supabaseCategory.status || 'active',
          featured: supabaseCategory.featured || false,
          tags: supabaseCategory.tags || [],
          createdAt: supabaseCategory.created_at || new Date().toISOString(),
          updatedAt: supabaseCategory.updated_at || new Date().toISOString(),
          revenue: supabaseCategory.revenue || 0,
          views: supabaseCategory.views || 0
        };
        
        // Also update in local array for consistency
        const index = this.categories.findIndex(cat => cat.id === id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        
        return updatedCategory;
      }
      
      // If Supabase update fails, update in local array
      const index = this.categories.findIndex(cat => cat.id === id);
      if (index === -1) return null;

      this.categories[index] = {
        ...this.categories[index],
        ...updateFields,
        updatedAt: new Date().toISOString()
      };

      return this.categories[index];
    } catch (error) {
      console.error('Error updating category:', error);
      return null;
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<boolean> {
    try {
      // Try to delete from Supabase first
      const success = await SupabaseCategoryService.deleteCategory(id);
      
      if (success) {
              // Also remove from local array for consistency
      const index = this.categories.findIndex(cat => cat.id === id);
      if (index !== -1) {
        this.categories.splice(index, 1);
      }
      return true;
    }
    
    // If Supabase deletion fails, delete from local array
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) return false;

    this.categories.splice(index, 1);
    return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  // Toggle category status
  async toggleCategoryStatus(id: string): Promise<Category | null> {
    try {
      const category = this.categories.find(cat => cat.id === id);
      if (!category) return null;

      const newStatus = category.status === 'active' ? 'inactive' : 'active';
      return await this.updateCategory({ id, status: newStatus });
    } catch (error) {
      console.error('Error toggling category status:', error);
      return null;
    }
  }

  // Toggle featured status
  async toggleFeaturedStatus(id: string): Promise<Category | null> {
    try {
      const category = this.categories.find(cat => cat.id === id);
      if (!category) return null;

      return await this.updateCategory({ id, featured: !category.featured });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      return null;
    }
  }

  // Search categories
  async searchCategories(query: string): Promise<Category[]> {
    try {
      const allCategories = await this.getAllCategories();
      if (!query.trim()) return allCategories;

      const searchTerm = query.toLowerCase();
      return allCategories.filter(category => 
        category.name.toLowerCase().includes(searchTerm) ||
        category.description.toLowerCase().includes(searchTerm) ||
        category.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching categories:', error);
      return [];
    }
  }

  // Get categories by status
  async getCategoriesByStatus(status: 'active' | 'inactive' | 'all'): Promise<Category[]> {
    try {
      const allCategories = await this.getAllCategories();
      if (status === 'all') return allCategories;
      
      return allCategories.filter(category => category.status === status);
    } catch (error) {
      console.error('Error fetching categories by status:', error);
      return [];
    }
  }

  // Get real category statistics from Supabase
  async getCategoryStats(): Promise<any> {
    try {
      const stats = await SupabaseCategoryService.getCategoryStats();
      return stats;
    } catch (error) {
      console.error('Error fetching category stats from Supabase:', error);
      return null;
    }
  }

  // Check if Supabase is available and working
  async checkSupabaseConnection(): Promise<boolean> {
    try {
      const categories = await SupabaseCategoryService.getAllCategories();
      return Array.isArray(categories);
    } catch (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
  }

  // Get featured categories
  async getFeaturedCategories(): Promise<Category[]> {
    try {
      const allCategories = await this.getAllCategories();
      return allCategories.filter(category => category.featured);
    } catch (error) {
      console.error('Error fetching featured categories:', error);
      return [];
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;
