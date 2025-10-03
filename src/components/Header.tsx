import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import { CartManager } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../utils/adminUtils';
import { useCategories } from '../contexts/CategoryContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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
    const unsubscribe = CartManager.subscribe((cart) => {
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
    
    return unsubscribe;
  }, []);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
        setIsSearchFocused(false);
        setSelectedIndex(-1);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Add to search history
      const newHistory = [query.trim(), ...searchHistory.filter(item => item !== query.trim())].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSearchSuggestions(false);
      setSearchQuery('');
      setIsSearchFocused(false);
      setSelectedIndex(-1);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1);
    if (value.trim().length > 1) {
      // Generate search suggestions based on common art terms and history
      const suggestions = generateSearchSuggestions(value);
      setSearchSuggestions(suggestions);
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
    }
  };

  const generateSearchSuggestions = (query: string): string[] => {
    const commonTerms = [
      'digital art', 'illustration', 'photography', 'graphics', 'vector',
      'watercolor', 'oil painting', 'sketch', 'portrait', 'landscape',
      'abstract', 'minimalist', 'vintage', 'modern', 'fantasy',
      'nature', 'cityscape', 'anime', 'cartoon', 'realistic',
      'surreal', 'impressionist', 'expressionist', 'cubist', 'pop art'
    ];
    
    const queryLower = query.toLowerCase();
    const matchingTerms = commonTerms
      .filter(term => term.includes(queryLower))
      .slice(0, 3);
    
    const matchingHistory = searchHistory
      .filter(item => item.toLowerCase().includes(queryLower))
      .slice(0, 2);
    
    return [...matchingHistory, ...matchingTerms];
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      case 'Escape':
        setShowSearchSuggestions(false);
        setIsSearchFocused(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const getSuggestionItemClass = (index: number, isHistory: boolean = false) => {
    const baseClass = "w-full text-left px-3 py-2 transition-colors rounded-md text-sm";
    const isSelected = selectedIndex === (isHistory ? index : index + searchHistory.length);
    
    if (isSelected) {
      return `${baseClass} bg-pink-100 text-pink-600`;
    }
    return `${baseClass} hover:bg-pink-50 hover:text-pink-600`;
  };

  if (isAdminPage) {
    return null;
  }

  return (
    <header className="bg-gray-50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/arvexa-logo.svg" 
              alt="ARVEXA" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Categories - Desktop with Dropdown */}
          <div 
            className="hidden lg:block relative ml-6"
            ref={categoriesRef}
            onMouseEnter={() => setShowCategoriesDropdown(true)}
            onMouseLeave={() => setShowCategoriesDropdown(false)}
          >
            <Link 
              to="/categories" 
              className="flex items-center gap-1 text-gray-700 hover:text-pink-600 transition-colors py-2"
            >
              <span>Categories</span>
              <ChevronDown className="w-4 h-4" />
            </Link>

            {/* Categories Dropdown */}
            {showCategoriesDropdown && categories.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 max-h-96 overflow-y-auto">
                {categories
                  .filter(category => {
                    // Exclude clothing-related categories
                    const lowerName = category.name.toLowerCase();
                    return !['men', 'women', 'clothing'].some(keyword => lowerName.includes(keyword));
                  })
                  .map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="search"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-200"
              />
              
              {/* Search Suggestions Dropdown */}
              {showSearchSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2 px-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Recent Searches</span>
                        </div>
                        <button
                          onClick={clearSearchHistory}
                          className="text-xs text-pink-600 hover:text-pink-700 hover:underline"
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
                          <div className="flex items-center space-x-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{item}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Search Suggestions */}
                  {searchSuggestions.length > 0 && (
                    <div className="p-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2 px-2">
                        <TrendingUp className="w-3 h-3" />
                        <span>Suggestions</span>
                      </div>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={`suggestion-${index}`}
                          onClick={() => handleSearch(suggestion)}
                          className={getSuggestionItemClass(index)}
                        >
                          <div className="flex items-center space-x-3">
                            <Search className="w-4 h-4 text-gray-400" />
                            <span>{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation - Desktop Only (lg+) */}
          <nav className="hidden lg:flex items-center space-x-4">
            <Link to="/favorites" className="p-2 text-gray-700 hover:text-pink-600 transition-colors">
              <Heart className="w-6 h-6" />
            </Link>
            <Link to="/browse" className="text-gray-700 hover:text-pink-600 transition-colors">
              Art
            </Link>
            <Link to="/men" className="text-gray-700 hover:text-pink-600 transition-colors">
              Clothes
            </Link>
            {isAdmin(user?.email) && (
              <Link to="/admin" className="text-gray-700 hover:text-pink-600 transition-colors">
                Admin
              </Link>
            )}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link to={user ? "/dashboard" : "/sign-in"} className="p-2 text-gray-700 hover:text-pink-600 transition-colors">
              <User className="w-6 h-6" />
            </Link>
          </nav>

          {/* Tablet Navigation - Search Tab */}
          <div className="hidden md:flex lg:hidden items-center space-x-3">
            <Link 
              to="/search" 
              className="p-2 text-gray-700 hover:text-pink-600 transition-colors"
              title="Search"
            >
              <Search className="w-6 h-6" />
            </Link>
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link to={user ? "/dashboard" : "/sign-in"} className="p-2 text-gray-700 hover:text-pink-600 transition-colors">
              <User className="w-6 h-6" />
            </Link>
          </div>

          {/* Mobile & Tablet Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-pink-600 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile & Tablet Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="mb-4">
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="search"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                
                {/* Mobile Search Suggestions */}
                {showSearchSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {/* Search History */}
                    {searchHistory.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-2 px-2">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Recent Searches</span>
                          </div>
                          <button
                            onClick={clearSearchHistory}
                            className="text-xs text-pink-600 hover:text-pink-700 hover:underline"
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
                            <div className="flex items-center space-x-3">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{item}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Search Suggestions */}
                    {searchSuggestions.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2 px-2">
                          <TrendingUp className="w-3 h-3" />
                          <span>Suggestions</span>
                        </div>
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={`mobile-suggestion-${index}`}
                            onClick={() => handleSearch(suggestion)}
                            className={getSuggestionItemClass(index)}
                          >
                            <div className="flex items-center space-x-3">
                              <Search className="w-4 h-4 text-gray-400" />
                              <span>{suggestion}</span>
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
                className="flex items-center text-gray-700 hover:text-pink-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-5 h-5 mr-2" />
                Favorites
              </Link>
              <Link
                to="/categories"
                className="text-gray-700 hover:text-pink-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/browse"
                className="text-gray-700 hover:text-pink-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Art
              </Link>
              <Link
                to="/men"
                className="text-gray-700 hover:text-pink-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Clothes
              </Link>
              {isAdmin(user?.email) && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-pink-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <div className="flex items-center space-x-3 pt-2">
                <Link 
                  to="/cart"
                  className="flex items-center text-gray-700 hover:text-pink-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-6 h-6 mr-2" />
                  Cart ({cartItemCount})
                </Link>
                <Link
                  to={user ? "/dashboard" : "/sign-in"}
                  className="flex items-center text-gray-700 hover:text-pink-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-6 h-6 mr-2" />
                  {user ? "Dashboard" : "Sign In"}
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
