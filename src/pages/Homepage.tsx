import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Download, Palette, Users, TrendingUp, Award, Mail, Heart, Grid3X3 } from 'lucide-react';
import { HomepageSettingsService } from '../services/homepageSettingsService';
import { ProductService, CategoryService } from '../services/supabaseService';
import { useCurrency } from '../contexts/CurrencyContext';
import { generateProductUrl } from '../utils/slugUtils';
import { logMemoryUsage, isMemoryUsageHigh } from '../utils/memoryUtils';
import HomepageSkeleton from '../components/HomepageSkeleton';
import OptimizedImage from '../components/OptimizedImage';

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
      
      const [settings, products, categories, stats] = await Promise.all([
        HomepageSettingsService.getHomepageSettings(),
        ProductService.getAllProducts(),
        CategoryService.getAllCategories(),
        ProductService.getProductStats()
      ]);
      
      
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
    
    return bestSellersProducts.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage,
      images: product.images || (product.main_image ? [product.main_image] : ['/placeholder-image.jpg']),
      rating: product.rating || 4.5,
      downloads: product.downloads || 0,
      favoritesCount: product.favoritesCount || 0,
      category: product.categories?.[0] || 'Art',
      badge: 'Best Seller',
      badgeColor: 'pink',
      link: generateProductUrl(product.categories?.[0] || product.category, product.title)
    }));
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
    
    // Get featured products (products marked as featured in database)
    const featuredProducts = realProducts.filter(product => product.featured === true);
    
    // If we have featured products, use them; otherwise use top products by rating
    const artworkProducts = featuredProducts.length > 0 
      ? featuredProducts.slice(0, 4)
      : realProducts
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);
    
    return artworkProducts.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage,
      images: product.images || (product.main_image ? [product.main_image] : ['/placeholder-image.jpg']),
      rating: product.rating || 4.5,
      downloads: product.downloads || 0,
      favoritesCount: product.favoritesCount || 0,
      category: product.categories?.[0] || 'Art',
      badge: 'Featured',
      badgeColor: 'blue',
      link: generateProductUrl(product.categories?.[0] || product.category, product.title)
    }));
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

  // Ensure featured artwork products have valid images array
  const safeFeaturedArtwork = {
    ...featuredArtwork,
    selectedProducts: getFeaturedArtworkProducts().map((product: any) => ({
      ...product,
      images: product.images || (product.image ? [product.image] : ['/placeholder-image.jpg'])
    }))
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

  const newsletterSection = homepageSettings?.newsletter || {
    title: 'Stay Updated',
    subtitle: 'Get notified about new artwork, special offers and new products.',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe'
  };

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


  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette': return <Palette className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6" />;
      case 'Award': return <Award className="w-6 h-6" />;
      case 'Grid3X3': return <Grid3X3 className="w-6 h-6" />;
      default: return <Palette className="w-6 h-6" />;
    }
  };

  // Compute live stats (compact cards): Artworks, Categories, Downloads, Avg Rating
  const computedStats = [
    { id: 'artworks', icon: 'Palette', value: `${realProducts?.length || 0}`, label: 'Artworks' },
    { id: 'categories', icon: 'Grid3X3', value: `${realCategories?.length || 0}`, label: 'Categories' },
    { id: 'downloads', icon: 'TrendingUp', value: `${realStats?.totalDownloads || realStats?.total || 0}` , label: 'Downloads' },
    { id: 'rating', icon: 'Award', value: `${(realStats?.avgRating || 0).toFixed ? (realStats?.avgRating || 0).toFixed(1) : (Number(realStats?.avgRating || 0)).toFixed(1)}`, label: 'Avg Rating' }
  ];

  // Show loading state while data is being fetched
  if (loading) {
    return <HomepageSkeleton />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Card */}
            <div 
              className={`bg-gradient-to-br ${heroSection.mainCard.gradientColors?.[0] || 'from-orange-200'} ${heroSection.mainCard.gradientColors?.[1] || 'to-orange-300'} rounded-2xl p-8 flex flex-col justify-center relative`} 
              style={{ minHeight: `${heroSection.height}px` }}
            >
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {heroSection.mainCard.title}
              </h1>
              <p className="text-gray-700 mb-6 text-sm">
                {heroSection.mainCard.subtitle}
              </p>
              <Link 
                to={heroSection.mainCard.buttonLink}
                className="inline-block px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-full transition-colors w-fit text-sm"
              >
                {heroSection.mainCard.buttonText}
              </Link>
            </div>

            {/* Featured Card */}
            <Link to={heroSection.featuredCard.link} className="relative rounded-2xl overflow-hidden group cursor-pointer" style={{ minHeight: `${heroSection.height}px` }}>
              <OptimizedImage
                src={heroSection.featuredCard.images[0]}
                alt={heroSection.featuredCard.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={600}
                priority={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-bold mb-1 text-white">{heroSection.featuredCard.title}</h3>
                <p className="text-white/90 text-sm">{heroSection.featuredCard.subtitle}</p>
              </div>
            </Link>

            {/* Categories Card */}
            <Link to={heroSection.categoriesCard.link} className="relative rounded-2xl overflow-hidden group cursor-pointer" style={{ minHeight: `${heroSection.height}px` }}>
              <OptimizedImage
                src={heroSection.categoriesCard.images[0]}
                alt={heroSection.categoriesCard.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={600}
                priority={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-bold mb-1 text-white">{heroSection.categoriesCard.title}</h3>
                <p className="text-white/90 text-sm">{heroSection.categoriesCard.subtitle}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Image Slider Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[300px] lg:h-[400px]">
              {/* Image Section */}
              <div className="relative overflow-hidden h-[250px] lg:h-full">
                <OptimizedImage
                  src={safeImageSlider.slides[currentSlide].images[0]}
                  alt={safeImageSlider.slides[currentSlide].title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  width={800}
                  priority={true}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent lg:from-black/20" />
                
                {/* Navigation Arrows */}
                {safeImageSlider.showArrows && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1.5 lg:p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <ChevronLeft size={16} className="lg:w-5 lg:h-5" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1.5 lg:p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <ChevronRight size={16} className="lg:w-5 lg:h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Text Description Section */}
              <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-center h-full">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 lg:mb-4">
                  {safeImageSlider.slides[currentSlide].title}
                </h2>
                {safeImageSlider.slides[currentSlide].subtitle && (
                  <p className="text-base sm:text-lg text-gray-600 mb-3 lg:mb-4">
                    {safeImageSlider.slides[currentSlide].subtitle}
                  </p>
                )}
                <p className="text-sm sm:text-base text-gray-500 mb-4 lg:mb-6">
                  {safeImageSlider.slides[currentSlide].description}
                </p>
                <Link
                  to={safeImageSlider.slides[currentSlide].link}
                  className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-full transition-colors w-fit text-sm sm:text-base"
                >
                  View Artwork
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Grid Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          
          <div className={`grid gap-6 ${
            safeFeaturedGrid.gridLayout === 'two-column' ? 'grid-cols-1 md:grid-cols-2' :
            safeFeaturedGrid.gridLayout === 'three-column' ? 'grid-cols-1 md:grid-cols-3' :
            'grid-cols-1 md:grid-cols-4'
          }`}>
            {safeFeaturedGrid.items.map((item: any) => (
              <Link key={item.id} to={item.link} className="group">
                <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-64">
                  <OptimizedImage
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    width={600}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-white/90 text-sm">{item.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {safeFeaturedGrid.showButton && (
            <div className="text-center mt-8">
              <Link
                to={safeFeaturedGrid.buttonLink}
                className="inline-block px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-full transition-colors"
              >
                {safeFeaturedGrid.buttonText}
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
                    />
                    {safeBestSellers.showBadge && (
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white bg-${product.badgeColor}-500`}>
                        {product.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 truncate" title={product.title}>{product.title}</h3>
                    
                    {/* Price Section */}
                    <div className="mb-2">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="text-lg font-bold text-pink-600">
                              {formatUIPrice(product.price, 'INR')}
                            </div>
                            <div className="text-xs text-green-600 font-semibold">
                              {product.discountPercentage}% OFF
                            </div>
                          </div>
                          <div className="text-sm text-gray-400 line-through">
                            {formatUIPrice(product.originalPrice, 'INR')}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-pink-600">
                          {formatUIPrice(product.price, 'INR')}
                        </div>
                      )}
                    </div>

                    {/* Stats Section */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
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
                className="inline-block px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-full transition-colors"
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
                    />
                    {safeFeaturedArtwork.showBadge && (
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white bg-${product.badgeColor}-500`}>
                        {product.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 truncate" title={product.title}>{product.title}</h3>
                    
                    {/* Price Section */}
                    <div className="mb-2">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="text-lg font-bold text-pink-600">
                              {formatUIPrice(product.price, 'INR')}
                            </div>
                            <div className="text-xs text-green-600 font-semibold">
                              {product.discountPercentage}% OFF
                            </div>
                          </div>
                          <div className="text-sm text-gray-400 line-through">
                            {formatUIPrice(product.originalPrice, 'INR')}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-pink-600">
                          {formatUIPrice(product.price, 'INR')}
                        </div>
                      )}
                    </div>

                    {/* Stats Section */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
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
                className="inline-block px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-full transition-colors"
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
            {categoriesSection.selectedCategories.map((category: any) => (
              <Link key={category.id} to={`/${category.slug}`} className="group">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="relative h-32">
                    <OptimizedImage
                      src={category.image}
                      alt={category.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      width={300}
                    />
                    {category.featured && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white bg-pink-500">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-1">{category.name}</h3>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">{category.description}</p>
                    {categoriesSection.showProductCount && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{category.count} artworks</span>
                        <span className="text-pink-600 text-xs font-medium group-hover:text-pink-700">
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
                className="inline-block px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-full transition-colors text-sm"
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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{trendingCollections.title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{trendingCollections.subtitle}</p>
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
                    />
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white bg-${collection.badgeColor}-500`}>
                      {collection.badge}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{collection.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{collection.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">{collection.artworkCount} artworks</span>
                      <span className="text-xs text-gray-400">{collection.updateFrequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-pink-600 text-sm font-medium group-hover:text-pink-700">
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
                className="inline-block px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-full transition-colors"
              >
                {trendingCollections.buttonText}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Statistics Section - Compact Cards */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {computedStats.map((stat: any) => (
              <div key={stat.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                  {getIcon(stat.icon)}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 leading-tight">{stat.value}</div>
                  <div className="text-xs text-gray-600 leading-tight">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section - Compact */}
      <section className="py-6 px-4 bg-pink-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-pink-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{newsletterSection.title}</h2>
              <p className="text-xs text-gray-600 mt-1">{newsletterSection.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder={newsletterSection.placeholder}
                className="flex-1 sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-300 text-sm"
              />
              <button className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm whitespace-nowrap">
                <Mail className="w-4 h-4" />
                <span>{newsletterSection.buttonText}</span>
              </button>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Homepage;
