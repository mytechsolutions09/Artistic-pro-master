export interface ArtWork {
  id: string;
  title: string;
  price: number;
  category: string;
  images: string[]; // Changed from single image to array of images
  featured: boolean;
  downloads: number;
  rating: number;
  tags: string[];
  // Additional fields for order items
  productType?: 'digital' | 'poster' | 'clothing';
  posterSize?: string;
  itemDetails?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  // Support both single image (admin categories) and images array (frontend categories)
  image?: string;
  images?: string[];
  description?: string;
  status?: 'active' | 'inactive';
  featured?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  revenue?: number;
  views?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'artist';
  joinDate: string;
  totalPurchases: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedProductType: 'digital' | 'poster' | 'clothing';
  selectedPosterSize?: string;
  selectedPrice: number;
  options?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  items: ArtWork[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  date: string;
  paymentId?: string;
  paymentMethod?: string;
  downloadLinks?: string[];
  customerEmail?: string;
  shipping_address?: string;
  billing_address?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  message?: string;
  downloadLinks?: string[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
  status: 'active' | 'pending' | 'rejected';
  images?: string[]; // Array of image URLs
  orderId?: string; // ID of the order this review is for
  orderItemId?: string; // ID of the specific order item this review is for
}

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number; // Original price before discount
  discountPercentage?: number; // Discount percentage (0-100)
  categories: string[]; // Changed from single category to multiple categories
  images: string[]; // Changed from single image to array of images
  main_image?: string; // Main product image URL (for email and profile)
  pdf_url?: string; // PDF file URL (sent via email and available in profile)
  video_url?: string; // Product video URL
  image_url?: string; // For backward compatibility with supabase
  productType: 'digital' | 'poster' | 'clothing'; // Product type for different handling
  posterSize?: string; // Size for poster products (e.g., "A4", "A3", "A2", "A1")
  posterPricing?: Record<string, number>; // Pricing for each poster size
  featured: boolean;
  downloads: number;
  rating: number;
  tags: string[];
  status: 'active' | 'inactive' | 'draft';
  createdDate: string;
  created_date?: string; // For backward compatibility with supabase
  description: string;
  reviews: Review[];
  slug?: string; // For routing
  views?: number; // For popularity metrics
  favoritesCount?: number; // Number of users who favorited this product
  // Product details sections
  itemDetails?: {
    material: string;
    size: string;
    frame: string;
    style: string;
    origin: string;
  };
  delivery?: {
    standardDelivery: string;
    expressDelivery: string;
    sameDayDelivery: string;
    additionalInfo: string;
  };
  didYouKnow?: {
    artistStory: string;
    ecoFriendly: string;
    uniqueFeatures: string;
  };
  // Clothing-specific fields
  productId?: string; // SKU (Stock Keeping Unit)
  gender?: string; // 'Men', 'Women', or 'Unisex'
  details?: string; // Product details (material, weight, features)
  washCare?: string; // Washing and care instructions
  shipping?: string; // Shipping information
  clothingType?: string; // Type: Oversized Hoodies, Extra Oversized Hoodies, etc.
  material?: string; // Fabric material
  brand?: string; // Product brand
  // Inventory fields
  stockQuantity?: number; // Available stock quantity
  lowStockThreshold?: number; // Alert when stock falls below this
  trackInventory?: boolean; // Whether to track inventory for this product
}

export interface HomepageSection {
  id: string;
  type: 'hero' | 'imageSlider' | 'featuredGrid' | 'bestSellers' | 'featuredArtwork' | 'categories' | 'trendingCollections' | 'stats' | 'newsletter';
  title: string;
  subtitle?: string;
  visible: boolean;
  order: number;
  config: any;
}

export interface HeroSectionConfig {
  mainCard: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    gradientColors?: string[];
  };
  featuredCard: {
    title: string;
    subtitle: string;
    images: string[]; // Changed from single image to array of images
    link: string;
  };
  categoriesCard: {
    title: string;
    subtitle: string;
    images: string[]; // Changed from single image to array of images
    link: string;
  };
}

export interface ImageSliderConfig {
  slides: Array<{
    id: string;
    images: string[]; // Changed from single image to array of images
    title: string;
    description: string;
    link?: string;
  }>;
  autoPlay: boolean;
  interval: number;
  showDots: boolean;
  showArrows: boolean;
  showArtistInfo: boolean;
}

export interface FeaturedGridConfig {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  showButton: boolean;
  gridLayout: 'two-column' | 'three-column' | 'four-column';
  backgroundImage?: string;
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    description?: string;
    images: string[]; // Changed from single image to array of images
    link: string;
    overlayStyle: 'gradient' | 'solid' | 'none';
    textPosition: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
  }>;
}

export interface BestSellersConfig {
  title: string;
  subtitle: string;
  maxItems: number;
  buttonText: string;
  buttonLink: string;
  showButton: boolean;
  showRating: boolean;
  showDownloads: boolean;
  showBadge: boolean;
  selectedProducts: Array<{
    id: string;
    title: string;
    price: number;
    images: string[]; // Changed from single image to array of images
    rating: number;
    downloads: number;
    category: string;
    badge?: string;
    badgeColor?: string;
    link: string;
  }>;
}

export interface FeaturedArtworkConfig {
  title: string;
  subtitle: string;
  maxItems: number;
  buttonText: string;
  buttonLink: string;
  showButton: boolean;
  showRating: boolean;
  showDownloads: boolean;
  showBadge: boolean;
  selectedProducts: Array<{
    id: string;
    title: string;
    price: number;
    images: string[]; // Changed from single image to array of images
    rating: number;
    downloads: number;
    category: string;
    badge?: string;
    badgeColor?: string;
    link: string;
  }>;
}

export interface CategoriesConfig {
  title: string;
  subtitle: string;
  maxCategories: number;
  buttonText: string;
  buttonLink: string;
  showButton: boolean;
  showProductCount: boolean;
  selectedCategories: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
    images: string[]; // Changed from single image to array of images
    description?: string;
    featured?: boolean;
  }>;
}

export interface TrendingCollectionsConfig {
  title: string;
  subtitle: string;
  showButton: boolean;
  buttonText: string;
  buttonLink: string;
  collections: Array<{
    id: string;
    title: string;
    description: string;
    images: string[]; // Changed from single image to array of images
    artworkCount: number;
    badge?: string;
    badgeColor?: string;
    link: string;
    updateFrequency?: string;
    status?: 'trending' | 'popular' | 'new';
  }>;
}

export interface StatsConfig {
  stats: Array<{
    id: string;
    icon: string;
    value: string;
    label: string;
    color: string;
  }>;
}

export interface NewsletterConfig {
  title: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
}
