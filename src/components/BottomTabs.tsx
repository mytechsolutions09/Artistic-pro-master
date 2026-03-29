'use client'

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from '@/src/compat/router';
import { Home, Grid3X3, ShoppingCart, User, LogIn, Heart, Palette, Shirt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CartManager } from '../services/orderService';
import { NavigationVisibilityService, type NavigationVisibilitySettings } from '../services/navigationVisibilityService';

const BottomTabs: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [navigationVisibility, setNavigationVisibility] = useState<NavigationVisibilitySettings>(
    NavigationVisibilityService.getSettings()
  );

  // Initialize cart count and subscribe to changes
  useEffect(() => {
    setCartItemCount(CartManager.getItemCount());
    
    const unsubscribe = CartManager.subscribe(() => {
      setCartItemCount(CartManager.getItemCount());
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = NavigationVisibilityService.subscribe((settings) => {
      setNavigationVisibility(settings);
    });

    return unsubscribe;
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
              ? 'text-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center">
            <Home className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Home</span>
        </Link>

        {/* Categories Tab */}
        <Link
          to="/categories"
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
            isActiveTab('/categories') 
              ? 'text-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center">
            <Grid3X3 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Categories</span>
        </Link>

        {/* Art Tab */}
        <Link
          to="/browse"
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
            isActiveTab('/browse') 
              ? 'text-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Art</span>
        </Link>

        {/* Clothes Tab */}
        {navigationVisibility.clothesActive && (
          <Link
            to="/clothes"
            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-all duration-200 ${
              isActiveTab('/clothes') 
                ? 'text-[#ff6e00]' 
                : 'text-gray-500 hover:text-[#ff6e00]'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center">
              <Shirt className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">Clothes</span>
          </Link>
        )}

        {/* Favorites Tab - Hidden on mobile, visible on md+ screens */}
        <Link
          to="/favorites"
          className={`hidden md:flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
            isActiveTab('/favorites') 
              ? 'text-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Favorites</span>
        </Link>

        {/* Cart Tab */}
        <Link
          to="/cart"
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 relative ${
            isActiveTab('/cart') 
              ? 'text-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Cart</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                ? 'text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        ) : (
          <Link
            to="/sign-in"
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActiveTab('/sign-in') 
                ? 'text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center">
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




