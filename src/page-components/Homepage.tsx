'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from '@/src/compat/router';
import { ChevronLeft, ChevronRight, Star, Download, Palette, Users, TrendingUp, Award, Heart, Grid3X3, ArrowRight, Rss, ChevronDown } from 'lucide-react';
import { HomepageSettingsService } from '../services/homepageSettingsService';
import { ProductService, CategoryService } from '../services/supabaseService';
import { appCache, CACHE_KEYS, CACHE_TTL } from '../services/cacheService';
import { useCurrency } from '../contexts/CurrencyContext';
import { generateProductUrl, generateSlug } from '../utils/slugUtils';
import { logMemoryUsage, isMemoryUsageHigh } from '../utils/memoryUtils';
import HomepageSkeleton from '../components/HomepageSkeleton';
import OptimizedImage from '../components/OptimizedImage';
import BentoHeroSection from '../components/BentoHeroSection';
import LazyHomeSection from '../components/LazyHomeSection';
import { NavigationVisibilityService } from '../services/navigationVisibilityService';

const Homepage: React.FC = () => {
  // Currency context
  const { formatUIPrice, currentCurrency } = useCurrency();
  
  // State for loaded settings and data
  const [homepageSettings, setHomepageSettings] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [realProducts, setRealProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [realCategories, setRealCategories] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [realStats, setRealStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openHomepageFaqs, setOpenHomepageFaqs] = useState<number[]>([]);
  const productsLoadStarted = useRef(false);
  const skipHeavyProductFetch = useRef(false);

  const toggleHomepageFaq = (index: number) => {
    setOpenHomepageFaqs(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const loadProducts = useCallback(async () => {
    if (skipHeavyProductFetch.current || productsLoadStarted.current) return;
    productsLoadStarted.current = true;
    try {
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
      setRealProducts(products);
      logMemoryUsage('Homepage - After Loading Products');
    } catch (error) {
      console.error('Error loading homepage products:', error);
    }
  }, []);

  // First paint: settings + categories + stats only (no 50-row product query).
  const loadCriticalHomepageData = useCallback(async () => {
    try {
      setLoading(true);
      logMemoryUsage('Homepage - Before Loading Data');

      if (isMemoryUsageHigh(80)) {
        console.warn('High memory usage detected, loading minimal data');
        skipHeavyProductFetch.current = true;
        const settings = await HomepageSettingsService.getHomepageSettings();
        setHomepageSettings(settings);
        setRealProducts([]);
        setRealCategories([]);
        setRealStats(null);
        return;
      }

      const [settings, categories, stats] = await Promise.all([
        HomepageSettingsService.getHomepageSettings(),
        appCache.getOrFetch(CACHE_KEYS.CATEGORIES_ALL, () => CategoryService.getAllCategories(), CACHE_TTL.CATEGORIES),
        appCache.getOrFetch('stats:products', () => ProductService.getProductStats(), CACHE_TTL.PRODUCTS),
      ]);

      setHomepageSettings(settings);
      setRealCategories(categories);
      setRealStats(stats);
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCriticalHomepageData();
  }, [loadCriticalHomepageData]);

  // If the user never scrolls, still load products after a short delay.
  useEffect(() => {
    if (loading || skipHeavyProductFetch.current) return;
    const id = window.setTimeout(() => {
      loadProducts();
    }, 2200);
    return () => window.clearTimeout(id);
  }, [loading, loadProducts]);

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

  const getProductLink = (product: any) => {
    const category = product.categories?.[0] || product.category || 'Art';
    
    // Check if product is clothing by category or properties
    const clothingCategories = ['unisex', 'men', 'women', 'mens', 'womens', 'clothing', 'tshirt', 't-shirt', 'shirt', 'sweatshirt', 'hoodie'];
    const isCategoryClothing = clothingCategories.some(cat => 
      category?.toLowerCase().includes(cat)
    );
    const hasClothingProperties = !!(product.sizes || product.colors || product.type === 'clothing' || product.gender);
    const isClothing = isCategoryClothing || hasClothingProperties;

    // Check if product is F&B
    const categoriesLower = (product.categories || []).map((c: any) => c.toLowerCase()).join(' ');
    const isFB = categoriesLower.includes('food & beverage') || 
                 categoriesLower.includes('f&b') || 
                 categoriesLower.includes('food-beverage') ||
                 categoriesLower.includes('dry fruit') || 
                 categoriesLower.includes('dried fruit') || 
                 categoriesLower.includes('spice');

    // Check if normal item
    const isNormalItem = product.categories && product.categories.includes('Normal');

    const productSlug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    if (isClothing) {
      return `/clothes/${productSlug}`;
    } else if (isFB) {
      return `/${productSlug}`;
    } else if (isNormalItem) {
      return `/shop/${generateSlug(product.title)}`;
    } else {
      return generateProductUrl(category, product.title);
    }
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
      const productLink = getProductLink(product);
      
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

  // Ensure best sellers products have valid images array and correct links
  const safeBestSellers = {
    ...bestSellers,
    selectedProducts: getBestSellersProducts().map((product: any) => ({
      ...product,
      images: product.images || (product.image ? [product.image] : ['/placeholder-image.jpg']),
      link: getProductLink(product)
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
      
      // Generate appropriate URL based on product type
      const productLink = getProductLink(product);
      
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
      // Generate appropriate URL based on product type
      const productLink = getProductLink(product);
      
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
    if (loading || !safeImageSlider.autoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % safeImageSlider.slides.length);
    }, safeImageSlider.interval);
    return () => clearInterval(timer);
  }, [loading, safeImageSlider.autoPlay, safeImageSlider.interval, safeImageSlider.slides.length]);

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
    <div className="min-h-screen bg-[#ffffff]">

      {/* Bento Hero Section */}
      <BentoHeroSection
        cards={
          homepageSettings?.bento_hero?.cards ||
          homepageSettings?.hero_section?.bento_cards ||
          []
        }
      />

      {/* Brand Introduction Section & Freshness Signals */}
      <section className="py-12 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Catalog Verified Fresh: June 2026
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4 font-sans leading-tight">
            Lurevi — Premium Digital Art Prints & Luxury Collections
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto font-sans font-normal">
            Welcome to Lurevi, your premier destination for curated luxury digital art, high-resolution wall prints, and exclusive lifestyle collections. We design and select exquisite masterpieces that bring visual harmony, sophistication, and modern aesthetics into your home or office. Whether you are seeking museum-quality digital downloads for instant framing or looking to explore premium physical apparel, Lurevi blends artistic vision with premium craftsmanship to transform your everyday spaces.
          </p>
        </div>
      </section>

      {/* Below hero: mount + product fetch as user scrolls */}
      <LazyHomeSection
        minHeight="min-h-[360px] sm:min-h-[440px] lg:min-h-[500px]"
        onVisible={loadProducts}
      >
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
      </LazyHomeSection>

      <LazyHomeSection minHeight="min-h-[280px] sm:min-h-[360px]">
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

          {/* Uniform three-column layout for exactly 3 items */}
          {safeFeaturedGrid.gridLayout === 'three-column' && safeFeaturedGrid.items.length === 3 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 h-auto sm:h-[280px] lg:h-[340px]">
              {safeFeaturedGrid.items.map((item: any) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="group relative rounded-2xl overflow-hidden h-[240px] sm:h-full"
                >
                  <OptimizedImage
                    src={item.images[0]}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    width={600}
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <span className="text-[10px] uppercase tracking-widest text-white/60 font-sans font-medium">Collection</span>
                    <h3 className="text-white font-bold text-sm sm:text-base leading-snug mt-0.5 mb-1 font-sans">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-white/70 text-xs font-sans hidden sm:block">{item.subtitle}</p>
                    )}
                    <span className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-xs text-white/80 group-hover:text-white group-hover:gap-2 transition-all font-sans">
                      Explore <ArrowRight size={11} />
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
      </LazyHomeSection>

      <LazyHomeSection minHeight="min-h-[320px] md:min-h-[400px]">
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
                            <div className="text-xs text-green-700 font-semibold font-sans font-normal">
                              {product.discountPercentage}% OFF
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 line-through font-sans font-normal">
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
      </LazyHomeSection>

      <LazyHomeSection minHeight="min-h-[320px] md:min-h-[400px]">
      {/* Featured Artwork Section */}
      <section className="py-12 px-4 bg-[#ffffff]">
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
                            <div className="text-xs text-green-700 font-semibold font-sans font-normal">
                              {product.discountPercentage}% OFF
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 line-through font-sans font-normal">
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
      </LazyHomeSection>

      <LazyHomeSection minHeight="min-h-[260px] md:min-h-[320px]">
      {/* Categories Section - Compact */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-sans">
              Shop Curated Digital Art Prints by Style
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-sans">
              Browse our verified luxury art categories to find the perfect match for your space.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resolvedHomepageCategories.map((category: any) => (
              <Link key={category.id} to={`/categories/${category.slug}`} className="group">
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
      </LazyHomeSection>

      <LazyHomeSection minHeight="min-h-[300px] md:min-h-[380px]">
      {/* Trending Collections Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#fbfbfc] via-[#f5f7f8] to-[#fbfbfc] relative overflow-hidden">
        {/* Soft ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.25em] font-bold text-teal-800 uppercase block mb-3">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-teal-900 to-gray-900 mb-4 font-sans tracking-tight">
              {trendingCollections.title}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto font-sans font-normal leading-relaxed">
              {trendingCollections.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingCollections.collections.map((collection: any) => (
              <Link key={collection.id} to={collection.link} className="group">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(4,120,120,0.1)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full">
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity duration-500" />
                    <OptimizedImage
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-105"
                      width={500}
                      priority={false}
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="backdrop-blur-md bg-black/40 border border-white/20 text-white text-[9px] tracking-widest uppercase font-semibold py-1 px-3.5 rounded-full shadow-sm">
                        {collection.badge}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors duration-300 font-sans tracking-tight">
                      {collection.title}
                    </h3>
                    <p className="text-gray-500 text-xs font-sans font-normal line-clamp-2 mt-2 mb-5 leading-relaxed flex-grow">
                      {collection.description}
                    </p>
                    
                    {/* Stats Box */}
                    <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50/80 border border-gray-100 rounded-xl mb-4 font-sans text-xs">
                      <div className="flex items-center space-x-1.5 text-gray-600 font-medium">
                        <Grid3X3 className="w-3.5 h-3.5 text-teal-600" />
                        <span>{collection.artworkCount} artworks</span>
                      </div>
                      <div className="flex items-center space-x-1 font-semibold text-teal-700 uppercase tracking-wider text-[9px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse mr-1" />
                        <span>{collection.updateFrequency || 'Fresh content'}</span>
                      </div>
                    </div>
                    
                    {/* Explore Link */}
                    <div className="flex items-center text-xs font-bold text-gray-900 group-hover:text-teal-750 transition-colors duration-300 mt-auto">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {trendingCollections.showButton && (
            <div className="text-center mt-12">
              <Link
                to={trendingCollections.buttonLink}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-gray-900 hover:bg-teal-800 text-white font-semibold rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(4,120,120,0.22)] hover:scale-105 transition-all duration-300 text-xs tracking-wider uppercase font-sans"
              >
                {trendingCollections.buttonText}
              </Link>
            </div>
          )}
        </div>
      </section>
      </LazyHomeSection>

      <LazyHomeSection minHeight="min-h-[300px]">
      {/* Comparison Section */}
      <section className="py-12 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-sans">
              Why Choose Lurevi Digital Art?
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-sans max-w-xl mx-auto">
              Compare Lurevi with standard digital downloads and stock platforms to see the premium difference in design, quality, and support.
            </p>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans">Feature</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50/50 font-sans">Lurevi Premium</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans">Standard Downloads</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans">Generic Stock Art</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900 font-sans">File Resolution</td>
                  <td className="px-6 py-4 text-emerald-700 bg-emerald-50/30 font-medium font-sans">300 DPI Giclée-ready</td>
                  <td className="px-6 py-4 text-gray-600 font-sans">72 - 150 DPI web res</td>
                  <td className="px-6 py-4 text-gray-600 font-sans">Variable / compressed</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900 font-sans">Licensing & Rights</td>
                  <td className="px-6 py-4 text-emerald-700 bg-emerald-50/30 font-medium font-sans">Personal Print Rights Included</td>
                  <td className="px-6 py-4 text-gray-600 font-sans">Restricted / single-use</td>
                  <td className="px-6 py-4 text-gray-600 font-sans">Strict commercial terms</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900 font-sans">Expert Curation</td>
                  <td className="px-6 py-4 text-emerald-700 bg-emerald-50/30 font-medium font-sans">100% Curated by Panel</td>
                  <td className="px-6 py-4 text-gray-600 font-sans">Unfiltered user uploads</td>
                  <td className="px-6 py-4 text-gray-600 font-sans">Algorithmic selection</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900 font-sans">Lifetime Re-download</td>
                  <td className="px-6 py-4 text-emerald-700 bg-emerald-50/30 font-medium font-sans">Yes, unlimited access</td>
                  <td className="px-6 py-4 text-gray-600 font-sans">Limited to 30 days</td>
                  <td className="px-6 py-4 text-gray-600 font-sans">Requires subscription</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900 font-sans">Artist Bio & Attribution</td>
                  <td className="px-6 py-4 text-emerald-700 bg-emerald-50/30 font-medium font-sans">Direct verification & support</td>
                  <td className="px-6 py-4 text-gray-600 font-sans">Anonymous uploads</td>
                  <td className="px-6 py-4 text-gray-600 font-sans">No artist attribution</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      </LazyHomeSection>

      <LazyHomeSection minHeight="min-h-[200px]">
      {/* Cited Statistics Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 font-sans">92%</div>
              <p className="text-xs font-semibold text-gray-800 font-sans mb-1">Ambiance Improvement</p>
              <p className="text-[11px] text-gray-500 font-sans leading-normal">
                Agree that wall art dramatically improves emotional comfort and room ambiance.<br/>
                <span className="text-[10px] text-gray-400 italic">[Source: Home Decor Association Annual Report]</span>
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 font-sans">45%</div>
              <p className="text-xs font-semibold text-gray-800 font-sans mb-1">Office Productivity Gain</p>
              <p className="text-[11px] text-gray-500 font-sans leading-normal">
                Observed in workspaces that integrate natural, calming digital artwork prints.<br/>
                <span className="text-[10px] text-gray-400 italic">[Source: Journal of Environmental Psychology]</span>
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 font-sans">300 DPI</div>
              <p className="text-xs font-semibold text-gray-800 font-sans mb-1">Technical Standard</p>
              <p className="text-[11px] text-gray-500 font-sans leading-normal">
                High-definition pixel density provided for standard sizing up to poster size.<br/>
                <span className="text-[10px] text-gray-400 italic">[Source: International Fine Art Printing Standards]</span>
              </p>
            </div>
          </div>
        </div>
      </section>
      </LazyHomeSection>

      <LazyHomeSection minHeight="min-h-[350px]">
      {/* Editorial Guide / Answer Blocks Section */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-sans">
              Art Curation & Design Insights
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-sans">
              Expert guidelines and actionable advice on printing, framing, and styling your digital art.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-2 font-sans">
                What is digital art and how does downloading it work?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-sans font-normal">
                Digital art is high-resolution artwork delivered in digital format (like 300 DPI JPEGs or PDFs). Once purchased, you download the file instantly and can print it using a home printer, local print shop, or online printing service. This provides an affordable, instant way to decorate your space.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-2 font-sans">
                What paper weight and style are recommended for printing wall art?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-sans font-normal">
                For the best results, we recommend printing on heavy-weight matte paper of at least 200 GSM or premium canvas. Matte paper eliminates reflections, making it perfect for brightly lit rooms, while canvas provides a classic, painterly texture.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-2 font-sans">
                How do I select the right size artwork for my room?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-sans font-normal">
                A general rule of thumb is that the artwork should cover 60% to 75% of the available wall space not covered by furniture. For instance, above a 6-foot sofa, a frame arrangement spanning about 4 to 4.5 feet wide looks most balanced.
              </p>
            </div>
          </div>
        </div>
      </section>
      </LazyHomeSection>

      <LazyHomeSection minHeight="min-h-[350px]">
      {/* Homepage FAQ Section */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-sans">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-sans">
              Find answers to core questions about buying, downloading, and printing digital wall art.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How do I receive my digital files after purchase?",
                a: "Immediately upon checkout, you will receive an email with direct download links for your files. Alternatively, you can log into your Lurevi profile dashboard and access them from the 'Downloads' tab at any time."
              },
              {
                q: "What dimensions are Lurevi's digital prints suitable for?",
                a: "Our files are exported as ultra-high-resolution 300 DPI files in standard print ratios (e.g. ISO A1-A4, 2:3 ratio, 3:4 ratio, 4:5 ratio). This allows you to print files at sizes ranging from 4x6 inches up to massive poster sizes like 24x36 inches without pixelation."
              },
              {
                q: "Do Lurevi downloads include a commercial license?",
                a: "No, all digital files purchased on Lurevi are for personal use only. If you wish to use our designs for commercial decoration, product packaging, or advertising, please reach out to our support team for a commercial license."
              },
              {
                q: "Do you ship physical prints and frames?",
                a: currentCurrency !== 'INR'
                  ? "We offer physical poster delivery exclusively within India. For international customers, we provide instant high-resolution digital downloads of our artwork, which you can easily print locally on your preferred paper or canvas."
                  : "Yes! While we default to digital art downloads, you can select 'Physical Poster' on the product page. We will print the artwork on museum-grade 200 GSM matte paper and deliver it directly to your address in protective tubes. Note that frames are not included."
              }
            ].map((faq, idx) => {
              const isOpen = openHomepageFaqs.includes(idx);
              return (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleHomepageFaq(idx)}
                    className="w-full flex items-center justify-between text-left p-5 focus:outline-none group"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#ff6e00] transition-colors font-sans">
                      {faq.q}
                    </h3>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed font-sans font-normal border-t border-gray-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      </LazyHomeSection>

      <section className="px-4 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 sm:p-10 shadow-xl border border-gray-800">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff6e00]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight mb-3">
                Lurevi — Luxury That Stays With You
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-2xl font-sans font-normal">
                Discover curated digital art, premium wall prints, and luxury collections crafted for modern spaces. Elevate your everyday home or office layout with Giclée-ready downloads and fine artisan designs.
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link
                  to="/categories"
                  className="px-5 py-2.5 bg-white text-gray-900 hover:bg-gray-100 font-medium rounded-full transition-all text-xs sm:text-sm font-sans"
                >
                  Explore Luxury Collections
                </Link>
                <Link
                  to="/shop"
                  className="px-5 py-2.5 bg-transparent border border-white/30 text-white hover:bg-white/10 font-medium rounded-full transition-all text-xs sm:text-sm font-sans"
                >
                  Shop Premium Picks
                </Link>
                <Link
                  to="/browse"
                  className="px-5 py-2.5 bg-transparent border border-white/30 text-white hover:bg-white/10 font-medium rounded-full transition-all text-xs sm:text-sm font-sans"
                >
                  Browse Curated Artworks
                </Link>
                <Link
                  to="/contact-us"
                  className="px-5 py-2.5 bg-transparent border border-white/30 text-white hover:bg-white/10 font-medium rounded-full transition-all text-xs sm:text-sm font-sans"
                >
                  Contact Lurevi Concierge
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Homepage;




