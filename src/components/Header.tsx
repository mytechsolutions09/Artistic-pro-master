import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, Clock, TrendingUp, ChevronDown, Settings } from 'lucide-react';
import { CartManager } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../utils/adminUtils';
import { useCategories } from '../contexts/CategoryContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname.startsWith('/admin');
  const { user } = useAuth();
  const { categories } = useCategories();
  
  useEffect(() => {
    // Initialize cart count
    setCartItemCount(CartManager.getItemCount());
    
    // Subscribe to cart changes
    const unsubscribe = CartManager.subscribe(() => {
      setCartItemCount(CartManager.getItemCount());
    });
    
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing search history:', error);
      }
    }
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchOpen && searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
        setSelectedIndex(-1);
        setIsSearchOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSearchOpen]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Add to search history
      const newHistory = [query.trim(), ...searchHistory.filter(item => item !== query.trim())].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSearchSuggestions(false);
      setSearchQuery('');
      setSelectedIndex(-1);
      setIsSearchOpen(false);
    }
  };

  const handleSearchInputChange = async (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1);
    if (value.trim().length > 1) {
      // Generate search suggestions from all product types
      const suggestions = await generateSearchSuggestions(value);
      setSearchSuggestions(suggestions);
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
    }
  };

  const generateSearchSuggestions = async (query: string): Promise<string[]> => {
    const queryLower = query.toLowerCase();
    
    // Common terms across all product types
    const commonTerms = [
      // Art terms
      'digital art', 'illustration', 'photography', 'graphics', 'vector',
      'watercolor', 'oil painting', 'sketch', 'portrait', 'landscape',
      'abstract', 'minimalist', 'vintage', 'modern', 'fantasy',
      'nature', 'cityscape', 'anime', 'cartoon', 'realistic',
      // Clothing terms
      't-shirt', 'shirt', 'dress', 'pants', 'jeans', 'jacket', 'hoodie',
      'men', 'women', 'unisex', 'casual', 'formal', 'sportswear',
      // Normal items / Shop terms
      'home decor', 'furniture', 'accessories', 'gifts',
      // F&B terms
      'dry fruits', 'dried fruits', 'spices', 'nuts', 'almonds', 'cashews',
      'walnuts', 'raisins', 'dates', 'turmeric', 'cumin', 'pepper'
    ];
    
    const matchingTerms = commonTerms
      .filter(term => term.includes(queryLower))
      .slice(0, 5);
    
    const matchingHistory = searchHistory
      .filter(item => item.toLowerCase().includes(queryLower))
      .slice(0, 3);
    
    // Try to get suggestions from actual products/items
    try {
      const { ProductService } = await import('../services/supabaseService');
      const NormalItemsService = (await import('../services/normalItemsService')).default;
      
      const [products, normalItems] = await Promise.all([
        ProductService.searchProducts(query, { status: 'active' }).catch(() => []),
        NormalItemsService.getActiveItems().catch(() => [])
      ]);
      
      // Filter F&B items from products
      const fbCategories = ['Food & Beverage', 'F&B', 'Food', 'Beverage', 'Dry Fruits', 'Dried Fruits', 'Spices'];
      const fbProducts = products.filter((p: any) => {
        const categories = p.categories || [];
        const category = p.category || '';
        return categories.some((cat: string) => 
          fbCategories.some(fbCat => cat.toLowerCase().includes(fbCat.toLowerCase()))
        ) || fbCategories.some(fbCat => category.toLowerCase().includes(fbCat.toLowerCase()));
      });
      
      // Extract titles from products (excluding F&B), normal items, and F&B items
      const regularProducts = products.filter((p: any) => !fbProducts.includes(p));
      const productTitles = [
        ...regularProducts.slice(0, 2).map((p: any) => p.title),
        ...normalItems.slice(0, 2).map((item: any) => item.title),
        ...fbProducts.slice(0, 2).map((p: any) => p.title)
      ].filter(Boolean);
      
      return [...matchingHistory, ...productTitles, ...matchingTerms].slice(0, 8);
    } catch (error) {
      // Fallback to static suggestions if search fails
      return [...matchingHistory, ...matchingTerms].slice(0, 8);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setShowSearchSuggestions(false);
      setSearchQuery('');
      setSelectedIndex(-1);
      return;
    }

    if (!showSearchSuggestions) return;

    const allItems = [...searchHistory, ...searchSuggestions];
    const maxIndex = allItems.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < maxIndex ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : maxIndex);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allItems.length) {
          handleSearch(allItems[selectedIndex]);
        } else {
          handleSearch(searchQuery);
        }
        break;
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const getSuggestionItemClass = (index: number, isHistory: boolean = false) => {
    const baseClass = "w-full text-left px-3 py-2 transition-colors rounded-md text-sm font-sans font-normal";
    const isSelected = selectedIndex === (isHistory ? index : index + searchHistory.length);
    
    if (isSelected) {
      return `${baseClass} bg-pink-100 text-pink-600`;
    }
    return `${baseClass} hover:bg-pink-50 hover:text-white`;
  };

  if (isAdminPage) {
    return null;
  }

  return (
    <header className="bg-gray-50 sticky top-0 z-50 border-b border-gray-200 font-sans font-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-black font-sans font-bold uppercase text-2xl">Lurevi</span>
          </Link>


          {/* Navigation - Desktop Only (lg+) */}
          <nav className="hidden lg:flex items-center space-x-4">
            <Link to="/favorites" className="p-2 text-black hover:text-gray-600">
              <Heart className="w-4 h-4" />
            </Link>
            {/* Search Icon/Bar - Desktop */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchOpen(true);
                }}
                className="p-2 text-black hover:text-gray-600"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              
              {/* Search Bar - Opens below icon */}
              {isSearchOpen && (
                <div className="absolute top-full right-0 mt-2" style={{ minWidth: '300px', width: '400px' }}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {}}
                      placeholder="search"
                      autoFocus
                      className="w-full pl-10 pr-4 py-2 bg-white text-black border border-black rounded-full focus:outline-none focus:border-black focus:ring-0 font-sans font-normal"
                    />
                    
                    {/* Search Suggestions Dropdown */}
                    {showSearchSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                        {/* Search History */}
                        {searchHistory.length > 0 && (
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-2 px-2">
                              <div className="flex items-center space-x-2 text-xs text-gray-500 font-sans font-normal">
                                <Clock className="w-3 h-3" />
                                <span className="font-sans font-normal">Recent Searches</span>
                              </div>
                              <button
                                onClick={clearSearchHistory}
                                className="text-xs text-pink-600 hover:text-pink-700 hover:underline font-sans font-normal"
                              >
                                Clear
                              </button>
                            </div>
                            {searchHistory.map((item, index) => (
                              <button
                                key={`history-${index}`}
                                onClick={() => handleSearch(item)}
                                className={getSuggestionItemClass(index, true)}
                              >
                                <div className="flex items-center space-x-3 font-sans font-normal">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="font-sans font-normal">{item}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Search Suggestions */}
                        {searchSuggestions.length > 0 && (
                          <div className="p-2">
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2 px-2 font-sans font-normal">
                              <TrendingUp className="w-3 h-3" />
                              <span className="font-sans font-normal">Suggestions</span>
                            </div>
                            {searchSuggestions.map((suggestion, index) => (
                              <button
                                key={`suggestion-${index}`}
                                onClick={() => handleSearch(suggestion)}
                                className={getSuggestionItemClass(index)}
                              >
                                <div className="flex items-center space-x-3 font-sans font-normal">
                                  <Search className="w-4 h-4 text-gray-400" />
                                  <span className="font-sans font-normal">{suggestion}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Categories - Desktop with Dropdown */}
            <div 
              className="relative"
              ref={categoriesRef}
              onMouseEnter={() => setShowCategoriesDropdown(true)}
              onMouseLeave={() => setShowCategoriesDropdown(false)}
            >
              <Link 
                to="/categories" 
                className="flex items-center gap-1 text-black hover:text-gray-600 text-sm font-normal font-sans uppercase"
              >
                Categories
                <ChevronDown className="w-3 h-3" />
              </Link>

              {/* Categories Dropdown */}
              {showCategoriesDropdown && categories.length > 0 && (
                <div 
                  className="fixed top-16 left-1/2 -translate-x-1/2 mt-1 w-[90vw] max-w-[1100px] max-h-[50vh] bg-gray-50 border border-gray-200 rounded-xl shadow-2xl z-50 p-3 overflow-y-auto"
                  style={{ maxWidth: 'min(90vw, 1100px)' }}
                  onMouseEnter={() => setShowCategoriesDropdown(true)}
                  onMouseLeave={() => setShowCategoriesDropdown(false)}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {categories
                      .filter(category => {
                        // Exclude clothing-related categories
                        const lowerName = category.name.toLowerCase();
                        return !['men', 'women', 'clothing'].some(keyword => lowerName.includes(keyword));
                      })
                      .map((category) => (
                        <Link
                          key={category.id}
                          to={`/${category.slug}`}
                          className="px-2.5 py-1.5 text-xs text-gray-700 hover:text-black rounded-md hover:bg-gray-100 font-normal text-center whitespace-nowrap overflow-hidden text-ellipsis font-sans uppercase"
                          style={{ boxShadow: 'none' }}
                          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 0, 0, 0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                          {category.name}
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <Link to="/browse" className="text-black hover:text-gray-600 text-sm font-normal font-sans uppercase">
              Art
            </Link>
            <Link to="/shop" className="text-black hover:text-gray-600 text-sm font-normal font-sans uppercase">
              Shop
            </Link>
            <Link to="/clothes" className="text-black hover:text-gray-600 text-sm font-normal font-sans uppercase">
              Clothes
            </Link>
            <Link to="/fb" className="text-black hover:text-gray-600 text-sm font-normal font-sans uppercase">
              F&B
            </Link>
            {isAdmin(user?.email) && (
              <Link to="/admin" className="p-2 text-black hover:text-gray-600" title="Admin">
                <Settings className="w-4 h-4" />
              </Link>
            )}
            <Link to="/cart" className="relative p-2 text-black hover:text-gray-600">
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-sans font-normal">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link to={user ? "/dashboard" : "/sign-in"} className="p-2 text-black hover:text-gray-600">
              <User className="w-4 h-4" />
            </Link>
          </nav>

          {/* Tablet Navigation - Search Tab */}
          <div className="hidden md:flex lg:hidden items-center space-x-3">
            <Link 
              to="/search" 
              className="p-2 text-black hover:text-gray-600"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </Link>
            <Link to="/cart" className="relative p-2 text-black hover:text-gray-600">
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-sans font-normal">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link to={user ? "/dashboard" : "/sign-in"} className="p-2 text-black hover:text-gray-600">
              <User className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile & Tablet Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-black hover:text-gray-600"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile & Tablet Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 bg-gray-50">
            <div className="mb-4">
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {}}
                  placeholder="search"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 font-sans font-normal"
                />
                
                {/* Mobile Search Suggestions */}
                {showSearchSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {/* Search History */}
                    {searchHistory.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-2 px-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 font-sans font-normal">
                          <Clock className="w-3 h-3" />
                          <span className="font-sans font-normal">Recent Searches</span>
                        </div>
                        <button
                          onClick={clearSearchHistory}
                          className="text-xs text-pink-600 hover:text-pink-700 hover:underline font-sans font-normal"
                        >
                          Clear
                        </button>
                        </div>
                        {searchHistory.map((item, index) => (
                          <button
                            key={`mobile-history-${index}`}
                            onClick={() => handleSearch(item)}
                            className={getSuggestionItemClass(index, true)}
                          >
                            <div className="flex items-center space-x-3 font-sans font-normal">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="font-sans font-normal">{item}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Search Suggestions */}
                    {searchSuggestions.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2 px-2 font-sans font-normal">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-sans font-normal">Suggestions</span>
                        </div>
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={`mobile-suggestion-${index}`}
                            onClick={() => handleSearch(suggestion)}
                            className={getSuggestionItemClass(index)}
                          >
                            <div className="flex items-center space-x-3 font-sans font-normal">
                              <Search className="w-4 h-4 text-gray-400" />
                              <span className="font-sans font-normal">{suggestion}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <nav className="flex flex-col space-y-3">
              <Link
                to="/favorites"
                className="flex items-center text-black hover:text-gray-600 py-2 font-sans font-normal"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-4 h-4 mr-2" />
                <span className="font-sans font-normal uppercase text-sm">Favorites</span>
              </Link>
              <Link
                to="/categories"
                className="text-black hover:text-gray-600 py-2 font-sans font-normal"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="font-sans font-normal uppercase text-sm">Categories</span>
              </Link>
              <Link
                to="/browse"
                className="text-black hover:text-gray-600 py-2 font-sans font-normal"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="font-sans font-normal uppercase text-sm">Art</span>
              </Link>
              <Link
                to="/shop"
                className="text-black hover:text-gray-600 py-2 font-sans font-normal"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="font-sans font-normal uppercase text-sm">Shop</span>
              </Link>
              <Link
                to="/clothes"
                className="text-black hover:text-gray-600 py-2 font-sans font-normal"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="font-sans font-normal uppercase text-sm">Clothes</span>
              </Link>
              <Link
                to="/fb"
                className="text-black hover:text-gray-600 py-2 font-sans font-normal"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="font-sans font-normal uppercase text-sm">F&B</span>
              </Link>
              {isAdmin(user?.email) && (
                <Link
                  to="/admin"
                  className="flex items-center text-black hover:text-gray-600 py-2 font-sans font-normal"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="font-sans font-normal uppercase text-sm">Admin</span>
                </Link>
              )}
              <div className="flex items-center space-x-3 pt-2">
                <Link 
                  to="/cart"
                  className="flex items-center text-black hover:text-gray-600 font-sans font-normal"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  <span className="font-sans font-normal uppercase text-sm">Cart ({cartItemCount})</span>
                </Link>
                <Link
                  to={user ? "/dashboard" : "/sign-in"}
                  className="flex items-center text-black hover:text-gray-600 font-sans font-normal"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-sans font-normal uppercase text-sm">{user ? "Dashboard" : "Sign In"}</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
