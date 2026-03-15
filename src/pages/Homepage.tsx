import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Download, Palette, Users, TrendingUp, Award, Heart, Grid3X3, ArrowRight } from 'lucide-react';
import { HomepageSettingsService } from '../services/homepageSettingsService';
import { ProductService, CategoryService } from '../services/supabaseService';
import { appCache, CACHE_KEYS, CACHE_TTL } from '../services/cacheService';
import { useCurrency } from '../contexts/CurrencyContext';
import { generateProductUrl, generateSlug } from '../utils/slugUtils';
import { logMemoryUsage, isMemoryUsageHigh } from '../utils/memoryUtils';
import HomepageSkeleton from '../components/HomepageSkeleton';
import OptimizedImage from '../components/OptimizedImage';
import BentoHeroSection from '../components/BentoHeroSection';
import { NavigationVisibilityService } from '../services/navigationVisibilityService';

const Homepage: React.FC = () => {
  // Currency context
  const { formatUIPrice } = useCurrency();
  
  // State for loaded settings and data
  const [homepageSettings, setHomepageSettings] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [realProducts, setRealProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [realCategories, setRealCategories] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [realStats, setRealStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Optimized homepage data loading with memory monitoring
  const loadHomepageData = useCallback(async () => {
    try {
      setLoading(true);
      logMemoryUsage('Homepage - Before Loading Data');
      
      // Check memory usage before loading large datasets
      if (isMemoryUsageHigh(80)) {
        console.warn('High memory usage detected, loading minimal data');
        const settings = await HomepageSettingsService.getHomepageSettings();
        setHomepageSettings(settings);
        setRealProducts([]);
        setRealCategories([]);
        setRealStats(null);
        setLoading(false);
        return;
      }
      
      // Settings and categories are served from cache when warm (populated by global contexts)
      const [settings, categories, stats] = await Promise.all([
        HomepageSettingsService.getHomepageSettings(),
        appCache.getOrFetch(CACHE_KEYS.CATEGORIES_ALL, () => CategoryService.getAllCategories(), CACHE_TTL.CATEGORIES),
        appCache.getOrFetch('stats:products', () => ProductService.getProductStats(), CACHE_TTL.PRODUCTS),
      ]);

      // Lightweight homepage product fetch — cached separately from the full admin product list
      const products = await appCache.getOrFetch<any[]>(
        CACHE_KEYS.PRODUCTS_HOMEPAGE,
        async () => {
          const { supabase } = await import('../services/supabaseService');
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id, title, price, original_price, discount_percentage, images, main_image, categories, category, rating, downloads, slug, status, featured, product_type, created_date')
            .eq('status', 'active')
            .order('created_date', { ascending: false })
            .limit(50);
          return productsError ? [] : (productsData || []).map((product: any) => ({
            ...product,
            productType: product.product_type || 'digital',
            createdDate: product.created_date,
            favoritesCount: 0
          }));
        },
        CACHE_TTL.PRODUCTS
      );
      
      
      setHomepageSettings(settings);
      setRealProducts(products);
      setRealCategories(categories);
      setRealStats(stats);
      
      logMemoryUsage('Homepage - After Loading Data');
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomepageData();
  }, []);

  // These variables are used in loadHomepageData function

  // Dynamic configurations that use saved settings or fall back to defaults
  const heroSection = homepageSettings?.hero_section || {
    height: 300,
    mainCard: {
      title: 'Digital Art Collection',
      subtitle: 'Discover unique digital artworks for your space',
      buttonText: 'Discover more',
      buttonLink: '/browse',
      gradientColors: ['from-orange-200', 'to-orange-300']
    },
    featuredCard: {
      title: 'Featured Artwork',
      subtitle: 'Curated masterpieces',
      images: ['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
      link: '/featured'
    },
    categoriesCard: {
      title: 'Categories',
      subtitle: 'Explore by style',
      images: ['https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800'],
      link: '/categories'
    }
  };

  const imageSlider = homepageSettings?.image_slider || {
    slides: [
      {
        id: '1',
        title: 'Abstract Harmony',
        subtitle: 'A mesmerizing blend of colors and shapes',
        description: 'This piece explores the boundaries between chaos and order.',
        images: ['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
        link: '/artwork/1'
      },
      {
        id: '2',
        title: 'Watercolor Dreams',
        subtitle: 'Delicate brushstrokes and flowing pigments',
        description: 'A dreamlike landscape that transports viewers to another world.',
        images: ['https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=800'],
        link: '/artwork/2'
      },
      {
        id: '3',
        title: 'Modern Expression',
        subtitle: 'Contemporary art that challenges boundaries',
        description: 'Bold strokes and innovative techniques that redefine artistic expression.',
        images: ['https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800'],
        link: '/artwork/3'
      }
    ],
    autoPlay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
    showArtistInfo: true
  };

  // Ensure slides have valid images array
  const safeImageSlider = {
    ...imageSlider,
    slides: imageSlider.slides.map((slide: any) => ({
      ...slide,
      images: slide.images || (slide.image ? [slide.image] : ['/placeholder-image.jpg'])
    }))
  };

  const featuredGrid = homepageSettings?.featured_grid || {
    title: '',
    subtitle: '',
    buttonText: 'Explore Collections',
    buttonLink: '/browse',
    showButton: true,
    gridLayout: 'two-column',
    items: [
      {
        id: '1',
        title: 'Exclusive Artist Collections',
        subtitle: 'Discover curated collections from our most talented artists',
        description: 'Explore Collections',
        images: ['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
        link: '/collections',
        overlayStyle: 'gradient',
        textPosition: 'bottom-left'
      },
      {
        id: '2',
        title: 'Artist Spotlight',
        subtitle: 'Featured creators',
        description: 'Meet the artists',
        images: ['https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800'],
        link: '/artists',
        overlayStyle: 'gradient',
        textPosition: 'bottom-left'
      }
    ]
  };

  // Ensure featured grid items have valid images array
  const safeFeaturedGrid = {
    ...featuredGrid,
    items: featuredGrid.items.map((item: any) => ({
      ...item,
      images: item.images || (item.image ? [item.image] : ['/placeholder-image.jpg'])
    }))
  };

  const bestSellers = homepageSettings?.best_sellers || {
    title: 'Best Sellers',
    subtitle: 'Our most popular and highest-rated artworks loved by customers worldwide',
    maxItems: 5,
    buttonText: 'View All Best Sellers',
    buttonLink: '/browse',
    showButton: true,
    showRating: true,
    showDownloads: true,
    showBadge: true,
    selectedProducts: [
      {
        id: '1',
        title: 'Urban Majesty',
        price: 450,
        originalPrice: 500,
        discountPercentage: 10,
        images: ['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
        rating: 4.5,
        downloads: 12,
        favoritesCount: 0,
        category: 'Abstract',
        badge: 'Best Seller',
        badgeColor: 'pink',
        link: generateProductUrl('Abstract', 'Urban Majesty')
      },
      {
        id: '2',
        title: 'Urban Majesty (Copy)',
        price: 450,
        originalPrice: 500,
        discountPercentage: 10,
        images: ['https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800'],
        rating: 4.5,
        downloads: 0,
        favoritesCount: 0,
        category: 'Abstract',
        badge: 'Best Seller',
        badgeColor: 'pink',
        link: generateProductUrl('Abstract', 'Urban Majesty (Copy)')
      }
    ]
  };

  // Get best sellers from real products data
  const getBestSellersProducts = () => {
    if (!realProducts || realProducts.length === 0) {
      return bestSellers.selectedProducts; // Fallback to sample data
    }
    const visibilitySettings = NavigationVisibilityService.getSettings();
    
    // Get products with actual pricing data (originalPrice and discountPercentage)
    const productsWithDiscounts = realProducts.filter(product => 
      product.originalPrice && product.originalPrice > product.price
    );
    
    // If we have products with discounts, use them; otherwise use top products by downloads
    const bestSellersProducts = productsWithDiscounts.length > 0 
      ? productsWithDiscounts.slice(0, 3)
      : realProducts
          .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
          .slice(0, 3);
    
    return bestSellersProducts
      .filter((product) => NavigationVisibilityService.isProductVisible(product, visibilitySettings))
      .map(product => {
      const category = product.categories?.[0] || product.category || 'Art';
      
      // Check if product is clothing by category or properties
      const clothingCategories = ['unisex', 'men', 'women', 'mens', 'womens', 'clothing', 'tshirt', 't-shirt', 'shirt', 'sweatshirt', 'hoodie'];
      const isCategoryClothing = clothingCategories.some(cat => 
        category?.toLowerCase().includes(cat)
      );
      const hasClothingProperties = !!(product.sizes || product.colors || product.type === 'clothing');
      const isClothing = isCategoryClothing || hasClothingProperties;
      
      // Generate appropriate URL based on product type
      let productLink;
      if (isClothing) {
        // For clothing products, use /clothes/ prefix
        productLink = `/clothes/${generateSlug(product.title)}`;
      } else {
        // For art products, use category/product format
        productLink = generateProductUrl(category, product.title);
      }
      
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage,
        images: product.images || (product.main_image ? [product.main_image] : ['/placeholder-image.jpg']),
        rating: product.rating || 4.5,
        downloads: product.downloads || 0,
        favoritesCount: product.favoritesCount || 0,
        category: category,
        badge: 'Best Seller',
        badgeColor: 'pink',
        link: productLink,
        isClothing: isClothing
      };
    });
  };

  // Ensure best sellers products have valid images array
  const safeBestSellers = {
    ...bestSellers,
    selectedProducts: getBestSellersProducts().map((product: any) => ({
      ...product,
      images: product.images || (product.image ? [product.image] : ['/placeholder-image.jpg'])
    }))
  };

  // Get featured artwork from real products data
  const getFeaturedArtworkProducts = () => {
    if (!realProducts || realProducts.length === 0) {
      return featuredArtwork.selectedProducts; // Fallback to sample data
    }
    
    // Filter out F&B and clothing products first
    const artOnlyProducts = realProducts.filter(product => {
      const categories = (product.categories || []).map((c: string) => c.toLowerCase());
      const tags = ((product as any).tags || []).map((t: string) => t.toLowerCase());
      const combined = [...categories, ...tags].join(' ');
      
      // Exclude F&B products
      const isFB = combined.includes('food & beverage') ||
                   combined.includes('f&b') ||
                   combined.includes('f & b') ||
                   combined.includes('dry fruit') ||
                   combined.includes('dried fruit') ||
                   combined.includes('spice');
      if (isFB) return false;
      
      // Exclude clothing products
      const isClothing = combined.includes('men') ||
                        combined.includes('women') ||
                        combined.includes('clothing') ||
                        !!(product as any).gender;
      if (isClothing) return false;
      
      return true;
    });
    
    // Get featured products (products marked as featured in database)
    const featuredProducts = artOnlyProducts.filter(product => product.featured === true);
    
    // If we have featured products, use them; otherwise use top products by rating
    const artworkProducts = featuredProducts.length > 0 
      ? featuredProducts.slice(0, 4)
      : artOnlyProducts
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);
    
    return artworkProducts.map(product => {
      const category = product.categories?.[0] || product.category || 'Art';
      
      // Check if product is clothing by category or properties
      const clothingCategories = ['unisex', 'men', 'women', 'mens', 'womens', 'clothing', 'tshirt', 't-shirt', 'shirt', 'sweatshirt', 'hoodie'];
      const isCategoryClothing = clothingCategories.some(cat => 
        category?.toLowerCase().includes(cat)
      );
      const hasClothingProperties = !!(product.sizes || product.colors || product.type === 'clothing' || (product as any).gender);
      const isClothing = isCategoryClothing || hasClothingProperties;
      
      // Generate appropriate URL based on product type
      let productLink;
      if (isClothing) {
        // For clothing products, use /clothes/ prefix
        productLink = `/clothes/${generateSlug(product.title)}`;
      } else {
        // For art products, use category/product format
        productLink = generateProductUrl(category, product.title);
      }
      
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage,
        images: product.images || (product.main_image ? [product.main_image] : ['/placeholder-image.jpg']),
        rating: product.rating || 4.5,
        downloads: product.downloads || 0,
        favoritesCount: product.favoritesCount || 0,
        category: category,
        badge: 'Featured',
        badgeColor: 'blue',
        link: productLink
      };
    });
  };

  const featuredArtwork = homepageSettings?.featured_artwork || {
    title: 'Featured Artwork',
    subtitle: 'Handpicked masterpieces from our most talented artists',
    maxItems: 4,
    buttonText: 'Explore More Artwork',
    buttonLink: '/browse',
    showButton: true,
    showRating: true,
    showDownloads: true,
    showBadge: true,
    selectedProducts: [
      {
        id: '3',
        title: 'Vintage Sports Car',
        artist: 'Roberto Silva',
        price: 39.99,
        originalPrice: 49.99,
        discountPercentage: 20,
        images: ['https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800'],
        rating: 4.7,
        downloads: 756,
        favoritesCount: 45,
        category: 'Automotive',
        badge: 'Featured',
        badgeColor: 'blue',
        link: generateProductUrl('Automotive', 'Vintage Sports Car')
      },
      {
        id: '4',
        title: 'Garden Paradise',
        artist: 'Emma Johnson',
        price: 24.99,
        originalPrice: 34.99,
        discountPercentage: 29,
        images: ['https://images.pexels.com/photos/1172207/pexels-photo-1172207.jpeg?auto=compress&cs=tinysrgb&w=800'],
        rating: 4.9,
        downloads: 1156,
        favoritesCount: 78,
        category: 'Nature',
        badge: 'Featured',
        badgeColor: 'green',
        link: generateProductUrl('Nature', 'Garden Paradise')
      },
      {
        id: '5',
        title: 'Abstract Dreams',
        artist: 'Maria Garcia',
        price: 32.99,
        originalPrice: 42.99,
        discountPercentage: 23,
        images: ['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
        rating: 4.6,
        downloads: 892,
        favoritesCount: 56,
        category: 'Abstract',
        badge: 'Featured',
        badgeColor: 'purple',
        link: generateProductUrl('Abstract', 'Abstract Dreams')
      },
      {
        id: '6',
        title: 'Ocean Waves',
        artist: 'David Chen',
        price: 28.99,
        originalPrice: 38.99,
        discountPercentage: 26,
        images: ['https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800'],
        rating: 4.8,
        downloads: 634,
        favoritesCount: 34,
        category: 'Nature',
        badge: 'Featured',
        badgeColor: 'teal',
        link: generateProductUrl('Nature', 'Ocean Waves')
      }
    ]
  };

  // Ensure featured artwork products have valid images array and correct links
  const safeFeaturedArtwork = {
    ...featuredArtwork,
    selectedProducts: getFeaturedArtworkProducts().map((product: any) => {
      // Regenerate link to ensure correct format (fix /artwork/ links)
      const category = product.category || product.categories?.[0] || 'Art';
      
      // Check if product is clothing by category or properties
      const clothingCategories = ['unisex', 'men', 'women', 'mens', 'womens', 'clothing', 'tshirt', 't-shirt', 'shirt', 'sweatshirt', 'hoodie'];
      const isCategoryClothing = clothingCategories.some(cat => 
        category?.toLowerCase().includes(cat)
      );
      const hasClothingProperties = !!(product.sizes || product.colors || product.type === 'clothing' || product.gender);
      const isClothing = isCategoryClothing || hasClothingProperties;
      
      // Generate appropriate URL based on product type
      let productLink;
      if (isClothing) {
        // For clothing products, use /clothes/ prefix
        productLink = `/clothes/${generateSlug(product.title)}`;
      } else {
        // For art products, use category/product format
        productLink = generateProductUrl(category, product.title);
      }
      
      return {
        ...product,
        images: product.images || (product.image ? [product.image] : ['/placeholder-image.jpg']),
        link: productLink // Always regenerate link to ensure correct format
      };
    })
  };

  const categoriesSection = homepageSettings?.categories || {
    title: '',
    subtitle: '',
    maxCategories: 8,
    buttonText: 'View All Categories',
    buttonLink: '/categories',
    showButton: true,
    showProductCount: true,
    selectedCategories: [
      {
        id: '1',
        name: 'Abstract',
        slug: 'abstract',
        count: 245,
        image: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: 'Modern abstract art and designs',
        featured: true
      },
      {
        id: '2',
        name: 'Nature',
        slug: 'nature',
        count: 189,
        image: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: 'Beautiful nature and landscape art',
        featured: true
      },
      {
        id: '3',
        name: 'Portrait',
        slug: 'portrait',
        count: 156,
        image: 'https://images.pexels.com/photos/1172207/pexels-photo-1172207.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: 'Human portraits and figure art',
        featured: false
      }
    ]
  };

  const resolvedHomepageCategories = (categoriesSection.selectedCategories || []).map((category: any) => {
    const liveCategory = (realCategories || []).find((candidate: any) => {
      if (category?.id && candidate?.id) return candidate.id === category.id;
      if (category?.slug && candidate?.slug) return candidate.slug === category.slug;
      if (category?.name && candidate?.name) return candidate.name === category.name;
      return false;
    });

    const liveImage = liveCategory?.image;
    const existingImage =
      category?.image || (Array.isArray(category?.images) && category.images.length > 0 ? category.images[0] : undefined);

    return {
      ...category,
      image: liveImage || existingImage,
      count: liveCategory?.count ?? category?.count ?? 0,
      description: liveCategory?.description || category?.description,
      slug: liveCategory?.slug || category?.slug,
    };
  });

  const trendingCollections = homepageSettings?.trending_collections || {
    title: 'Trending Collections',
    subtitle: 'Discover the most popular and trending art collections this season',
    showButton: true,
    buttonText: 'View All Collections',
    buttonLink: '/collections',
    collections: [
      {
        id: '1',
        title: 'Abstract Expressionism',
        image: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600',
        artworkCount: 245,
        description: 'Bold colors and dynamic brushstrokes that capture raw emotion and creative energy.',
        badge: 'Trending',
        badgeColor: 'orange',
        link: '/categories/abstract',
        updateFrequency: 'Updated daily',
        status: 'trending'
      },
      {
        id: '2',
        title: 'Watercolor Masterpieces',
        image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=600',
        artworkCount: 298,
        description: 'Delicate and flowing watercolor techniques that bring nature and imagination to life.',
        badge: 'Popular',
        badgeColor: 'green',
        link: '/categories/watercolor',
        updateFrequency: 'Weekly updates',
        status: 'popular'
      },
      {
        id: '3',
        title: 'Contemporary Classics',
        image: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=600',
        artworkCount: 445,
        description: 'Modern interpretations of classical themes with innovative techniques and bold concepts.',
        badge: 'New',
        badgeColor: 'purple',
        link: '/categories/paintings',
        updateFrequency: 'Fresh content',
        status: 'new'
      }
    ]
  };

  // const statsSection = homepageSettings?.stats || { stats: [] };

  // Image Slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (safeImageSlider.autoPlay) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % safeImageSlider.slides.length);
      }, safeImageSlider.interval);
      return () => clearInterval(timer);
    }
  }, [safeImageSlider.autoPlay, safeImageSlider.interval, safeImageSlider.slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % safeImageSlider.slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + safeImageSlider.slides.length) % safeImageSlider.slides.length);
  };



  // Show loading state while data is being fetched
  if (loading) {
    return <HomepageSkeleton />;
  }

  return (
    <div className="min-h-screen">

      {/* Bento Hero Section */}
      <BentoHeroSection
        cards={
          homepageSettings?.bento_hero?.cards ||
          homepageSettings?.hero_section?.bento_cards ||
          []
        }
      />

      {/* Image Slider Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Full-bleed slider — image fills the whole card */}
          <div className="relative rounded-2xl shadow-lg overflow-hidden h-[340px] sm:h-[420px] lg:h-[480px]">

            {/* Full-bleed background image */}
            <OptimizedImage
              src={safeImageSlider.slides[currentSlide].images[0]}
              alt={safeImageSlider.slides[currentSlide].title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 scale-100 hover:scale-105"
              width={1400}
              priority={true}
            />

            {/* Navigation Arrows */}
            {safeImageSlider.showArrows && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-3 lg:left-5 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white backdrop-blur-sm text-gray-800 p-2 lg:p-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft size={18} className="lg:w-5 lg:h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 lg:right-5 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white backdrop-blur-sm text-gray-800 p-2 lg:p-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight size={18} className="lg:w-5 lg:h-5" />
                </button>
              </>
            )}

            {/* White gradient + text at the bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
              {/* Gradient fade from transparent → white */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />

              {/* Text & button sit on top of the gradient */}
              <div className="relative px-5 sm:px-8 lg:px-10 pt-10 pb-5 sm:pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 leading-snug font-sans truncate">
                    {safeImageSlider.slides[currentSlide].title}
                  </h2>
                  {safeImageSlider.slides[currentSlide].subtitle && (
                    <p className="text-xs sm:text-sm text-gray-500 mb-1 font-sans font-normal">
                      {safeImageSlider.slides[currentSlide].subtitle}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 font-sans font-normal line-clamp-2 hidden sm:block">
                    {safeImageSlider.slides[currentSlide].description}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Slide dots */}
                  {safeImageSlider.slides.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      {safeImageSlider.slides.map((_: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`rounded-full transition-all duration-300 ${
                            i === currentSlide
                              ? 'w-5 h-2 bg-gray-800'
                              : 'w-2 h-2 bg-gray-300 hover:bg-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <Link
                    to={safeImageSlider.slides[currentSlide].link}
                    className="inline-block px-4 sm:px-5 py-2 bg-gray-900 text-white hover:bg-gray-700 font-medium rounded-full transition-colors text-xs sm:text-sm font-sans whitespace-nowrap"
                  >
                    View Artwork
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grid Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          {(safeFeaturedGrid.title || safeFeaturedGrid.subtitle) && (
            <div className="flex items-end justify-between mb-7">
              <div>
                {safeFeaturedGrid.title && (
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-sans">{safeFeaturedGrid.title}</h2>
                )}
                {safeFeaturedGrid.subtitle && (
                  <p className="text-sm text-gray-500 mt-1 font-sans">{safeFeaturedGrid.subtitle}</p>
                )}
              </div>
              {safeFeaturedGrid.showButton && (
                <Link
                  to={safeFeaturedGrid.buttonLink}
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors font-sans"
                >
                  {safeFeaturedGrid.buttonText}
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          )}

          {/* Asymmetric magazine layout for exactly 3 items */}
          {safeFeaturedGrid.gridLayout === 'three-column' && safeFeaturedGrid.items.length === 3 ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 h-[360px] sm:h-[440px] lg:h-[500px]"
              style={{ gridTemplateRows: '1fr 1fr' }}
            >
              {/* Card 1 — tall hero card, spans 2 rows */}
              <Link
                to={safeFeaturedGrid.items[0].link}
                className="group col-span-1 row-span-2 relative rounded-2xl overflow-hidden"
              >
                <OptimizedImage
                  src={safeFeaturedGrid.items[0].images[0]}
                  alt={safeFeaturedGrid.items[0].title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  width={700}
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <span className="text-[10px] uppercase tracking-widest text-white/60 font-sans font-medium">Collection</span>
                  <h3 className="text-white font-bold text-sm sm:text-base leading-snug mt-0.5 mb-1 font-sans">{safeFeaturedGrid.items[0].title}</h3>
                  <p className="text-white/70 text-xs font-sans hidden sm:block">{safeFeaturedGrid.items[0].subtitle}</p>
                  <span className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-xs text-white/80 group-hover:text-white group-hover:gap-2 transition-all font-sans">
                    Explore <ArrowRight size={11} />
                  </span>
                </div>
              </Link>

              {/* Cards 2 & 3 — fill each row of the right column */}
              {[safeFeaturedGrid.items[1], safeFeaturedGrid.items[2]].map((item: any) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="group relative rounded-2xl overflow-hidden"
                >
                  <OptimizedImage
                    src={item.images[0]}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    width={500}
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <span className="text-[9px] uppercase tracking-widest text-white/60 font-sans font-medium hidden sm:block">Collection</span>
                    <h3 className="text-white font-bold text-xs sm:text-sm leading-snug font-sans">{item.title}</h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-white/70 group-hover:text-white group-hover:gap-1.5 transition-all font-sans">
                      Explore <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

          ) : safeFeaturedGrid.gridLayout === 'two-column' && safeFeaturedGrid.items.length >= 2 ? (
            /* Two-column: first card wide hero, rest stack */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {safeFeaturedGrid.items.map((item: any, idx: number) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className={`group relative rounded-2xl overflow-hidden ${idx === 0 ? 'h-72 sm:h-80' : 'h-56 sm:h-64'}`}
                >
                  <OptimizedImage
                    src={item.images[0]}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    width={700}
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <span className="text-[10px] uppercase tracking-widest text-white/60 font-sans font-medium">Collection</span>
                    <h3 className="text-white font-bold text-sm sm:text-base leading-snug mt-0.5 mb-1 font-sans">{item.title}</h3>
                    <p className="text-white/70 text-xs font-sans hidden sm:block">{item.subtitle}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-white/80 group-hover:text-white group-hover:gap-2 transition-all font-sans">
                      Explore <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

          ) : (
            /* Four-column / fallback: uniform grid */
            <div className={`grid gap-3 sm:gap-4 grid-cols-2 ${
              safeFeaturedGrid.gridLayout === 'four-column' ? 'md:grid-cols-4' : 'md:grid-cols-3'
            }`}>
              {safeFeaturedGrid.items.map((item: any) => (
                <Link key={item.id} to={item.link} className="group relative rounded-2xl overflow-hidden h-52 sm:h-64">
                  <OptimizedImage
                    src={item.images[0]}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    width={500}
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <h3 className="text-white font-bold text-xs sm:text-sm leading-snug font-sans">{item.title}</h3>
                    <p className="text-white/70 text-[11px] mt-0.5 font-sans">{item.subtitle}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-white/70 group-hover:text-white group-hover:gap-1.5 transition-all font-sans">
                      Explore <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile CTA button */}
          {safeFeaturedGrid.showButton && (
            <div className="text-center mt-7 sm:hidden">
              <Link
                to={safeFeaturedGrid.buttonLink}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors font-sans"
              >
                {safeFeaturedGrid.buttonText}
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {safeBestSellers.selectedProducts.map((product: any) => (
              <Link key={product.id} to={product.link} className="group">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative overflow-hidden h-80">
                    <OptimizedImage
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                      width={500}
                      priority={false}
                    />
                    {safeBestSellers.showBadge && (
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white bg-${product.badgeColor}-500 font-sans font-normal`}>
                        {product.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2 truncate font-sans font-normal" title={product.title}>{product.title}</h3>
                    
                    {/* Price Section */}
                    <div className="mb-2">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="text-base font-semibold text-black font-sans font-normal">
                              {formatUIPrice(product.price, 'INR')}
                            </div>
                            <div className="text-xs text-green-600 font-semibold font-sans font-normal">
                              {product.discountPercentage}% OFF
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 line-through font-sans font-normal">
                            {formatUIPrice(product.originalPrice, 'INR')}
                          </div>
                        </div>
                      ) : (
                        <div className="text-base font-semibold text-black font-sans font-normal">
                          {formatUIPrice(product.price, 'INR')}
                        </div>
                      )}
                    </div>

                    {/* Stats Section */}
                    <div className="flex items-center justify-between text-xs text-gray-500 font-sans font-normal">
                      <div className="flex items-center space-x-3">
                        {safeBestSellers.showDownloads && (
                          <div className="flex items-center space-x-1">
                            <Download className="w-3 h-3" />
                            <span>{product.downloads || 0}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{product.favoritesCount || 0}</span>
                        </div>
                      </div>
                      {safeBestSellers.showRating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span>{product.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {safeBestSellers.showButton && (
            <div className="text-center mt-8">
              <Link
                to={safeBestSellers.buttonLink}
                className="inline-block px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 font-medium rounded-full transition-colors text-sm font-sans font-normal"
              >
                {safeBestSellers.buttonText}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Artwork Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safeFeaturedArtwork.selectedProducts.map((product: any) => (
              <Link key={product.id} to={product.link} className="group">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative overflow-hidden h-80">
                    <OptimizedImage
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                      width={400}
                      priority={false}
                    />
                    {safeFeaturedArtwork.showBadge && (
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white bg-${product.badgeColor}-500 font-sans font-normal`}>
                        {product.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2 truncate font-sans font-normal" title={product.title}>{product.title}</h3>
                    
                    {/* Price Section */}
                    <div className="mb-2">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="text-base font-semibold text-black font-sans font-normal">
                              {formatUIPrice(product.price, 'INR')}
                            </div>
                            <div className="text-xs text-green-600 font-semibold font-sans font-normal">
                              {product.discountPercentage}% OFF
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 line-through font-sans font-normal">
                            {formatUIPrice(product.originalPrice, 'INR')}
                          </div>
                        </div>
                      ) : (
                        <div className="text-base font-semibold text-black font-sans font-normal">
                          {formatUIPrice(product.price, 'INR')}
                        </div>
                      )}
                    </div>

                    {/* Stats Section */}
                    <div className="flex items-center justify-between text-xs text-gray-500 font-sans font-normal">
                      <div className="flex items-center space-x-3">
                        {safeFeaturedArtwork.showDownloads && (
                          <div className="flex items-center space-x-1">
                            <Download className="w-3 h-3" />
                            <span>{product.downloads || 0}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{product.favoritesCount || 0}</span>
                        </div>
                      </div>
                      {safeFeaturedArtwork.showRating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span>{product.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {safeFeaturedArtwork.showButton && (
            <div className="text-center mt-8">
              <Link
                to={safeFeaturedArtwork.buttonLink}
                className="inline-block px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 font-medium rounded-full transition-colors text-sm font-sans font-normal"
              >
                {safeFeaturedArtwork.buttonText}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section - Compact */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resolvedHomepageCategories.map((category: any) => (
              <Link key={category.id} to={`/${category.slug}`} className="group">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="relative h-32">
                    <OptimizedImage
                      src={category.image}
                      alt={category.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      width={300}
                      priority={false}
                    />
                    {category.featured && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white bg-pink-500 font-sans font-normal">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-gray-800 mb-1 font-sans font-normal">{category.name}</h3>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2 font-sans font-normal">{category.description}</p>
                    {categoriesSection.showProductCount && (
                      <div className="flex items-center justify-between font-sans font-normal">
                        <span className="text-xs text-gray-500">{category.count} artworks</span>
                        <span className="text-black text-xs font-medium group-hover:text-gray-700">
                          Explore →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {categoriesSection.showButton && (
            <div className="text-center mt-6">
              <Link
                to={categoriesSection.buttonLink}
                className="inline-block px-5 py-2 bg-white border border-black text-black hover:bg-gray-50 font-medium rounded-full transition-colors text-sm font-sans font-normal"
              >
                {categoriesSection.buttonText}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trending Collections Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-sans font-normal">{trendingCollections.title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-sans font-normal">{trendingCollections.subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingCollections.collections.map((collection: any) => (
              <Link key={collection.id} to={collection.link} className="group">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48">
                    <OptimizedImage
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      width={500}
                      priority={false}
                    />
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white bg-${collection.badgeColor}-500 font-sans font-normal`}>
                      {collection.badge}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-2 font-sans font-normal">{collection.title}</h3>
                    <p className="text-gray-600 text-xs mb-3 font-sans font-normal">{collection.description}</p>
                    <div className="flex items-center justify-between mb-3 font-sans font-normal">
                      <span className="text-xs text-gray-500">{collection.artworkCount} artworks</span>
                      <span className="text-xs text-gray-400">{collection.updateFrequency}</span>
                    </div>
                    <div className="flex items-center justify-between font-sans font-normal">
                      <span className="text-black text-xs font-medium group-hover:text-gray-700">
                        Explore Collection →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {trendingCollections.showButton && (
            <div className="text-center mt-8">
              <Link
                to={trendingCollections.buttonLink}
                className="inline-block px-6 py-3 bg-white border border-black text-black hover:bg-gray-50 font-medium rounded-full transition-colors text-sm font-sans font-normal"
              >
                {trendingCollections.buttonText}
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Homepage;
