import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, ShoppingCart, User, LogIn, Heart, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CartManager } from '../services/orderService';

const BottomTabs: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Initialize cart count and subscribe to changes
  useEffect(() => {
    setCartItemCount(CartManager.getItemCount());
    
    const unsubscribe = CartManager.subscribe(() => {
      setCartItemCount(CartManager.getItemCount());
    });
    
    return () => unsubscribe();
  }, []);

  // Hide bottom tabs on dashboard page
  if (location.pathname === '/dashboard') {
    return null;
  }

  // Check if current path matches a tab
  const isActiveTab = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-2">
        {/* Home Tab */}
        <Link
          to="/"
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
            isActiveTab('/') 
              ? 'text-pink-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActiveTab('/') ? 'bg-pink-100' : 'bg-gray-100'
          }`}>
            <Home className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Home</span>
        </Link>

        {/* Categories Tab */}
        <Link
          to="/categories"
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
            isActiveTab('/categories') 
              ? 'text-pink-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActiveTab('/categories') ? 'bg-pink-100' : 'bg-gray-100'
          }`}>
            <Grid3X3 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Categories</span>
        </Link>

        {/* Browse Tab */}
        <Link
          to="/browse"
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
            isActiveTab('/browse') 
              ? 'text-pink-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActiveTab('/browse') ? 'bg-pink-100' : 'bg-gray-100'
          }`}>
            <Palette className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Browse</span>
        </Link>

        {/* Favorites Tab */}
        <Link
          to="/favorites"
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
            isActiveTab('/favorites') 
              ? 'text-pink-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActiveTab('/favorites') ? 'bg-pink-100' : 'bg-gray-100'
          }`}>
            <Heart className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Favorites</span>
        </Link>

        {/* Cart Tab */}
        <Link
          to="/cart"
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 relative ${
            isActiveTab('/cart') 
              ? 'text-pink-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isActiveTab('/cart') ? 'bg-pink-100' : 'bg-gray-100'
          }`}>
            <ShoppingCart className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Cart</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Link>

        {/* User Tab */}
        {user ? (
          <Link
            to="/dashboard"
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActiveTab('/dashboard') 
                ? 'text-pink-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isActiveTab('/dashboard') ? 'bg-pink-100' : 'bg-gray-100'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        ) : (
          <Link
            to="/sign-in"
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActiveTab('/sign-in') 
                ? 'text-pink-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isActiveTab('/sign-in') ? 'bg-pink-100' : 'bg-gray-100'
            }`}>
              <LogIn className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BottomTabs;
