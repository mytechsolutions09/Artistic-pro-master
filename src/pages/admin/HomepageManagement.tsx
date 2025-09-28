import React, { useState, useEffect } from 'react';
import { Save, Eye, Plus, Trash2, Settings, Layout, Image, Star, Palette, TrendingUp, Mail, Grid, BarChart3, Upload, Check, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { HeroSectionConfig, ImageSliderConfig, FeaturedGridConfig, BestSellersConfig, FeaturedArtworkConfig, CategoriesConfig, TrendingCollectionsConfig, StatsConfig, NewsletterConfig } from '../../types';
import { ProductService, CategoryService } from '../../services/supabaseService';
import { HomepageSettingsService } from '../../services/homepageSettingsService';
import { ImageUploadService } from '../../services/imageUploadService';
// import categoryService from '../../services/categoryService';


const HomepageManagement: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('hero');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  // Real data state
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [realCategories, setRealCategories] = useState<any[]>([]);
  const [realStats, setRealStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);

  // Fetch real data from database
  const fetchRealData = async () => {
    try {
      setLoading(true);
      const [products, categories, stats, savedSettings] = await Promise.all([
        ProductService.getAllProducts(),
        CategoryService.getAllCategories(),
        ProductService.getProductStats(),
        HomepageSettingsService.getHomepageSettings()
      ]);
      
      setRealProducts(products);
      setRealCategories(categories);
      setRealStats(stats);
      
      // Load saved homepage settings if they exist
      if (savedSettings) {
        console.log('Loading saved homepage settings:', savedSettings);
        
        // Apply saved settings to state variables
        if (savedSettings.hero_section) {
          setHeroSection(savedSettings.hero_section);
        }
        if (savedSettings.image_slider) {
          setImageSlider(savedSettings.image_slider);
        }
        if (savedSettings.featured_grid) {
          setFeaturedGrid(savedSettings.featured_grid);
        }
        if (savedSettings.best_sellers) {
          setBestSellers(savedSettings.best_sellers);
        }
        if (savedSettings.featured_artwork) {
          setFeaturedArtwork(savedSettings.featured_artwork);
        }
        if (savedSettings.categories) {
          setCategoriesSection(savedSettings.categories);
        }
        if (savedSettings.trending_collections) {
          setTrendingCollections(savedSettings.trending_collections);
        }
        if (savedSettings.stats) {
          setStatsSection(savedSettings.stats);
        }
        if (savedSettings.newsletter) {
          setNewsletterSection(savedSettings.newsletter);
        }
        setSettingsLoaded(true);
      } else {
        console.log('No saved homepage settings found, using default configurations');
        setSettingsLoaded(false);
      }
    } catch (error) {
      console.error('Error fetching real data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  // Mock data for available products (in a real app, this would come from an API)
  // Use real products from database
  const availableProducts = realProducts.map(product => ({
    id: product.id,
    title: product.title,
    price: product.price,
    images: product.images || [product.main_image || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
    rating: product.rating || 4.5,
    downloads: product.downloads || 0,
    category: product.category || 'Uncategorized',
    link: `/artwork/${product.slug || product.id}`,
    artist: product.artist || 'Unknown Artist',
    featured: product.featured || false
  }));

  // Use real categories from database
  const availableCategories = ['All', ...realCategories.map(cat => cat.name)];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  
  // Featured Artwork specific filters
  const [featuredSelectedCategory, setFeaturedSelectedCategory] = useState<string>('All');
  const [featuredProductSearchTerm, setFeaturedProductSearchTerm] = useState<string>('');

  // Categories specific filters
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>('');

  // Use real categories from database
  const availableCategories_data = realCategories.map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    count: category.count || 0,
    image: category.image || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: category.description || 'Category description'
  }));

  // Hero Section State
  const [heroSection, setHeroSection] = useState<HeroSectionConfig>({
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
  });

  // Image Slider State
  const [imageSlider, setImageSlider] = useState<ImageSliderConfig>({
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
  });

  // Featured Grid State
  const [featuredGrid, setFeaturedGrid] = useState<FeaturedGridConfig>({
    title: 'Exclusive Artist Collections',
    subtitle: 'Discover curated collections from our most talented artists',
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
  });

  // Best Sellers State
  const [bestSellers, setBestSellers] = useState<BestSellersConfig>({
    title: 'Best Sellers',
    subtitle: 'Our most popular and highest-rated artworks loved by customers worldwide',
    maxItems: 5,
    buttonText: 'View All Best Sellers',
    buttonLink: '/browse',
    showButton: true,
    showRating: true,
    showDownloads: true,
    showBadge: true,
    selectedProducts: realProducts
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 5)
      .map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
        images: [product.main_image || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
        rating: product.rating || 4.5,
        downloads: product.downloads || 0,
        category: product.category || 'Uncategorized',
        badge: 'Best Seller',
        badgeColor: 'pink',
        link: `/artwork/${product.slug || product.id}`
      }))
  });

  // Featured Artwork State
  const [featuredArtwork, setFeaturedArtwork] = useState<FeaturedArtworkConfig>({
    title: 'Featured Artwork',
    subtitle: 'Handpicked masterpieces from our most talented artists',
    maxItems: 4,
    buttonText: 'Explore More Artwork',
    buttonLink: '/browse',
    showButton: true,
    showRating: true,
    showDownloads: true,
    showBadge: true,
    selectedProducts: realProducts
      .filter(product => product.featured)
      .slice(0, 4)
      .map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
        images: [product.main_image || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
        rating: product.rating || 4.5,
        downloads: product.downloads || 0,
        category: product.category || 'Uncategorized',
        badge: 'Featured',
        badgeColor: 'blue',
        link: `/artwork/${product.slug || product.id}`
      }))
  });

  // Categories State
  const [categoriesSection, setCategoriesSection] = useState<CategoriesConfig>({
    title: 'Popular Categories',
    subtitle: 'Explore our most popular categories and find the perfect style for your needs',
    maxCategories: 8,
    buttonText: 'View All Categories',
    buttonLink: '/categories',
    showButton: true,
    showProductCount: true,
    selectedCategories: realCategories.slice(0, 8).map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: category.count || 0,
      images: [category.image || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
      description: category.description || 'Category description',
      featured: category.featured || false
    }))
  });

  // Trending Collections State
  const [trendingCollections, setTrendingCollections] = useState<TrendingCollectionsConfig>({
    title: 'Trending Collections',
    subtitle: 'Discover the most popular and trending art collections this season',
    showButton: true,
    buttonText: 'View All Collections',
    buttonLink: '/collections',
    collections: realCategories.slice(0, 3).map((category, index) => ({
      id: category.id,
      title: category.name,
      images: [category.image || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600'],
      artworkCount: category.count || 0,
      description: category.description || 'Category description',
      badge: index === 0 ? 'Trending' : index === 1 ? 'Popular' : 'New',
      badgeColor: index === 0 ? 'orange' : index === 1 ? 'green' : 'purple',
      link: `/categories/${category.slug}`,
      updateFrequency: 'Updated regularly',
      status: index === 0 ? 'trending' : index === 1 ? 'popular' : 'new'
    }))
  });

  // Stats State - Use real data from database
  const [statsSection, setStatsSection] = useState<StatsConfig>({
    stats: [
      { 
        id: '1', 
        icon: 'Palette', 
        value: realStats ? `${realStats.totalProducts || 0}` : '0', 
        label: 'Artworks', 
        color: 'bg-pink-100' 
      },
      { 
        id: '2', 
        icon: 'Users', 
        value: realStats ? `${realStats.totalArtists || 0}` : '0', 
        label: 'Artists', 
        color: 'bg-pink-100' 
      },
      { 
        id: '3', 
        icon: 'TrendingUp', 
        value: realStats ? `${realStats.totalDownloads || 0}` : '0', 
        label: 'Downloads', 
        color: 'bg-pink-100' 
      },
      { 
        id: '4', 
        icon: 'Award', 
        value: realStats ? `${(realStats.averageRating || 0).toFixed(1)}` : '0.0', 
        label: 'Avg Rating', 
        color: 'bg-pink-100' 
      }
    ]
  });

  // Newsletter State
  const [newsletterSection, setNewsletterSection] = useState<NewsletterConfig>({
    title: 'Stay Updated',
    subtitle: 'Get notified about new artwork, special offers, and artist features',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe'
  });

  // Preview and Save Functions
  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleSaveChanges = async () => {
    setSaveStatus('saving');
    try {
      // Prepare all homepage settings data
      const homepageSettings = {
        hero_section: heroSection,
        image_slider: imageSlider,
        featured_grid: featuredGrid,
        best_sellers: bestSellers,
        featured_artwork: featuredArtwork,
        categories: categoriesSection,
        trending_collections: trendingCollections,
        stats: statsSection,
        newsletter: newsletterSection
      };

      // Save to database
      const success = await HomepageSettingsService.saveHomepageSettings(homepageSettings);
      
      if (success) {
        setSaveStatus('saved');
        console.log('Homepage settings saved successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Failed to save homepage settings');
      }
    } catch (error) {
      console.error('Error saving homepage settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Image Upload Function
  const handleImageUpload = async (file: File, cardType: 'featured' | 'categories') => {
    if (!file) return;
    
    setUploadingImage(cardType);
    
    try {
      // Upload to Supabase storage
      const uploadResult = await ImageUploadService.uploadHomepageHeroImage(file, cardType);
      
      if (uploadResult.success && uploadResult.url) {
        // Update the appropriate card with the new image URL
        if (cardType === 'featured') {
          setHeroSection({
            ...heroSection,
            featuredCard: { ...heroSection.featuredCard, images: [uploadResult.url] }
          });
        } else {
          setHeroSection({
            ...heroSection,
            categoriesCard: { ...heroSection.categoriesCard, images: [uploadResult.url] }
          });
        }
        console.log('Image uploaded successfully:', uploadResult.url);
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      setUploadingImage(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadingImage(null);
      // You could add a toast notification here to show the error to the user
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'hero': return <Layout className="w-5 h-5" />;
      case 'imageSlider': return <Image className="w-5 h-5" />;
      case 'featuredGrid': return <Grid className="w-5 h-5" />;
      case 'bestSellers': return <Star className="w-5 h-5" />;
      case 'featuredArtwork': return <Palette className="w-5 h-5" />;
      case 'categories': return <Grid className="w-5 h-5" />;
      case 'trendingCollections': return <TrendingUp className="w-5 h-5" />;
      case 'stats': return <BarChart3 className="w-5 h-5" />;
      case 'newsletter': return <Mail className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const renderSectionEditor = () => {
    switch (selectedSection) {
      case 'hero':
  return (
          <div className="space-y-8">
                        {/* Editor Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Card Editor */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">Main Card</h4>
          <div className="space-y-4">
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                    value={heroSection.mainCard.title}
                    onChange={(e) => setHeroSection({
                      ...heroSection,
                      mainCard: { ...heroSection.mainCard, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter main title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <textarea
                    value={heroSection.mainCard.subtitle}
                    onChange={(e) => setHeroSection({
                      ...heroSection,
                      mainCard: { ...heroSection.mainCard, subtitle: e.target.value }
                    })}
                rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                    value={heroSection.mainCard.buttonText}
                    onChange={(e) => setHeroSection({
                      ...heroSection,
                      mainCard: { ...heroSection.mainCard, buttonText: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter button text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                  <input
                    type="text"
                    value={heroSection.mainCard.buttonLink}
                    onChange={(e) => setHeroSection({
                      ...heroSection,
                      mainCard: { ...heroSection.mainCard, buttonLink: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter button link"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gradient</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={heroSection.mainCard.gradientColors?.[0] || 'from-orange-200'}
                      onChange={(e) => setHeroSection({
                        ...heroSection,
                        mainCard: {
                          ...heroSection.mainCard,
                          gradientColors: [e.target.value, heroSection.mainCard.gradientColors?.[1] || 'to-orange-300']
                        }
                      })}
                      className="px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                    >
                      <option value="from-orange-200">Orange</option>
                      <option value="from-pink-200">Pink</option>
                      <option value="from-blue-200">Blue</option>
                      <option value="from-purple-200">Purple</option>
                      <option value="from-green-200">Green</option>
                    </select>
                    <select
                      value={heroSection.mainCard.gradientColors?.[1] || 'to-orange-300'}
                      onChange={(e) => setHeroSection({
                        ...heroSection,
                        mainCard: {
                          ...heroSection.mainCard,
                          gradientColors: [heroSection.mainCard.gradientColors?.[0] || 'from-orange-200', e.target.value]
                        }
                      })}
                      className="px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                    >
                      <option value="to-orange-300">Orange</option>
                      <option value="to-pink-300">Pink</option>
                      <option value="to-blue-300">Blue</option>
                      <option value="to-purple-300">Purple</option>
                      <option value="to-green-300">Green</option>
                    </select>
                  </div>
                </div>
                </div>
              </div>

              {/* Featured Card Editor */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">Featured Card</h4>
                <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={heroSection.featuredCard.title}
                    onChange={(e) => setHeroSection({
                      ...heroSection,
                      featuredCard: { ...heroSection.featuredCard, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter featured title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={heroSection.featuredCard.subtitle}
                    onChange={(e) => setHeroSection({
                      ...heroSection,
                      featuredCard: { ...heroSection.featuredCard, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter featured subtitle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <div className="space-y-3">
                    {/* URL Input */}
                    <input
                      type="url"
                      value={heroSection.featuredCard.image}
                      onChange={(e) => setHeroSection({
                        ...heroSection,
                        featuredCard: { ...heroSection.featuredCard, image: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter image URL"
                    />
                    
                    <div className="text-center text-sm text-gray-500">or</div>
                    
                    {/* File Upload */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, 'featured');
                          }
                        }}
                        className="hidden"
                        id="featured-image-upload"
                      />
                      <label
                        htmlFor="featured-image-upload"
                        className={`w-full flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 transition-colors ${
                          uploadingImage === 'featured' ? 'bg-pink-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <Upload className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {uploadingImage === 'featured' ? 'Uploading...' : 'Upload Image'}
                        </span>
                      </label>
                    </div>
                    
                    {/* Image Preview */}
                    {heroSection.featuredCard.image && (
                      <div className="mt-2">
                        <img
                          src={heroSection.featuredCard.image}
                          alt="Preview"
                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                  <input
                    type="text"
                    value={heroSection.featuredCard.link}
                    onChange={(e) => setHeroSection({
                      ...heroSection,
                      featuredCard: { ...heroSection.featuredCard, link: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                        placeholder="Enter link"
              />
            </div>
                </div>
              </div>

              {/* Categories Card Editor */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">Categories Card</h4>
                <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={heroSection.categoriesCard.title}
                    onChange={(e) => setHeroSection({
                      ...heroSection,
                      categoriesCard: { ...heroSection.categoriesCard, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter categories title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={heroSection.categoriesCard.subtitle}
                    onChange={(e) => setHeroSection({
                      ...heroSection,
                      categoriesCard: { ...heroSection.categoriesCard, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter categories subtitle"
                  />
                </div>
                                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <div className="space-y-3">
                    {/* URL Input */}
                    <input
                      type="url"
                      value={heroSection.categoriesCard.image}
                      onChange={(e) => setHeroSection({
                        ...heroSection,
                        categoriesCard: { ...heroSection.categoriesCard, image: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter image URL"
                    />
                    
                    <div className="text-center text-sm text-gray-500">or</div>
                    
                    {/* File Upload */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, 'categories');
                          }
                        }}
                        className="hidden"
                        id="categories-image-upload"
                      />
                      <label
                        htmlFor="categories-image-upload"
                        className={`w-full flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 transition-colors ${
                          uploadingImage === 'categories' ? 'bg-pink-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <Upload className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {uploadingImage === 'categories' ? 'Uploading...' : 'Upload Image'}
                        </span>
                      </label>
          </div>
          
                    {/* Image Preview */}
                    {heroSection.categoriesCard.image && (
                      <div className="mt-2">
                        <img
                          src={heroSection.categoriesCard.image}
                          alt="Preview"
                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
            </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                  <input
                    type="text"
                    value={heroSection.categoriesCard.link}
                    onChange={(e) => setHeroSection({
                      ...heroSection,
                      categoriesCard: { ...heroSection.categoriesCard, link: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter link"
                  />
            </div>
          </div>
        </div>
      </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">Live Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Card Preview */}
                <div className={`bg-gradient-to-br ${heroSection.mainCard.gradientColors?.[0] || 'from-orange-200'} ${heroSection.mainCard.gradientColors?.[1] || 'to-orange-300'} rounded-2xl p-8 flex flex-col justify-center min-h-[300px] relative`}>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {heroSection.mainCard.title || 'Main Title'}
                  </h1>
                  <p className="text-gray-700 mb-6 text-sm">
                    {heroSection.mainCard.subtitle || 'Subtitle goes here'}
                  </p>
                  <button className="inline-block px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-full transition-colors w-fit text-sm">
                    {heroSection.mainCard.buttonText || 'Button Text'}
            </button>
                  {isPreviewMode && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      Live
          </div>
                  )}
        </div>

                {/* Featured Card Preview */}
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer min-h-[300px]">
                  <img
                    src={heroSection.featuredCard.image || 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={heroSection.featuredCard.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-lg font-bold mb-1">{heroSection.featuredCard.title || 'Featured Title'}</h3>
                    <p className="text-white/90 text-sm">{heroSection.featuredCard.subtitle || 'Featured subtitle'}</p>
                  </div>
                </div>

                {/* Categories Card Preview */}
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer min-h-[300px]">
                  <img
                    src={heroSection.categoriesCard.image || 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={heroSection.categoriesCard.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-lg font-bold mb-1">{heroSection.categoriesCard.title || 'Categories Title'}</h3>
                    <p className="text-white/90 text-sm">{heroSection.categoriesCard.subtitle || 'Categories subtitle'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'imageSlider':
        return (
          <div className="space-y-8">
            {/* Slider Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">Slider Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageSlider.autoPlay}
                        onChange={(e) => setImageSlider({ ...imageSlider, autoPlay: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        imageSlider.autoPlay ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          imageSlider.autoPlay ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Auto-play</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interval (ms)</label>
                    <input
                      type="number"
                      value={imageSlider.interval}
                      onChange={(e) => setImageSlider({ ...imageSlider, interval: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      min="1000"
                      max="10000"
                      step="500"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageSlider.showDots}
                        onChange={(e) => setImageSlider({ ...imageSlider, showDots: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        imageSlider.showDots ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          imageSlider.showDots ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Dots</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageSlider.showArrows}
                        onChange={(e) => setImageSlider({ ...imageSlider, showArrows: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        imageSlider.showArrows ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          imageSlider.showArrows ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Arrows</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageSlider.showArtistInfo}
                        onChange={(e) => setImageSlider({ ...imageSlider, showArtistInfo: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        imageSlider.showArtistInfo ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          imageSlider.showArtistInfo ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Artist Info</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{imageSlider.slides.length}</span> slides total
                  </div>
                </div>
              </div>
            </div>

            {/* Slides Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
                <h4 className="font-semibold text-gray-800">Slides Management</h4>
                <button
                  onClick={() => {
                    const newSlide = {
                      id: Date.now().toString(),
                      images: ['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
                      title: 'New Slide',
                      description: 'Enter description here',
                      artist: 'Artist Name',
                      link: '/artwork/new'
                    };
                    setImageSlider({
                      ...imageSlider,
                      slides: [...imageSlider.slides, newSlide]
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Slide</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {imageSlider.slides.map((slide, index) => (
                  <div key={slide.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-800">Slide {index + 1}</h5>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (index > 0) {
                              const newSlides = [...imageSlider.slides];
                              [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
                              setImageSlider({ ...imageSlider, slides: newSlides });
                            }
                          }}
                          disabled={index === 0}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => {
                            if (index < imageSlider.slides.length - 1) {
                              const newSlides = [...imageSlider.slides];
                              [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
                              setImageSlider({ ...imageSlider, slides: newSlides });
                            }
                          }}
                          disabled={index === imageSlider.slides.length - 1}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => {
                            const newSlides = imageSlider.slides.filter((_, i) => i !== index);
                            setImageSlider({ ...imageSlider, slides: newSlides });
                          }}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                            value={slide.title}
                            onChange={(e) => {
                              const newSlides = [...imageSlider.slides];
                              newSlides[index] = { ...slide, title: e.target.value };
                              setImageSlider({ ...imageSlider, slides: newSlides });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="Enter slide title"
              />
            </div>
            <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                            value={slide.description}
                            onChange={(e) => {
                              const newSlides = [...imageSlider.slides];
                              newSlides[index] = { ...slide, description: e.target.value };
                              setImageSlider({ ...imageSlider, slides: newSlides });
                            }}
                rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="Enter slide description"
              />
            </div>
            <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Artist</label>
              <input
                type="text"
                            value={slide.artist}
                            onChange={(e) => {
                              const newSlides = [...imageSlider.slides];
                              newSlides[index] = { ...slide, artist: e.target.value };
                              setImageSlider({ ...imageSlider, slides: newSlides });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="Enter artist name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                          <input
                            type="text"
                            value={slide.link || ''}
                            onChange={(e) => {
                              const newSlides = [...imageSlider.slides];
                              newSlides[index] = { ...slide, link: e.target.value };
                              setImageSlider({ ...imageSlider, slides: newSlides });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="Enter slide link"
              />
            </div>
          </div>
          
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                          <div className="space-y-3">
                            <input
                              type="url"
                              value={slide.images?.[0] || ''}
                              onChange={(e) => {
                                const newSlides = [...imageSlider.slides];
                                newSlides[index] = { ...slide, images: [e.target.value] };
                                setImageSlider({ ...imageSlider, slides: newSlides });
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                              placeholder="Enter image URL"
                            />
                            
                            <div className="text-center text-sm text-gray-500">or</div>
                            
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      setUploadingImage(`slide-${index}`);
                                      
                                      // Upload to Supabase storage
                                      const uploadResult = await ImageUploadService.uploadHomepageSliderImage(file, slide.id);
                                      
                                      if (uploadResult.success && uploadResult.url) {
                                        const newSlides = [...imageSlider.slides];
                                        newSlides[index] = { ...slide, images: [uploadResult.url] };
                                        setImageSlider({ ...imageSlider, slides: newSlides });
                                      } else {
                                        console.error('Upload failed:', uploadResult.error);
                                        alert(`Upload failed: ${uploadResult.error}`);
                                      }
                                    } catch (error) {
                                      console.error('Upload error:', error);
                                      alert('Upload failed. Please try again.');
                                    } finally {
                                      setUploadingImage(null);
                                    }
                                  }
                                }}
                                className="hidden"
                                id={`slide-image-upload-${index}`}
                              />
                              <label
                                htmlFor={`slide-image-upload-${index}`}
                                className={`w-full flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 transition-colors ${
                                  uploadingImage === `slide-${index}` ? 'bg-pink-50' : 'hover:bg-gray-50'
                                }`}
                              >
                                {uploadingImage === `slide-${index}` ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm text-pink-600">Uploading...</span>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="text-sm text-gray-600">Upload Image</span>
                                  </>
                                )}
                              </label>
            </div>
                            
                            {slide.images?.[0] && (
                              <div className="mt-2">
                                <img
                                  src={slide.images[0]}
                                  alt={slide.title}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
        </div>
      </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">Live Preview</h4>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
                {imageSlider.slides.length > 0 && (
                  <div className="relative h-96">
                    <img
                      src={imageSlider.slides[0].image}
                      alt={imageSlider.slides[0].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white max-w-lg">
                      <h2 className="text-3xl font-bold mb-4">{imageSlider.slides[0].title}</h2>
                      <p className="text-lg mb-4 text-white/90">{imageSlider.slides[0].description}</p>
                      {imageSlider.showArtistInfo && (
                        <p className="text-sm text-white/80">by {imageSlider.slides[0].artist}</p>
                      )}
                    </div>
                    
                    {/* Navigation Arrows */}
                    {imageSlider.showArrows && (
                      <>
                        <button className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
                          ←
            </button>
                        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
                          →
                        </button>
                      </>
                    )}
                    
                    {/* Dots */}
                    {imageSlider.showDots && (
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {imageSlider.slides.map((_, index) => (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
          </div>
                    )}
                    
                    {isPreviewMode && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        Live Preview
        </div>
                    )}
                  </div>
                )}
                
                {imageSlider.slides.length === 0 && (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No slides added yet</p>
                      <p className="text-sm">Add slides to see preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'featuredGrid':
        return (
          <div className="space-y-8">
            {/* Section Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">Section Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                    <input
                      type="text"
                      value={featuredGrid.title}
                      onChange={(e) => setFeaturedGrid({ ...featuredGrid, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter section title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <textarea
                      value={featuredGrid.subtitle}
                      onChange={(e) => setFeaturedGrid({ ...featuredGrid, subtitle: e.target.value })}
                rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter subtitle"
              />
            </div>
                </div>
                
                <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                      value={featuredGrid.buttonText}
                      onChange={(e) => setFeaturedGrid({ ...featuredGrid, buttonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter button text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                    <input
                      type="text"
                      value={featuredGrid.buttonLink}
                      onChange={(e) => setFeaturedGrid({ ...featuredGrid, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter button link"
              />
            </div>
          </div>
          
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                        checked={featuredGrid.showButton}
                        onChange={(e) => setFeaturedGrid({ ...featuredGrid, showButton: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        featuredGrid.showButton ? 'bg-pink-500' : 'bg-gray-200'
                    }`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          featuredGrid.showButton ? 'translate-x-4' : ''
                      }`} />
                    </div>
                  </label>
                    <span className="text-sm font-medium text-gray-700">Show Button</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grid Layout</label>
                    <select
                      value={featuredGrid.gridLayout}
                      onChange={(e) => setFeaturedGrid({ ...featuredGrid, gridLayout: e.target.value as 'two-column' | 'three-column' | 'four-column' })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                      <option value="two-column">2 Columns</option>
                      <option value="three-column">3 Columns</option>
                      <option value="four-column">4 Columns</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{featuredGrid.items.length}</span> items total
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Items Management - Placeholder for now */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
                <h4 className="font-semibold text-gray-800">Grid Items Management</h4>
                <button
                  onClick={() => {
                    const newItem = {
                      id: Date.now().toString(),
                      title: 'New Item',
                      subtitle: 'Item subtitle',
                      description: 'Item description',
                      images: ['https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=800'],
                      link: '/new-item',
                      overlayStyle: 'gradient' as const,
                      textPosition: 'bottom-left' as const
                    };
                    setFeaturedGrid({
                      ...featuredGrid,
                      items: [...featuredGrid.items, newItem]
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
              </button>
            </div>
              <div className="space-y-6">
                {featuredGrid.items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-800">Item {index + 1}</h5>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (index > 0) {
                              const newItems = [...featuredGrid.items];
                              [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
                              setFeaturedGrid({ ...featuredGrid, items: newItems });
                            }
                          }}
                          disabled={index === 0}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => {
                            if (index < featuredGrid.items.length - 1) {
                              const newItems = [...featuredGrid.items];
                              [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                              setFeaturedGrid({ ...featuredGrid, items: newItems });
                            }
                          }}
                          disabled={index === featuredGrid.items.length - 1}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => {
                            const newItems = featuredGrid.items.filter((_, i) => i !== index);
                            setFeaturedGrid({ ...featuredGrid, items: newItems });
                          }}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                    <Trash2 className="w-4 h-4" />
                  </button>
          </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...featuredGrid.items];
                              newItems[index] = { ...item, title: e.target.value };
                              setFeaturedGrid({ ...featuredGrid, items: newItems });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="Enter item title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                          <input
                            type="text"
                            value={item.subtitle}
                            onChange={(e) => {
                              const newItems = [...featuredGrid.items];
                              newItems[index] = { ...item, subtitle: e.target.value };
                              setFeaturedGrid({ ...featuredGrid, items: newItems });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="Enter item subtitle"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={item.description || ''}
                            onChange={(e) => {
                              const newItems = [...featuredGrid.items];
                              newItems[index] = { ...item, description: e.target.value };
                              setFeaturedGrid({ ...featuredGrid, items: newItems });
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="Enter item description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                          <input
                            type="text"
                            value={item.link}
                            onChange={(e) => {
                              const newItems = [...featuredGrid.items];
                              newItems[index] = { ...item, link: e.target.value };
                              setFeaturedGrid({ ...featuredGrid, items: newItems });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                            placeholder="Enter item link"
                          />
        </div>
      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                          <div className="space-y-3">
                            <input
                              type="url"
                              value={item.images?.[0] || ''}
                              onChange={(e) => {
                                const newItems = [...featuredGrid.items];
                                newItems[index] = { ...item, images: [e.target.value] };
                                setFeaturedGrid({ ...featuredGrid, items: newItems });
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                              placeholder="Enter image URL"
                            />
                            
                            <div className="text-center text-sm text-gray-500">or</div>
                            
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      // Create preview first
                                      const previewUrl = URL.createObjectURL(file);
                                      const newItems = [...featuredGrid.items];
                                      newItems[index] = { ...item, images: [previewUrl] };
                                      setFeaturedGrid({ ...featuredGrid, items: newItems });

                                      // Upload to Supabase storage
                                      const { ImageUploadService } = await import('../../services/imageUploadService');
                                      const result = await ImageUploadService.uploadImage(file, 'homepage');
                                      
                                      if (result.success && result.url) {
                                        // Replace preview with actual URL
                                        const updatedItems = [...featuredGrid.items];
                                        updatedItems[index] = { ...item, images: [result.url] };
                                        setFeaturedGrid({ ...featuredGrid, items: updatedItems });
                                      } else {
                                        console.error('Failed to upload image:', result.error);
                                        // Remove preview on failure
                                        const failedItems = [...featuredGrid.items];
                                        failedItems[index] = { ...item, images: [] };
                                        setFeaturedGrid({ ...featuredGrid, items: failedItems });
                                      }
                                    } catch (error) {
                                      console.error('Error uploading image:', error);
                                      // Remove preview on error
                                      const errorItems = [...featuredGrid.items];
                                      errorItems[index] = { ...item, images: [] };
                                      setFeaturedGrid({ ...featuredGrid, items: errorItems });
                                    }
                                  }
                                }}
                                className="hidden"
                                id={`grid-item-image-upload-${index}`}
                              />
                              <label
                                htmlFor={`grid-item-image-upload-${index}`}
                                className="w-full flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 transition-colors hover:bg-gray-50"
                              >
                                <Upload className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="text-sm text-gray-600">Upload Image</span>
                              </label>
                            </div>
                            
                            {item.images?.[0] && (
                              <div className="mt-2">
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Overlay Style</label>
                          <select
                            value={item.overlayStyle}
                            onChange={(e) => {
                              const newItems = [...featuredGrid.items];
                              newItems[index] = { ...item, overlayStyle: e.target.value as 'gradient' | 'solid' | 'none' };
                              setFeaturedGrid({ ...featuredGrid, items: newItems });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                          >
                            <option value="gradient">Gradient</option>
                            <option value="solid">Solid</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Text Position</label>
                          <select
                            value={item.textPosition}
                            onChange={(e) => {
                              const newItems = [...featuredGrid.items];
                              newItems[index] = { ...item, textPosition: e.target.value as any };
                              setFeaturedGrid({ ...featuredGrid, items: newItems });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                          >
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="center">Center</option>
                          </select>
                        </div>
                      </div>
                </div>
              </div>
            ))}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">Live Preview</h4>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{featuredGrid.title}</h2>
                  <p className="text-gray-600 text-lg mb-6">{featuredGrid.subtitle}</p>
                  {featuredGrid.showButton && (
                    <button className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-full transition-colors">
                      {featuredGrid.buttonText}
            </button>
                  )}
          </div>
                
                {featuredGrid.items.length > 0 && (
                  <div className={`grid gap-6 ${
                    featuredGrid.gridLayout === 'two-column' ? 'grid-cols-1 md:grid-cols-2' :
                    featuredGrid.gridLayout === 'three-column' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                  }`}>
                    {featuredGrid.items.map((item) => (
                      <div key={item.id} className="relative rounded-xl overflow-hidden group cursor-pointer">
                        <img
                          src={item.images?.[0] || '/placeholder-image.jpg'}
                          alt={item.title}
                          className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                        />
                        
                        <div className={`absolute inset-0 ${
                          item.overlayStyle === 'gradient' 
                            ? 'bg-gradient-to-t from-black/60 via-transparent to-transparent' 
                            : item.overlayStyle === 'solid' ? 'bg-black/40' : ''
                        }`} />
                        
                        <div className={`absolute text-white ${
                          item.textPosition === 'bottom-left' ? 'bottom-4 left-4' :
                          item.textPosition === 'bottom-right' ? 'bottom-4 right-4' :
                          item.textPosition === 'top-left' ? 'top-4 left-4' :
                          item.textPosition === 'top-right' ? 'top-4 right-4' :
                          'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center'
                        }`}>
                          <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                          <p className="text-sm text-white/90">{item.subtitle}</p>
                          {item.description && (
                            <p className="text-xs text-white/75 mt-1">{item.description}</p>
                          )}
        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {featuredGrid.items.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
                      <Grid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No items added yet</p>
                      <p className="text-sm">Add items to see preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'bestSellers':
        const filteredProducts = availableProducts.filter(product => {
          const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
          const matchesSearch = product.title.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
                               product.title.toLowerCase().includes(productSearchTerm.toLowerCase());
          return matchesCategory && matchesSearch;
        });

        return (
          <div className="space-y-8">
            {/* Section Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">Section Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                    <input
                      type="text"
                      value={bestSellers.title}
                      onChange={(e) => setBestSellers({ ...bestSellers, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <textarea
                      value={bestSellers.subtitle}
                      onChange={(e) => setBestSellers({ ...bestSellers, subtitle: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter subtitle"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                    <input
                      type="text"
                      value={bestSellers.buttonText}
                      onChange={(e) => setBestSellers({ ...bestSellers, buttonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter button text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                    <input
                      type="text"
                      value={bestSellers.buttonLink}
                      onChange={(e) => setBestSellers({ ...bestSellers, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter button link"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Items to Display</label>
                    <input
                      type="number"
                      value={bestSellers.maxItems}
                      onChange={(e) => setBestSellers({ ...bestSellers, maxItems: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                        checked={bestSellers.showButton}
                        onChange={(e) => setBestSellers({ ...bestSellers, showButton: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        bestSellers.showButton ? 'bg-pink-500' : 'bg-gray-200'
                    }`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          bestSellers.showButton ? 'translate-x-4' : ''
                      }`} />
                    </div>
                  </label>
                    <span className="text-sm font-medium text-gray-700">Show Button</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bestSellers.showRating}
                        onChange={(e) => setBestSellers({ ...bestSellers, showRating: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        bestSellers.showRating ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          bestSellers.showRating ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Rating</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bestSellers.showDownloads}
                        onChange={(e) => setBestSellers({ ...bestSellers, showDownloads: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        bestSellers.showDownloads ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          bestSellers.showDownloads ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Downloads</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bestSellers.showBadge}
                        onChange={(e) => setBestSellers({ ...bestSellers, showBadge: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        bestSellers.showBadge ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          bestSellers.showBadge ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Badge</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{bestSellers.selectedProducts.length}</span> products selected
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selection Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Products */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Available Products</h4>
                  
                  {/* Search and Filter */}
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category}
              </button>
                      ))}
            </div>
          </div>
        </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => {
                    const isSelected = bestSellers.selectedProducts.some(p => p.id === product.id);
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          isSelected 
                            ? 'border-pink-300 bg-pink-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setBestSellers({
                              ...bestSellers,
                              selectedProducts: bestSellers.selectedProducts.filter(p => p.id !== product.id)
                            });
                          } else if (bestSellers.selectedProducts.length < bestSellers.maxItems) {
                            setBestSellers({
                              ...bestSellers,
                              selectedProducts: [...bestSellers.selectedProducts, {
                                ...product,
                                badge: 'Best Seller',
                                badgeColor: 'pink'
                              }]
                            });
                          }
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{product.title}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-medium">${product.price}</span>
                            <span className="text-xs text-gray-500">⭐ {product.rating}</span>
                            <span className="text-xs text-gray-500">{product.downloads} downloads</span>
      </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <button
                              className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-colors ${
                                bestSellers.selectedProducts.length >= bestSellers.maxItems
                                  ? 'border-gray-300 cursor-not-allowed'
                                  : 'border-gray-300 hover:border-pink-500'
                              }`}
                              disabled={bestSellers.selectedProducts.length >= bestSellers.maxItems}
                            >
                              <Plus className="w-3 h-3 text-gray-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No products found</p>
                      <p className="text-sm">Try adjusting your search or filter</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Products */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h4 className="font-semibold text-gray-800">Selected Products ({bestSellers.selectedProducts.length}/{bestSellers.maxItems})</h4>
                  <p className="text-sm text-gray-600">Drag to reorder, click to edit badges</p>
                </div>
                
                {bestSellers.selectedProducts.length > 0 ? (
                  <div className="space-y-3">
                    {bestSellers.selectedProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-shrink-0 cursor-move">
                          <div className="w-6 h-6 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{product.title}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-medium">${product.price}</span>
                            <span className="text-xs text-gray-500">⭐ {product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={product.badge || ''}
                              onChange={(e) => {
                                const updatedProducts = [...bestSellers.selectedProducts];
                                updatedProducts[index] = { ...product, badge: e.target.value };
                                setBestSellers({ ...bestSellers, selectedProducts: updatedProducts });
                              }}
                              placeholder="Badge text"
                              className="w-20 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-300"
                            />
                            <select
                              value={product.badgeColor || 'pink'}
                              onChange={(e) => {
                                const updatedProducts = [...bestSellers.selectedProducts];
                                updatedProducts[index] = { ...product, badgeColor: e.target.value };
                                setBestSellers({ ...bestSellers, selectedProducts: updatedProducts });
                              }}
                              className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-300"
                            >
                              <option value="pink">Pink</option>
                              <option value="blue">Blue</option>
                              <option value="green">Green</option>
                              <option value="yellow">Yellow</option>
                              <option value="red">Red</option>
                              <option value="purple">Purple</option>
                            </select>
                          </div>
                          <button
                            onClick={() => {
                              setBestSellers({
                                ...bestSellers,
                                selectedProducts: bestSellers.selectedProducts.filter(p => p.id !== product.id)
                              });
                            }}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No products selected</p>
                    <p className="text-sm">Select products from the left panel</p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">Live Preview</h4>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{bestSellers.title}</h2>
                  <p className="text-gray-600 text-lg mb-6">{bestSellers.subtitle}</p>
                </div>
                
                {bestSellers.selectedProducts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                    {bestSellers.selectedProducts.slice(0, bestSellers.maxItems).map((product) => (
                      <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                          />
                          {bestSellers.showBadge && product.badge && (
                            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white ${
                              product.badgeColor === 'pink' ? 'bg-pink-500' :
                              product.badgeColor === 'blue' ? 'bg-blue-500' :
                              product.badgeColor === 'green' ? 'bg-green-500' :
                              product.badgeColor === 'yellow' ? 'bg-yellow-500' :
                              product.badgeColor === 'red' ? 'bg-red-500' :
                              product.badgeColor === 'purple' ? 'bg-purple-500' :
                              'bg-pink-500'
                            }`}>
                              {product.badge}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-1">{product.title}</h3>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg text-gray-800">${product.price}</span>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              {bestSellers.showRating && (
                                <span className="flex items-center">
                                  ⭐ {product.rating}
                                </span>
                              )}
                              {bestSellers.showDownloads && (
                                <span>{product.downloads.toLocaleString()} downloads</span>
                              )}
                            </div>
                          </div>
                          <button className="w-full mt-3 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors">
                            View Details
            </button>
          </div>
        </div>
                    ))}
                  </div>
                )}
                
                {bestSellers.showButton && (
                  <div className="text-center">
                    <button className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-full transition-colors">
                      {bestSellers.buttonText}
                    </button>
                  </div>
                )}
                
                {bestSellers.selectedProducts.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No products selected</p>
                      <p className="text-sm">Select products to see preview</p>
                    </div>
                  </div>
                )}
                
                {isPreviewMode && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Live Preview
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'featuredArtwork':
        const featuredFilteredProducts = availableProducts.filter(product => {
          const matchesCategory = featuredSelectedCategory === 'All' || product.category === featuredSelectedCategory;
          const matchesSearch = product.title.toLowerCase().includes(featuredProductSearchTerm.toLowerCase()) || 
                               product.artist.toLowerCase().includes(featuredProductSearchTerm.toLowerCase());
          return matchesCategory && matchesSearch;
        });

        return (
          <div className="space-y-8">
            {/* Section Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">Section Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                    <input
                      type="text"
                      value={featuredArtwork.title}
                      onChange={(e) => setFeaturedArtwork({ ...featuredArtwork, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <textarea
                      value={featuredArtwork.subtitle}
                      onChange={(e) => setFeaturedArtwork({ ...featuredArtwork, subtitle: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter subtitle"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                    <input
                      type="text"
                      value={featuredArtwork.buttonText}
                      onChange={(e) => setFeaturedArtwork({ ...featuredArtwork, buttonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter button text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                    <input
                      type="text"
                      value={featuredArtwork.buttonLink}
                      onChange={(e) => setFeaturedArtwork({ ...featuredArtwork, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter button link"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Items to Display</label>
                    <input
                      type="number"
                      value={featuredArtwork.maxItems}
                      onChange={(e) => setFeaturedArtwork({ ...featuredArtwork, maxItems: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredArtwork.showButton}
                        onChange={(e) => setFeaturedArtwork({ ...featuredArtwork, showButton: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        featuredArtwork.showButton ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          featuredArtwork.showButton ? 'translate-x-4' : ''
                        }`} />
                  </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Button</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredArtwork.showRating}
                        onChange={(e) => setFeaturedArtwork({ ...featuredArtwork, showRating: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        featuredArtwork.showRating ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          featuredArtwork.showRating ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Rating</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredArtwork.showDownloads}
                        onChange={(e) => setFeaturedArtwork({ ...featuredArtwork, showDownloads: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        featuredArtwork.showDownloads ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          featuredArtwork.showDownloads ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Downloads</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredArtwork.showBadge}
                        onChange={(e) => setFeaturedArtwork({ ...featuredArtwork, showBadge: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        featuredArtwork.showBadge ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          featuredArtwork.showBadge ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Badge</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{featuredArtwork.selectedProducts.length}</span> products selected
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selection Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Products */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Available Products</h4>
                  
                  {/* Search and Filter */}
                  <div className="space-y-3">
                  <div>
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={featuredProductSearchTerm}
                        onChange={(e) => setFeaturedProductSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                  </div>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setFeaturedSelectedCategory(category)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            featuredSelectedCategory === category
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                </div>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {featuredFilteredProducts.map((product) => {
                    const isSelected = featuredArtwork.selectedProducts.some(p => p.id === product.id);
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          isSelected 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setFeaturedArtwork({
                              ...featuredArtwork,
                              selectedProducts: featuredArtwork.selectedProducts.filter(p => p.id !== product.id)
                            });
                          } else if (featuredArtwork.selectedProducts.length < featuredArtwork.maxItems) {
                            setFeaturedArtwork({
                              ...featuredArtwork,
                              selectedProducts: [...featuredArtwork.selectedProducts, {
                                ...product,
                                badge: 'Featured',
                                badgeColor: 'blue'
                              }]
                            });
                          }
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{product.title}</h5>
                          <p className="text-xs text-gray-500">by {product.artist}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-medium">${product.price}</span>
                            <span className="text-xs text-gray-500">⭐ {product.rating}</span>
                            <span className="text-xs text-gray-500">{product.downloads} downloads</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <button
                              className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-colors ${
                                featuredArtwork.selectedProducts.length >= featuredArtwork.maxItems
                                  ? 'border-gray-300 cursor-not-allowed'
                                  : 'border-gray-300 hover:border-blue-500'
                              }`}
                              disabled={featuredArtwork.selectedProducts.length >= featuredArtwork.maxItems}
                            >
                              <Plus className="w-3 h-3 text-gray-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {featuredFilteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No products found</p>
                      <p className="text-sm">Try adjusting your search or filter</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Products */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h4 className="font-semibold text-gray-800">Selected Products ({featuredArtwork.selectedProducts.length}/{featuredArtwork.maxItems})</h4>
                  <p className="text-sm text-gray-600">Drag to reorder, click to edit badges</p>
                </div>
                
                {featuredArtwork.selectedProducts.length > 0 ? (
                  <div className="space-y-3">
                    {featuredArtwork.selectedProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-shrink-0 cursor-move">
                          <div className="w-6 h-6 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{product.title}</h5>
                          <p className="text-xs text-gray-500">by {product.artist}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-medium">${product.price}</span>
                            <span className="text-xs text-gray-500">⭐ {product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={product.badge || ''}
                              onChange={(e) => {
                                const updatedProducts = [...featuredArtwork.selectedProducts];
                                updatedProducts[index] = { ...product, badge: e.target.value };
                                setFeaturedArtwork({ ...featuredArtwork, selectedProducts: updatedProducts });
                              }}
                              placeholder="Badge text"
                              className="w-20 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                            />
                            <select
                              value={product.badgeColor || 'blue'}
                              onChange={(e) => {
                                const updatedProducts = [...featuredArtwork.selectedProducts];
                                updatedProducts[index] = { ...product, badgeColor: e.target.value };
                                setFeaturedArtwork({ ...featuredArtwork, selectedProducts: updatedProducts });
                              }}
                              className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                            >
                              <option value="pink">Pink</option>
                              <option value="blue">Blue</option>
                              <option value="green">Green</option>
                              <option value="yellow">Yellow</option>
                              <option value="red">Red</option>
                              <option value="purple">Purple</option>
                            </select>
                          </div>
                          <button
                            onClick={() => {
                              setFeaturedArtwork({
                                ...featuredArtwork,
                                selectedProducts: featuredArtwork.selectedProducts.filter(p => p.id !== product.id)
                              });
                            }}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No products selected</p>
                    <p className="text-sm">Select products from the left panel</p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">Live Preview</h4>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{featuredArtwork.title}</h2>
                  <p className="text-gray-600 text-lg mb-6">{featuredArtwork.subtitle}</p>
                </div>
                
                {featuredArtwork.selectedProducts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {featuredArtwork.selectedProducts.slice(0, featuredArtwork.maxItems).map((product) => (
                      <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                          />
                          {featuredArtwork.showBadge && product.badge && (
                            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white ${
                              product.badgeColor === 'pink' ? 'bg-pink-500' :
                              product.badgeColor === 'blue' ? 'bg-blue-500' :
                              product.badgeColor === 'green' ? 'bg-green-500' :
                              product.badgeColor === 'yellow' ? 'bg-yellow-500' :
                              product.badgeColor === 'red' ? 'bg-red-500' :
                              product.badgeColor === 'purple' ? 'bg-purple-500' :
                              'bg-blue-500'
                            }`}>
                              {product.badge}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-1">{product.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">by {product.artist}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg text-gray-800">${product.price}</span>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              {featuredArtwork.showRating && (
                                <span className="flex items-center">
                                  ⭐ {product.rating}
                                </span>
                              )}
                              {featuredArtwork.showDownloads && (
                                <span>{product.downloads.toLocaleString()} downloads</span>
                              )}
                            </div>
                          </div>
                          <button className="w-full mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {featuredArtwork.showButton && (
                  <div className="text-center">
                    <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-colors">
                      {featuredArtwork.buttonText}
                    </button>
                  </div>
                )}
                
                {featuredArtwork.selectedProducts.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No products selected</p>
                      <p className="text-sm">Select products to see preview</p>
                    </div>
                  </div>
                )}
                
                {isPreviewMode && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Live Preview
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'categories':
        const filteredCategories = availableCategories_data.filter(category => {
          const matchesSearch = category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) || 
                               category.description.toLowerCase().includes(categorySearchTerm.toLowerCase());
          return matchesSearch;
        });

        return (
          <div className="space-y-8">
            {/* Section Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">Section Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                    <input
                      type="text"
                      value={categoriesSection.title}
                      onChange={(e) => setCategoriesSection({ ...categoriesSection, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <textarea
                      value={categoriesSection.subtitle}
                      onChange={(e) => setCategoriesSection({ ...categoriesSection, subtitle: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter subtitle"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                    <input
                      type="text"
                      value={categoriesSection.buttonText}
                      onChange={(e) => setCategoriesSection({ ...categoriesSection, buttonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter button text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                    <input
                      type="text"
                      value={categoriesSection.buttonLink}
                      onChange={(e) => setCategoriesSection({ ...categoriesSection, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter button link"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Categories to Display</label>
                    <input
                      type="number"
                      value={categoriesSection.maxCategories}
                      onChange={(e) => setCategoriesSection({ ...categoriesSection, maxCategories: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      min="1"
                      max="12"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                        checked={categoriesSection.showButton}
                        onChange={(e) => setCategoriesSection({ ...categoriesSection, showButton: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        categoriesSection.showButton ? 'bg-pink-500' : 'bg-gray-200'
                    }`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          categoriesSection.showButton ? 'translate-x-4' : ''
                      }`} />
                    </div>
                  </label>
                    <span className="text-sm font-medium text-gray-700">Show Button</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoriesSection.showProductCount}
                        onChange={(e) => setCategoriesSection({ ...categoriesSection, showProductCount: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        categoriesSection.showProductCount ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          categoriesSection.showProductCount ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Product Count</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{categoriesSection.selectedCategories.length}</span> categories selected
                  </div>
                </div>
              </div>
            </div>

            {/* Category Selection Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Categories */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Available Categories</h4>
                  
                  {/* Search */}
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredCategories.map((category) => {
                    const isSelected = categoriesSection.selectedCategories.some(c => c.id === category.id);
                    return (
                      <div
                        key={category.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          isSelected 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setCategoriesSection({
                              ...categoriesSection,
                              selectedCategories: categoriesSection.selectedCategories.filter(c => c.id !== category.id)
                            });
                          } else if (categoriesSection.selectedCategories.length < categoriesSection.maxCategories) {
                            setCategoriesSection({
                              ...categoriesSection,
                              selectedCategories: [...categoriesSection.selectedCategories, {
                                ...category,
                                featured: false
                              }]
                            });
                          }
                        }}
                      >
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{category.name}</h5>
                          <p className="text-xs text-gray-500">{category.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{category.count} artworks</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <button
                              className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-colors ${
                                categoriesSection.selectedCategories.length >= categoriesSection.maxCategories
                                  ? 'border-gray-300 cursor-not-allowed'
                                  : 'border-gray-300 hover:border-green-500'
                              }`}
                              disabled={categoriesSection.selectedCategories.length >= categoriesSection.maxCategories}
                            >
                              <Plus className="w-3 h-3 text-gray-500" />
                  </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredCategories.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No categories found</p>
                      <p className="text-sm">Try adjusting your search</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Categories */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h4 className="font-semibold text-gray-800">Selected Categories ({categoriesSection.selectedCategories.length}/{categoriesSection.maxCategories})</h4>
                  <p className="text-sm text-gray-600">Drag to reorder, toggle featured status</p>
                </div>
                
                {categoriesSection.selectedCategories.length > 0 ? (
                  <div className="space-y-3">
                    {categoriesSection.selectedCategories.map((category, index) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-shrink-0 cursor-move">
                          <div className="w-6 h-6 flex flex-col items-center justify-center text-gray-400">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{category.name}</h5>
                          <p className="text-xs text-gray-500">{category.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{category.count} artworks</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={category.featured || false}
                                onChange={(e) => {
                                  const updatedCategories = [...categoriesSection.selectedCategories];
                                  updatedCategories[index] = { ...category, featured: e.target.checked };
                                  setCategoriesSection({ ...categoriesSection, selectedCategories: updatedCategories });
                                }}
                                className="sr-only"
                              />
                              <div className={`relative w-8 h-5 rounded-full transition-colors ${
                                category.featured ? 'bg-green-500' : 'bg-gray-200'
                              }`}>
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${
                                  category.featured ? 'translate-x-3' : ''
                                }`} />
                              </div>
                            </label>
                            <span className="text-xs text-gray-600">Featured</span>
                          </div>
                          <button
                            onClick={() => {
                              setCategoriesSection({
                                ...categoriesSection,
                                selectedCategories: categoriesSection.selectedCategories.filter(c => c.id !== category.id)
                              });
                            }}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Grid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No categories selected</p>
                    <p className="text-sm">Select categories from the left panel</p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">Live Preview</h4>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{categoriesSection.title}</h2>
                  <p className="text-gray-600 text-lg mb-6">{categoriesSection.subtitle}</p>
                </div>
                
                {categoriesSection.selectedCategories.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {categoriesSection.selectedCategories.slice(0, categoriesSection.maxCategories).map((category) => (
                      <div key={category.id} className="relative group cursor-pointer">
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          {category.featured && (
                            <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                              Featured
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 text-white">
                            <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                            {categoriesSection.showProductCount && (
                              <p className="text-xs text-white/80">{category.count} artworks</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {categoriesSection.showButton && (
                  <div className="text-center">
                    <button className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition-colors">
                      {categoriesSection.buttonText}
                    </button>
                  </div>
                )}
                
                {categoriesSection.selectedCategories.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Grid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No categories selected</p>
                      <p className="text-sm">Select categories to see preview</p>
                    </div>
                  </div>
                )}
                
                {isPreviewMode && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Live Preview
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'trendingCollections':
        return (
          <div className="space-y-8">
            {/* Section Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">Section Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                    <input
                      type="text"
                      value={trendingCollections.title}
                      onChange={(e) => setTrendingCollections({ ...trendingCollections, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <textarea
                      value={trendingCollections.subtitle}
                      onChange={(e) => setTrendingCollections({ ...trendingCollections, subtitle: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter subtitle"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                    <input
                      type="text"
                      value={trendingCollections.buttonText}
                      onChange={(e) => setTrendingCollections({ ...trendingCollections, buttonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter button text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                    <input
                      type="text"
                      value={trendingCollections.buttonLink}
                      onChange={(e) => setTrendingCollections({ ...trendingCollections, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="Enter button link"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trendingCollections.showButton}
                        onChange={(e) => setTrendingCollections({ ...trendingCollections, showButton: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        trendingCollections.showButton ? 'bg-pink-500' : 'bg-gray-200'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          trendingCollections.showButton ? 'translate-x-4' : ''
                        }`} />
                      </div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Show Button</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{trendingCollections.collections.length}</span> collections configured
                  </div>
                </div>
              </div>
            </div>

            {/* Collections Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="border-b border-gray-200 pb-3 mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Collections Management</h4>
                <p className="text-sm text-gray-600">Edit images, text, and links for each collection</p>
                <button
                  onClick={() => {
                    const newCollection = {
                      id: Date.now().toString(),
                      title: 'New Collection',
                      image: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=600',
                      artworkCount: 0,
                      description: 'Collection description',
                      badge: 'New',
                      badgeColor: 'purple',
                      link: '/collections/new-collection',
                      updateFrequency: 'Fresh content',
                      status: 'new'
                    };
                    setTrendingCollections({
                      ...trendingCollections,
                      collections: [...trendingCollections.collections, newCollection]
                    });
                  }}
                  className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Collection</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {trendingCollections.collections.map((collection, index) => (
                  <div key={collection.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-semibold text-gray-800">Collection {index + 1}</h5>
                      <div className="flex items-center space-x-2">
                        {index > 0 && (
                          <button
                            onClick={() => {
                              const newCollections = [...trendingCollections.collections];
                              [newCollections[index], newCollections[index - 1]] = [newCollections[index - 1], newCollections[index]];
                              setTrendingCollections({ ...trendingCollections, collections: newCollections });
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            ↑
                          </button>
                        )}
                        {index < trendingCollections.collections.length - 1 && (
                          <button
                            onClick={() => {
                              const newCollections = [...trendingCollections.collections];
                              [newCollections[index], newCollections[index + 1]] = [newCollections[index + 1], newCollections[index]];
                              setTrendingCollections({ ...trendingCollections, collections: newCollections });
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setTrendingCollections({
                              ...trendingCollections,
                              collections: trendingCollections.collections.filter(c => c.id !== collection.id)
                            });
                          }}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        >
                    <Trash2 className="w-4 h-4" />
                  </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Collection Details */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Collection Title</label>
                          <input
                            type="text"
                            value={collection.title}
                            onChange={(e) => {
                              const updatedCollections = [...trendingCollections.collections];
                              updatedCollections[index] = { ...collection, title: e.target.value };
                              setTrendingCollections({ ...trendingCollections, collections: updatedCollections });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                            placeholder="Enter collection title"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={collection.description}
                            onChange={(e) => {
                              const updatedCollections = [...trendingCollections.collections];
                              updatedCollections[index] = { ...collection, description: e.target.value };
                              setTrendingCollections({ ...trendingCollections, collections: updatedCollections });
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                            placeholder="Enter collection description"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Artwork Count</label>
                            <input
                              type="number"
                              value={collection.artworkCount}
                              onChange={(e) => {
                                const updatedCollections = [...trendingCollections.collections];
                                updatedCollections[index] = { ...collection, artworkCount: parseInt(e.target.value) || 0 };
                                setTrendingCollections({ ...trendingCollections, collections: updatedCollections });
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                            <input
                              type="text"
                              value={collection.link}
                              onChange={(e) => {
                                const updatedCollections = [...trendingCollections.collections];
                                updatedCollections[index] = { ...collection, link: e.target.value };
                                setTrendingCollections({ ...trendingCollections, collections: updatedCollections });
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                              placeholder="/collections/..."
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
                            <input
                              type="text"
                              value={collection.badge || ''}
                              onChange={(e) => {
                                const updatedCollections = [...trendingCollections.collections];
                                updatedCollections[index] = { ...collection, badge: e.target.value };
                                setTrendingCollections({ ...trendingCollections, collections: updatedCollections });
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                              placeholder="Badge text"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Badge Color</label>
                            <select
                              value={collection.badgeColor || 'purple'}
                              onChange={(e) => {
                                const updatedCollections = [...trendingCollections.collections];
                                updatedCollections[index] = { ...collection, badgeColor: e.target.value };
                                setTrendingCollections({ ...trendingCollections, collections: updatedCollections });
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                            >
                              <option value="orange">Orange</option>
                              <option value="green">Green</option>
                              <option value="blue">Blue</option>
                              <option value="purple">Purple</option>
                              <option value="pink">Pink</option>
                              <option value="red">Red</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Update Frequency</label>
                          <input
                            type="text"
                            value={collection.updateFrequency || ''}
                            onChange={(e) => {
                              const updatedCollections = [...trendingCollections.collections];
                              updatedCollections[index] = { ...collection, updateFrequency: e.target.value };
                              setTrendingCollections({ ...trendingCollections, collections: updatedCollections });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                            placeholder="e.g., Updated daily, Weekly updates"
                          />
                        </div>
                      </div>
                      
                      {/* Image Management */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Collection Image</label>
                          <div className="space-y-3">
                            <img
                              src={collection.image}
                              alt={collection.title}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <input
                              type="text"
                              value={collection.image}
                              onChange={(e) => {
                                const updatedCollections = [...trendingCollections.collections];
                                updatedCollections[index] = { ...collection, image: e.target.value };
                                setTrendingCollections({ ...trendingCollections, collections: updatedCollections });
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                              placeholder="Enter image URL"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    // Create preview first
                                    const previewUrl = URL.createObjectURL(file);
                                    const updatedCollections = [...trendingCollections.collections];
                                    updatedCollections[index] = { ...collection, image: previewUrl };
                                    setTrendingCollections({ ...trendingCollections, collections: updatedCollections });

                                    // Upload to Supabase storage
                                    const { ImageUploadService } = await import('../../services/imageUploadService');
                                    const result = await ImageUploadService.uploadImage(file, 'homepage');
                                    
                                    if (result.success && result.url) {
                                      // Replace preview with actual URL
                                      const finalCollections = [...trendingCollections.collections];
                                      finalCollections[index] = { ...collection, image: result.url };
                                      setTrendingCollections({ ...trendingCollections, collections: finalCollections });
                                    } else {
                                      console.error('Failed to upload image:', result.error);
                                      // Remove preview on failure
                                      const failedCollections = [...trendingCollections.collections];
                                      failedCollections[index] = { ...collection, image: '' };
                                      setTrendingCollections({ ...trendingCollections, collections: failedCollections });
                                    }
                                  } catch (error) {
                                    console.error('Error uploading image:', error);
                                    // Remove preview on error
                                    const errorCollections = [...trendingCollections.collections];
                                    errorCollections[index] = { ...collection, image: '' };
                                    setTrendingCollections({ ...trendingCollections, collections: errorCollections });
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <select
                            value={collection.status || 'new'}
                            onChange={(e) => {
                              const updatedCollections = [...trendingCollections.collections];
                              updatedCollections[index] = { ...collection, status: e.target.value as 'trending' | 'popular' | 'new' };
                              setTrendingCollections({ ...trendingCollections, collections: updatedCollections });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                          >
                            <option value="trending">Trending</option>
                            <option value="popular">Popular</option>
                            <option value="new">New</option>
                          </select>
                        </div>
                      </div>
                </div>
              </div>
            ))}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">Live Preview</h4>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{trendingCollections.title}</h2>
                  <p className="text-gray-600 text-lg mb-6">{trendingCollections.subtitle}</p>
                </div>
                
                {trendingCollections.collections.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {trendingCollections.collections.map((collection) => (
                      <div key={collection.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={collection.image}
                            alt={collection.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                          />
                          {collection.badge && (
                            <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium text-white ${
                              collection.badgeColor === 'orange' ? 'bg-orange-500' :
                              collection.badgeColor === 'green' ? 'bg-green-500' :
                              collection.badgeColor === 'blue' ? 'bg-blue-500' :
                              collection.badgeColor === 'purple' ? 'bg-purple-500' :
                              collection.badgeColor === 'pink' ? 'bg-pink-500' :
                              collection.badgeColor === 'red' ? 'bg-red-500' :
                              'bg-purple-500'
                            }`}>
                              {collection.badge}
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 text-white">
                            <p className="text-xs font-medium">{collection.artworkCount}+ artworks</p>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-semibold text-gray-800 mb-2">{collection.title}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{collection.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{collection.updateFrequency}</span>
                            <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors">
                              Explore Collection →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {trendingCollections.showButton && (
                  <div className="text-center">
                    <button className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-full transition-colors">
                      {trendingCollections.buttonText}
                    </button>
                  </div>
                )}
                
                {trendingCollections.collections.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No collections configured</p>
                      <p className="text-sm">Add collections to see preview</p>
                    </div>
                  </div>
                )}
                
                {isPreviewMode && (
                  <div className="absolute top-4 right-4 bg-pink-500 text-white px-2 py-1 rounded text-xs">
                    Live Preview
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Statistics Configuration</h4>
                <p className="text-sm text-gray-500">Configure the statistics displayed in the stats section. Each stat shows an icon, value, and label.</p>
                
                <div className="space-y-3">
                  {statsSection.stats.map((stat, index) => (
                    <div key={stat.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...statsSection.stats];
                            newStats[index].value = e.target.value;
                            setStatsSection({ ...statsSection, stats: newStats });
                          }}
                          placeholder="Value"
                          className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...statsSection.stats];
                            newStats[index].label = e.target.value;
                            setStatsSection({ ...statsSection, stats: newStats });
                          }}
                          placeholder="Label"
                          className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                        <select
                          value={stat.color}
                          onChange={(e) => {
                            const newStats = [...statsSection.stats];
                            newStats[index].color = e.target.value;
                            setStatsSection({ ...statsSection, stats: newStats });
                          }}
                          className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        >
                          <option value="bg-pink-100">Pink</option>
                          <option value="bg-blue-100">Blue</option>
                          <option value="bg-green-100">Green</option>
                          <option value="bg-purple-100">Purple</option>
                          <option value="bg-yellow-100">Yellow</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  {statsSection.stats.map((stat) => (
                    <div key={stat.id} className="bg-white rounded-xl shadow-lg p-4 text-center border border-gray-100">
                      <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.color} rounded-xl mb-3`}>
                        {getSectionIcon(stat.icon)}
                      </div>
                      <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                      <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input
                    type="text"
                    value={newsletterSection.title}
                    onChange={(e) => setNewsletterSection({ ...newsletterSection, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    value={newsletterSection.subtitle}
                    onChange={(e) => setNewsletterSection({ ...newsletterSection, subtitle: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Placeholder</label>
                  <input
                    type="text"
                    value={newsletterSection.placeholder}
                    onChange={(e) => setNewsletterSection({ ...newsletterSection, placeholder: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={newsletterSection.buttonText}
                    onChange={(e) => setNewsletterSection({ ...newsletterSection, buttonText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              </div>
              
              {/* Preview */}
              <div className="bg-white p-8 rounded-xl border border-pink-100">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{newsletterSection.title}</h2>
                  <p className="text-gray-600 mb-8">{newsletterSection.subtitle}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder={newsletterSection.placeholder}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <button className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors">
                      {newsletterSection.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a section to edit</div>;
    }
  };

  const sections = [
    { id: 'hero', name: 'Hero Section', type: 'hero' },
    { id: 'imageSlider', name: 'Image Slider', type: 'imageSlider' },
    { id: 'featuredGrid', name: 'Featured Grid', type: 'featuredGrid' },
    { id: 'bestSellers', name: 'Best Sellers', type: 'bestSellers' },
    { id: 'featuredArtwork', name: 'Featured Artwork', type: 'featuredArtwork' },
    { id: 'categories', name: 'Categories', type: 'categories' },
    { id: 'trendingCollections', name: 'Trending Collections', type: 'trendingCollections' },
    { id: 'stats', name: 'Statistics', type: 'stats' },
    { id: 'newsletter', name: 'Newsletter', type: 'newsletter' }
  ];

  return (
    <AdminLayout title="" noHeader={true}>
      <div className="flex h-screen bg-gray-50">
        {/* Left Sidebar - Section Navigation */}
        <div 
          className="bg-white border-r border-gray-200 w-20 h-full fixed top-0 left-20 z-20"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Layout className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="py-4">
            <nav className="space-y-1 px-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative ${
                    selectedSection === section.id
                      ? 'bg-pink-50 text-pink-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={section.name}
                >
                  {/* Active indicator */}
                  {selectedSection === section.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 rounded-r-full" />
                  )}
                  
                  <span className={`flex-shrink-0 transition-colors ${
                    selectedSection === section.id ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`}>
                    {getSectionIcon(section.type)}
                  </span>
                  
                  {/* Tooltip for collapsed state */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {section.name}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                  </div>
                </button>
              ))}
            </nav>
          </div>


        </div>

        {/* Right Side - Section Editor with left margin to account for fixed sidebars */}
        <div className="flex-1 flex flex-col overflow-hidden ml-20">
          {/* Content Header */}
          <div className="px-6 py-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-pink-600">
                    {getSectionIcon(sections.find(s => s.id === selectedSection)?.type || 'hero')}
                  </span>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-800">
                      {sections.find(s => s.id === selectedSection)?.name} Editor
                    </h1>
                    <p className="text-sm text-gray-600">
                      Configure the {sections.find(s => s.id === selectedSection)?.name.toLowerCase()} section
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {settingsLoaded && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      <Check className="w-3 h-3" />
                      <span>Settings Loaded</span>
                    </div>
                  )}
                  <button 
                    onClick={handlePreview}
                    className={`flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg transition-colors text-sm ${
                      isPreviewMode 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
                  </button>
                  <button 
                    onClick={handleSaveChanges}
                    disabled={saveStatus === 'saving' || loading}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      saveStatus === 'saving' || loading
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : saveStatus === 'saved'
                        ? 'bg-green-500 text-white'
                        : saveStatus === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-pink-500 hover:bg-pink-600 text-white'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {loading && 'Loading...'}
                      {saveStatus === 'saving' && 'Saving...'}
                      {saveStatus === 'saved' && 'Saved!'}
                      {saveStatus === 'error' && 'Error - Try Again'}
                      {saveStatus === 'idle' && !loading && 'Save Changes'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pb-6">
              {renderSectionEditor()}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default HomepageManagement;